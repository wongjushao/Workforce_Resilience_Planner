import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AuthLayoutComponent],
  template: `
    <app-auth-layout>
      <div class="signup-wrap">

        <!-- ── Step 0: Role selection ── -->
        <div *ngIf="step() === 0" class="role-select-card glass">
          <div class="auth-head" style="text-align:center">
            <h1 class="auth-h1">Join TalentPivot</h1>
            <p class="auth-sub">Who are you? Choose your path to get started.</p>
          </div>
          <div class="role-options">

            <!-- Job Seeker -->
            <button class="role-option role-option-seeker" type="button" (click)="selectRole('job-seeker')">
              <div class="role-option-icon role-icon-seeker">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="role-option-body">
                <strong>I'm looking for a job</strong>
                <p>Find AI-matched roles, track your applications, build your profile</p>
                <span class="role-option-tag role-tag-seeker">Career OS · Job Seeker</span>
              </div>
              <svg class="role-option-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <!-- Employer / HR -->
            <button class="role-option role-option-employer" type="button" (click)="selectRole('employer')">
              <div class="role-option-icon role-icon-employer">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" stroke-width="2"/>
                  <path d="M9 12h6M12 12v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="role-option-body">
                <strong>I'm hiring or managing a team</strong>
                <p>Post jobs, evaluate candidates, run workforce resilience planning</p>
                <span class="role-option-tag role-tag-employer">TalentPivot WRP · Employer</span>
              </div>
              <svg class="role-option-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

          </div>
          <p class="auth-switch" style="text-align:center;margin-top:1.5rem">
            Already have an account?
            <a routerLink="/login" class="auth-switch-link">Sign in</a>
          </p>
        </div>

        <!-- Step indicator (steps 1 & 2 only) -->
        <div *ngIf="step() > 0" class="step-indicator">
          <div class="step" [class.step-active]="step() === 1" [class.step-done]="step() > 1">
            <span class="step-num">
              <svg *ngIf="step() > 1" width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span *ngIf="step() <= 1">1</span>
            </span>
            <span class="step-label">Your details</span>
          </div>
          <div class="step-connector" [class.step-connector-done]="step() > 1"></div>
          <div class="step" [class.step-active]="step() === 2">
            <span class="step-num">2</span>
            <span class="step-label">Verify</span>
          </div>
        </div>

        <!-- ── Step 1: Account details ── -->
        <div *ngIf="step() === 1" class="auth-card glass">
          <button class="btn-back" type="button" (click)="step.set(0)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Change role
          </button>
          <div class="auth-head">
            <h1 class="auth-h1">Create your account</h1>
            <p class="auth-sub">
              <span class="role-badge" [class.role-badge-employer]="selectedRole() === 'employer'">
                {{ selectedRole() === 'employer' ? 'Employer / HR account' : 'Job Seeker account' }}
              </span>
            </p>
          </div>

          <!-- Google -->
          <button class="btn-google" type="button" (click)="signupWithGoogle()" [disabled]="loading()">
            <span class="google-icon">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
              </svg>
            </span>
            <span *ngIf="!googleLoading()">Sign up with Google</span>
            <span *ngIf="googleLoading()" class="btn-loading-dots">
              <span></span><span></span><span></span>
            </span>
          </button>

          <div class="auth-divider">
            <span class="divider-line"></span>
            <span class="divider-text">or sign up with email</span>
            <span class="divider-line"></span>
          </div>

          <!-- Full name -->
          <div class="field-group">
            <label class="field-label" for="sg-name">Full name</label>
            <div class="field-wrap"
              [class.field-focused]="nameFocused()"
              [class.field-invalid]="showNameError()">
              <span class="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </span>
              <input id="sg-name" type="text" class="field-input" [(ngModel)]="name" name="name"
                placeholder="Ahmad Fadzillah" autocomplete="off"
                (focus)="nameFocused.set(true)"
                (blur)="nameFocused.set(false); nameTouched.set(true)" />
              <span *ngIf="showNameError()" class="field-err-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#ff4d6d" stroke-width="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#ff4d6d" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </span>
            </div>
            <p *ngIf="showNameError()" class="field-error-msg">
              Enter your full name (at least 2 characters)
            </p>
          </div>

          <!-- Username -->
          <div class="field-group">
            <label class="field-label" for="sg-username">
              Username
              <span class="field-hint">Visible on your public profile</span>
            </label>
            <div class="field-wrap"
              [class.field-focused]="usernameFocused()"
              [class.field-invalid]="showUsernameError()">
              <span class="field-icon field-icon-at">@</span>
              <input id="sg-username" type="text" class="field-input" [(ngModel)]="username" name="username"
                placeholder="your_username" autocomplete="off"
                (focus)="usernameFocused.set(true)"
                (blur)="usernameFocused.set(false); usernameTouched.set(true)" />
              <span *ngIf="showUsernameError()" class="field-err-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#ff4d6d" stroke-width="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#ff4d6d" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </span>
            </div>
            <p *ngIf="showUsernameError()" class="field-error-msg">
              Username must be at least 3 characters
            </p>
          </div>

          <!-- Email -->
          <div class="field-group">
            <label class="field-label" for="sg-email">Email address</label>
            <div class="field-wrap"
              [class.field-focused]="emailFocused()"
              [class.field-invalid]="showEmailError()">
              <span class="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
                  <path d="M2 8l10 6 10-6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </span>
              <input id="sg-email" type="email" class="field-input" [(ngModel)]="email" name="email"
                placeholder="you@company.com" autocomplete="off"
                (focus)="emailFocused.set(true)"
                (blur)="emailFocused.set(false); emailTouched.set(true)" />
              <span *ngIf="showEmailError()" class="field-err-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#ff4d6d" stroke-width="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#ff4d6d" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </span>
            </div>
            <p *ngIf="showEmailError()" class="field-error-msg">
              Enter a valid email address
            </p>
          </div>

          <!-- Password -->
          <div class="field-group">
            <label class="field-label" for="sg-password">Password</label>
            <div class="field-wrap"
              [class.field-focused]="pwFocused()"
              [class.field-invalid]="showPwError()">
              <span class="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </span>
              <input id="sg-password" [type]="showPassword() ? 'text' : 'password'" class="field-input"
                [(ngModel)]="password" name="password"
                placeholder="At least 8 characters" autocomplete="off"
                (focus)="pwFocused.set(true)"
                (blur)="pwFocused.set(false); pwTouched.set(true)" />
              <button type="button" class="field-eye" (click)="showPassword.set(!showPassword())">
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
            <p *ngIf="showPwError()" class="field-error-msg">
              Password must be at least 8 characters
            </p>
            <!-- Strength meter (only when typing) -->
            <div *ngIf="password.length > 0" class="pw-strength">
              <div class="pw-strength-track">
                <div class="pw-strength-fill" [class]="'pw-' + passwordStrength()"></div>
              </div>
              <span class="pw-strength-label" [class]="'pw-label-' + passwordStrength()">
                {{ passwordStrengthLabel() }}
              </span>
            </div>
          </div>

          <!-- Confirm password -->
          <div class="field-group">
            <label class="field-label" for="sg-confirm">Confirm password</label>
            <div class="field-wrap"
              [class.field-focused]="confirmFocused()"
              [class.field-invalid]="showConfirmError()">
              <span class="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </span>
              <input id="sg-confirm" [type]="showPassword() ? 'text' : 'password'" class="field-input"
                [(ngModel)]="confirmPassword" name="confirmPassword"
                placeholder="Repeat your password" autocomplete="off"
                (focus)="confirmFocused.set(true)"
                (blur)="confirmFocused.set(false); confirmTouched.set(true)" />
              <span *ngIf="showConfirmError()" class="field-err-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#ff4d6d" stroke-width="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#ff4d6d" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </span>
            </div>
            <p *ngIf="showConfirmError()" class="field-error-msg">
              {{ confirmPassword.length === 0 ? 'Please confirm your password' : 'Passwords do not match' }}
            </p>
          </div>

          <!-- Continue (always clickable — reveals errors when invalid) -->
          <button type="button" class="btn-submit" (click)="tryProceed()">
            Continue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <p class="auth-switch">
            Already have an account?
            <a routerLink="/login" class="auth-switch-link">Sign in</a>
          </p>
        </div>

        <!-- ── Step 2: Verify & complete ── -->
        <div *ngIf="step() === 2" class="auth-card glass">
          <div class="auth-head">
            <button type="button" class="back-btn" (click)="step.set(1)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Back
            </button>
            <h1 class="auth-h1">Almost there!</h1>
            <p class="auth-sub">Verify you're human and agree to our terms</p>
          </div>

          <!-- Account summary -->
          <div class="account-summary">
            <div class="summary-avatar">{{ nameInitials() }}</div>
            <div class="summary-info">
              <div class="summary-name">{{ name }}</div>
              <div class="summary-meta">
                <span class="summary-username">@{{ username }}</span>
                <span class="summary-sep">·</span>
                <span class="summary-email">{{ email }}</span>
              </div>
              <div class="summary-badge">New member</div>
            </div>
          </div>

          <!-- CAPTCHA -->
          <div class="captcha-wrap" [class.captcha-verified]="captchaVerified()">
            <div class="captcha-left"
              (click)="verifyCaptcha()"
              [class.captcha-clickable]="!captchaVerified() && !captchaLoading()">
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

          <!-- Terms -->
          <label class="terms-label">
            <input type="checkbox" [(ngModel)]="agreeTerms" name="agreeTerms" class="check-native" />
            <span class="check-box" [class.check-checked]="agreeTerms">
              <svg *ngIf="agreeTerms" width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#031018" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="terms-text">
              I agree to TalentPivot's
              <a class="inline-link" routerLink="/terms">Terms of Service</a>
              and
              <a class="inline-link" routerLink="/privacy">Privacy Policy</a>.
              I consent to receiving emails about my account.
            </span>
          </label>

          <!-- Marketing opt-in -->
          <label class="check-label">
            <input type="checkbox" [(ngModel)]="agreeMarketing" name="agreeMarketing" class="check-native" />
            <span class="check-box" [class.check-checked]="agreeMarketing">
              <svg *ngIf="agreeMarketing" width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#031018" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="check-text">Send me product updates and workforce insights (optional)</span>
          </label>

          <div *ngIf="errorMsg()" class="error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#ff4d6d" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="#ff4d6d" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ errorMsg() }}
          </div>

          <button type="button" class="btn-submit"
            [disabled]="!canSubmit() || loading()"
            (click)="onSubmit()">
            <span *ngIf="!loading()">Create my account</span>
            <span *ngIf="loading()" class="btn-loading-dots">
              <span></span><span></span><span></span>
            </span>
          </button>

          <p class="auth-switch">
            Already have an account?
            <a routerLink="/login" class="auth-switch-link">Sign in</a>
          </p>
        </div>

      </div>
    </app-auth-layout>
  `,
  styles: [`
    .signup-wrap {
      width: 100%; max-width: 28rem;
      display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
    }

    /* ── Step indicator ── */
    .step-indicator { display: flex; align-items: center; }
    .step { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; }
    .step-num {
      width: 2rem; height: 2rem; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.04);
      color: #475569; font-size: 0.8rem; font-weight: 700;
      display: inline-grid; place-items: center;
      transition: all 200ms ease;
    }
    .step-label { font-size: 0.7rem; font-weight: 600; color: #334155; white-space: nowrap; transition: color 200ms ease; }
    .step-active .step-num { border-color: #00f2ff; background: rgba(0,242,255,0.15); color: #00f2ff; }
    .step-active .step-label { color: #00f2ff; }
    .step-done .step-num { border-color: #00f2ff; background: #00f2ff; color: #031018; }
    .step-done .step-label { color: #64748b; }
    .step-connector {
      width: 5rem; height: 2px;
      background: rgba(255,255,255,0.1);
      margin: 0 0.65rem; margin-bottom: 1.35rem;
      transition: background 200ms ease;
    }
    .step-connector-done { background: rgba(0,242,255,0.4); }

    /* ── Card ── */
    .auth-card {
      width: 100%; padding: 2.25rem; border-radius: 1.5rem;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 32px 80px rgba(0,0,0,0.32);
    }
    .auth-head { margin-bottom: 1.75rem; }
    .auth-h1 {
      margin: 0 0 0.5rem;
      font-family: "Cabinet Grotesk","Satoshi",sans-serif;
      font-weight: 900; font-size: 1.9rem; color: #f8fbff; line-height: 1.1;
    }
    .auth-sub { margin: 0; font-size: 0.95rem; color: #94a3b8; }

    /* ── Back btn ── */
    .back-btn {
      display: inline-flex; align-items: center; gap: 0.4rem;
      margin-bottom: 1rem; background: none; border: none;
      font-size: 0.8rem; color: #64748b; cursor: pointer; padding: 0; font-family: inherit;
      transition: color 150ms ease;
    }
    .back-btn:hover { color: #94a3b8; }

    /* ── Google ── */
    .btn-google {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.65rem;
      height: 2.85rem; border-radius: 10px;
      background: #ffffff; color: #1a1a2e; border: none;
      font-size: 0.92rem; font-weight: 700; cursor: pointer; font-family: inherit;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      transition: transform 160ms ease, box-shadow 160ms ease;
    }
    .btn-google:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.28); }
    .btn-google:disabled { opacity: 0.6; cursor: not-allowed; }
    .google-icon { display: inline-grid; place-items: center; flex-shrink: 0; }

    /* ── Divider ── */
    .auth-divider { display: flex; align-items: center; gap: 0.85rem; margin: 1.5rem 0; }
    .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
    .divider-text { font-size: 0.78rem; color: #475569; white-space: nowrap; }

    /* ── Fields ── */
    .field-group { margin-bottom: 1rem; }
    .field-label {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 0.45rem;
      font-size: 0.82rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.02em;
    }
    .field-hint { font-size: 0.75rem; font-weight: 400; color: #475569; }
    .field-wrap {
      position: relative; display: flex; align-items: center;
      border-radius: 10px; background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
    }
    .field-wrap.field-focused {
      border-color: rgba(0,242,255,0.45); background: rgba(0,242,255,0.04);
      box-shadow: 0 0 0 3px rgba(0,242,255,0.1);
    }
    .field-wrap.field-invalid {
      border-color: rgba(255,77,109,0.55);
      background: rgba(255,77,109,0.04);
    }
    .field-wrap.field-invalid.field-focused {
      border-color: rgba(255,77,109,0.7);
      box-shadow: 0 0 0 3px rgba(255,77,109,0.12);
    }
    .field-icon {
      display: inline-grid; place-items: center;
      width: 2.6rem; flex-shrink: 0; color: #475569;
    }
    .field-icon-at { font-size: 1rem; font-weight: 700; color: #475569; }
    .field-input {
      flex: 1; height: 2.75rem;
      background: transparent; border: none; outline: none;
      color: #f8fbff; font-size: 0.9rem; font-family: inherit;
      padding-right: 0.5rem;
    }
    .field-input::placeholder { color: #334155; }
    .field-err-icon {
      display: inline-grid; place-items: center;
      width: 2.2rem; flex-shrink: 0; color: #ff4d6d;
    }
    .field-eye {
      display: inline-grid; place-items: center; width: 2.4rem; height: 100%;
      background: none; border: none; color: #475569; cursor: pointer;
      border-radius: 0 10px 10px 0; transition: color 180ms ease; flex-shrink: 0;
    }
    .field-eye:hover { color: #94a3b8; }
    .field-error-msg {
      margin: 0.35rem 0 0;
      font-size: 0.78rem; color: #ff7096; line-height: 1.4;
      display: flex; align-items: center; gap: 0.3rem;
    }

    /* ── Password strength ── */
    .pw-strength { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.5rem; }
    .pw-strength-track {
      flex: 1; height: 4px; border-radius: 2px;
      background: rgba(255,255,255,0.08); overflow: hidden;
    }
    .pw-strength-fill {
      height: 100%; border-radius: 2px; width: 0;
      transition: width 300ms ease, background 300ms ease;
    }
    .pw-strength-fill.pw-weak { width: 33%; background: #ff4d6d; }
    .pw-strength-fill.pw-fair { width: 66%; background: #f59e0b; }
    .pw-strength-fill.pw-strong { width: 100%; background: #00f2ff; }
    .pw-strength-label { font-size: 0.73rem; font-weight: 600; color: #475569; white-space: nowrap; }
    .pw-label-weak { color: #ff7096; }
    .pw-label-fair { color: #fbbf24; }
    .pw-label-strong { color: #00f2ff; }

    /* ── Account summary ── */
    .account-summary {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem; margin-bottom: 1.5rem;
      border-radius: 12px; background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .summary-avatar {
      width: 2.75rem; height: 2.75rem; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, rgba(0,242,255,0.25), rgba(112,0,255,0.35));
      border: 1.5px solid rgba(0,242,255,0.25);
      display: grid; place-items: center;
      font-size: 0.85rem; font-weight: 900; color: #00f2ff;
    }
    .summary-info { min-width: 0; }
    .summary-name { font-size: 0.9rem; font-weight: 700; color: #f8fbff; }
    .summary-meta {
      display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;
      margin-top: 0.15rem;
    }
    .summary-username { font-size: 0.78rem; color: #7dd3fc; font-weight: 600; }
    .summary-sep { font-size: 0.78rem; color: #334155; }
    .summary-email { font-size: 0.78rem; color: #64748b; overflow: hidden; text-overflow: ellipsis; }
    .summary-badge {
      display: inline-block; margin-top: 0.35rem;
      font-size: 0.65rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
      padding: 2px 8px; border-radius: 4px;
      background: rgba(0,242,255,0.1); border: 1px solid rgba(0,242,255,0.2); color: #00f2ff;
    }

    /* ── CAPTCHA ── */
    .captcha-wrap {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.85rem 1rem; margin-bottom: 1.1rem;
      border-radius: 10px; background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.1);
      transition: border-color 180ms ease, background 180ms ease;
    }
    .captcha-wrap.captcha-verified { border-color: rgba(0,242,255,0.3); background: rgba(0,242,255,0.04); }
    .captcha-left { display: flex; align-items: center; gap: 0.75rem; }
    .captcha-clickable { cursor: pointer; }
    .captcha-checkbox {
      width: 1.25rem; height: 1.25rem; border-radius: 4px;
      border: 2px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.04);
      display: inline-grid; place-items: center; flex-shrink: 0;
      transition: border-color 180ms ease;
    }
    .captcha-checkbox.captcha-checked { border-color: #00f2ff; background: rgba(0,242,255,0.1); }
    .captcha-label { font-size: 0.9rem; color: #cbd5e1; }
    .captcha-label-done { color: #00f2ff; }
    .captcha-brand { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
    .captcha-logo { display: inline-grid; place-items: center; }
    .captcha-brand-text { display: flex; align-items: center; gap: 0.3rem; font-size: 0.65rem; color: #475569; }
    .captcha-brand-name { font-weight: 700; color: #64748b; }
    .captcha-brand-sep { color: #334155; }
    .captcha-brand-links { color: #475569; text-decoration: none; transition: color 150ms ease; }
    .captcha-brand-links:hover { color: #94a3b8; }
    .captcha-spinner {
      width: 0.85rem; height: 0.85rem; border-radius: 50%;
      border: 2px solid rgba(0,242,255,0.2); border-top-color: #00f2ff;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Terms / checkboxes ── */
    .terms-label {
      display: flex; align-items: flex-start; gap: 0.65rem;
      cursor: pointer; margin-bottom: 0.85rem;
    }
    .terms-text { font-size: 0.82rem; color: #64748b; line-height: 1.55; }
    .check-label {
      display: inline-flex; align-items: center; gap: 0.55rem;
      cursor: pointer; user-select: none; margin-bottom: 1.25rem;
    }
    .check-native { position: absolute; opacity: 0; width: 0; height: 0; }
    .check-box {
      width: 1.1rem; height: 1.1rem; border-radius: 5px;
      border: 1.5px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.04);
      display: inline-grid; place-items: center; flex-shrink: 0;
      transition: border-color 180ms ease, background 180ms ease;
    }
    .check-box.check-checked { background: #00f2ff; border-color: #00f2ff; }
    .check-text { font-size: 0.85rem; color: #94a3b8; }
    .inline-link { color: #00f2ff; text-decoration: none; font-weight: 600; transition: color 180ms ease; }
    .inline-link:hover { color: #7dd3fc; }

    /* ── Error banner ── */
    .error-banner {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.75rem 1rem; margin-bottom: 1.25rem;
      border-radius: 10px; background: rgba(255,77,109,0.08);
      border: 1px solid rgba(255,77,109,0.22);
      color: #ff7096; font-size: 0.875rem;
    }

    /* ── Submit ── */
    .btn-submit {
      width: 100%; height: 2.85rem; border-radius: 10px;
      background: #00f2ff; color: #031018; border: none;
      font-size: 0.95rem; font-weight: 800; cursor: pointer; font-family: inherit;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      box-shadow: 0 0 22px rgba(0,242,255,0.45);
      transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
      margin-bottom: 1.5rem;
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 32px rgba(0,242,255,0.65); }
    .btn-submit:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

    /* ── Loading dots ── */
    .btn-loading-dots { display: inline-flex; align-items: center; gap: 5px; }
    .btn-loading-dots span {
      width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.6;
      animation: dot-pulse 1.2s infinite;
    }
    .btn-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
    .btn-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dot-pulse {
      0%, 80%, 100% { transform: scale(0.75); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* ── Sign-in switch ── */
    .auth-switch { margin: 0; text-align: center; font-size: 0.875rem; color: #64748b; }
    .auth-switch-link {
      color: #00f2ff; text-decoration: none; font-weight: 700;
      margin-left: 0.3rem; transition: color 180ms ease;
    }
    .auth-switch-link:hover { color: #7dd3fc; }

    /* ── Role selection (step 0) ── */
    .role-select-card {
      width: 100%;
      max-width: 30rem;
      padding: 2.25rem;
      border-radius: 1.5rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 32px 80px rgba(0,0,0,0.32);
    }
    .role-options { display: flex; flex-direction: column; gap: 0.85rem; margin-top: 1.5rem; }
    .role-option {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
      padding: 1.1rem 1.25rem;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03);
      cursor: pointer;
      text-align: left;
      transition: all 200ms ease;
      font-family: inherit;
    }
    .role-option:hover { transform: translateY(-2px); }
    .role-option-seeker:hover {
      border-color: rgba(0,242,255,0.35);
      background: rgba(0,242,255,0.05);
      box-shadow: 0 8px 32px rgba(0,242,255,0.1);
    }
    .role-option-employer:hover {
      border-color: rgba(112,0,255,0.35);
      background: rgba(112,0,255,0.06);
      box-shadow: 0 8px 32px rgba(112,0,255,0.1);
    }
    .role-option-icon {
      width: 3rem; height: 3rem; border-radius: 12px;
      display: inline-grid; place-items: center; flex-shrink: 0;
    }
    .role-icon-seeker { background: rgba(0,242,255,0.1); color: #00f2ff; border: 1px solid rgba(0,242,255,0.2); }
    .role-icon-employer { background: rgba(112,0,255,0.15); color: #a78bfa; border: 1px solid rgba(112,0,255,0.25); }
    .role-option-body { flex: 1; min-width: 0; }
    .role-option-body strong { display: block; font-size: 0.95rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.25rem; }
    .role-option-body p { margin: 0; font-size: 0.8rem; color: #64748b; line-height: 1.5; }
    .role-option-tag {
      display: inline-block; margin-top: 0.4rem;
      font-size: 0.62rem; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase;
      padding: 2px 7px; border-radius: 4px;
    }
    .role-tag-seeker { background: rgba(0,242,255,0.08); border: 1px solid rgba(0,242,255,0.18); color: #00f2ff; }
    .role-tag-employer { background: rgba(112,0,255,0.1); border: 1px solid rgba(112,0,255,0.25); color: #a78bfa; }
    .role-option-arrow { color: #334155; flex-shrink: 0; transition: color 200ms ease, transform 200ms ease; }
    .role-option:hover .role-option-arrow { transform: translateX(3px); }
    .role-option-seeker:hover .role-option-arrow { color: #00f2ff; }
    .role-option-employer:hover .role-option-arrow { color: #a78bfa; }

    /* ── Back button ── */
    .btn-back {
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: none; border: none; cursor: pointer; font-family: inherit;
      font-size: 0.8rem; font-weight: 600; color: #475569;
      padding: 0; margin-bottom: 1.25rem;
      transition: color 180ms ease;
    }
    .btn-back:hover { color: #94a3b8; }

    /* ── Role badge in step 1 heading ── */
    .role-badge {
      display: inline-block;
      font-size: 0.72rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
      padding: 3px 9px; border-radius: 5px;
      background: rgba(0,242,255,0.08); border: 1px solid rgba(0,242,255,0.2); color: #00f2ff;
    }
    .role-badge-employer {
      background: rgba(112,0,255,0.1); border-color: rgba(112,0,255,0.25); color: #a78bfa;
    }

    @media (max-width: 640px) {
      .auth-card, .role-select-card { padding: 1.75rem 1.25rem; }
      .step-connector { width: 3rem; }
    }
  `]
})
export class SignupComponent {
  step = signal(0);
  selectedRole = signal<'job-seeker' | 'employer' | null>(null);

  name = '';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  agreeTerms = false;
  agreeMarketing = false;

  /* focus state */
  showPassword    = signal(false);
  nameFocused     = signal(false);
  usernameFocused = signal(false);
  emailFocused    = signal(false);
  pwFocused       = signal(false);
  confirmFocused  = signal(false);

  /* touched state — set on blur or when Continue is clicked */
  nameTouched     = signal(false);
  usernameTouched = signal(false);
  emailTouched    = signal(false);
  pwTouched       = signal(false);
  confirmTouched  = signal(false);

  loading       = signal(false);
  googleLoading = signal(false);
  captchaVerified = signal(false);
  captchaLoading  = signal(false);
  errorMsg        = signal('');

  /* ── Per-field error predicates ── */
  nameError    = computed(() => this.name.trim().length < 2);
  usernameError = computed(() => this.username.trim().length < 3);
  emailError   = computed(() => !this.email.includes('@') || !this.email.includes('.'));
  pwError      = computed(() => this.password.length < 8);
  confirmError = computed(() => this.confirmPassword !== this.password || this.confirmPassword.length === 0);

  /* Only show an error once the field has been touched */
  showNameError    = computed(() => this.nameTouched()    && this.nameError());
  showUsernameError = computed(() => this.usernameTouched() && this.usernameError());
  showEmailError   = computed(() => this.emailTouched()   && this.emailError());
  showPwError      = computed(() => this.pwTouched()      && this.pwError());
  showConfirmError = computed(() => this.confirmTouched() && this.confirmError());

  canProceedStep1 = computed(() =>
    !this.nameError() && !this.usernameError() && !this.emailError() &&
    !this.pwError()   && !this.confirmError()
  );

  canSubmit = computed(() => this.captchaVerified() && this.agreeTerms);

  nameInitials = computed(() => {
    const parts = this.name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  passwordStrength = computed<'weak' | 'fair' | 'strong' | ''>(() => {
    const p = this.password;
    if (!p) return '';
    if (p.length < 6) return 'weak';
    const score =
      (/[A-Z]/.test(p) ? 1 : 0) +
      (/\d/.test(p)    ? 1 : 0) +
      (/[^a-zA-Z0-9]/.test(p) ? 1 : 0);
    if (p.length >= 12 && score >= 2) return 'strong';
    if (p.length >= 8  && score >= 1) return 'fair';
    return 'weak';
  });

  passwordStrengthLabel = computed(() => {
    const s = this.passwordStrength();
    if (s === 'weak')   return 'Weak';
    if (s === 'fair')   return 'Fair';
    if (s === 'strong') return 'Strong';
    return '';
  });

  constructor(private auth: AuthService, private router: Router) {}

  selectRole(role: 'job-seeker' | 'employer') {
    this.selectedRole.set(role);
    this.step.set(1);
  }

  /* Touch all fields, then advance only if valid */
  tryProceed() {
    this.nameTouched.set(true);
    this.usernameTouched.set(true);
    this.emailTouched.set(true);
    this.pwTouched.set(true);
    this.confirmTouched.set(true);
    if (this.canProceedStep1()) {
      this.step.set(2);
    }
  }

  verifyCaptcha() {
    if (this.captchaVerified() || this.captchaLoading()) return;
    this.captchaLoading.set(true);
    setTimeout(() => {
      this.captchaLoading.set(false);
      this.captchaVerified.set(true);
    }, 1800);
  }

  async signupWithGoogle() {
    if (this.loading()) return;
    this.googleLoading.set(true);
    this.loading.set(true);
    const role = this.selectedRole() === 'employer' ? 'hr-leader' : 'job-seeker';
    await this.auth.loginWithGoogle(role);
    this.googleLoading.set(false);
    this.loading.set(false);
    this.router.navigate([role === 'job-seeker' ? '/candidate' : '/app']);
  }

  async onSubmit() {
    if (!this.canSubmit() || this.loading()) return;
    this.loading.set(true);
    const role = this.selectedRole() === 'employer' ? 'hr-leader' : 'job-seeker';
    const result = await this.auth.signup({
      name: this.name,
      username: this.username,
      email: this.email,
      password: this.password,
      role,
    });
    this.loading.set(false);
    if (result.success) {
      this.router.navigate([role === 'job-seeker' ? '/candidate' : '/app']);
    } else {
      this.errorMsg.set(result.error ?? 'Something went wrong. Please try again.');
    }
  }
}
