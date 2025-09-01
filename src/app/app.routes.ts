import { Routes } from '@angular/router';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { LaptopFormComponent } from './laptop-form/laptop-form.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: '/inventory', pathMatch: 'full' },
  { path: 'inventory', component: InventoryListComponent },
  { path: 'add', component: LaptopFormComponent },
  { path: 'edit/:id', component: LaptopFormComponent },
  { path: 'settings', component: SettingsComponent }
];
