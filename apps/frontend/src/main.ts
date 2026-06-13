import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { RouterRootComponent } from './app/router-root.component';

bootstrapApplication(RouterRootComponent, {
  providers: [
    provideRouter(routes),
  ],
}).catch(err => console.error(err));
