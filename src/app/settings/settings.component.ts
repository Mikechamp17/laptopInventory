import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

import { GoogleSheetsService, GoogleSheetsConfig } from '../services/google-sheets.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  googleSheetsConfig: GoogleSheetsConfig = {
    spreadsheetId: '',
    apiKey: '',
    range: 'Sheet1!A:G'
  };

  showApiKey = false;
  setupInstructions = '';

  constructor(
    private googleSheetsService: GoogleSheetsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadConfig();
    this.setupInstructions = this.googleSheetsService.getSetupInstructions();
  }

  loadConfig(): void {
    const savedConfig = localStorage.getItem('googleSheetsConfig');
    if (savedConfig) {
      this.googleSheetsConfig = JSON.parse(savedConfig);
    }
  }

  saveConfig(): void {
    localStorage.setItem('googleSheetsConfig', JSON.stringify(this.googleSheetsConfig));
    this.snackBar.open('Google Sheets configuration saved!', 'Close', { duration: 3000 });
  }

  testConnection(): void {
    if (!this.googleSheetsConfig.spreadsheetId || !this.googleSheetsConfig.apiKey) {
      this.snackBar.open('Please enter both Spreadsheet ID and API Key', 'Close', { duration: 3000 });
      return;
    }

    this.googleSheetsService.loadLaptopsFromSheet(this.googleSheetsConfig)
      .subscribe({
        next: (laptops) => {
          this.snackBar.open(`Connection successful! Found ${laptops.length} laptops.`, 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open(`Connection failed: ${error.message}`, 'Close', { duration: 5000 });
        }
      });
  }

  toggleApiKeyVisibility(): void {
    this.showApiKey = !this.showApiKey;
  }

  copySpreadsheetId(): void {
    const url = this.googleSheetsConfig.spreadsheetId;
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Spreadsheet ID copied to clipboard!', 'Close', { duration: 2000 });
      });
    }
  }

  openGoogleSheets(): void {
    if (this.googleSheetsConfig.spreadsheetId) {
      const url = `https://docs.google.com/spreadsheets/d/${this.googleSheetsConfig.spreadsheetId}/edit`;
      window.open(url, '_blank');
    }
  }

  openGoogleCloudConsole(): void {
    window.open('https://console.developers.google.com', '_blank');
  }
}
