import { Routes } from '@angular/router';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { LaptopFormComponent } from './laptop-form/laptop-form.component';
import { SettingsComponent } from './settings/settings.component';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard, GuestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    component: AuthComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'inventory', 
    component: InventoryListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'add', 
    component: LaptopFormComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'edit/:id', 
    component: LaptopFormComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'settings', 
    component: SettingsComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];
