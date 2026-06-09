import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { HowToUseComponent } from './pages/how-to-use/how-to-use.component';
import { FaqComponent } from './pages/faq/faq.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  // Marketing / public pages
  { path: 'home',       component: LandingComponent },
  { path: 'how-to-use', component: HowToUseComponent },
  { path: 'faq',        component: FaqComponent },
  { path: 'privacy',    component: PrivacyComponent },
  { path: 'terms',      component: TermsComponent },

  // The existing dashboard SPA lives at /app
  // AppComponent is the shell; routing within the app is handled by activeNav state
  { path: 'app',        component: AppComponent },

  // Default: go to the landing page
  { path: '',           redirectTo: 'home', pathMatch: 'full' },
  { path: '**',         redirectTo: 'home' },
];
