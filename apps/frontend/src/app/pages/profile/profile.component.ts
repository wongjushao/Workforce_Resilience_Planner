import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SiteLayoutComponent } from '../site-layout.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SiteLayoutComponent],
  template: `
    <app-site-layout>
      <div class="profile-page">

        <!-- Profile hero header (below fixed nav) -->
        <div class="profile-hero">
          <div class="profile-hero-inner">
            <div class="profile-avatar-wrap">
              <div class="profile-avatar">AF</div>
              <div class="profile-avatar-edit">📷</div>
            </div>
            <div class="profile-hero-info">
              <h1 class="profile-name">{{ auth.user()?.name || 'Ahmad Fadzillah' }}</h1>
              <p class="profile-headline">{{ headline }}</p>
              <div class="profile-hero-meta">
                <span>📍 {{ location }}</span>
                <span>✉ {{ auth.user()?.email }}</span>
                <span>🔗 {{ linkedin }}</span>
              </div>
            </div>
            <button class="profile-save-btn" [class.saved]="saveSuccess()" (click)="saveProfile()">
              {{ saveSuccess() ? '✓ Saved!' : 'Save Profile' }}
            </button>
          </div>
        </div>

        <!-- Tab bar -->
        <div class="profile-tabs">
          <div class="profile-tabs-inner">
            <button
              *ngFor="let tab of tabs"
              class="profile-tab"
              [class.active]="activeTab() === tab.id"
              (click)="activeTab.set(tab.id)">
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Tab content -->
        <div class="profile-content">
          <div class="profile-content-inner">

            <!-- Personal Info -->
            <div *ngIf="activeTab() === 'info'" class="profile-section">
              <div class="profile-card">
                <h2 class="pc-title">Professional Headline</h2>
                <div class="form-field">
                  <label>Headline</label>
                  <input class="pf-input" [(ngModel)]="headline" placeholder="e.g. Senior Frontend Engineer · Angular" />
                </div>
                <div class="form-field">
                  <label>Professional Summary</label>
                  <textarea class="pf-input pf-textarea" [(ngModel)]="summary" rows="5"></textarea>
                </div>
              </div>
              <div class="profile-card">
                <h2 class="pc-title">Contact &amp; Links</h2>
                <div class="form-grid">
                  <div class="form-field">
                    <label>Phone</label>
                    <input class="pf-input" [(ngModel)]="phone" />
                  </div>
                  <div class="form-field">
                    <label>Location</label>
                    <input class="pf-input" [(ngModel)]="location" />
                  </div>
                  <div class="form-field">
                    <label>LinkedIn</label>
                    <input class="pf-input" [(ngModel)]="linkedin" />
                  </div>
                  <div class="form-field">
                    <label>Portfolio / GitHub</label>
                    <input class="pf-input" [(ngModel)]="portfolio" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Experience -->
            <div *ngIf="activeTab() === 'experience'" class="profile-section">
              <div class="profile-card exp-card" *ngFor="let exp of experience">
                <div class="exp-header">
                  <div class="exp-dot" [class.current]="exp.current"></div>
                  <div class="exp-info">
                    <h3 class="exp-role">{{ exp.role }}</h3>
                    <p class="exp-company">{{ exp.company }}</p>
                    <span class="exp-duration">{{ exp.duration }}</span>
                    <span class="exp-badge" *ngIf="exp.current">Current</span>
                  </div>
                </div>
                <p class="exp-desc">{{ exp.description }}</p>
              </div>
              <button class="add-btn">+ Add Experience</button>
            </div>

            <!-- Education -->
            <div *ngIf="activeTab() === 'education'" class="profile-section">
              <div class="profile-card" *ngFor="let edu of education">
                <div class="edu-row">
                  <div class="edu-icon">🎓</div>
                  <div>
                    <h3 class="edu-degree">{{ edu.degree }}</h3>
                    <p class="edu-institution">{{ edu.institution }}</p>
                    <div class="edu-meta">
                      <span>{{ edu.year }}</span>
                      <span>{{ edu.gpa }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button class="add-btn">+ Add Education</button>
            </div>

            <!-- Skills -->
            <div *ngIf="activeTab() === 'skills'" class="profile-section">
              <div class="profile-card" *ngFor="let cat of skillCategories()">
                <h2 class="pc-title">{{ cat }}</h2>
                <div class="skills-list">
                  <div class="skill-row" *ngFor="let skill of skillsByCategory(cat)">
                    <span class="skill-name">{{ skill.name }}</span>
                    <div class="skill-track">
                      <div class="skill-fill"
                        [style.width]="skill.proficiency + '%'"
                        [style.background]="skillColor(skill.proficiency)">
                      </div>
                    </div>
                    <span class="skill-pct" [style.color]="skillColor(skill.proficiency)">{{ skill.proficiency }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Documents -->
            <div *ngIf="activeTab() === 'documents'" class="profile-section">
              <div class="profile-card">
                <h2 class="pc-title">Resume / CV</h2>
                <div class="doc-upload-zone" [class.has-file]="resumeUploaded()">
                  <div *ngIf="resumeUploaded()" class="doc-uploaded">
                    <span class="doc-icon">📄</span>
                    <div class="doc-info">
                      <strong>{{ resumeFileName() }}</strong>
                      <span>PDF · Uploaded Jun 1, 2024</span>
                    </div>
                    <button class="doc-replace-btn">Replace</button>
                  </div>
                  <div *ngIf="!resumeUploaded()" class="doc-empty">
                    <div class="doc-empty-icon">📤</div>
                    <p>Drop your resume here or <span class="doc-browse">browse files</span></p>
                    <p class="doc-hint">PDF, DOC, DOCX · Max 10MB</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </app-site-layout>
  `,
  styles: [`
    /* ── Page shell ── */
    .profile-page {
      min-height: 100vh;
      padding-top: 76px;
    }

    /* ── Hero ── */
    .profile-hero {
      padding: 48px 24px 0;
      background: linear-gradient(180deg, rgba(0,242,255,0.04), transparent);
    }
    .profile-hero-inner {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
      padding-bottom: 32px;
    }
    .profile-avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }
    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0077bb, #00f2ff);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      font-weight: 800;
      color: #fff;
      box-shadow: 0 0 28px rgba(0,242,255,0.3);
    }
    .profile-avatar-edit {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: rgba(15,23,42,0.9);
      border: 1.5px solid rgba(0,242,255,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .profile-hero-info {
      flex: 1;
      min-width: 200px;
    }
    .profile-name {
      font-size: 1.6rem;
      font-weight: 800;
      color: #f1f5f9;
      margin: 0 0 4px;
    }
    .profile-headline {
      color: #00d4e8;
      font-size: 0.95rem;
      margin: 0 0 8px;
    }
    .profile-hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.82rem;
      color: #94a3b8;
    }
    .profile-hero-meta span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .profile-save-btn {
      padding: 10px 24px;
      border-radius: 999px;
      border: none;
      background: linear-gradient(135deg, #00d4e8, #00f2ff);
      color: #031018;
      font-size: 0.88rem;
      font-weight: 800;
      font-family: inherit;
      cursor: pointer;
      transition: background 300ms ease, box-shadow 200ms ease, transform 150ms ease;
      box-shadow: 0 0 20px rgba(0,242,255,0.3);
      flex-shrink: 0;
    }
    .profile-save-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 0 28px rgba(0,242,255,0.5);
    }
    .profile-save-btn.saved {
      background: linear-gradient(135deg, #16a34a, #22c55e);
      box-shadow: 0 0 20px rgba(34,197,94,0.35);
    }

    /* ── Tab bar ── */
    .profile-tabs {
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: rgba(3,7,18,0.8);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      position: sticky;
      top: 74px;
      z-index: 10;
    }
    .profile-tabs-inner {
      display: flex;
      gap: 4px;
      max-width: 900px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .profile-tab {
      padding: 14px 16px;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: color 180ms ease, border-color 180ms ease;
      white-space: nowrap;
    }
    .profile-tab:hover {
      color: #cbd5e1;
    }
    .profile-tab.active {
      color: #00f2ff;
      border-bottom-color: #00f2ff;
    }

    /* ── Content area ── */
    .profile-content {
      padding-bottom: 80px;
    }
    .profile-content-inner {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 24px;
    }
    .profile-section {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    /* ── Card ── */
    .profile-card {
      background: rgba(15,23,42,0.65);
      border: 1px solid rgba(148,163,184,0.1);
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 16px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .pc-title {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #00d4e8;
      margin: 0 0 16px;
      font-weight: 700;
    }

    /* ── Form ── */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      margin-bottom: 14px;
    }
    .form-field:last-child {
      margin-bottom: 0;
    }
    .form-field label {
      display: block;
      font-size: 0.76rem;
      color: #7e8fa2;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 600;
    }
    .pf-input {
      width: 100%;
      background: rgba(15,23,42,0.8);
      border: 1px solid rgba(148,163,184,0.15);
      border-radius: 8px;
      padding: 10px 12px;
      color: #e2e8f0;
      font-size: 0.88rem;
      box-sizing: border-box;
      font-family: inherit;
      transition: border-color 180ms ease, box-shadow 180ms ease;
    }
    .pf-input:focus {
      outline: none;
      border-color: rgba(0,242,255,0.5);
      box-shadow: 0 0 0 3px rgba(0,242,255,0.07);
    }
    .pf-textarea {
      resize: vertical;
      min-height: 100px;
      line-height: 1.6;
    }

    /* ── Experience ── */
    .exp-card {
      position: relative;
    }
    .exp-header {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .exp-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #00d4e8;
      margin-top: 5px;
      flex-shrink: 0;
      box-shadow: 0 0 8px rgba(0,212,232,0.5);
    }
    .exp-dot.current {
      background: #22c55e;
      box-shadow: 0 0 10px rgba(34,197,94,0.55);
    }
    .exp-info {
      flex: 1;
    }
    .exp-role {
      font-size: 1rem;
      font-weight: 800;
      color: #f1f5f9;
      margin: 0 0 2px;
    }
    .exp-company {
      color: #94a3b8;
      font-size: 0.88rem;
      margin: 0 0 6px;
    }
    .exp-duration {
      font-size: 0.78rem;
      color: #64748b;
      margin-right: 10px;
    }
    .exp-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(34,197,94,0.12);
      border: 1px solid rgba(34,197,94,0.3);
      color: #22c55e;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .exp-desc {
      color: #94a3b8;
      font-size: 0.87rem;
      line-height: 1.6;
      margin: 0;
      padding-left: 28px;
    }

    /* ── Education ── */
    .edu-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    .edu-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .edu-degree {
      font-size: 1rem;
      font-weight: 800;
      color: #f1f5f9;
      margin: 0 0 4px;
    }
    .edu-institution {
      color: #00d4e8;
      font-size: 0.88rem;
      margin: 0 0 8px;
    }
    .edu-meta {
      display: flex;
      gap: 16px;
      font-size: 0.8rem;
      color: #64748b;
    }

    /* ── Skills ── */
    .skills-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .skill-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .skill-name {
      width: 110px;
      flex-shrink: 0;
      font-size: 0.85rem;
      font-weight: 600;
      color: #cbd5e1;
    }
    .skill-track {
      flex: 1;
      height: 6px;
      background: rgba(148,163,184,0.12);
      border-radius: 999px;
      overflow: hidden;
    }
    .skill-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 600ms ease;
    }
    .skill-pct {
      width: 38px;
      flex-shrink: 0;
      text-align: right;
      font-size: 0.8rem;
      font-weight: 700;
    }

    /* ── Add button ── */
    .add-btn {
      display: block;
      width: 100%;
      padding: 14px;
      background: transparent;
      border: 1.5px dashed rgba(148,163,184,0.2);
      border-radius: 12px;
      color: #64748b;
      font-size: 0.88rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      text-align: center;
      transition: border-color 180ms ease, color 180ms ease, background 180ms ease;
    }
    .add-btn:hover {
      border-color: rgba(0,242,255,0.35);
      color: #00d4e8;
      background: rgba(0,242,255,0.04);
    }

    /* ── Documents ── */
    .doc-upload-zone {
      border: 1.5px dashed rgba(148,163,184,0.18);
      border-radius: 12px;
      padding: 24px;
      transition: border-color 200ms ease, background 200ms ease;
    }
    .doc-upload-zone.has-file {
      border-color: rgba(0,242,255,0.35);
      background: rgba(0,242,255,0.03);
    }
    .doc-uploaded {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .doc-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }
    .doc-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .doc-info strong {
      font-size: 0.92rem;
      color: #e2e8f0;
      font-weight: 700;
    }
    .doc-info span {
      font-size: 0.78rem;
      color: #64748b;
    }
    .doc-replace-btn {
      padding: 7px 16px;
      border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.2);
      background: transparent;
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: border-color 180ms ease, color 180ms ease;
      flex-shrink: 0;
    }
    .doc-replace-btn:hover {
      border-color: rgba(0,242,255,0.4);
      color: #00d4e8;
    }
    .doc-empty {
      text-align: center;
      padding: 16px 0;
    }
    .doc-empty-icon {
      font-size: 2.5rem;
      margin-bottom: 12px;
    }
    .doc-empty p {
      color: #64748b;
      font-size: 0.88rem;
      margin: 0 0 6px;
    }
    .doc-browse {
      color: #00d4e8;
      cursor: pointer;
      text-decoration: underline;
    }
    .doc-hint {
      font-size: 0.78rem !important;
      color: #475569 !important;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .profile-hero {
        padding: 32px 16px 0;
      }
      .profile-hero-inner {
        gap: 16px;
        padding-bottom: 24px;
      }
      .profile-name {
        font-size: 1.25rem;
      }
      .profile-hero-meta {
        flex-direction: column;
        gap: 6px;
      }
      .profile-save-btn {
        width: 100%;
        text-align: center;
      }
      .profile-tabs-inner {
        padding: 0 12px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .profile-tabs-inner::-webkit-scrollbar {
        display: none;
      }
      .profile-tab {
        padding: 12px 12px;
        font-size: 0.8rem;
      }
      .profile-content-inner {
        padding: 24px 16px;
      }
      .form-grid {
        grid-template-columns: 1fr;
      }
      .skill-name {
        width: 85px;
      }
      .exp-desc {
        padding-left: 0;
      }
      .doc-uploaded {
        flex-wrap: wrap;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  activeTab = signal<string>('info');
  saveSuccess = signal(false);

  tabs = [
    { id: 'info', label: 'Personal Info' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'documents', label: 'Documents' },
  ];

  // Personal info fields
  headline = 'Senior Software Engineer · Angular · TypeScript';
  summary = 'Passionate software engineer with 6+ years building scalable web applications across fintech and e-commerce. Led frontend architecture at a Series B startup, delivered a 40% improvement in page load times, and mentored a team of 5 engineers.';
  phone = '+60 12-345 6789';
  location = 'Kuala Lumpur, Malaysia';
  linkedin = 'linkedin.com/in/ahmadfadzillah';
  portfolio = 'github.com/ahmadfadzillah';

  // Work experience
  experience = [
    { id: 1, role: 'Senior Frontend Engineer', company: 'Grab', duration: 'Jan 2022 – Present', description: 'Led frontend architecture for Grab\'s payments web app. Reduced bundle size by 45% and improved Lighthouse score from 62 to 94. Mentored 5 junior engineers.', current: true },
    { id: 2, role: 'Frontend Developer', company: 'CIMB Digital', duration: 'Mar 2019 – Dec 2021', description: 'Built responsive banking web portal serving 2M+ users. Implemented accessibility improvements achieving WCAG AA compliance.', current: false },
    { id: 3, role: 'Junior Web Developer', company: 'Axiata Digital', duration: 'Jun 2017 – Feb 2019', description: 'Developed internal HR tools and customer-facing web applications using React and Django.', current: false },
  ];

  // Education
  education = [
    { id: 1, degree: 'B.Sc. Computer Science', institution: 'Universiti Malaya', year: '2013 – 2017', gpa: '3.82 / 4.00' },
    { id: 2, degree: 'AWS Solutions Architect', institution: 'Amazon Web Services', year: '2021', gpa: 'Professional Certification' },
  ];

  // Skills
  skills = [
    { name: 'Angular', proficiency: 95, category: 'Frontend' },
    { name: 'TypeScript', proficiency: 90, category: 'Frontend' },
    { name: 'React', proficiency: 80, category: 'Frontend' },
    { name: 'Node.js', proficiency: 75, category: 'Backend' },
    { name: 'Python', proficiency: 65, category: 'Backend' },
    { name: 'PostgreSQL', proficiency: 70, category: 'Database' },
    { name: 'AWS', proficiency: 72, category: 'Cloud' },
    { name: 'Docker', proficiency: 68, category: 'DevOps' },
  ];

  skillCategories = computed(() => [...new Set(this.skills.map(s => s.category))]);

  resumeFileName = signal<string>('Ahmad_Fadzillah_CV_2024.pdf');
  resumeUploaded = signal(true);

  saveProfile() {
    this.saveSuccess.set(true);
    setTimeout(() => this.saveSuccess.set(false), 3000);
  }

  skillsByCategory(cat: string) {
    return this.skills.filter(s => s.category === cat);
  }

  skillColor(p: number): string {
    return p >= 80 ? '#22c55e' : p >= 60 ? '#00d4e8' : '#f59e0b';
  }

  constructor(public auth: AuthService) {}
  ngOnInit() {}
}
