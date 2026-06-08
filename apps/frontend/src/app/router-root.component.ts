import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root bootstrap component — just a router outlet.
 * The marketing pages use SiteLayoutComponent for their nav/footer.
 * The app page uses AppComponent (the existing dashboard).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class RouterRootComponent {}
