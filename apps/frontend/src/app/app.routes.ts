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
import { JobsComponent } from './pages/jobs/jobs.component';
import { CandidateDashboardComponent } from './pages/candidate/candidate-dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { jobSeekerGuard } from './guards/job-seeker.guard';
import { employerGuard } from './guards/employer.guard';

export const routes: Routes = [
  // Marketing / public pages
  { path: 'home',       component: LandingComponent },
  { path: 'how-to-use', component: HowToUseComponent },
  { path: 'faq',        component: FaqComponent },
  { path: 'privacy',    component: PrivacyComponent },
  { path: 'terms',      component: TermsComponent },

  // Career OS — public job search
  { path: 'jobs', component: JobsComponent },

  // Career OS — authenticated job seeker pages
  { path: 'candidate', component: CandidateDashboardComponent, canActivate: [jobSeekerGuard] },
  { path: 'profile',   component: ProfileComponent,            canActivate: [jobSeekerGuard] },

  // Auth pages
  { path: 'login',           component: LoginComponent },
  { path: 'signup',          component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'forgot-username', component: ForgotUsernameComponent },

  // TalentPivot WRP employer dashboard — employer/HR only
  { path: 'app', component: AppComponent, canActivate: [employerGuard] },

  // Default: go to the landing page
  { path: '',   redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
