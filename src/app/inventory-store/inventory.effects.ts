import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { EMPTY, of } from "rxjs";
import { map, exhaustMap, catchError, tap, switchMap } from "rxjs/operators";
import { LaptopService } from "../services/laptop.service";
import * as InvetoryActions from "./inventory.actions";
import { HttpErrorResponse } from "@angular/common/http";
import { InventoryLogger } from "./inventory.logger";
import { Laptop } from "../models/laptop.model";

@Injectable()
export class InvenotryEffects {
  private actions$ = inject(Actions);
  private laptopService = inject(LaptopService);
  private logger = new InventoryLogger();

  loadInvenotry$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(InvetoryActions.getInvenotry),
      tap(action => {
        console.group('🎯 Effect Triggered: getInvenotry');
        console.log('Action dispatched:', action);
        console.log('Calling laptopService.getLaptopsByStatus()...');
        console.groupEnd();
      }),
      exhaustMap(() =>
        this.laptopService.getLaptopsByStatus().pipe(
          tap(laptopStatus => {
            console.group('✅ Service Response Received');
            console.log('Laptop Status from Service:', laptopStatus);
            console.groupEnd();
          }),
          map((laptopStatus) => {
            console.log('🎉 Dispatching getInvenotrySuccess action');
            return InvetoryActions.getInvenotrySuccess({ inventory: laptopStatus })
          }),
          catchError((error) => {
            console.group('❌ Error in Effect');
            console.error('Service Error:', error);
            console.log('Dispatching getInvenotryFailure action');
            console.groupEnd();
            return of(InvetoryActions.getInvenotryFailure({ error: error.message || 'Unknown error' }));
          })
        )
      )
    );
  });

  addLaptop$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(InvetoryActions.addLaptop),
      tap(action => {
        console.group('🎯 Effect Triggered: addLaptop');
        console.log('Action dispatched:', action);
        console.log('Laptop to add:', action.laptop);
        console.log('Calling laptopService.addLaptop()...');
        console.groupEnd();
      }),
      exhaustMap((action) =>
        this.laptopService.addLaptop(action.laptop).pipe(
          tap(docId => {
            console.group('✅ Service Response Received');
            console.log('Laptop saved successfully with ID:', docId);
            console.groupEnd();
          }),
          map((docId) => {
            console.log('🎉 Dispatching addLaptopSuccess action');
            // Create the saved laptop object with the ID
            const savedLaptop: Laptop = {
              ...action.laptop,
              id: docId
            };
            return InvetoryActions.addLaptopSuccess({ laptop: savedLaptop })
          }),
          catchError((error) => {
            console.group('❌ Error in Effect');
            console.error('Service Error:', error);
            console.log('Dispatching addLaptopFailure action');
            console.groupEnd();
            return of(InvetoryActions.addLaptopFailure({ error: error.message || 'Unknown error' }));
          })
        )
      )
    );
  });

  updateLaptop$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(InvetoryActions.updateLaptop),
      tap(action => {
        console.group('🎯 Effect Triggered: updateLaptop');
        console.log('Action dispatched:', action);
        console.log('Laptop ID to update:', action.id);
        console.log('Update data:', action.laptop);
        console.log('Calling laptopService.updateLaptop()...');
        console.groupEnd();
      }),
      exhaustMap((action) =>
        this.laptopService.updateLaptop(action.id, action.laptop).pipe(
          tap(() => {
            console.group('✅ Service Response Received');
            console.log('Laptop updated successfully');
            console.groupEnd();
          }),
          switchMap(() => {
            console.log('🎉 Getting updated laptop data');
            return this.laptopService.getLaptopById(action.id).pipe(
              map(laptop => {
                if (!laptop) {
                  throw new Error('Laptop not found after update');
                }
                return InvetoryActions.updateLaptopSuccess({ laptop });
              })
            );
          }),
          catchError((error) => {
            console.group('❌ Error in Effect');
            console.error('Service Error:', error);
            console.log('Dispatching updateLaptopFailure action');
            console.groupEnd();
            return of(InvetoryActions.updateLaptopFailure({ error: error.message || 'Unknown error' }));
          })
        )
      )
    );
  });

  deleteLaptop$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(InvetoryActions.deleteLaptop),
      tap(action => {
        console.group('🎯 Effect Triggered: deleteLaptop');
        console.log('Action dispatched:', action);
        console.log('Laptop ID to delete:', action.id);
        console.log('Calling laptopService.deleteLaptop()...');
        console.groupEnd();
      }),
      exhaustMap((action) =>
        this.laptopService.deleteLaptop(action.id).pipe(
          tap(() => {
            console.group('✅ Service Response Received');
            console.log('Laptop deleted successfully');
            console.groupEnd();
          }),
          map(() => {
            console.log('🎉 Dispatching deleteLaptopSuccess action');
            return InvetoryActions.deleteLaptopSuccess({ id: action.id });
          }),
          catchError((error) => {
            console.group('❌ Error in Effect');
            console.error('Service Error:', error);
            console.log('Dispatching deleteLaptopFailure action');
            console.groupEnd();
            return of(InvetoryActions.deleteLaptopFailure({ error: error.message || 'Unknown error' }));
          })
        )
      )
    );
  });
}