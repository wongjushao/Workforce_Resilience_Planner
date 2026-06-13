import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AuthLayoutComponent],
  template: `
    <app-auth-layout>
      <div class="auth-card glass">

        <!-- Heading -->
        <div class="auth-head">
          <h1 class="auth-h1">Welcome back</h1>
          <p class="auth-sub">Sign in to your TalentPivot account</p>
        </div>

        <!-- Google button -->
        <button class="btn-google" (click)="loginWithGoogle()" [disabled]="loading()">
          <span class="google-icon">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
            </svg>
          </span>
          <span *ngIf="!googleLoading()">Continue with Google</span>
          <span *ngIf="googleLoading()" class="btn-loading-dots">
            <span></span><span></span><span></span>
          </span>
        </button>

        <!-- Divider -->
        <div class="auth-divider">
          <span class="divider-line"></span>
          <span class="divider-text">or continue with email</span>
          <span class="divider-line"></span>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" novalidate autocomplete="off">

          <!-- Error banner -->
          <div *ngIf="errorMsg()" class="error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="#ff4d6d" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="#ff4d6d" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ errorMsg() }}
          </div>

          <!-- Email -->
          <div class="field-group">
            <label class="field-label" for="login-email">Email address</label>
            <div class="field-wrap" [class.field-focused]="emailFocused()">
              <span class="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
                  <path d="M2 8l10 6 10-6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </span>
              <input
                id="login-email"
                type="email"
                class="field-input"
                [(ngModel)]="email"
                name="email"
                placeholder="you@company.com"
                autocomplete="off"
                required
                [disabled]="loading()"
                (focus)="emailFocused.set(true)"
                (blur)="emailFocused.set(false)"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="field-group">
            <div class="field-label-row">
              <label class="field-label" for="login-password">Password</label>
              <a class="inline-link" routerLink="/forgot-password">Forgot password?</a>
            </div>
            <div class="field-wrap" [class.field-focused]="pwFocused()">
              <span class="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </span>
              <input
                id="login-password"
                [type]="showPassword() ? 'text' : 'password'"
                class="field-input"
                [(ngModel)]="password"
                name="password"
                placeholder="Enter your password"
                autocomplete="off"
                required
                [disabled]="loading()"
                (focus)="pwFocused.set(true)"
                (blur)="pwFocused.set(false)"
              />
              <button
                type="button"
                class="field-eye"
                (click)="showPassword.set(!showPassword())"
                [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
              >
                <svg *ngIf="!showPassword()" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg *ngIf="showPassword()" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Extras row -->
          <div class="extras-row">
            <label class="check-label">
              <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" class="check-native" />
              <span class="check-box" [class.check-checked]="rememberMe">
                <svg *ngIf="rememberMe" width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#031018" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="check-text">Remember me</span>
            </label>
            <a class="inline-link" routerLink="/forgot-username">Forgot username?</a>
          </div>

          <!-- Mock CAPTCHA -->
          <div class="captcha-wrap" [class.captcha-verified]="captchaVerified()">
            <div class="captcha-left" (click)="verifyCaptcha()" [class.captcha-clickable]="!captchaVerified() && !captchaLoading()">
              <div class="captcha-checkbox" [class.captcha-checked]="captchaVerified()">
                <div *ngIf="captchaLoading()" class="captcha-spinner"></div>
                <svg *ngIf="captchaVerified() && !captchaLoading()" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#00f2ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="captcha-label" [class.captcha-label-done]="captchaVerified()">
                {{ captchaVerified() ? 'Verified' : "I'm not a robot" }}
              </span>
            </div>
            <div class="captcha-brand">
              <div class="captcha-logo">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" fill="rgba(0,242,255,0.08)" stroke="rgba(0,242,255,0.28)" stroke-width="1.5"/>
                  <path d="M12 6v5.5l3.5 2" stroke="#00f2ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="captcha-brand-text">
                <span class="captcha-brand-name">reCAPTCHA</span>
                <a class="captcha-brand-links" routerLink="/privacy">Privacy</a>
                <span class="captcha-brand-sep">·</span>
                <a class="captcha-brand-links" routerLink="/terms">Terms</a>
              </div>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="btn-submit"
            [disabled]="loading() || !captchaVerified()"
          >
            <span *ngIf="!submitLoading()">Sign in</span>
            <span *ngIf="submitLoading()" class="btn-loading-dots">
              <span></span><span></span><span></span>
            </span>
          </button>
        </form>

        <!-- Switch to signup -->
        <p class="auth-switch">
          Don't have an account?
          <a routerLink="/signup" class="auth-switch-link">Create one for free</a>
        </p>
      </div>
    </app-auth-layout>
  `,
  styles: [`
    .auth-card {
      width: 100%;
      max-width: 26rem;
      padding: 2.25rem;
      border-radius: 1.5rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 32px 80px rgba(0,0,0,0.32);
    }

    /* Heading */
    .auth-head { margin-bottom: 1.75rem; }
    .auth-h1 {
      margin: 0 0 0.5rem;
      font-family: "Cabinet Grotesk","Satoshi",sans-serif;
      font-weight: 900;
      font-size: 1.9rem;
      color: #f8fbff;
      line-height: 1.1;
    }
    .auth-sub { margin: 0; font-size: 0.95rem; color: #94a3b8; }

    /* Google button */
    .btn-google {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      height: 2.85rem;
      border-radius: 10px;
      background: #ffffff;
      color: #1a1a2e;
      border: none;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    }
    .btn-google:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.28);
    }
    .btn-google:disabled { opacity: 0.6; cursor: not-allowed; }
    .google-icon { display: inline-grid; place-items: center; flex-shrink: 0; }

    /* Divider */
    .auth-divider {
      display: flex; align-items: center; gap: 0.85rem;
      margin: 1.5rem 0;
    }
    .divider-line {
      flex: 1; height: 1px;
      background: rgba(255,255,255,0.1);
    }
    .divider-text { font-size: 0.78rem; color: #475569; white-space: nowrap; }

    /* Error banner */
    .error-banner {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.75rem 1rem; margin-bottom: 1.25rem;
      border-radius: 10px;
      background: rgba(255, 77, 109, 0.08);
      border: 1px solid rgba(255, 77, 109, 0.22);
      color: #ff7096;
      font-size: 0.875rem;
    }

    /* Field */
    .field-group { margin-bottom: 1.1rem; }
    .field-label {
      display: block;
      margin-bottom: 0.45rem;
      font-size: 0.82rem;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.02em;
    }
    .field-label-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 0.45rem;
    }
    .field-label-row .field-label { margin-bottom: 0; }
    .field-wrap {
      position: relative;
      display: flex;
      align-items: center;
      border-radius: 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
    }
    .field-wrap.field-focused {
      border-color: rgba(0,242,255,0.45);
      background: rgba(0,242,255,0.04);
      box-shadow: 0 0 0 3px rgba(0,242,255,0.1);
    }
    .field-icon {
      display: inline-grid; place-items: center;
      width: 2.6rem; flex-shrink: 0; color: #475569;
    }
    .field-input {
      flex: 1;
      height: 2.75rem;
      background: transparent;
      border: none;
      outline: none;
      color: #f8fbff;
      font-size: 0.9rem;
      font-family: inherit;
      padding-right: 0.75rem;
    }
    .field-input::placeholder { color: #334155; }
    .field-input:disabled { opacity: 0.5; cursor: not-allowed; }
    .field-eye {
      display: inline-grid; place-items: center;
      width: 2.4rem; height: 100%;
      background: none; border: none;
      color: #475569; cursor: pointer;
      border-radius: 0 10px 10px 0;
      transition: color 180ms ease;
      flex-shrink: 0;
    }
    .field-eye:hover { color: #94a3b8; }

    /* Inline links */
    .inline-link {
      font-size: 0.8rem;
      color: #00f2ff;
      text-decoration: none;
      font-weight: 600;
      transition: color 180ms ease;
    }
    .inline-link:hover { color: #7dd3fc; }

    /* Extras row */
    .extras-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    /* Checkbox */
    .check-label {
      display: inline-flex; align-items: center; gap: 0.55rem;
      cursor: pointer; user-select: none;
    }
    .check-native { position: absolute; opacity: 0; width: 0; height: 0; }
    .check-box {
      width: 1.1rem; height: 1.1rem; border-radius: 5px;
      border: 1.5px solid rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.04);
      display: inline-grid; place-items: center;
      transition: border-color 180ms ease, background 180ms ease;
      flex-shrink: 0;
    }
    .check-box.check-checked {
      background: #00f2ff;
      border-color: #00f2ff;
    }
    .check-text { font-size: 0.85rem; color: #94a3b8; }

    /* CAPTCHA */
    .captcha-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1rem;
      margin-bottom: 1.25rem;
      border-radius: 10px;
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.1);
      transition: border-color 180ms ease;
    }
    .captcha-wrap.captcha-verified {
      border-color: rgba(0,242,255,0.3);
      background: rgba(0,242,255,0.04);
    }
    .captcha-left {
      display: flex; align-items: center; gap: 0.75rem;
    }
    .captcha-clickable { cursor: pointer; }
    .captcha-checkbox {
      width: 1.25rem; height: 1.25rem; border-radius: 4px;
      border: 2px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.04);
      display: inline-grid; place-items: center;
      flex-shrink: 0;
      transition: border-color 180ms ease;
    }
    .captcha-checkbox.captcha-checked {
      border-color: #00f2ff;
      background: rgba(0,242,255,0.1);
    }
    .captcha-label { font-size: 0.9rem; color: #cbd5e1; }
    .captcha-label-done { color: #00f2ff; }
    .captcha-brand {
      display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
    }
    .captcha-logo { display: inline-grid; place-items: center; }
    .captcha-brand-text {
      display: flex; align-items: center; gap: 0.3rem;
      font-size: 0.65rem; color: #475569;
    }
    .captcha-brand-name { font-weight: 700; color: #64748b; }
    .captcha-brand-sep { color: #334155; }
    .captcha-brand-links {
      color: #475569; text-decoration: none;
      transition: color 150ms ease;
    }
    .captcha-brand-links:hover { color: #94a3b8; }
    .captcha-spinner {
      width: 0.85rem; height: 0.85rem; border-radius: 50%;
      border: 2px solid rgba(0,242,255,0.2);
      border-top-color: #00f2ff;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Submit button */
    .btn-submit {
      width: 100%;
      height: 2.85rem;
      border-radius: 10px;
      background: #00f2ff;
      color: #031018;
      border: none;
      font-size: 0.95rem;
      font-weight: 800;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 0 22px rgba(0,242,255,0.45);
      transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
      margin-bottom: 1.5rem;
    }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 0 32px rgba(0,242,255,0.65);
    }
    .btn-submit:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* Loading dots */
    .btn-loading-dots {
      display: inline-flex; align-items: center; gap: 5px;
    }
    .btn-loading-dots span {
      width: 6px; height: 6px; border-radius: 50%;
      background: currentColor; opacity: 0.6;
      animation: dot-pulse 1.2s infinite;
    }
    .btn-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
    .btn-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dot-pulse {
      0%, 80%, 100% { transform: scale(0.75); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Switch link */
    .auth-switch {
      margin: 0;
      text-align: center;
      font-size: 0.875rem;
      color: #64748b;
    }
    .auth-switch-link {
      color: #00f2ff;
      text-decoration: none;
      font-weight: 700;
      margin-left: 0.3rem;
      transition: color 180ms ease;
    }
    .auth-switch-link:hover { color: #7dd3fc; }

    @media (max-width: 640px) {
      .auth-card { padding: 1.75rem 1.25rem; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;

  showPassword = signal(false);
  emailFocused = signal(false);
  pwFocused = signal(false);
  loading = signal(false);
  googleLoading = signal(false);
  submitLoading = signal(false);
  captchaVerified = signal(false);
  captchaLoading = signal(false);
  errorMsg = signal('');

  private returnUrl = '/app';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/app';
  }

  verifyCaptcha() {
    if (this.captchaVerified() || this.captchaLoading()) return;
    this.captchaLoading.set(true);
    setTimeout(() => {
      this.captchaLoading.set(false);
      this.captchaVerified.set(true);
    }, 1600);
  }

  async loginWithGoogle() {
    if (this.loading()) return;
    this.googleLoading.set(true);
    this.loading.set(true);
    this.errorMsg.set('');
    await this.auth.loginWithGoogle();
    this.googleLoading.set(false);
    this.loading.set(false);
    this.router.navigateByUrl(this.returnUrl);
  }

  async onSubmit() {
    if (this.loading() || !this.captchaVerified()) return;
    this.errorMsg.set('');
    this.submitLoading.set(true);
    this.loading.set(true);
    const result = await this.auth.login(this.email, this.password);
    this.submitLoading.set(false);
    this.loading.set(false);
    if (result.success) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.errorMsg.set(result.error ?? 'Something went wrong. Please try again.');
      this.captchaVerified.set(false);
    }
  }
}
