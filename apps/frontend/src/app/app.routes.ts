import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { HowToUseComponent } from './pages/how-to-use/how-to-use.component';
import { FaqComponent } from './pages/faq/faq.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ForgotUsernameComponent } from './pages/forgot-username/forgot-username.component';
import { AppComponent } from './app.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Marketing / public pages
  { path: 'home',       component: LandingComponent },
  { path: 'how-to-use', component: HowToUseComponent },
  { path: 'faq',        component: FaqComponent },
  { path: 'privacy',    component: PrivacyComponent },
  { path: 'terms',      component: TermsComponent },

  // Auth pages
  { path: 'login',           component: LoginComponent },
  { path: 'signup',          component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'forgot-username', component: ForgotUsernameComponent },

  // The existing dashboard SPA lives at /app — requires authentication
  { path: 'app', component: AppComponent, canActivate: [authGuard] },

  // Default: go to the landing page
  { path: '',           redirectTo: 'home', pathMatch: 'full' },
  { path: '**',         redirectTo: 'home' },
];
