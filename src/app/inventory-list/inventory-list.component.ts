import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { LaptopService } from '../services/laptop.service';
import { GoogleSheetsService, GoogleSheetsConfig } from '../services/google-sheets.service';
import { Laptop, LaptopStatus } from '../models/laptop.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
    templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent implements OnInit, OnDestroy {
  laptops: Laptop[] = [];
  filteredLaptops: Laptop[] = [];
  statusSummary: LaptopStatus = { in_stock: [], assigned: [], damaged: [] };
  loading = true;
  searchTerm = '';
  selectedStatus = 'all';
  
  displayedColumns = ['asset_tag', 'make', 'assigned_to', 'assigned_date', 'status', 'issues', 'actions'];
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private laptopService: LaptopService,
    private googleSheetsService: GoogleSheetsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // Debounce search input
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  ngOnInit(): void {
    this.loadInventory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInventory(): void {
    this.loading = true;
    this.laptopService.getLaptopsByStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (status) => {
          this.statusSummary = status;
          this.laptops = [
            ...status.in_stock,
            ...status.assigned,
            ...status.damaged
          ];
          this.filteredLaptops = [...this.laptops];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading inventory:', error);
          this.loading = false;
          this.snackBar.open('Error loading inventory', 'Close', { duration: 3000 });
        }
      });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onStatusChange(): void {
    console.log('=== Status Change Event ===');
    console.log('Previous selectedStatus:', this.selectedStatus);
    console.log('New selectedStatus:', this.selectedStatus);
    
    // Ensure selectedStatus is valid
    if (!this.selectedStatus) {
      console.log('selectedStatus was undefined, setting to "all"');
      this.selectedStatus = 'all';
    }
    
    console.log('Final selectedStatus:', this.selectedStatus);
    this.applyFilters();
  }

  selectStatus(status: string): void {
    console.log('=== Select Status Called ===');
    console.log('Previous status:', this.selectedStatus);
    console.log('New status:', status);
    
    this.selectedStatus = status;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedStatus = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  private performSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.laptops];

    // Ensure selectedStatus is never undefined
    if (!this.selectedStatus) {
      this.selectedStatus = 'all';
    }

    console.log('=== Starting Filter Process ===');
    console.log('Initial laptops count:', this.laptops.length);
    console.log('Selected status:', this.selectedStatus);
    console.log('Search term:', this.searchTerm);

    // Apply status filter
    if (this.selectedStatus !== 'all') {
      console.log('Applying status filter for:', this.selectedStatus);
      filtered = filtered.filter(laptop => {
        const statusKey = this.getStatusKey(laptop);
        const matches = statusKey === this.selectedStatus;
        console.log(`Laptop ${laptop.asset_tag}: statusKey="${statusKey}", selected="${this.selectedStatus}", matches=${matches}`);
        return matches;
      });
      console.log('After status filter:', filtered.length, 'laptops');
    } else {
      console.log('No status filter applied (showing all)');
    }

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      console.log('Applying search filter for:', this.searchTerm);
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(laptop =>
        laptop.asset_tag.toLowerCase().includes(searchLower) ||
        laptop.assigned_to.toLowerCase().includes(searchLower) ||
        laptop.make.toLowerCase().includes(searchLower)
      );
      console.log('After search filter:', filtered.length, 'laptops');
    }

    console.log(`Final result: ${filtered.length} laptops out of ${this.laptops.length} total`);
    this.filteredLaptops = filtered;
  }

  getStatusText(laptop: Laptop): string {
    if (laptop.returned) {
      return laptop.issues && laptop.issues.trim() ? 'Damaged' : 'In Stock';
    }
    return 'Assigned';
  }

  getStatusClass(laptop: Laptop): string {
    if (laptop.returned) {
      return laptop.issues && laptop.issues.trim() ? 'damaged' : 'in-stock';
    }
    return 'assigned';
  }

  // Get status key for filtering (consistent with chip values)
  getStatusKey(laptop: Laptop): string {
    if (laptop.returned) {
      return laptop.issues && laptop.issues.trim() ? 'damaged' : 'in_stock';
    }
    return 'assigned';
  }

  // Debug method to check status calculations
  debugStatuses(): void {
    console.log('=== Status Debug ===');
    this.laptops.forEach(laptop => {
      const statusText = this.getStatusText(laptop);
      const statusClass = this.getStatusClass(laptop);
      const statusKey = this.getStatusKey(laptop);
      console.log(`${laptop.asset_tag}: returned=${laptop.returned}, issues="${laptop.issues}", statusText="${statusText}", statusClass="${statusClass}", statusKey="${statusKey}"`);
    });
    console.log('=== End Debug ===');
  }

  // Safe method to format status for display
  getStatusDisplayText(status: string): string {
    if (!status || status === 'all') return '';
    return status.replace('_', ' ').toUpperCase();
  }

  // Test method to manually test filtering
  testFiltering(): void {
    console.log('=== Manual Filter Test ===');
    console.log('Current selectedStatus:', this.selectedStatus);
    console.log('Current laptops:', this.laptops.length);
    console.log('Current filteredLaptops:', this.filteredLaptops.length);
    
    // Test each status
    ['all', 'in_stock', 'assigned', 'damaged'].forEach(status => {
      console.log(`\n--- Testing status: ${status} ---`);
      this.selectedStatus = status;
      this.applyFilters();
      console.log(`Result for ${status}: ${this.filteredLaptops.length} laptops`);
    });
    
    // Reset to all
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  deleteLaptop(laptop: Laptop): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Laptop',
        message: `Are you sure you want to delete laptop ${laptop.asset_tag}? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && laptop.id) {
        this.laptopService.deleteLaptop(laptop.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Laptop deleted successfully', 'Close', { duration: 3000 });
              this.loadInventory();
            },
            error: (error) => {
              console.error('Error deleting laptop:', error);
              this.snackBar.open('Error deleting laptop', 'Close', { duration: 3000 });
            }
          });
      }
    });
  }

  exportToCSV(): void {
    if (this.filteredLaptops.length === 0) {
      this.snackBar.open('No data to export', 'Close', { duration: 3000 });
      return;
    }

    const headers = ['Asset Tag', 'Make', 'Assigned To', 'Assigned Date', 'Status', 'Issues', 'Notes'];
    const csvData = this.filteredLaptops.map(laptop => [
      laptop.asset_tag,
      laptop.make,
      laptop.assigned_to,
      laptop.assigned_date,
      this.getStatusText(laptop),
      laptop.issues || '',
      laptop.notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laptop-inventory-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('CSV exported successfully', 'Close', { duration: 3000 });
  }

  exportToExcel(): void {
    if (this.filteredLaptops.length === 0) {
      this.snackBar.open('No data to export', 'Close', { duration: 3000 });
      return;
    }

    // Create Excel-compatible CSV with proper formatting
    const headers = ['Asset Tag', 'Make', 'Assigned To', 'Assigned Date', 'Status', 'Issues', 'Notes', 'Created Date'];
    const csvData = this.filteredLaptops.map(laptop => [
      laptop.asset_tag,
      laptop.make,
      laptop.assigned_to,
      laptop.assigned_date,
      this.getStatusText(laptop),
      laptop.issues || '',
      laptop.notes || '',
      laptop.created_at ? new Date(laptop.created_at).toLocaleDateString() : ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laptop-inventory-excel-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('Excel-compatible CSV exported successfully', 'Close', { duration: 3000 });
  }

  exportToGoogleSheets(): void {
    if (this.filteredLaptops.length === 0) {
      this.snackBar.open('No data to export', 'Close', { duration: 3000 });
      return;
    }

    const savedConfig = localStorage.getItem('googleSheetsConfig');
    if (!savedConfig) {
      this.snackBar.open('Please configure Google Sheets in Settings first', 'Close', { duration: 5000 });
      return;
    }

    const config: GoogleSheetsConfig = JSON.parse(savedConfig);
    if (!config.spreadsheetId || !config.apiKey) {
      this.snackBar.open('Please configure Google Sheets in Settings first', 'Close', { duration: 5000 });
      return;
    }

    this.snackBar.open('Exporting to Google Sheets...', 'Close', { duration: 2000 });

    this.googleSheetsService.exportLaptopsToSheet(this.filteredLaptops, config)
      .subscribe({
        next: () => {
          this.snackBar.open('Successfully exported to Google Sheets!', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error exporting to Google Sheets:', error);
          this.snackBar.open(`Export failed: ${error.message}`, 'Close', { duration: 5000 });
        }
      });
  }

  getLastUpdatedTime(): string {
    if (this.laptops.length === 0) {
      return 'Never';
    }
    
    const now = new Date();
    const lastUpdate = new Date();
    lastUpdate.setMinutes(now.getMinutes() - Math.floor(Math.random() * 60)); // Simulate recent update
    
    const diffInMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Ctrl/Cmd + E to export
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
      event.preventDefault();
      this.exportToCSV();
    }
    
    // Ctrl/Cmd + N to add new laptop
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      // Navigate to add page
      window.location.href = '/add';
    }
    
    // Ctrl/Cmd + F to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      const searchInput = document.querySelector('input[matInput]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  }

  showKeyboardShortcuts(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Keyboard Shortcuts',
        message: `
          <div style="text-align: left;">
            <p><strong>Ctrl/Cmd + F:</strong> Focus search field</p>
            <p><strong>Ctrl/Cmd + E:</strong> Export to CSV</p>
            <p><strong>Ctrl/Cmd + N:</strong> Add new laptop</p>
            <p><strong>Enter:</strong> Submit forms</p>
            <p><strong>Escape:</strong> Close dialogs</p>
          </div>
        `,
        confirmText: 'Got it!',
        confirmColor: 'primary'
      }
    });
  }
}
