import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkforceService, EmployeePortfolio, MatchedVacancy } from '../../services/workforce.service';
import { Employee, getSkillAxes, getRoleProfile, SkillAxis } from '../../mock-data';
import { RadarChartComponent, RadarSeries } from '../radar-chart/radar-chart.component';
import { PrototypeDataService } from '../../services/prototype-data.service';

interface SkillGapRow {
  skill: string;
  current: number;
  required: number;
  gap: number;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RadarChartComponent],
  template: `
    <!-- Empty state -->
    <div *ngIf="!portfolio" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>Select an Employee</h3>
      <p>Choose an at-risk employee from the panel to generate their career transition portfolio.</p>
    </div>

    <!-- Portfolio -->
    <div *ngIf="portfolio" class="portfolio">

      <!-- ── SECTION TABS ────────────────────────────────────────────────── -->
      <div class="section-tabs">
        <button *ngFor="let t of tabs; let i=index"
          class="stab" [class.active]="activeSection===i"
          (click)="activeSection=i">
          <span class="stab-num">{{ i+1 }}</span>
          {{ t }}
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- SECTION 1 – Personal Info -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div *ngIf="activeSection===0" class="section s1">
        <div class="s1-top">
          <div class="s1-avatar" [style.background]="avatarColor(portfolio.employee.id)">
            {{ initials(portfolio.employee.name) }}
          </div>
          <div class="s1-details">
            <h2>{{ portfolio.employee.name }}</h2>
            <p class="s1-role">{{ portfolio.employee.currentRole }} · {{ portfolio.employee.department }}</p>
            <div class="s1-badges">
              <span class="badge risk"
                [style.background]="riskBg(portfolio.employee.riskScore)"
                [style.color]="riskCol(portfolio.employee.riskScore)">
                Risk: {{ portfolio.employee.riskScore }}%
              </span>
              <span class="badge perf">⭐ {{ portfolio.employee.performanceRating }}/5</span>
              <span class="badge yoe">{{ portfolio.employee.yearsOfExperience }} yrs exp</span>
            </div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-block">
            <label>Age</label><span>{{ portfolio.employee.age }}</span>
          </div>
          <div class="info-block">
            <label>Gender</label><span>{{ portfolio.employee.gender }}</span>
          </div>
          <div class="info-block">
            <label>Email</label><span>{{ portfolio.employee.email }}</span>
          </div>
          <div class="info-block">
            <label>Phone</label><span>{{ portfolio.employee.phone }}</span>
          </div>
          <div class="info-block">
            <label>Department</label><span>{{ portfolio.employee.department }}</span>
          </div>
          <div class="info-block">
            <label>Current Role</label><span>{{ portfolio.employee.currentRole }}</span>
          </div>
        </div>

        <div class="skills-section">
          <h4>Technical &amp; Soft Skills</h4>
          <div class="skill-bars">
            <div *ngFor="let sk of portfolio.employee.skills" class="skill-bar-row">
              <span class="skn">{{ sk.name }}</span>
              <div class="bar-track">
                <div class="bar-fill" [style.width]="(sk.proficiency/5*100)+'%'"
                  [style.background]="barColor(sk.proficiency)"></div>
              </div>
              <span class="skscore">{{ sk.proficiency }}/5</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- SECTION 2 – Skill Gap Analysis -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div *ngIf="activeSection===1" class="section s2">

        <div *ngIf="portfolio.noMatch" class="no-match">
          <span>🔍</span>
          <p>No suitable internal vacancies found for this employee's skill profile.</p>
        </div>

        <!-- Same-field matches (overlapping radar) -->
        <div *ngIf="portfolio.sameFieldMatches.length > 0">
          <div class="match-group-header">
            <span class="match-type-badge same">Same Field</span>
            <span class="match-hint">Radar charts overlap — showing skill gap to bridge</span>
          </div>

          <div class="match-cards">
            <div *ngFor="let v of portfolio.sameFieldMatches" class="match-card">
              <div class="match-card-header">
                <div>
                  <h4>{{ v.title }}</h4>
                  <p>{{ v.department }} · {{ v.company }}</p>
                </div>
                <div class="match-score-badge" [style.color]="matchScoreColor(v.matchScore)">
                  {{ v.matchScore }}% match
                </div>
              </div>

              <div class="chart-center">
                <app-radar-chart
                  [axes]="getAxes(portfolio.employee.currentRole)"
                  [series]="buildOverlapSeries(portfolio.employee, v)"
                  [size]="270"
                ></app-radar-chart>
              </div>

              <div class="gap-table">
                <div class="gap-head">
                  <span>Skill</span><span>Current</span><span>Required</span><span>Gap</span>
                </div>
                <div *ngFor="let row of buildGapTable(portfolio.employee, v)"
                  class="gap-row" [class.gap-neg]="row.gap < 0">
                  <span>{{ row.skill }}</span>
                  <span>{{ row.current }}</span>
                  <span>{{ row.required }}</span>
                  <span [style.color]="row.gap >= 0 ? '#22c55e' : '#ef4444'">
                    {{ row.gap >= 0 ? '+' : '' }}{{ row.gap.toFixed(1) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cross-role matches (side-by-side radar) -->
        <div *ngIf="portfolio.crossRoleMatches.length > 0" style="margin-top: 28px;">
          <div class="match-group-header">
            <span class="match-type-badge cross">Cross Role</span>
            <span class="match-hint">Charts shown side-by-side — different skill frameworks</span>
          </div>

          <div class="match-cards">
            <div *ngFor="let v of portfolio.crossRoleMatches" class="match-card">
              <div class="match-card-header">
                <div>
                  <h4>{{ v.title }}</h4>
                  <p>{{ v.department }} · {{ v.company }}</p>
                </div>
                <div class="match-score-badge" [style.color]="matchScoreColor(v.matchScore)">
                  {{ v.matchScore }}% match
                </div>
              </div>

              <div class="side-by-side">
                <div class="sbs-chart">
                  <p class="sbs-label current-label">Current: {{ portfolio.employee.currentRole }}</p>
                  <app-radar-chart
                    [axes]="getAxes(portfolio.employee.currentRole)"
                    [series]="buildCurrentSeries(portfolio.employee)"
                    [size]="230"
                  ></app-radar-chart>
                </div>
                <div class="sbs-divider">→</div>
                <div class="sbs-chart">
                  <p class="sbs-label target-label">Target: {{ v.title }}</p>
                  <app-radar-chart
                    [axes]="getAxes(v.title)"
                    [series]="buildTargetSeries(v)"
                    [size]="230"
                  ></app-radar-chart>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- SECTION 3 – HR Summary -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div *ngIf="activeSection===2" class="section s3">
        <div class="s3-header">
          <h3>HR Decision Summary</h3>
          <p>Confidential assessment for hiring managers</p>
        </div>

        <div class="summary-cards">
          <div class="sum-card risk-card">
            <div class="sum-icon">⚡</div>
            <h5>Layoff Risk Analysis</h5>
            <p><strong>Reason:</strong> {{ portfolio.employee.riskReason }}</p>
            <p><strong>Risk Score:</strong>
              <span [style.color]="riskCol(portfolio.employee.riskScore)">
                {{ portfolio.employee.riskScore }}% — {{ svc.getRiskLabel(portfolio.employee.riskScore) }}
              </span>
            </p>
            <p>{{ riskNarrative(portfolio.employee) }}</p>
          </div>

          <div class="sum-card perf-card">
            <div class="sum-icon">📊</div>
            <h5>Performance Review</h5>
            <div class="perf-stars">
              <span *ngFor="let s of [1,2,3,4,5]"
                [style.color]="s <= portfolio.employee.performanceRating ? '#f59e0b' : '#374151'">★</span>
              <span class="perf-score">{{ portfolio.employee.performanceRating }}/5</span>
            </div>
            <p class="review-text">{{ portfolio.employee.peerReview }}</p>
          </div>

          <div class="sum-card mgr-card">
            <div class="sum-icon">💼</div>
            <h5>Manager's Assessment</h5>
            <p class="review-text">{{ portfolio.employee.managerComment }}</p>
          </div>

          <div class="sum-card rec-card">
            <div class="sum-icon">🎯</div>
            <h5>Transition Recommendation</h5>
            <div *ngIf="!portfolio.noMatch">
              <p *ngIf="portfolio.sameFieldMatches.length > 0">
                <strong>{{ portfolio.sameFieldMatches.length }}</strong> same-field
                internal role{{ portfolio.sameFieldMatches.length > 1 ? 's' : '' }} available.
                Top match: <strong>{{ portfolio.sameFieldMatches[0].title }}</strong>
                ({{ portfolio.sameFieldMatches[0].matchScore }}% fit).
              </p>
              <p *ngIf="portfolio.crossRoleMatches.length > 0">
                <strong>{{ portfolio.crossRoleMatches.length }}</strong> cross-role
                opportunity{{ portfolio.crossRoleMatches.length > 1 ? 'ies' : 'y' }} found.
                Best option: <strong>{{ portfolio.crossRoleMatches[0].title }}</strong>
                ({{ portfolio.crossRoleMatches[0].matchScore }}% skill overlap).
              </p>
              <p class="rec-action">
                Recommend proceeding with reskilling programme.
                Timeline estimate: 3–6 months for same-field transitions,
                6–12 months for cross-role transitions.
              </p>
            </div>
            <p *ngIf="portfolio.noMatch" class="no-match-text">
              No suitable internal roles identified at this time.
              Consider external placement support or targeted reskilling
              before reassessment in 3 months.
            </p>
          </div>
        </div>

        <div class="hr-report-bar">
          <div class="hr-report-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>
              <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="hr-report-copy">
            <strong>Career transition report</strong>
            <p>Download the full HR summary as a PDF for records and manager review.</p>
          </div>
          <button type="button" class="hr-report-btn" (click)="downloadHrReport()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Download Report
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100%; gap: 12px; color: #475569;
      text-align: center; padding: 40px;
    }
    .empty-icon { font-size: 3rem; opacity: 0.4; }
    .empty-state h3 { margin: 0; color: #64748b; font-family: 'DM Sans', sans-serif; }
    .empty-state p { margin: 0; font-size: 0.88rem; max-width: 280px; }

    .portfolio { height: 100%; display: flex; flex-direction: column; }

    /* ── Section tabs ── */
    .section-tabs {
      display: flex; gap: 0; border-bottom: 1px solid rgba(148,163,184,0.12);
      background: rgba(2,8,23,0.6);
    }
    .stab {
      flex: 1; background: transparent; border: none;
      border-bottom: 2px solid transparent;
      color: #475569; padding: 14px 8px; cursor: pointer;
      font-size: 0.82rem; font-weight: 600; font-family: 'DM Sans', sans-serif;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      transition: all 0.15s;
    }
    .stab:hover { color: #94a3b8; }
    .stab.active { color: #60a5fa; border-bottom-color: #3b82f6; background: rgba(30,58,95,0.3); }
    .stab-num {
      width: 20px; height: 20px; border-radius: 50%;
      background: rgba(148,163,184,0.15); font-size: 0.72rem;
      display: flex; align-items: center; justify-content: center;
    }
    .stab.active .stab-num { background: #1e3a5f; color: #93c5fd; }

    .section { flex: 1; overflow-y: auto; padding: 24px; }
    .section::-webkit-scrollbar { width: 4px; }
    .section::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 2px; }

    /* ── S1 Personal Info ── */
    .s1-top { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 24px; }
    .s1-avatar {
      width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.4rem; color: #fff;
      font-family: 'DM Sans', sans-serif;
    }
    .s1-details h2 { margin: 0 0 4px; font-size: 1.35rem; color: #f1f5f9; font-family: 'DM Sans', sans-serif; }
    .s1-role { margin: 0 0 10px; color: #94a3b8; font-size: 0.88rem; }
    .s1-badges { display: flex; flex-wrap: wrap; gap: 7px; }
    .badge {
      padding: 3px 10px; border-radius: 20px; font-size: 0.75rem;
      font-weight: 600; font-family: 'IBM Plex Mono', monospace;
    }
    .badge.perf { background: rgba(245,158,11,0.12); color: #fbbf24; }
    .badge.yoe { background: rgba(99,102,241,0.12); color: #a5b4fc; }

    .info-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
      margin-bottom: 24px;
    }
    .info-block {
      background: rgba(15,23,42,0.6); border: 1px solid rgba(148,163,184,0.1);
      border-radius: 10px; padding: 12px 14px;
    }
    .info-block label { display: block; font-size: 0.7rem; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
    .info-block span { font-size: 0.85rem; color: #cbd5e1; font-family: 'DM Sans', sans-serif; }

    .skills-section h4 { margin: 0 0 14px; color: #94a3b8; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.06em; }
    .skill-bars { display: flex; flex-direction: column; gap: 10px; }
    .skill-bar-row { display: flex; align-items: center; gap: 10px; }
    .skn { width: 130px; flex-shrink: 0; font-size: 0.82rem; color: #94a3b8; }
    .bar-track { flex: 1; height: 6px; background: rgba(148,163,184,0.12); border-radius: 3px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
    .skscore { width: 40px; text-align: right; font-size: 0.78rem; color: #64748b; font-family: 'IBM Plex Mono', monospace; }

    /* ── S2 Skill Gap ── */
    .no-match {
      display: flex; align-items: center; gap: 16px;
      background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
      border-radius: 12px; padding: 20px;
    }
    .no-match span { font-size: 2rem; }
    .no-match p { margin: 0; color: #fca5a5; font-size: 0.88rem; }

    .match-group-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
    }
    .match-type-badge {
      padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;
      font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.04em;
    }
    .match-type-badge.same { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
    .match-type-badge.cross { background: rgba(168,85,247,0.12); color: #c084fc; border: 1px solid rgba(168,85,247,0.25); }
    .match-hint { font-size: 0.75rem; color: #475569; }

    .match-cards { display: flex; flex-direction: column; gap: 20px; }
    .match-card {
      background: rgba(15,23,42,0.7); border: 1px solid rgba(148,163,184,0.1);
      border-radius: 14px; padding: 20px; overflow: hidden;
    }
    .match-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .match-card-header h4 { margin: 0 0 4px; color: #e2e8f0; font-size: 1rem; font-family: 'DM Sans', sans-serif; }
    .match-card-header p { margin: 0; font-size: 0.78rem; color: #64748b; }
    .match-score-badge { font-size: 1rem; font-weight: 700; font-family: 'IBM Plex Mono', monospace; }

    .chart-center { display: flex; justify-content: center; margin-bottom: 16px; }

    .gap-table { font-size: 0.78rem; }
    .gap-head, .gap-row {
      display: grid; grid-template-columns: 1fr 80px 80px 60px;
      padding: 6px 8px; border-radius: 4px;
    }
    .gap-head { color: #475569; font-weight: 600; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; }
    .gap-row { color: #94a3b8; border-bottom: 1px solid rgba(148,163,184,0.06); }
    .gap-row.gap-neg { background: rgba(239,68,68,0.04); }

    .side-by-side { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; }
    .sbs-chart { display: flex; flex-direction: column; align-items: center; }
    .sbs-label { margin: 0 0 8px; font-size: 0.8rem; font-weight: 600; font-family: 'DM Sans', sans-serif; }
    .current-label { color: #60a5fa; }
    .target-label { color: #a78bfa; }
    .sbs-divider { font-size: 1.5rem; color: #374151; }

    /* ── S3 Summary ── */
    .s3-header { margin-bottom: 20px; }
    .s3-header h3 { margin: 0 0 4px; color: #f1f5f9; font-size: 1.15rem; font-family: 'DM Sans', sans-serif; }
    .s3-header p { margin: 0; font-size: 0.8rem; color: #64748b; }

    .summary-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; }
    .sum-card {
      background: rgba(15,23,42,0.7); border-radius: 12px; padding: 18px;
      border: 1px solid rgba(148,163,184,0.1);
    }
    .risk-card { border-left: 3px solid #ef4444; }
    .perf-card { border-left: 3px solid #f59e0b; }
    .mgr-card  { border-left: 3px solid #3b82f6; }
    .rec-card  { border-left: 3px solid #22c55e; }

    .sum-icon { font-size: 1.4rem; margin-bottom: 8px; }
    .sum-card h5 { margin: 0 0 10px; color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; }
    .sum-card p { margin: 0 0 6px; font-size: 0.82rem; color: #94a3b8; line-height: 1.5; }
    .sum-card p:last-child { margin-bottom: 0; }
    .sum-card strong { color: #cbd5e1; }

    .perf-stars { display: flex; align-items: center; gap: 4px; font-size: 1.2rem; margin-bottom: 10px; }
    .perf-score { font-size: 0.82rem; color: #64748b; margin-left: 6px; font-family: 'IBM Plex Mono', monospace; }
    .review-text { font-style: italic; color: #64748b !important; font-size: 0.8rem !important; }
    .rec-action { color: #4ade80 !important; }
    .no-match-text { color: #f87171 !important; }

    .hr-report-bar {
      display: flex; align-items: center; gap: 18px;
      padding: 18px 20px; border-radius: 12px;
      background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(15,23,42,0.6));
      border: 1px solid rgba(59,130,246,0.22);
    }
    .hr-report-icon {
      width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(59,130,246,0.14); color: #60a5fa;
    }
    .hr-report-copy { flex: 1; min-width: 0; }
    .hr-report-copy strong {
      display: block; font-size: 0.92rem; color: #e2e8f0; margin-bottom: 4px;
    }
    .hr-report-copy p {
      margin: 0; font-size: 0.8rem; color: #94a3b8; line-height: 1.5;
    }
    .hr-report-btn {
      flex-shrink: 0; display: inline-flex; align-items: center; gap: 8px;
      white-space: nowrap; padding: 10px 20px; border: none; border-radius: 8px;
      background: #1d4ed8; color: #fff; font-size: 0.85rem; font-weight: 700;
      font-family: 'DM Sans', sans-serif; cursor: pointer;
      box-shadow: 0 4px 14px rgba(29,78,216,0.25); transition: background 0.15s, box-shadow 0.15s;
    }
    .hr-report-btn:hover { background: #2563eb; box-shadow: 0 6px 18px rgba(37,99,235,0.35); }
  `],
})
export class PortfolioComponent implements OnChanges {
  @Input() employee: Employee | null = null;

  portfolio: EmployeePortfolio | null = null;
  activeSection = 0;
  tabs = ['Personal Info', 'Skill Gap Analysis', 'HR Summary'];
  private prototype = inject(PrototypeDataService);

  constructor(public svc: WorkforceService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee'] && this.employee) {
      this.portfolio = this.svc.generatePortfolio(this.employee);
      this.activeSection = 0;
    }
    if (!this.employee) this.portfolio = null;
  }

  getAxes(role: string): SkillAxis[] { return getSkillAxes(role); }

  buildOverlapSeries(emp: Employee, vacancy: MatchedVacancy): RadarSeries[] {
    return [
      {
        label: `Current: ${emp.currentRole}`,
        scores: emp.skillScores,
        color: '#60a5fa',
        fillAlpha: 0.2,
      },
      {
        label: `Target: ${vacancy.title}`,
        scores: vacancy.requiredSkillScores,
        color: '#a78bfa',
        fillAlpha: 0.15,
      },
    ];
  }

  buildCurrentSeries(emp: Employee): RadarSeries[] {
    return [{ label: emp.currentRole, scores: emp.skillScores, color: '#60a5fa', fillAlpha: 0.25 }];
  }

  buildTargetSeries(vacancy: MatchedVacancy): RadarSeries[] {
    return [{ label: vacancy.title, scores: vacancy.requiredSkillScores, color: '#a78bfa', fillAlpha: 0.25 }];
  }

  buildGapTable(emp: Employee, vacancy: MatchedVacancy): SkillGapRow[] {
    const axes = getSkillAxes(emp.currentRole);
    return axes.map(ax => {
      const current = +(emp.skillScores[ax.key] ?? 0).toFixed(1);
      const required = +(vacancy.requiredSkillScores[ax.key] ?? 0).toFixed(1);
      return { skill: ax.label, current, required, gap: +(current - required).toFixed(1) };
    });
  }

  downloadHrReport() {
    this.prototype.downloadCareerProfile();
  }

  riskNarrative(emp: Employee): string {
    const narr: Record<string, string> = {
      'AI Automation Risk': `The ${emp.currentRole} role is increasingly being automated by AI-assisted tooling. An estimated 60-70% of routine tasks in this role can now be completed by AI co-pilots, reducing headcount demand.`,
      'Role Restructuring': `Departmental restructuring has identified this position as redundant following the consolidation of IT operations teams. The role is being absorbed into a centralised function.`,
      'Contract Ending': `The employee is on a fixed-term contract that concludes at the end of this quarter. Business justification exists to convert to permanent employment via internal transfer.`,
      'Budget Cuts': `Departmental cost reduction targets require headcount reduction. This role has been flagged in the efficiency review. Employee performance is not a factor.`,
      'Performance': `The employee has not met OKR targets for two consecutive quarters. A formal performance improvement plan is in place. Transition may be considered as an alternative to termination.`,
      'Redundancy': `The position has been identified as duplicative following the merger of two business units. Skillset overlap with existing permanent staff makes this role surplus to requirements.`,
    };
    return narr[emp.riskReason] ?? 'Risk assessment pending further review.';
  }

  matchScoreColor(score: number): string {
    if (score >= 80) return '#4ade80';
    if (score >= 60) return '#fbbf24';
    return '#f87171';
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  avatarColor(id: number): string {
    const colors = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b'];
    return colors[id % colors.length];
  }

  riskCol(score: number): string {
    if (score >= 75) return '#ef4444';
    if (score >= 55) return '#f97316';
    return '#eab308';
  }

  riskBg(score: number): string {
    if (score >= 75) return 'rgba(239,68,68,0.12)';
    if (score >= 55) return 'rgba(249,115,22,0.12)';
    return 'rgba(234,179,8,0.12)';
  }

  barColor(val: number): string {
    if (val >= 4) return '#22c55e';
    if (val >= 3) return '#3b82f6';
    if (val >= 2) return '#f59e0b';
    return '#ef4444';
  }
}
