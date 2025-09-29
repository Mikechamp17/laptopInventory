import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    console.log('AuthGuard: Checking access to protected route');
    return this.authService.user$.pipe(
      take(1),
      map(user => {
        console.log('AuthGuard: User state:', user ? 'authenticated' : 'not authenticated');
        if (user) {
          console.log('AuthGuard: Allowing access to protected route');
          return true;
        } else {
          console.log('AuthGuard: Redirecting unauthenticated user to /login');
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.user$.pipe(
      take(1),
      map(user => {
        console.log('GuestGuard: User state:', user ? 'authenticated' : 'not authenticated');
        if (user) {
          // User is already logged in, redirect to inventory
          console.log('GuestGuard: Redirecting authenticated user to /inventory');
          return this.router.createUrlTree(['/inventory']);
        } else {
          // User is not logged in, allow access to login page
          console.log('GuestGuard: Allowing access to login page');
          return true;
        }
      })
    );
  }
}
