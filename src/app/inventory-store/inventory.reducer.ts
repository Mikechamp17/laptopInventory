import { Action, createReducer, createSelector, on } from '@ngrx/store';
import * as InvetoryActions from './inventory.actions';
import { Laptop, LaptopStatus } from '../models/laptop.model';
import { HttpErrorResponse } from '@angular/common/http';
import { InventoryLogger } from './inventory.logger';

export interface InvetoryState {
    loading: boolean;
    error: any;
    inventory: LaptopStatus;
}

export const initialInvenotryState: InvetoryState = {
    loading: false,
    error: null,
    inventory: { available: [], assigned: [], damaged: [] }
}

const logger = new InventoryLogger();

export const inventoryReducer = createReducer(
    initialInvenotryState,
    on(InvetoryActions.getInvenotry, (state, action) => {
        logger.logAction(action);
        const newState = { ...state, loading: true };
        logger.logState(newState, action.type);
        return newState;
    }),
    on(InvetoryActions.getInvenotrySuccess, (state, action) => {
        logger.logAction(action);
        const newState = { ...state, loading: false, inventory: action.inventory };
        logger.logState(newState, action.type);
        return newState;
    }),
    on(InvetoryActions.getInvenotryFailure, (state, action) => {
        logger.logAction(action);
        logger.logError(action.error, action.type);
        const newState = { ...state, loading: false, error: action.error };
        logger.logState(newState, action.type);
        return newState;
    }),



    
    // Add Laptop reducers
    on(InvetoryActions.addLaptop, (state, action) => {
        logger.logAction(action);
        const newState = { ...state, loading: true };
        logger.logState(newState, action.type);
        return newState;
    }),
    on(InvetoryActions.addLaptopSuccess, (state, action) => {
        logger.logAction(action);
        // Add the new laptop to the available list
        const updatedInventory = {
            ...state.inventory,
            available: [...state.inventory.available, action.laptop]
        };
        const newState = { ...state, loading: false, inventory: updatedInventory };
        logger.logState(newState, action.type);
        return newState;
    }),
    on(InvetoryActions.addLaptopFailure, (state, action) => {
        logger.logAction(action);
        logger.logError(action.error, action.type);
        const newState = { ...state, loading: false, error: action.error };
        logger.logState(newState, action.type);
        return newState;
    }),
);
