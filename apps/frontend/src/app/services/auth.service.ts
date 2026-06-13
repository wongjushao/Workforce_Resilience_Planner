import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export type UserRole = 'job-seeker' | 'employer' | 'hr-leader';

export interface AuthUser {
  name: string;
  username: string;
  email: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoggedIn = signal(false);
  private _user = signal<AuthUser | null>(null);
  private _isLoading = signal(false);

  readonly isLoggedIn = computed(() => this._isLoggedIn());
  readonly user = computed(() => this._user());
  readonly isLoading = computed(() => this._isLoading());

  constructor(private router: Router) {}

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    await this.delay(1600);
    this._isLoading.set(false);
    if (email && password.length >= 6) {
      this._isLoggedIn.set(true);
      this._user.set({
        name: this.emailToName(email),
        username: email.split('@')[0],
        email,
        role: 'job-seeker',
      });
      return { success: true };
    }
    return { success: false, error: 'Incorrect email or password. Please try again.' };
  }

  async loginWithGoogle(): Promise<{ success: boolean }> {
    this._isLoading.set(true);
    await this.delay(1200);
    this._isLoading.set(false);
    this._isLoggedIn.set(true);
    this._user.set({
      name: 'Ahmad Fadzillah',
      username: 'ahmad_fadzillah',
      email: 'ahmad.fadzillah@gmail.com',
      role: 'hr-leader',
    });
    return { success: true };
  }

  async signup(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    await this.delay(2000);
    this._isLoading.set(false);
    this._isLoggedIn.set(true);
    this._user.set({ name: data.name, username: data.username, email: data.email, role: data.role });
    return { success: true };
  }

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    await this.delay(1400);
    return { success: true };
  }

  async forgotUsername(email: string): Promise<{ success: boolean }> {
    await this.delay(1400);
    return { success: true };
  }

  logout() {
    this._isLoggedIn.set(false);
    this._user.set(null);
    this.router.navigate(['/home']);
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private emailToName(email: string): string {
    return email
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}
