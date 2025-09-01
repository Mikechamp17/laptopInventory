import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Laptop } from '../models/laptop.model';

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey: string;
  range: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private readonly GOOGLE_SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
  
  constructor(private http: HttpClient) {}

  // Load laptops from Google Sheets
  loadLaptopsFromSheet(config: GoogleSheetsConfig): Observable<Laptop[]> {
    const url = `${this.GOOGLE_SHEETS_API}/${config.spreadsheetId}/values/${config.range}?key=${config.apiKey}`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (!response.values || response.values.length < 2) {
          return [];
        }
        
        const headers = response.values[0];
        const dataRows = response.values.slice(1);
        
        return dataRows.map((row: any[]) => {
          const laptop: any = {};
          headers.forEach((header: string, index: number) => {
            laptop[this.normalizeFieldName(header)] = row[index] || '';
          });
          
          return this.mapToLaptop(laptop);
        });
      }),
      catchError(error => {
        console.error('Error loading from Google Sheets:', error);
        throw new Error('Failed to load data from Google Sheets');
      })
    );
  }

  // Export laptops to Google Sheets
  exportLaptopsToSheet(laptops: Laptop[], config: GoogleSheetsConfig): Observable<any> {
    const headers = ['Asset Tag', 'Make', 'Assigned To', 'Assigned Date', 'Returned', 'Issues', 'Notes'];
    const data = laptops.map(laptop => [
      laptop.asset_tag,
      laptop.make,
      laptop.assigned_to,
      laptop.assigned_date,
      laptop.returned ? 'Yes' : 'No',
      laptop.issues || '',
      laptop.notes || ''
    ]);
    
    const values = [headers, ...data];
    const url = `${this.GOOGLE_SHEETS_API}/${config.spreadsheetId}/values/${config.range}?valueInputOption=RAW&key=${config.apiKey}`;
    
    return this.http.put(url, { values }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(error => {
        console.error('Error exporting to Google Sheets:', error);
        throw new Error('Failed to export data to Google Sheets');
      })
    );
  }

  // Append a new laptop to Google Sheets
  appendLaptopToSheet(laptop: Laptop, config: GoogleSheetsConfig): Observable<any> {
    const row = [
      laptop.asset_tag,
      laptop.make,
      laptop.assigned_to,
      laptop.assigned_date,
      laptop.returned ? 'Yes' : 'No',
      laptop.issues || '',
      laptop.notes || ''
    ];
    
    const url = `${this.GOOGLE_SHEETS_API}/${config.spreadsheetId}/values/${config.range}:append?valueInputOption=RAW&key=${config.apiKey}`;
    
    return this.http.post(url, { values: [row] }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(error => {
        console.error('Error appending to Google Sheets:', error);
        throw new Error('Failed to append data to Google Sheets');
      })
    );
  }

  // Update a specific laptop in Google Sheets
  updateLaptopInSheet(laptop: Laptop, rowIndex: number, config: GoogleSheetsConfig): Observable<any> {
    const row = [
      laptop.asset_tag,
      laptop.make,
      laptop.assigned_to,
      laptop.assigned_date,
      laptop.returned ? 'Yes' : 'No',
      laptop.issues || '',
      laptop.notes || ''
    ];
    
    const range = `${config.range.split('!')[0]}!A${rowIndex + 2}:G${rowIndex + 2}`;
    const url = `${this.GOOGLE_SHEETS_API}/${config.spreadsheetId}/values/${range}?valueInputOption=RAW&key=${config.apiKey}`;
    
    return this.http.put(url, { values: [row] }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(error => {
        console.error('Error updating Google Sheets:', error);
        throw new Error('Failed to update data in Google Sheets');
      })
    );
  }

  // Delete a laptop from Google Sheets
  deleteLaptopFromSheet(rowIndex: number, config: GoogleSheetsConfig): Observable<any> {
    const range = `${config.range.split('!')[0]}!A${rowIndex + 2}:G${rowIndex + 2}`;
    const url = `${this.GOOGLE_SHEETS_API}/${config.spreadsheetId}/values/${range}?key=${config.apiKey}`;
    
    return this.http.delete(url).pipe(
      catchError(error => {
        console.error('Error deleting from Google Sheets:', error);
        throw new Error('Failed to delete data from Google Sheets');
      })
    );
  }

  // Helper method to normalize field names
  private normalizeFieldName(fieldName: string): string {
    return fieldName.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }

  // Helper method to map sheet data to Laptop object
  private mapToLaptop(data: any): Laptop {
    return {
      asset_tag: data.asset_tag || data.asset_tag || '',
      make: data.make || '',
      assigned_to: data.assigned_to || data.assigned_to || '',
      assigned_date: data.assigned_date || data.assigned_date || '',
      returned: data.returned === 'Yes' || data.returned === 'true' || data.returned === true,
      issues: data.issues || '',
      notes: data.notes || ''
    };
  }

  // Generate Google Sheets setup instructions
  getSetupInstructions(): string {
    return `
## Google Sheets Setup Instructions

### 1. Create a Google Sheet
- Go to https://sheets.google.com
- Create a new spreadsheet
- Name it "Laptop Inventory"

### 2. Set up the headers (Row 1)
A1: Asset Tag
B1: Make  
C1: Assigned To
D1: Assigned Date
E1: Returned
F1: Issues
G1: Notes

### 3. Enable Google Sheets API
- Go to https://console.developers.google.com
- Create a new project or select existing
- Enable Google Sheets API
- Create credentials (API Key)
- Copy the API Key

### 4. Make your sheet public (for read access)
- Click "Share" in your Google Sheet
- Set to "Anyone with the link can view"
- Copy the Spreadsheet ID from the URL

### 5. Configure in the app
- Go to Settings > Google Sheets
- Enter your Spreadsheet ID and API Key
- Set range to "Sheet1!A:G" (adjust sheet name as needed)
    `;
  }
}
