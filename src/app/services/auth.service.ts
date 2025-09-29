import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, authState, User, sendPasswordResetEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  private readonly allowedDomain = '@whitehatgaming.com'; // Hidden from UI
  constructor(
    private auth: Auth,
    private router: Router
  ) {
    authState(this.auth).subscribe((user: User | null) => { 
      console.log('AuthService: Auth state changed:', user ? 'authenticated' : 'not authenticated');
      this.userSubject.next(user);
      
      // Redirect authenticated users away from login page
      if (user && this.router.url === '/login') {
        console.log('AuthService: User authenticated, redirecting to /inventory');
        this.router.navigate(['/inventory']);
      }
      
      // Redirect unauthenticated users to login page
      if (!user && this.router.url !== '/login') {
        console.log('AuthService: User not authenticated, redirecting to /login');
        this.router.navigate(['/login']);
      }
    });
  }

  // Stealth domain validation - hidden from UI
  private validateDomain(email: string): boolean {
    const emailLower = email.toLowerCase();
    return emailLower.endsWith(this.allowedDomain.toLowerCase());
  }

  // Centralized error handling
  private handleAuthError(error: any): string {
    const errorMap: { [key: string]: string } = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-email': 'Invalid email address',
      'auth/user-disabled': 'This account has been disabled',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/invalid-credential': 'Invalid email or password',
      'auth/email-already-in-use': 'This email is already registered',
      'auth/weak-password': 'Password should be at least 6 characters'
    };
    
    return errorMap[error.code] || error.message || 'An unexpected error occurred';
  }

  // Password reset functionality
  resetPassword(email: string): Observable<void> {
    // Stealth domain validation
    if (!this.validateDomain(email)) {
      return throwError(() => new Error('Invalid email address'));
    }

    console.log('AuthService: Attempting to send password reset email to:', email);

    return from(sendPasswordResetEmail(this.auth, email)).pipe(
      catchError(error => {
        console.log('AuthService: Password reset error:', error.code, error.message);
        const errorMessage = this.handleAuthError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  signUp(email: string, password: string): Observable<any> {
    // Stealth domain validation
    if (!this.validateDomain(email)) {
      return throwError(() => new Error('Invalid email address'));
    }

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase();
    console.log('AuthService: Attempting to sign up with email:', normalizedEmail);

    return from(createUserWithEmailAndPassword(this.auth, normalizedEmail, password)).pipe(
      catchError(error => {
        console.log('AuthService: Sign up error:', error.code, error.message);
        const errorMessage = this.handleAuthError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  signIn(email: string, password: string): Observable<any> {
    // Stealth domain validation
    if (!this.validateDomain(email)) {
      return throwError(() => new Error('Invalid email address'));
    }

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase();
    console.log('AuthService: Attempting to sign in with email:', normalizedEmail);

    return from(signInWithEmailAndPassword(this.auth, normalizedEmail, password)).pipe(
      catchError(error => {
        console.log('AuthService: Sign in error:', error.code, error.message);
        const errorMessage = this.handleAuthError(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  signOut(): Observable<void> {
    console.log('AuthService: signOut() called');
    return from(signOut(this.auth)).pipe(
      switchMap(() => {
        console.log('AuthService: Firebase signOut successful');
        // Navigation will be handled by auth state listener
        return new Observable<void>(subscriber => subscriber.next());
      }),
      catchError(error => {
        console.error('AuthService: Error signing out:', error);
        return throwError(() => new Error('Error signing out'));
      })
    );
  }

  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(
      map((user: User | null) => !!user)
    );
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }
}