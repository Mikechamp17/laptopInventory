import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class InventoryLogger {
  
  logAction(action: Action): void {
    const timestamp = new Date().toISOString();
    const actionType = action.type;
    const actionPayload = (action as any).payload || (action as any).inventory || (action as any).error || 'No payload';
    
    console.group(`🔄 NgRx Action: ${actionType} (${timestamp})`);
    console.log('Action Type:', actionType);
    console.log('Action Payload:', actionPayload);
    console.log('Full Action Object:', action);
    console.groupEnd();
  }

  logState(state: any, actionType: string): void {
    const timestamp = new Date().toISOString();
    
    console.group(`📊 State After Action: ${actionType} (${timestamp})`);
    console.log('Current State:', state);
    console.groupEnd();
  }

  logError(error: any, actionType: string): void {
    const timestamp = new Date().toISOString();
    
    console.group(`❌ Error in Action: ${actionType} (${timestamp})`);
    console.error('Error Details:', error);
    console.groupEnd();
  }
}
