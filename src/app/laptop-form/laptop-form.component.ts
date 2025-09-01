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
import { Subject, takeUntil } from 'rxjs';

import { LaptopService } from '../services/laptop.service';
import { Laptop } from '../models/laptop.model';

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
    private snackBar: MatSnackBar
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      asset_tag: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      make: ['', Validators.required],
      assigned_to: ['', Validators.required],
      assigned_date: ['', Validators.required],
      returned: [false],
      issues: [''],
      notes: ['']
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
              notes: laptop.notes || ''
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
    if (this.laptopForm.invalid) return;

    this.loading = true;
    const formValue = this.laptopForm.value;
    
    // Format the date properly for Firebase
    const laptopData: Omit<Laptop, 'id'> = {
      ...formValue,
      assigned_date: this.formatDateForFirebase(formValue.assigned_date)
    };

    if (this.isEditMode && this.laptopId) {
      this.laptopService.updateLaptop(this.laptopId, laptopData)
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
    } else {
      this.laptopService.addLaptop(laptopData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Laptop added successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/inventory']);
          },
          error: (error) => {
            console.error('Error adding laptop:', error);
            this.snackBar.open('Error adding laptop', 'Close', { duration: 3000 });
            this.loading = false;
          }
        });
    }
  }

  // Helper method to format date for Firebase
  private formatDateForFirebase(date: Date | string): string {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().split('T')[0];
  }
}
