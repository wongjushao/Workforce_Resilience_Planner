import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Employee, Vacancy, MOCK_EMPLOYEES, MOCK_VACANCIES,
  SkillAxis, getAxes, getRoleProfile, isSameDomain, computeMatchScore, getDomain, SKILL_AXES,
} from './mock-data';

// ─── API types (from existing backend) ───────────────────────────────────────
type IntakeDocument = {
  id: number; originalFilename: string; fileType: string;
  fileSize: number; extractedText: string | null;
  rowCount: number | null; status: string; createdAt: string;
};
type AtRiskSubmission = {
  id: number; name: string; currentRole: string | null;
  department: string | null; email: string | null;
  skills: string | null; departureReason: string; source: string; createdAt: string;
};
type ManualForm = { name: string; currentRole: string; department: string; email: string; skills: string; departureReason: string; };

interface MatchedVacancy extends Vacancy { matchType: 'same-field' | 'cross-role'; matchScore: number; }
interface RadarSeries { label: string; scores: Record<string, number>; color: string; fillAlpha?: number; }
interface GapRow { axis: string; current: number; required: number; gap: number; }

// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewChecked {

  // ── Nav ────────────────────────────────────────────────────────────────────
  activeNav: 'dashboard' | 'intake' | 'employees' | 'vacancies' | 'portfolio' = 'dashboard';
  intakeTab: 'documents' | 'manual' = 'documents';

  // ── API data ───────────────────────────────────────────────────────────────
  documents: IntakeDocument[] = [];
  submissions: AtRiskSubmission[] = [];
  intakeLoading = false; intakeError = '';
  selectedFile: File | null = null;
  uploadLoading = false; uploadError = ''; uploadSuccess = '';
  manualLoading = false; manualError = ''; manualSuccess = '';
  manualForm: ManualForm = { name:'', currentRole:'', department:'', email:'', skills:'', departureReason:'' };

  // ── Local mock data (editable) ─────────────────────────────────────────────
  employees: Employee[] = [];
  vacancies: Vacancy[] = [];
  private nextEmpId = 100;
  private nextVacId = 100;

  // ── Employee CRUD ──────────────────────────────────────────────────────────
  editingEmployee: Employee | null = null;
  empForm: Partial<Employee> & { skillsRaw: string } = this.blankEmpForm();
  empFormError = '';
  showEmpModal = false;
  empFilterText = '';

  // ── Vacancy CRUD ───────────────────────────────────────────────────────────
  editingVacancy: Vacancy | null = null;
  vacForm: Partial<Vacancy> & { skillsRaw: string } = this.blankVacForm();
  vacFormError = '';
  showVacModal = false;
  vacFilterText = '';

  // ── Portfolio / risk analysis ──────────────────────────────────────────────
  portfolioEmployee: Employee | null = null;
  portfolioTab: 0 | 1 | 2 = 0;
  sameFieldMatches: MatchedVacancy[] = [];
  crossRoleMatches: MatchedVacancy[] = [];
  selectedVacancy: MatchedVacancy | null = null;

  // ── Confirm dialog ─────────────────────────────────────────────────────────
  confirmMsg = ''; confirmCb: (() => void) | null = null; showConfirm = false;

  // ── Canvas refs (radar) ───────────────────────────────────────────────────
  @ViewChild('radarOverlap') radarOverlapRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('radarLeft')    radarLeftRef?:    ElementRef<HTMLCanvasElement>;
  @ViewChild('radarRight')   radarRightRef?:   ElementRef<HTMLCanvasElement>;
  private pendingRadarDraw = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.employees = JSON.parse(JSON.stringify(MOCK_EMPLOYEES));
    this.vacancies = JSON.parse(JSON.stringify(MOCK_VACANCIES));
    this.nextEmpId = Math.max(...this.employees.map(e => e.id)) + 1;
    this.nextVacId = Math.max(...this.vacancies.map(v => v.id)) + 1;
    void this.loadIntakeData();
  }

  ngAfterViewChecked() {
    if (this.pendingRadarDraw) {
      this.pendingRadarDraw = false;
      this.drawRadar();
    }
  }

  // ─── API helpers ──────────────────────────────────────────────────────────
  private readonly TIMEOUT = 10_000;
  private async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const ctrl = new AbortController();
    const tid = window.setTimeout(() => ctrl.abort(), this.TIMEOUT);
    try {
      const res = await fetch(path, { ...init, signal: ctrl.signal });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof body.error === 'string' ? body.error : `HTTP ${res.status}`);
      return body as T;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') throw new Error(`Timed out: ${path}`);
      throw e;
    } finally { window.clearTimeout(tid); }
  }

  private async loadIntakeData() {
    this.intakeLoading = true; this.intakeError = '';
    try {
      const [docs, subs] = await Promise.all([
        this.fetchJson<IntakeDocument[]>('/api/intake/documents'),
        this.fetchJson<AtRiskSubmission[]>('/api/intake/employees'),
      ]);
      this.documents = docs; this.submissions = subs;
    } catch (e) {
      this.intakeError = e instanceof Error ? e.message : 'Could not load intake data.';
    } finally { this.intakeLoading = false; }
  }

  onFileSelected(ev: Event) {
    this.selectedFile = (ev.target as HTMLInputElement).files?.[0] ?? null;
    this.uploadError = ''; this.uploadSuccess = '';
  }

  async uploadDocument() {
    if (!this.selectedFile) { this.uploadError = 'Please choose a file.'; return; }
    const ok = ['.csv','.pdf','.doc','.docx'].some(e => this.selectedFile!.name.toLowerCase().endsWith(e));
    if (!ok) { this.uploadError = 'Supported: CSV, PDF, DOC, DOCX.'; return; }
    this.uploadLoading = true; this.uploadError = ''; this.uploadSuccess = '';
    const fd = new FormData(); fd.append('file', this.selectedFile);
    try {
      const rec = await this.fetchJson<IntakeDocument>('/api/intake/documents', { method:'POST', body:fd });
      this.documents = [rec, ...this.documents];
      this.uploadSuccess = `Uploaded ${rec.originalFilename} successfully.`;
      this.selectedFile = null;
    } catch (e) { this.uploadError = e instanceof Error ? e.message : 'Upload failed.'; }
    finally { this.uploadLoading = false; }
  }

  async submitManualEmployee() {
    this.manualLoading = true; this.manualError = ''; this.manualSuccess = '';
    try {
      const rec = await this.fetchJson<AtRiskSubmission>('/api/intake/employees', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(this.manualForm),
      });
      this.submissions = [rec, ...this.submissions];
      this.manualSuccess = `Saved details for ${rec.name}.`;
      this.manualForm = { name:'', currentRole:'', department:'', email:'', skills:'', departureReason:'' };
    } catch (e) { this.manualError = e instanceof Error ? e.message : 'Submission failed.'; }
    finally { this.manualLoading = false; }
  }

  // ─── Employee CRUD ─────────────────────────────────────────────────────────
  get filteredEmployees() {
    const t = this.empFilterText.toLowerCase();
    return t ? this.employees.filter(e =>
      e.name.toLowerCase().includes(t) || e.currentRole.toLowerCase().includes(t) || e.department.toLowerCase().includes(t)
    ) : this.employees;
  }

  openAddEmployee() {
    this.editingEmployee = null;
    this.empForm = this.blankEmpForm();
    this.empFormError = ''; this.showEmpModal = true;
  }

  openEditEmployee(emp: Employee) {
    this.editingEmployee = emp;
    this.empForm = {
      ...JSON.parse(JSON.stringify(emp)),
      skillsRaw: emp.skills.map(s => `${s.name}:${s.proficiency}`).join(', '),
    };
    this.empFormError = ''; this.showEmpModal = true;
  }

  saveEmployee() {
    if (!this.empForm.name?.trim()) { this.empFormError = 'Name is required.'; return; }
    if (!this.empForm.currentRole?.trim()) { this.empFormError = 'Role is required.'; return; }
    const skills = this.parseSkillsRaw(this.empForm.skillsRaw ?? '');
    const role = this.empForm.currentRole!.trim();
    const profile = getRoleProfile(role);
    const emp: Employee = {
      id: this.editingEmployee?.id ?? this.nextEmpId++,
      name: this.empForm.name!.trim(),
      age: +(this.empForm.age ?? 30),
      gender: this.empForm.gender ?? 'Unspecified',
      email: this.empForm.email ?? '',
      phone: this.empForm.phone ?? '',
      department: this.empForm.department ?? '',
      currentRole: role,
      yearsOfExperience: +(this.empForm.yearsOfExperience ?? 0),
      riskScore: +(this.empForm.riskScore ?? 50),
      riskReason: (this.empForm.riskReason as any) ?? 'Role Restructuring',
      skills,
      skillScores: Object.keys(profile).length ? profile : this.buildScoresFromSkills(skills),
      peerReview: this.empForm.peerReview ?? '',
      managerComment: this.empForm.managerComment ?? '',
      performanceRating: +(this.empForm.performanceRating ?? 3),
    };
    if (this.editingEmployee) {
      const idx = this.employees.findIndex(e => e.id === emp.id);
      if (idx >= 0) this.employees[idx] = emp;
    } else {
      this.employees = [emp, ...this.employees];
    }
    this.showEmpModal = false;
  }

  deleteEmployee(emp: Employee) {
    this.confirm(`Delete employee "${emp.name}"?`, () => {
      this.employees = this.employees.filter(e => e.id !== emp.id);
    });
  }

  // Skills inline edit inside the modal
  addSkillRow() {
    const cur = this.parseSkillsRaw(this.empForm.skillsRaw ?? '');
    cur.push({ name: '', proficiency: 3 });
    this.empForm.skillsRaw = cur.map(s => `${s.name}:${s.proficiency}`).join(', ');
  }
  removeSkillByIndex(i: number) {
    const cur = this.parseSkillsRaw(this.empForm.skillsRaw ?? '');
    cur.splice(i, 1);
    this.empForm.skillsRaw = cur.map(s => `${s.name}:${s.proficiency}`).join(', ');
  }
  get parsedSkillRows() { return this.parseSkillsRaw(this.empForm.skillsRaw ?? ''); }
  updateSkillName(i: number, val: string) {
    const rows = this.parseSkillsRaw(this.empForm.skillsRaw ?? '');
    rows[i].name = val;
    this.empForm.skillsRaw = rows.map(s => `${s.name}:${s.proficiency}`).join(', ');
  }
  updateSkillProf(i: number, val: number) {
    const rows = this.parseSkillsRaw(this.empForm.skillsRaw ?? '');
    rows[i].proficiency = val;
    this.empForm.skillsRaw = rows.map(s => `${s.name}:${s.proficiency}`).join(', ');
  }

  // ─── Vacancy CRUD ──────────────────────────────────────────────────────────
  get filteredVacancies() {
    const t = this.vacFilterText.toLowerCase();
    return t ? this.vacancies.filter(v =>
      v.title.toLowerCase().includes(t) || v.department.toLowerCase().includes(t)
    ) : this.vacancies;
  }

  openAddVacancy() {
    this.editingVacancy = null;
    this.vacForm = this.blankVacForm();
    this.vacFormError = ''; this.showVacModal = true;
  }

  openEditVacancy(vac: Vacancy) {
    this.editingVacancy = vac;
    this.vacForm = {
      ...JSON.parse(JSON.stringify(vac)),
      skillsRaw: Object.entries(vac.requiredSkillScores).map(([k,v]) => `${k}:${v}`).join(', '),
    };
    this.vacFormError = ''; this.showVacModal = true;
  }

  saveVacancy() {
    if (!this.vacForm.title?.trim()) { this.vacFormError = 'Title is required.'; return; }
    const reqScores = this.parseScoresRaw(this.vacForm.skillsRaw ?? '');
    const vac: Vacancy = {
      id: this.editingVacancy?.id ?? this.nextVacId++,
      title: this.vacForm.title!.trim(),
      department: this.vacForm.department ?? '',
      company: this.vacForm.company ?? '',
      requiredSkillScores: reqScores,
    };
    if (this.editingVacancy) {
      const idx = this.vacancies.findIndex(v => v.id === vac.id);
      if (idx >= 0) this.vacancies[idx] = vac;
    } else {
      this.vacancies = [vac, ...this.vacancies];
    }
    this.showVacModal = false;
  }

  deleteVacancy(vac: Vacancy) {
    this.confirm(`Delete vacancy "${vac.title}"?`, () => {
      this.vacancies = this.vacancies.filter(v => v.id !== vac.id);
    });
  }

  // ─── Portfolio ─────────────────────────────────────────────────────────────
  openPortfolio(emp: Employee) {
    this.portfolioEmployee = emp;
    this.portfolioTab = 0;
    this.selectedVacancy = null;
    this.computeMatches(emp);
    this.activeNav = 'portfolio';
  }

  selectVacancy(mv: MatchedVacancy) {
    this.selectedVacancy = mv;
    this.portfolioTab = 1;
    this.pendingRadarDraw = true;
    this.cdr.detectChanges();
  }

  setPortfolioTab(t: 0 | 1 | 2) {
    this.portfolioTab = t;
    if (t === 1 && this.selectedVacancy) {
      this.pendingRadarDraw = true;
      this.cdr.detectChanges();
    }
  }

  private computeMatches(emp: Employee) {
    this.sameFieldMatches = [];
    this.crossRoleMatches = [];
    for (const v of this.vacancies) {
      if (v.title === emp.currentRole) continue;
      const score = computeMatchScore(emp.skillScores, v.requiredSkillScores);
      const isS = isSameDomain(emp.currentRole, v.title);
      if (isS) {
        this.sameFieldMatches.push({ ...v, matchType: 'same-field', matchScore: score });
      } else if (score >= 70) {
        this.crossRoleMatches.push({ ...v, matchType: 'cross-role', matchScore: score });
      }
    }
    this.sameFieldMatches.sort((a,b) => b.matchScore - a.matchScore);
    this.crossRoleMatches.sort((a,b) => b.matchScore - a.matchScore);
    // Auto-select top match
    const top = this.sameFieldMatches[0] ?? this.crossRoleMatches[0] ?? null;
    this.selectedVacancy = top;
    if (top) { this.pendingRadarDraw = true; }
  }

  get noMatches() { return !this.sameFieldMatches.length && !this.crossRoleMatches.length; }

  get isOverlapMode(): boolean {
    return !!this.selectedVacancy && this.selectedVacancy.matchType === 'same-field';
  }

  gapRows(): GapRow[] {
    if (!this.portfolioEmployee || !this.selectedVacancy) return [];
    const axes = getAxes(this.portfolioEmployee.currentRole);
    return axes.map(ax => {
      const cur = +(this.portfolioEmployee!.skillScores[ax.key] ?? 0).toFixed(1);
      const req = +(this.selectedVacancy!.requiredSkillScores[ax.key] ?? 0).toFixed(1);
      return { axis: ax.label, current: cur, required: req, gap: +(cur - req).toFixed(1) };
    });
  }

  // ─── Radar drawing ─────────────────────────────────────────────────────────
  private drawRadar() {
    if (!this.portfolioEmployee || !this.selectedVacancy) return;
    const emp = this.portfolioEmployee;
    const vac = this.selectedVacancy;

    if (this.isOverlapMode && this.radarOverlapRef) {
      const axes = getAxes(emp.currentRole);
      this.renderRadar(this.radarOverlapRef.nativeElement, axes, [
        { label: emp.currentRole, scores: emp.skillScores, color: '#60a5fa', fillAlpha: 0.2 },
        { label: vac.title, scores: vac.requiredSkillScores, color: '#a78bfa', fillAlpha: 0.15 },
      ]);
    }
    if (!this.isOverlapMode) {
      if (this.radarLeftRef) {
        this.renderRadar(this.radarLeftRef.nativeElement, getAxes(emp.currentRole), [
          { label: emp.currentRole, scores: emp.skillScores, color: '#60a5fa', fillAlpha: 0.25 },
        ]);
      }
      if (this.radarRightRef) {
        this.renderRadar(this.radarRightRef.nativeElement, getAxes(vac.title), [
          { label: vac.title, scores: vac.requiredSkillScores, color: '#a78bfa', fillAlpha: 0.25 },
        ]);
      }
    }
  }

  private renderRadar(canvas: HTMLCanvasElement, axes: SkillAxis[], series: RadarSeries[]) {
    const size = canvas.width;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2;
    const R = size * 0.34;
    const n = axes.length;
    if (n < 3) return;
    const step = (Math.PI * 2) / n;
    const start = -Math.PI / 2;
    const pt = (i: number, r: number) => ({
      x: cx + r * Math.cos(start + i * step),
      y: cy + r * Math.sin(start + i * step),
    });

    // Grid
    for (let lvl = 1; lvl <= 5; lvl++) {
      const r = (R * lvl) / 5;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const {x,y} = pt(i, r); i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(148,163,184,0.15)'; ctx.lineWidth = 1; ctx.stroke();
    }
    // Spokes
    for (let i = 0; i < n; i++) {
      const {x,y} = pt(i, R);
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y);
      ctx.strokeStyle = 'rgba(148,163,184,0.2)'; ctx.lineWidth = 1; ctx.stroke();
    }
    // Labels
    const fs = Math.max(9, size * 0.032);
    ctx.font = `600 ${fs}px 'DM Sans', sans-serif`;
    ctx.fillStyle = '#94a3b8';
    for (let i = 0; i < n; i++) {
      const lr = R + size * 0.09;
      const {x,y} = pt(i, lr);
      const ang = start + i * step;
      ctx.textAlign = Math.abs(Math.cos(ang)) < 0.15 ? 'center' : Math.cos(ang) > 0 ? 'left' : 'right';
      ctx.textBaseline = Math.sin(ang) > 0.15 ? 'top' : Math.sin(ang) < -0.15 ? 'bottom' : 'middle';
      ctx.fillText(axes[i].label, x, y);
    }
    // Polygons
    for (const s of series) {
      const [r,g,b] = hexRgb(s.color);
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const val = Math.min(s.scores[axes[i].key] ?? 0, 5);
        const {x,y} = pt(i, (val/5)*R);
        i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(${r},${g},${b},${s.fillAlpha ?? 0.2})`; ctx.fill();
      ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.stroke();
      for (let i = 0; i < n; i++) {
        const val = Math.min(s.scores[axes[i].key] ?? 0, 5);
        const {x,y} = pt(i, (val/5)*R);
        ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2);
        ctx.fillStyle = s.color; ctx.fill();
      }
    }
  }

  // ─── Confirm dialog ────────────────────────────────────────────────────────
  confirm(msg: string, cb: () => void) { this.confirmMsg = msg; this.confirmCb = cb; this.showConfirm = true; }
  doConfirm() { this.confirmCb?.(); this.showConfirm = false; }
  cancelConfirm() { this.showConfirm = false; }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  private blankEmpForm(): Partial<Employee> & { skillsRaw: string } {
    return { name:'', currentRole:'', department:'', email:'', phone:'', age:28,
             gender:'Male', yearsOfExperience:1, riskScore:50, riskReason:'Role Restructuring' as any,
             peerReview:'', managerComment:'', performanceRating:3, skillsRaw:'' };
  }
  private blankVacForm(): Partial<Vacancy> & { skillsRaw: string } {
    return { title:'', department:'', company:'Acme Corp', skillsRaw:'' };
  }
  private parseSkillsRaw(raw: string): { name: string; proficiency: number }[] {
    if (!raw.trim()) return [];
    return raw.split(',').map(s => {
      const [name, prof] = s.split(':');
      return { name: (name ?? '').trim(), proficiency: +(prof ?? 3) };
    }).filter(s => s.name);
  }
  private parseScoresRaw(raw: string): Record<string, number> {
    const out: Record<string, number> = {};
    if (!raw.trim()) return out;
    for (const s of raw.split(',')) {
      const [k, v] = s.split(':');
      if (k?.trim()) out[k.trim()] = +(v ?? 3);
    }
    return out;
  }
  private buildScoresFromSkills(skills: { name: string; proficiency: number }[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const s of skills) out[s.name.toLowerCase().replace(/\s+/g,'_')] = s.proficiency;
    return out;
  }

  riskColor(s: number) { return s >= 75 ? '#ef4444' : s >= 55 ? '#f97316' : '#eab308'; }
  riskBg(s: number)    { return s >= 75 ? 'rgba(239,68,68,0.12)' : s >= 55 ? 'rgba(249,115,22,0.12)' : 'rgba(234,179,8,0.12)'; }
  riskLabel(s: number) { return s >= 75 ? 'High Risk' : s >= 55 ? 'Medium Risk' : 'Low Risk'; }
  matchColor(s: number){ return s >= 80 ? '#4ade80' : s >= 60 ? '#fbbf24' : '#f87171'; }
  barColor(v: number)  { return v >= 4 ? '#22c55e' : v >= 3 ? '#3b82f6' : v >= 2 ? '#f59e0b' : '#ef4444'; }
  initials(n: string)  { return n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
  avatarBg(id: number) { return ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b'][id % 5]; }

  get highRiskCount() { return this.employees.filter(e => e.riskScore >= 75).length; }

  scoreEntries(scores: Record<string, number>): [string, number][] {
    return Object.entries(scores);
  }

  formatFileSize(b: number) {
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b/1024).toFixed(1)} KB`;
    return `${(b/1048576).toFixed(1)} MB`;
  }
  formatSkills(skills: {id:number;name:string;proficiency:number}[]) {
    return skills.map(s=>`${s.name} (${s.proficiency})`).join(', ');
  }
  formatVacSkills(skills: {id:number;name:string;weight:number}[]) {
    return skills.map(s=>`${s.name} (${s.weight})`).join(', ');
  }

  riskNarrative(emp: Employee): string {
    const m: Record<string, string> = {
      'AI Automation Risk': `The ${emp.currentRole} role is increasingly automated by AI-assisted tooling. An estimated 60–70% of routine tasks can now be performed by AI co-pilots, reducing headcount demand.`,
      'Role Restructuring': `Departmental restructuring has identified this position as redundant following consolidation of teams.`,
      'Contract Ending': `Fixed-term contract concludes this quarter. Business justification exists for an internal transfer to convert to permanent employment.`,
      'Budget Cuts': `Cost reduction targets require headcount reduction. This role was flagged in the efficiency review. Employee performance is not a factor.`,
      'Performance': `The employee has not met OKR targets for two consecutive quarters. A formal PIP is in place. Transition may be considered as an alternative.`,
      'Redundancy': `The position is duplicative following a business unit merger. Skillset overlap with existing staff makes this role surplus.`,
    };
    return m[emp.riskReason] ?? 'Risk assessment pending further review.';
  }
}

function hexRgb(hex: string): [number,number,number] {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}
