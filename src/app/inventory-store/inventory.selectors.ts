import { InvetoryState } from "./inventory.reducer";

export const selectInventory = (state: InvetoryState) => state.inventory;
export const selectInvenotryLoading = (state: InvetoryState) => state.loading;
export const selectInventoryError = (state: InvetoryState) => state.error;