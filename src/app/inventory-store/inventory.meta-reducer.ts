import { MetaReducer } from '@ngrx/store';
import { InventoryLogger } from './inventory.logger';

const logger = new InventoryLogger();

export function inventoryMetaReducer(reducer: any): any {
  return function(state: any, action: any) {
    logger.logAction(action);
    const newState = reducer(state, action);
    logger.logState(newState, action.type);
    return newState;
  };
}

export const metaReducers: MetaReducer<any>[] = [inventoryMetaReducer];