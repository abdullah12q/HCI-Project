import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth();
  currentUser = signal<User | null>(null);

  constructor(private router: Router) {
    // Listen for auth state changes (refresh, closing tab, etc.)
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      if (user) {
        // Optional: Redirect to dashboard if they land on login page
        this.router.navigate(['/dashboard']);
      }
    });
  }

  async login(email: string, pass: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, pass);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      alert('Login Failed: Invalid email or password');
    }
  }

  async register(email: string, pass: string) {
    try {
      await createUserWithEmailAndPassword(this.auth, email, pass);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      alert('Registration Failed: ' + err.message);
    }
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  // Helper to get the token for HTTP requests
  async getToken(): Promise<string | null> {
    const user = this.currentUser();
    return user ? await user.getIdToken() : null;
  }
}
