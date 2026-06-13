import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BodyClassService } from '../../services/body-class.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .cd-app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      font-family: 'DM Sans', sans-serif;
      color: #e2e8f0;
    }

    /* ── Topbar ── */
    .cd-topbar {
      height: 54px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      background: rgba(2,8,23,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0,242,255,0.08);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .cd-top-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .cd-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      font-size: 1.05rem;
      font-weight: 700;
      color: #e2e8f0;
      letter-spacing: -0.02em;
    }
    .cd-logo svg {
      flex-shrink: 0;
    }
    .cd-logo em {
      font-style: normal;
      color: #00f2ff;
    }
    .cd-sep {
      width: 1px;
      height: 22px;
      background: rgba(148,163,184,0.2);
    }
    .cd-nav {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .cd-nav button {
      padding: 5px 14px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.18s;
      font-family: inherit;
    }
    .cd-nav button:hover {
      color: #cbd5e1;
      background: rgba(148,163,184,0.08);
    }
    .cd-nav button.active {
      color: #00f2ff;
      background: rgba(0,242,255,0.08);
      box-shadow: inset 0 0 0 1px rgba(0,242,255,0.22);
    }
    .cd-top-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cd-find-jobs-btn {
      padding: 6px 16px;
      border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #0088bb 0%, #00f2ff 100%);
      color: #020817;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.18s;
      font-family: inherit;
      letter-spacing: 0.01em;
    }
    .cd-find-jobs-btn:hover {
      opacity: 0.88;
    }
    .cd-user-chip {
      padding: 4px 14px;
      border-radius: 20px;
      background: rgba(0,242,255,0.08);
      border: 1px solid rgba(0,242,255,0.18);
      color: #a0f0f8;
      font-size: 0.8rem;
      font-weight: 500;
    }

    /* ── Page body ── */
    .cd-body {
      flex: 1;
    }
    .cd-section {
      max-width: 1280px;
      margin: 0 auto;
      padding: 28px 24px;
    }

    /* ── Welcome ── */
    .cd-welcome {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .cd-welcome-h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0 0 6px;
    }
    .cd-welcome-sub {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
    }
    .cd-profile-btn {
      padding: 8px 20px;
      border-radius: 8px;
      border: 1px solid rgba(148,163,184,0.2);
      background: rgba(15,23,42,0.6);
      color: #cbd5e1;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.18s;
      font-family: inherit;
      white-space: nowrap;
    }
    .cd-profile-btn:hover {
      border-color: rgba(0,242,255,0.3);
      color: #00f2ff;
    }

    /* ── KPI row ── */
    .cd-kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 24px;
    }
    .cd-kpi {
      background: rgba(15,23,42,0.65);
      border: 1px solid rgba(148,163,184,0.1);
      border-radius: 14px;
      padding: 18px 20px;
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .cd-kpi-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }
    .cd-kpi-val {
      font-size: 1.8rem;
      font-weight: 700;
      color: #e2f8ff;
      font-family: 'IBM Plex Mono', monospace;
      line-height: 1;
    }
    .cd-kpi-lbl {
      color: #64748b;
      font-size: 0.78rem;
      margin-top: 4px;
      font-weight: 500;
    }

    /* ── Two-column grid ── */
    .cd-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 16px;
      align-items: start;
    }
    .cd-main-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .cd-side-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ── Card ── */
    .cd-card {
      background: rgba(15,23,42,0.65);
      border: 1px solid rgba(148,163,184,0.1);
      border-radius: 14px;
      padding: 20px;
      backdrop-filter: blur(8px);
    }
    .cd-card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .cd-card-title {
      font-size: 1rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0;
    }
    .cd-card-count {
      font-size: 0.78rem;
      color: #64748b;
      background: rgba(100,116,139,0.1);
      border: 1px solid rgba(100,116,139,0.15);
      padding: 2px 10px;
      border-radius: 20px;
    }
    .cd-card-sub {
      color: #475569;
      font-size: 0.8rem;
      margin: 0 0 14px;
    }

    /* ── Pipeline bar ── */
    .cd-pipeline-bar {
      display: flex;
      gap: 8px;
      margin: 16px 0 20px;
    }
    .cd-pipe-stage {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .cd-pipe-count {
      font-size: 1.2rem;
      font-weight: 700;
      font-family: 'IBM Plex Mono', monospace;
      line-height: 1;
    }
    .cd-pipe-label {
      font-size: 0.7rem;
      color: #64748b;
      text-transform: capitalize;
      font-weight: 500;
    }
    .cd-pipe-bar {
      width: 100%;
      height: 4px;
      border-radius: 4px;
      border: 1px solid;
      margin-top: 2px;
    }

    /* ── Application list ── */
    .cd-app-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .cd-app-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 10px;
      border-radius: 10px;
      transition: background 0.15s;
    }
    .cd-app-item:hover {
      background: rgba(148,163,184,0.05);
    }
    .cd-app-logo {
      font-size: 1.5rem;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(15,23,42,0.8);
      border: 1px solid rgba(148,163,184,0.12);
      border-radius: 8px;
      flex-shrink: 0;
    }
    .cd-app-info {
      flex: 1;
      min-width: 0;
    }
    .cd-app-role {
      display: block;
      font-size: 0.88rem;
      font-weight: 600;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cd-app-company {
      font-size: 0.75rem;
      color: #64748b;
    }
    .cd-app-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      flex-shrink: 0;
    }
    .cd-app-status {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 20px;
      white-space: nowrap;
    }
    .cd-app-match {
      font-size: 0.72rem;
      font-weight: 700;
      font-family: 'IBM Plex Mono', monospace;
    }

    /* ── Activity feed ── */
    .cd-activity-card {
      /* inherits .cd-card */
    }
    .cd-activity-list {
      display: flex;
      flex-direction: column;
      gap: 0;
      margin-top: 14px;
    }
    .cd-activity-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(148,163,184,0.06);
    }
    .cd-activity-item:last-child {
      border-bottom: none;
    }
    .cd-activity-icon {
      font-size: 1.1rem;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,242,255,0.06);
      border-radius: 8px;
      flex-shrink: 0;
    }
    .cd-activity-text p {
      margin: 0 0 2px;
      font-size: 0.82rem;
      color: #cbd5e1;
      line-height: 1.4;
    }
    .cd-activity-text span {
      font-size: 0.72rem;
      color: #475569;
    }

    /* ── Job matches ── */
    .cd-match-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 4px;
    }
    .cd-match-item {
      background: rgba(2,8,23,0.5);
      border: 1px solid rgba(148,163,184,0.08);
      border-radius: 10px;
      padding: 14px;
      transition: border-color 0.18s;
    }
    .cd-match-item:hover {
      border-color: rgba(0,242,255,0.2);
    }
    .cd-match-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .cd-match-logo {
      font-size: 1.4rem;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(15,23,42,0.8);
      border: 1px solid rgba(148,163,184,0.1);
      border-radius: 8px;
    }
    .cd-match-score {
      font-size: 1rem;
      font-weight: 700;
      font-family: 'IBM Plex Mono', monospace;
    }
    .cd-match-role {
      font-size: 0.88rem;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 2px;
    }
    .cd-match-company {
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 8px;
    }
    .cd-match-meta {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    .cd-match-meta span {
      font-size: 0.72rem;
      color: #475569;
      background: rgba(148,163,184,0.07);
      padding: 2px 8px;
      border-radius: 6px;
    }
    .cd-quick-apply {
      width: 100%;
      padding: 6px 0;
      border-radius: 7px;
      border: 1px solid rgba(0,242,255,0.2);
      background: rgba(0,242,255,0.06);
      color: #00f2ff;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s;
      font-family: inherit;
    }
    .cd-quick-apply:hover {
      background: rgba(0,242,255,0.12);
      border-color: rgba(0,242,255,0.4);
    }

    /* ── Profile strength ── */
    .cd-profile-pct {
      font-size: 1.1rem;
      font-weight: 700;
      font-family: 'IBM Plex Mono', monospace;
    }
    .cd-profile-bar-track {
      height: 6px;
      background: rgba(148,163,184,0.1);
      border-radius: 6px;
      overflow: hidden;
      margin: 14px 0 10px;
    }
    .cd-profile-bar-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.4s ease;
    }
    .cd-profile-tip {
      font-size: 0.75rem;
      color: #475569;
      margin: 0 0 14px;
    }
    .cd-checklist {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }
    .cd-check-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.82rem;
      color: #475569;
    }
    .cd-check-item.done {
      color: #94a3b8;
    }
    .cd-check-icon {
      font-size: 0.85rem;
      width: 18px;
      text-align: center;
      flex-shrink: 0;
    }
    .cd-check-item.done .cd-check-icon {
      color: #22c55e;
    }
    .cd-complete-btn {
      width: 100%;
      padding: 9px 0;
      border-radius: 9px;
      border: none;
      background: linear-gradient(135deg, #0088bb 0%, #00f2ff 100%);
      color: #020817;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.18s;
      font-family: inherit;
    }
    .cd-complete-btn:hover {
      opacity: 0.88;
    }

    /* ── See all link ── */
    .cd-see-all {
      background: none;
      border: none;
      color: #00f2ff;
      font-size: 0.78rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
      font-family: inherit;
    }
    .cd-see-all:hover {
      text-decoration: underline;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .cd-kpi-row {
        grid-template-columns: repeat(2, 1fr);
      }
      .cd-grid {
        grid-template-columns: 1fr;
      }
      .cd-side-col {
        order: -1;
      }
      .cd-welcome {
        flex-direction: column;
        gap: 12px;
      }
    }

    @media (max-width: 560px) {
      .cd-section {
        padding: 18px 14px;
      }
      .cd-kpi-row {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .cd-kpi-val {
        font-size: 1.4rem;
      }
      .cd-nav button {
        padding: 5px 10px;
        font-size: 0.78rem;
      }
    }
  `],
  template: `
<div class="cd-app">

  <!-- Topbar -->
  <header class="cd-topbar">
    <div class="cd-top-left">
      <a routerLink="/home" class="cd-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#00f2ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Talent<em>Pivot</em></span>
      </a>
      <span class="cd-sep"></span>
      <nav class="cd-nav">
        <button [class.active]="activeTab() === 'overview'" (click)="activeTab.set('overview')">Overview</button>
        <button [class.active]="activeTab() === 'applications'" (click)="activeTab.set('applications')">Applications</button>
        <button [class.active]="activeTab() === 'matches'" (click)="activeTab.set('matches')">Job Matches</button>
      </nav>
    </div>
    <div class="cd-top-right">
      <button class="cd-find-jobs-btn" (click)="goToJobs()">Browse Jobs</button>
      <span class="cd-user-chip">{{ auth.user()?.name }}</span>
    </div>
  </header>

  <!-- Page body -->
  <main class="cd-body">
    <div class="cd-section">

      <!-- Welcome header -->
      <div class="cd-welcome">
        <div>
          <h1 class="cd-welcome-h1">Welcome back, {{ firstName }} 👋</h1>
          <p class="cd-welcome-sub">You have 1 interview scheduled and 3 new job matches today.</p>
        </div>
        <button class="cd-profile-btn" (click)="goToProfile()">Edit Profile</button>
      </div>

      <!-- KPI row -->
      <div class="cd-kpi-row">
        <div class="cd-kpi">
          <div class="cd-kpi-icon" style="background:rgba(0,200,220,0.1);color:#00d4e8">📨</div>
          <div>
            <div class="cd-kpi-val">5</div>
            <div class="cd-kpi-lbl">Applications</div>
          </div>
        </div>
        <div class="cd-kpi">
          <div class="cd-kpi-icon" style="background:rgba(59,130,246,0.1);color:#60a5fa">📅</div>
          <div>
            <div class="cd-kpi-val">1</div>
            <div class="cd-kpi-lbl">Interview</div>
          </div>
        </div>
        <div class="cd-kpi">
          <div class="cd-kpi-icon" style="background:rgba(168,85,247,0.1);color:#c084fc">👀</div>
          <div>
            <div class="cd-kpi-val">847</div>
            <div class="cd-kpi-lbl">Profile Views</div>
          </div>
        </div>
        <div class="cd-kpi">
          <div class="cd-kpi-icon" style="background:rgba(34,197,94,0.1);color:#4ade80">⚡</div>
          <div>
            <div class="cd-kpi-val">91%</div>
            <div class="cd-kpi-lbl">Avg. Match</div>
          </div>
        </div>
      </div>

      <!-- Main two-column grid -->
      <div class="cd-grid">

        <!-- Left column -->
        <div class="cd-main-col">

          <!-- Application Pipeline -->
          <div class="cd-card">
            <div class="cd-card-head">
              <h2 class="cd-card-title">Application Pipeline</h2>
              <span class="cd-card-count">{{ applications.length }} active</span>
            </div>

            <!-- Pipeline stages bar -->
            <div class="cd-pipeline-bar">
              <div class="cd-pipe-stage" *ngFor="let stage of statusOrder">
                <div class="cd-pipe-count" [style.color]="statusColors[stage]">{{ stageCount(stage) }}</div>
                <div class="cd-pipe-label">{{ stage }}</div>
                <div class="cd-pipe-bar"
                     [style.background]="statusBg[stage]"
                     [style.border-color]="statusColors[stage] + '44'"></div>
              </div>
            </div>

            <!-- Application list -->
            <div class="cd-app-list">
              <div class="cd-app-item" *ngFor="let app of applications">
                <span class="cd-app-logo">{{ app.logo }}</span>
                <div class="cd-app-info">
                  <strong class="cd-app-role">{{ app.role }}</strong>
                  <span class="cd-app-company">{{ app.company }} · Applied {{ app.date }}</span>
                </div>
                <div class="cd-app-right">
                  <span class="cd-app-status"
                        [style.color]="statusColors[app.status]"
                        [style.background]="statusBg[app.status]">{{ app.statusLabel }}</span>
                  <span class="cd-app-match" [style.color]="matchColor(app.match)">{{ app.match }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Feed -->
          <div class="cd-card cd-activity-card">
            <h2 class="cd-card-title">Recent Activity</h2>
            <div class="cd-activity-list">
              <div class="cd-activity-item" *ngFor="let a of activity">
                <span class="cd-activity-icon">{{ a.icon }}</span>
                <div class="cd-activity-text">
                  <p>{{ a.text }}</p>
                  <span>{{ a.time }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Right column -->
        <div class="cd-side-col">

          <!-- AI Job Matches -->
          <div class="cd-card">
            <div class="cd-card-head">
              <h2 class="cd-card-title">AI Job Matches</h2>
              <button class="cd-see-all" (click)="goToJobs()">See all →</button>
            </div>
            <p class="cd-card-sub">Roles curated for your profile</p>
            <div class="cd-match-list">
              <div class="cd-match-item" *ngFor="let job of topMatches">
                <div class="cd-match-top">
                  <span class="cd-match-logo">{{ job.logo }}</span>
                  <span class="cd-match-score" [style.color]="matchColor(job.match)">{{ job.match }}%</span>
                </div>
                <div class="cd-match-role">{{ job.role }}</div>
                <div class="cd-match-company">{{ job.company }}</div>
                <div class="cd-match-meta">
                  <span>{{ job.salary }}</span>
                  <span>{{ job.location }}</span>
                </div>
                <button class="cd-quick-apply" (click)="goToJobs()">View Job →</button>
              </div>
            </div>
          </div>

          <!-- Profile Strength -->
          <div class="cd-card">
            <div class="cd-card-head">
              <h2 class="cd-card-title">Profile Strength</h2>
              <span class="cd-profile-pct" [style.color]="matchColor(profileCompletion())">{{ profileCompletion() }}%</span>
            </div>
            <div class="cd-profile-bar-track">
              <div class="cd-profile-bar-fill"
                   [style.width]="profileCompletion() + '%'"
                   [style.background]="'linear-gradient(90deg, #0088bb, #00f2ff)'"></div>
            </div>
            <p class="cd-profile-tip">Complete your profile to get more recruiter visibility</p>
            <div class="cd-checklist">
              <div class="cd-check-item" *ngFor="let s of profileSections" [class.done]="s.done">
                <span class="cd-check-icon">{{ s.done ? '✓' : '○' }}</span>
                <span>{{ s.label }}</span>
              </div>
            </div>
            <button class="cd-complete-btn" (click)="goToProfile()">Complete Profile</button>
          </div>

        </div>
      </div>

    </div>
  </main>

</div>
  `
})
export class CandidateDashboardComponent implements OnInit {
  activeTab = signal<string>('overview');

  applications = [
    { id: 1, role: 'Senior Frontend Engineer', company: 'Grab',         logo: '🟢', status: 'interview', statusLabel: 'Interview Scheduled', date: 'Jun 12', match: 96 },
    { id: 2, role: 'Product Manager',          company: 'AirAsia',      logo: '🔴', status: 'screening', statusLabel: 'Under Review',         date: 'Jun 10', match: 88 },
    { id: 3, role: 'UX Designer',              company: 'CIMB',         logo: '🏦', status: 'applied',   statusLabel: 'Applied',               date: 'Jun 8',  match: 84 },
    { id: 4, role: 'HR Analytics Lead',        company: 'TalentPivot',  logo: '◈',  status: 'final',     statusLabel: 'Final Round',           date: 'Jun 5',  match: 99 },
    { id: 5, role: 'Data Scientist',           company: 'Maxis',        logo: '🔵', status: 'applied',   statusLabel: 'Applied',               date: 'Jun 3',  match: 91 },
  ];

  topMatches = [
    { id: 6, role: 'DevOps Engineer',    company: 'Petronas Digital', logo: '⚡', match: 94, salary: 'RM 8K–12K/mo',    location: 'KL, MY', type: 'Full-time' },
    { id: 7, role: 'Backend Engineer',   company: 'Shopee',           logo: '🟠', match: 87, salary: 'RM 7K–10.5K/mo', location: 'KL, MY', type: 'Hybrid'    },
    { id: 8, role: 'Marketing Manager',  company: 'Lazada',           logo: '🛒', match: 76, salary: 'RM 7.5K–11K/mo', location: 'KL, MY', type: 'Full-time' },
  ];

  profileSections = [
    { label: 'Basic Info',       done: true  },
    { label: 'Work Experience',  done: true  },
    { label: 'Education',        done: true  },
    { label: 'Skills',           done: true  },
    { label: 'Resume Upload',    done: false },
    { label: 'Portfolio Links',  done: false },
    { label: 'References',       done: false },
  ];

  profileCompletion = computed(() => {
    const done = this.profileSections.filter(s => s.done).length;
    return Math.round((done / this.profileSections.length) * 100);
  });

  statusOrder = ['applied', 'screening', 'interview', 'final', 'offer'];

  statusColors: Record<string, string> = {
    applied:   '#64748b',
    screening: '#f59e0b',
    interview: '#3b82f6',
    final:     '#a855f7',
    offer:     '#22c55e',
  };

  statusBg: Record<string, string> = {
    applied:   'rgba(100,116,139,0.12)',
    screening: 'rgba(245,158,11,0.12)',
    interview: 'rgba(59,130,246,0.12)',
    final:     'rgba(168,85,247,0.12)',
    offer:     'rgba(34,197,94,0.12)',
  };

  activity = [
    { icon: '📨', text: 'You applied to Senior Frontend Engineer at Grab',        time: '2 days ago' },
    { icon: '📅', text: 'Interview scheduled with Grab for June 18, 2PM',          time: '1 day ago'  },
    { icon: '⭐', text: 'TalentPivot HR Analytics Lead matched 99% — apply now!', time: '5 hours ago' },
    { icon: '👀', text: 'Your profile was viewed by 3 recruiters',                 time: '3 hours ago' },
    { icon: '📋', text: 'AirAsia moved your application to Under Review',          time: '1 hour ago'  },
  ];

  constructor(
    private bodyClass: BodyClassService,
    public auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.bodyClass.setDashboard();
  }

  get firstName(): string {
    return this.auth.user()?.name?.split(' ')[0] ?? 'there';
  }

  stageCount(stage: string): number {
    return this.applications.filter(a => a.status === stage).length;
  }

  matchColor(m: number): string {
    return m >= 85 ? '#22c55e' : m >= 70 ? '#f59e0b' : '#ef4444';
  }

  goToJobs(): void {
    this.router.navigate(['/jobs']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
