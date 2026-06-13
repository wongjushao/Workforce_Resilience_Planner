import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkforceService } from '../../services/workforce.service';
import { Employee } from '../../mock-data';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel">
      <div class="panel-header">
        <div class="header-top">
          <span class="panel-icon">⚠</span>
          <div>
            <h2>At-Risk Employees</h2>
            <p class="sub">{{ employees.length }} flagged for assessment</p>
          </div>
        </div>
        <div class="filter-row">
          <button
            *ngFor="let f of filters"
            class="filter-btn"
            [class.active]="activeFilter === f"
            (click)="setFilter(f)"
          >{{ f }}</button>
        </div>
      </div>

      <div class="emp-list">
        <div
          *ngFor="let emp of filteredEmployees"
          class="emp-card"
          [class.selected]="selectedId === emp.id"
          (click)="select(emp)"
        >
          <div class="emp-row">
            <div class="emp-avatar" [style.background]="avatarColor(emp.id)">
              {{ initials(emp.name) }}
            </div>
            <div class="emp-info">
              <span class="emp-name">{{ emp.name }}</span>
              <span class="emp-role">{{ emp.currentRole }}</span>
              <span class="emp-dept">{{ emp.department }}</span>
            </div>
            <div class="emp-risk">
              <div
                class="risk-badge"
                [style.background]="riskBg(emp.riskScore)"
                [style.color]="riskColor(emp.riskScore)"
              >
                {{ emp.riskScore }}%
              </div>
              <span class="risk-label" [style.color]="riskColor(emp.riskScore)">
                {{ svc.getRiskLabel(emp.riskScore) }}
              </span>
            </div>
          </div>

          <div class="reason-row">
            <span class="reason-tag">{{ emp.riskReason }}</span>
            <span class="yoe">{{ emp.yearsOfExperience }} yrs exp</span>
          </div>

          <div class="skill-pills">
            <span *ngFor="let sk of emp.skills.slice(0,4)" class="skill-pill">{{ sk.name }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .panel { height: 100%; display: flex; flex-direction: column; }

    .panel-header {
      padding: 20px 20px 0;
      border-bottom: 1px solid rgba(148,163,184,0.12);
      padding-bottom: 16px;
    }

    .header-top { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
    .panel-icon { font-size: 1.6rem; margin-top: 2px; filter: drop-shadow(0 0 6px #f97316aa); }

    h2 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #f1f5f9; font-family: 'DM Sans', sans-serif; }
    .sub { margin: 3px 0 0; font-size: 0.78rem; color: #64748b; }

    .filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .filter-btn {
      border: 1px solid rgba(148,163,184,0.2);
      background: transparent;
      color: #64748b;
      padding: 4px 10px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.75rem;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.15s;
    }
    .filter-btn.active, .filter-btn:hover {
      background: #1e3a5f;
      border-color: #3b82f6;
      color: #93c5fd;
    }

    .emp-list { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
    .emp-list::-webkit-scrollbar { width: 4px; }
    .emp-list::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 2px; }

    .emp-card {
      background: rgba(15,23,42,0.6);
      border: 1px solid rgba(148,163,184,0.1);
      border-radius: 12px;
      padding: 14px;
      cursor: pointer;
      transition: all 0.18s;
    }
    .emp-card:hover { border-color: rgba(59,130,246,0.4); background: rgba(15,23,42,0.8); }
    .emp-card.selected { border-color: #3b82f6; background: rgba(30,58,95,0.5); }

    .emp-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
    .emp-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem; color: #fff; flex-shrink: 0;
      font-family: 'DM Sans', sans-serif;
    }
    .emp-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .emp-name { font-weight: 600; color: #e2e8f0; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .emp-role { font-size: 0.78rem; color: #94a3b8; }
    .emp-dept { font-size: 0.72rem; color: #475569; }

    .emp-risk { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
    .risk-badge {
      padding: 3px 8px; border-radius: 6px; font-weight: 700;
      font-size: 0.8rem; font-family: 'IBM Plex Mono', monospace;
    }
    .risk-label { font-size: 0.68rem; font-weight: 600; }

    .reason-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .reason-tag {
      font-size: 0.72rem; background: rgba(249,115,22,0.12);
      color: #fb923c; border: 1px solid rgba(249,115,22,0.2);
      padding: 2px 8px; border-radius: 4px; font-family: 'DM Sans', sans-serif;
    }
    .yoe { font-size: 0.7rem; color: #475569; }

    .skill-pills { display: flex; flex-wrap: wrap; gap: 5px; }
    .skill-pill {
      background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);
      color: #93c5fd; font-size: 0.68rem; padding: 2px 7px; border-radius: 4px;
      font-family: 'IBM Plex Mono', monospace;
    }

    /* scrollbar */
  `],
})
export class EmployeeListComponent implements OnInit {
  @Output() employeeSelected = new EventEmitter<Employee>();

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  selectedId: number | null = null;
  activeFilter = 'All';
  filters = ['All', 'High Risk', 'AI Risk', 'Restructuring', 'Contract'];

  constructor(public svc: WorkforceService) {}

  ngOnInit(): void {
    this.employees = this.svc.getAtRiskEmployees();
    this.filteredEmployees = this.employees;
  }

  setFilter(f: string): void {
    this.activeFilter = f;
    if (f === 'All') { this.filteredEmployees = this.employees; return; }
    const map: Record<string, string> = {
      'High Risk': '', 'AI Risk': 'AI Automation Risk',
      'Restructuring': 'Role Restructuring', 'Contract': 'Contract Ending',
    };
    if (f === 'High Risk') {
      this.filteredEmployees = this.employees.filter(e => e.riskScore >= 75);
    } else {
      this.filteredEmployees = this.employees.filter(e => e.riskReason === map[f]);
    }
  }

  select(emp: Employee): void {
    this.selectedId = emp.id;
    this.employeeSelected.emit(emp);
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  avatarColor(id: number): string {
    const colors = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b'];
    return colors[id % colors.length];
  }

  riskColor(score: number): string {
    if (score >= 75) return '#ef4444';
    if (score >= 55) return '#f97316';
    return '#eab308';
  }

  riskBg(score: number): string {
    if (score >= 75) return 'rgba(239,68,68,0.12)';
    if (score >= 55) return 'rgba(249,115,22,0.12)';
    return 'rgba(234,179,8,0.12)';
  }
}
