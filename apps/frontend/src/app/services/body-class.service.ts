import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BodyClassService {
  setMarketing() {
    document.body.classList.remove('dashboard-bg');
    document.body.classList.add('marketing-bg');
  }
  setDashboard() {
    document.body.classList.remove('marketing-bg');
    document.body.classList.add('dashboard-bg');
  }
}
