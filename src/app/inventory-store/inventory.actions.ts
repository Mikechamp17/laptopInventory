import { createAction, props } from "@ngrx/store";
import { Laptop, LaptopStatus } from "../models/laptop.model";
import { HttpErrorResponse } from "@angular/common/http";

export const getInvenotry = createAction("[Inventory] Get Inventory");

export const getInvenotrySuccess = createAction(
  "[Inventory] Get Inventory Success",
  props<{ inventory: LaptopStatus }>()
);

export const getInvenotryFailure = createAction(
  "[Inventory] Get Inventory Failure",
  props<{ error: HttpErrorResponse }>()
);

// Add Laptop actions
export const addLaptop = createAction("[Inventory] Add Laptop", props<{ laptop: Laptop }>());

export const addLaptopSuccess = createAction("[Inventory] Add Laptop Success", props<{ laptop: Laptop }>());

export const addLaptopFailure = createAction("[Inventory] Add Laptop Failure", props<{ error: HttpErrorResponse }>());

// Update Laptop actions
export const updateLaptop = createAction("[Inventory] Update Laptop", props<{ id: string, laptop: Partial<Laptop> }>());

export const updateLaptopSuccess = createAction("[Inventory] Update Laptop Success", props<{ laptop: Laptop }>());

export const updateLaptopFailure = createAction("[Inventory] Update Laptop Failure", props<{ error: HttpErrorResponse }>());

// Delete Laptop actions
export const deleteLaptop = createAction("[Inventory] Delete Laptop", props<{ id: string }>());

export const deleteLaptopSuccess = createAction("[Inventory] Delete Laptop Success", props<{ id: string }>());

export const deleteLaptopFailure = createAction("[Inventory] Delete Laptop Failure", props<{ error: HttpErrorResponse }>());