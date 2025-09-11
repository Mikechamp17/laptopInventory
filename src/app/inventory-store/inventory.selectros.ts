import { InvetoryState } from "./inventory.reducer";

export const selectInventory = (state: InvetoryState) => state.inventory;
export const selectInvenotryLoading = (state: InvetoryState) => state.loading;
export const selectInventoryError = (state: InvetoryState) => state.error;

  // Add Laptop selectors
//   we don't need to add new selectors because:
//   selectInventory - Already gets the inventory (which will include the new laptop)
//   selectInvenotryLoading - Already shows loading state (works for add laptop too)
//   selectInventoryError - Already shows errors (works for add laptop too)
