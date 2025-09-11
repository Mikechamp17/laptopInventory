import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, takeUntil, filter } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { LaptopService } from '../services/laptop.service';
import { Laptop } from '../models/laptop.model';
import { InvetoryState } from '../inventory-store/inventory.reducer';
import * as InvetoryActions from '../inventory-store/inventory.actions';
import { selectInvenotryLoading, selectInventoryError } from '../inventory-store/inventory.selectors';

@Component({
  selector: 'app-laptop-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './laptop-form.component.html',
  styleUrls: ['./laptop-form.component.scss']
})
export class LaptopFormComponent implements OnInit, OnDestroy {
  laptopForm: FormGroup;
  isEditMode = false;
  laptopId: string | null = null;
  loading = false;
  
  // Date picker configuration
  maxDate = new Date();
  startDate = new Date();
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private laptopService: LaptopService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private store: Store<InvetoryState>,
    private actions$: Actions
  ) {
    this.laptopForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.laptopId = params['id'];
        this.loadLaptop();
      }
    });

    // Subscribe to NgRx loading state
    this.store.select(selectInvenotryLoading).pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.loading = loading;
    });

    // Subscribe to NgRx error state
    this.store.select(selectInventoryError).pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.snackBar.open('Error: ' + error.message, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });

    // Listen for add laptop success action
    this.actions$.pipe(
      ofType(InvetoryActions.addLaptopSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.snackBar.open('Laptop added successfully', 'Close', { duration: 3000 });
      this.router.navigate(['/inventory']);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      asset_tag: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      make: ['', Validators.required],
      assigned_to: [''],
      assigned_date: [''],
      returned: [false],
      issues: [''],
      notes: [''],
      jumpcloud_installed: [false],
      webroot_installed: [false]
    });
  }

  private loadLaptop(): void {
    if (!this.laptopId) return;
    
    this.loading = true;
    this.laptopService.getLaptopById(this.laptopId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (laptop) => {
          if (laptop) {
            this.laptopForm.patchValue({
              asset_tag: laptop.asset_tag,
              make: laptop.make,
              assigned_to: laptop.assigned_to,
              assigned_date: laptop.assigned_date,
              returned: laptop.returned,
              issues: laptop.issues || '',
              notes: laptop.notes || '',
              jumpcloud_installed: laptop.jumpcloud_installed || false,
              webroot_installed: laptop.webroot_installed || false
            });
          } else {
            this.snackBar.open('Laptop not found', 'Close', { duration: 3000 });
            this.router.navigate(['/inventory']);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading laptop:', error);
          this.snackBar.open('Error loading laptop', 'Close', { duration: 3000 });
          this.loading = false;
          this.router.navigate(['/inventory']);
        }
      });
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    const formValue = this.laptopForm.value;
    
    // Format the date properly for Firebase (only if assigned)
    const assignmentHistory = this.manageAssignmentHistory(formValue);
    console.log('Assignment History:', assignmentHistory);
    
    const laptopData: Omit<Laptop, 'id'> = {
      ...formValue,
      assigned_date: this.isLaptopAssigned() ? 
        this.formatDateForFirebase(formValue.assigned_date) : '',
      assigned_to: this.isLaptopAssigned() ? formValue.assigned_to : '',
      assignment_history: assignmentHistory
    };
    
    console.log('Laptop Data being saved:', laptopData);

    if (this.isEditMode && this.laptopId) {
      // For edit mode, we need to load current laptop data to manage assignment history
      this.laptopService.getLaptopById(this.laptopId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (currentLaptop) => {
            if (currentLaptop) {
              const updatedAssignmentHistory = this.updateAssignmentHistory(currentLaptop, formValue);
              console.log('Current Laptop:', currentLaptop);
              console.log('Updated Assignment History:', updatedAssignmentHistory);
              
              const updatedLaptopData = {
                ...laptopData,
                assignment_history: updatedAssignmentHistory
              };
              
              console.log('Updated Laptop Data:', updatedLaptopData);
              
              this.laptopService.updateLaptop(this.laptopId!, updatedLaptopData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: () => {
                    this.snackBar.open('Laptop updated successfully', 'Close', { duration: 3000 });
                    this.router.navigate(['/inventory']);
                  },
                  error: (error) => {
                    console.error('Error updating laptop:', error);
                    this.snackBar.open('Error updating laptop', 'Close', { duration: 3000 });
                    this.loading = false;
                  }
                });
            }
          },
          error: (error) => {
            console.error('Error loading laptop:', error);
            this.snackBar.open('Error loading laptop', 'Close', { duration: 3000 });
            this.loading = false;
          }
        });
    } else {
      // Use NgRx action for adding new laptops
      this.store.dispatch(InvetoryActions.addLaptop({ laptop: laptopData }));
    }
  }

  // Manage assignment history based on current form values
  private manageAssignmentHistory(formValue: any): any[] {
    // For new laptops, if assigned, create initial history entry
    if (this.isLaptopAssigned() && formValue.assigned_to && formValue.assigned_date) {
      return [{
        assigned_to: formValue.assigned_to,
        from_date: this.formatDateForFirebase(formValue.assigned_date),
        to_date: '' // Will be filled when laptop is returned/reassigned
      }];
    }
    
    // Return empty array for new laptops without assignment
    return [];
  }

  // Update assignment history when laptop assignment changes
  private updateAssignmentHistory(currentLaptop: Laptop, formValue: any): any[] {
    const currentHistory = currentLaptop.assignment_history || [];
    
    // If laptop is being assigned and wasn't assigned before
    if (this.isLaptopAssigned() && formValue.assigned_to && !currentLaptop.assigned_to) {
      return [...currentHistory, {
        assigned_to: formValue.assigned_to,
        from_date: this.formatDateForFirebase(formValue.assigned_date),
        to_date: ''
      }];
    }
    
    // If laptop is being returned
    if (formValue.returned && currentLaptop.assigned_to) {
      const updatedHistory = [...currentHistory];
      const lastEntry = updatedHistory[updatedHistory.length - 1];
      if (lastEntry && !lastEntry.to_date) {
        lastEntry.to_date = new Date().toISOString().split('T')[0];
      }
      return updatedHistory;
    }
    
    // If assignment is being changed (reassigned to someone else)
    if (this.isLaptopAssigned() && formValue.assigned_to && 
        currentLaptop.assigned_to && formValue.assigned_to !== currentLaptop.assigned_to) {
      // Close the previous assignment
      const updatedHistory = [...currentHistory];
      const lastEntry = updatedHistory[updatedHistory.length - 1];
      if (lastEntry && !lastEntry.to_date) {
        lastEntry.to_date = new Date().toISOString().split('T')[0];
      }
      
      // Add new assignment
      return [...updatedHistory, {
        assigned_to: formValue.assigned_to,
        from_date: this.formatDateForFirebase(formValue.assigned_date),
        to_date: ''
      }];
    }
    
    // Return current history if no changes
    return currentHistory;
  }

  // Helper method to format date for Firebase
  private formatDateForFirebase(date: Date | string): string {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().split('T')[0];
  }

  // Check if laptop is being assigned to someone
  isLaptopAssigned(): boolean {
    const assignedTo = this.laptopForm.get('assigned_to')?.value;
    return assignedTo && assignedTo.trim() !== '';
  }

  // Handle assignment field changes
  onAssignmentChange(): void {
    const assignedTo = this.laptopForm.get('assigned_to');
    const assignedDate = this.laptopForm.get('assigned_date');
    
    if (this.isLaptopAssigned()) {
      // If assigning to someone, make date required
      assignedDate?.setValidators([Validators.required]);
      assignedDate?.updateValueAndValidity();
    } else {
      // If not assigning, clear date and remove validators
      assignedDate?.clearValidators();
      assignedDate?.updateValueAndValidity();
      assignedDate?.setValue('');
    }
  }

  // Check if form is valid considering assignment logic
  isFormValid(): boolean {
    if (this.laptopForm.get('asset_tag')?.invalid || 
        this.laptopForm.get('make')?.invalid) {
      return false;
    }
    
    // If assigning to someone, both assigned_to and assigned_date are required
    if (this.isLaptopAssigned()) {
      return !this.laptopForm.get('assigned_to')?.invalid && 
             !this.laptopForm.get('assigned_date')?.invalid;
    }
    
    return true;
  }
}
