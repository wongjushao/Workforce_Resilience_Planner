import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AuthLayoutComponent],
  template: `
    <app-auth-layout>
      <div class="auth-card glass">

        <!-- Icon -->
        <div class="icon-wrap">
          <div class="icon-circle">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
            </svg>
          </div>
        </div>

        <!-- Sent state -->
        <div *ngIf="sent()" class="success-state">
          <div class="success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="rgba(0,242,255,0.12)" stroke="#00f2ff" stroke-width="1.5"/>
              <path d="M8 12l3 3 5-5" stroke="#00f2ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="auth-h1">Check your email</h1>
          <p class="auth-sub">
            We've sent a password reset link to
            <strong class="email-highlight">{{ submittedEmail }}</strong>.
            The link expires in 30 minutes.
          </p>
          <div class="info-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#7dd3fc" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p>Didn't receive it? Check your spam folder or
              <button type="button" class="resend-btn" (click)="resend()" [disabled]="resendLoading()">
                <span *ngIf="!resendLoading()">resend the email</span>
                <span *ngIf="resendLoading()" class="btn-loading-dots">
                  <span></span><span></span><span></span>
                </span>
              </button>.
            </p>
          </div>
          <a routerLink="/login" class="btn-submit-link">Back to sign in</a>
          <p class="auth-switch">
            Remember your password?
            <a routerLink="/login" class="auth-switch-link">Sign in</a>
          </p>
        </div>

        <!-- Form state -->
        <div *ngIf="!sent()">
          <div class="auth-head">
            <h1 class="auth-h1">Reset password</h1>
            <p class="auth-sub">
              Enter your email address and we'll send you a secure link to reset your password.
            </p>
          </div>

          <form (ngSubmit)="onSubmit()" #form="ngForm" novalidate>

            <div class="field-group">
              <label class="field-label" for="fp-email">Email address</label>
              <div class="field-wrap" [class.field-focused]="emailFocused()">
                <span class="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
                    <path d="M2 8l10 6 10-6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </span>
                <input
                  id="fp-email"
                  type="email"
                  class="field-input"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="you@company.com"
                  autocomplete="email"
                  required
                  [disabled]="loading()"
                  (focus)="emailFocused.set(true)"
                  (blur)="emailFocused.set(false)"
                />
              </div>
            </div>

            <!-- Security note -->
            <div class="security-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l8 4v5c0 5-8 9-8 9S4 17 4 12V7l8-4Z" stroke="#475569" stroke-width="2"/>
              </svg>
              <span>We never store plain-text passwords. Your data is protected.</span>
            </div>

            <button type="submit" class="btn-submit" [disabled]="loading() || !email.includes('@')">
              <span *ngIf="!loading()">Send reset link</span>
              <span *ngIf="loading()" class="btn-loading-dots">
                <span></span><span></span><span></span>
              </span>
            </button>
          </form>

          <p class="auth-switch">
            Remember your password?
            <a routerLink="/login" class="auth-switch-link">Sign in</a>
          </p>
          <p class="auth-switch alt-link">
            Forgot your username?
            <a routerLink="/forgot-username" class="auth-switch-link">Recover it here</a>
          </p>
        </div>

      </div>
    </app-auth-layout>
  `,
  styles: [`
    .auth-card {
      width: 100%; max-width: 24rem; padding: 2.25rem; border-radius: 1.5rem;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 32px 80px rgba(0,0,0,0.32);
    }

    /* Icon */
    .icon-wrap { display: flex; justify-content: center; margin-bottom: 1.5rem; }
    .icon-circle {
      width: 4rem; height: 4rem; border-radius: 50%;
      background: linear-gradient(135deg, rgba(0,242,255,0.12), rgba(112,0,255,0.18));
      border: 1px solid rgba(0,242,255,0.22);
      display: grid; place-items: center; color: #00f2ff;
      box-shadow: 0 0 28px rgba(0,242,255,0.18);
    }

    /* Heading */
    .auth-head { margin-bottom: 1.75rem; }
    .auth-h1 {
      margin: 0 0 0.6rem;
      font-family: "Cabinet Grotesk","Satoshi",sans-serif;
      font-weight: 900; font-size: 1.8rem; color: #f8fbff; line-height: 1.1;
    }
    .auth-sub { margin: 0; font-size: 0.9rem; color: #94a3b8; line-height: 1.65; }

    /* Fields */
    .field-group { margin-bottom: 0.85rem; }
    .field-label {
      display: block; margin-bottom: 0.45rem;
      font-size: 0.82rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.02em;
    }
    .field-wrap {
      display: flex; align-items: center; border-radius: 10px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
    }
    .field-wrap.field-focused {
      border-color: rgba(0,242,255,0.45); background: rgba(0,242,255,0.04);
      box-shadow: 0 0 0 3px rgba(0,242,255,0.1);
    }
    .field-icon {
      display: inline-grid; place-items: center;
      width: 2.6rem; flex-shrink: 0; color: #475569;
    }
    .field-input {
      flex: 1; height: 2.75rem;
      background: transparent; border: none; outline: none;
      color: #f8fbff; font-size: 0.9rem; font-family: inherit; padding-right: 0.75rem;
    }
    .field-input::placeholder { color: #334155; }
    .field-input:disabled { opacity: 0.5; }

    /* Security note */
    .security-note {
      display: flex; align-items: flex-start; gap: 0.5rem;
      padding: 0.65rem 0.85rem; margin-bottom: 1.25rem;
      border-radius: 8px;
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.07);
      font-size: 0.78rem; color: #475569; line-height: 1.5;
    }
    .security-note svg { flex-shrink: 0; margin-top: 2px; }

    /* Submit */
    .btn-submit {
      width: 100%; height: 2.85rem; border-radius: 10px;
      background: #00f2ff; color: #031018;
      border: none; font-size: 0.95rem; font-weight: 800; cursor: pointer; font-family: inherit;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      box-shadow: 0 0 22px rgba(0,242,255,0.45);
      transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
      margin-bottom: 1.5rem;
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 32px rgba(0,242,255,0.65); }
    .btn-submit:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

    /* Loading dots */
    .btn-loading-dots { display: inline-flex; align-items: center; gap: 5px; }
    .btn-loading-dots span {
      width: 6px; height: 6px; border-radius: 50%;
      background: currentColor; opacity: 0.6; animation: dot-pulse 1.2s infinite;
    }
    .btn-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
    .btn-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dot-pulse {
      0%, 80%, 100% { transform: scale(0.75); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Switch */
    .auth-switch { margin: 0 0 0.6rem; text-align: center; font-size: 0.875rem; color: #64748b; }
    .alt-link { margin-top: 0.5rem; }
    .auth-switch-link {
      color: #00f2ff; text-decoration: none; font-weight: 700;
      margin-left: 0.3rem; transition: color 180ms ease;
    }
    .auth-switch-link:hover { color: #7dd3fc; }

    /* Success state */
    .success-state { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .success-icon {
      margin-bottom: 1.25rem;
      display: grid; place-items: center;
      width: 4rem; height: 4rem; border-radius: 50%;
      background: rgba(0,242,255,0.06);
      box-shadow: 0 0 32px rgba(0,242,255,0.15);
    }
    .success-state .auth-h1 { margin-bottom: 0.75rem; }
    .success-state .auth-sub { margin-bottom: 1.25rem; }
    .email-highlight { color: #7dd3fc; font-weight: 700; }

    .info-box {
      display: flex; align-items: flex-start; gap: 0.6rem; text-align: left;
      padding: 0.85rem 1rem; margin-bottom: 1.75rem; border-radius: 10px;
      background: rgba(125,211,252,0.06); border: 1px solid rgba(125,211,252,0.15);
      font-size: 0.84rem; color: #7dd3fc; line-height: 1.55;
    }
    .info-box svg { flex-shrink: 0; margin-top: 3px; }
    .info-box p { margin: 0; color: #94a3b8; }
    .resend-btn {
      background: none; border: none; color: #00f2ff;
      font-size: inherit; font-family: inherit; cursor: pointer;
      padding: 0; font-weight: 600; transition: color 150ms ease;
    }
    .resend-btn:hover:not(:disabled) { color: #7dd3fc; }
    .resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-submit-link {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 2.85rem; border-radius: 10px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14);
      color: #f8fbff; text-decoration: none; font-size: 0.92rem; font-weight: 700;
      transition: border-color 180ms ease, transform 180ms ease; margin-bottom: 1.25rem;
    }
    .btn-submit-link:hover { border-color: rgba(0,242,255,0.45); transform: translateY(-1px); }

    @media (max-width: 640px) {
      .auth-card { padding: 1.75rem 1.25rem; }
    }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  submittedEmail = '';
  sent = signal(false);
  loading = signal(false);
  emailFocused = signal(false);
  resendLoading = signal(false);

  constructor(private auth: AuthService) {}

  async onSubmit() {
    if (this.loading() || !this.email.includes('@')) return;
    this.loading.set(true);
    await this.auth.forgotPassword(this.email);
    this.submittedEmail = this.email;
    this.loading.set(false);
    this.sent.set(true);
  }

  async resend() {
    if (this.resendLoading()) return;
    this.resendLoading.set(true);
    await this.auth.forgotPassword(this.submittedEmail);
    this.resendLoading.set(false);
  }
}
