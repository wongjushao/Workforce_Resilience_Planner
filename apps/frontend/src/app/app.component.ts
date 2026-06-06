import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Employee = {
  id: number;
  name: string;
  currentRole: string;
  department: string;
  skills: Array<{ id: number; name: string; proficiency: number }>;
};

type Vacancy = {
  id: number;
  title: string;
  department: string;
  company: string;
  skills: Array<{ id: number; name: string; weight: number }>;
};

type IntakeDocument = {
  id: number;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  extractedText: string | null;
  rowCount: number | null;
  status: string;
  createdAt: string;
};

type AtRiskSubmission = {
  id: number;
  name: string;
  currentRole: string | null;
  department: string | null;
  email: string | null;
  skills: string | null;
  departureReason: string;
  source: string;
  createdAt: string;
};

type ManualEmployeeForm = {
  name: string;
  currentRole: string;
  department: string;
  email: string;
  skills: string;
  departureReason: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  activeTab: 'documents' | 'manual' = 'documents';

  employees: Employee[] = [];
  vacancies: Vacancy[] = [];
  documents: IntakeDocument[] = [];
  submissions: AtRiskSubmission[] = [];

  intakeLoading = true;
  dashboardLoading = true;
  intakeError = '';
  dashboardError = '';

  selectedFile: File | null = null;
  uploadLoading = false;
  uploadError = '';
  uploadSuccess = '';

  manualForm: ManualEmployeeForm = {
    name: '',
    currentRole: '',
    department: '',
    email: '',
    skills: '',
    departureReason: ''
  };
  manualLoading = false;
  manualError = '';
  manualSuccess = '';

  private readonly requestTimeoutMs = 10000;

  private async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const response = await fetch(path, {
        ...init,
        signal: controller.signal
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof body.error === 'string' ? body.error : `Request failed (${response.status})`;
        throw new Error(message);
      }
      return body as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`Request timed out for ${path}.`);
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  ngOnInit() {
    void this.loadIntakeData();
    void this.loadDashboardData();
  }

  private async loadIntakeData() {
    this.intakeLoading = true;
    this.intakeError = '';

    try {
      const [documents, submissions] = await Promise.all([
        this.fetchJson<IntakeDocument[]>('/api/intake/documents'),
        this.fetchJson<AtRiskSubmission[]>('/api/intake/employees')
      ]);
      this.documents = documents;
      this.submissions = submissions;
    } catch (error) {
      this.intakeError = error instanceof Error ? error.message : 'Could not load intake data.';
    } finally {
      this.intakeLoading = false;
    }
  }

  private async loadDashboardData() {
    this.dashboardLoading = true;
    this.dashboardError = '';

    try {
      const [employees, vacancies] = await Promise.all([
        this.fetchJson<Employee[]>('/api/employees'),
        this.fetchJson<Vacancy[]>('/api/vacancies')
      ]);
      this.employees = employees;
      this.vacancies = vacancies;
    } catch (error) {
      this.dashboardError = error instanceof Error ? error.message : 'Could not load dashboard data.';
    } finally {
      this.dashboardLoading = false;
    }
  }

  setTab(tab: 'documents' | 'manual') {
    this.activeTab = tab;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.uploadError = '';
    this.uploadSuccess = '';
  }

  async uploadDocument() {
    if (!this.selectedFile) {
      this.uploadError = 'Please choose a CSV, PDF, or Word file.';
      return;
    }

    const allowedExtensions = ['.csv', '.pdf', '.doc', '.docx'];
    const fileName = this.selectedFile.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => fileName.endsWith(ext));
    if (!isAllowed) {
      this.uploadError = 'Supported formats: CSV, PDF, DOC, DOCX.';
      return;
    }

    this.uploadLoading = true;
    this.uploadError = '';
    this.uploadSuccess = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    try {
      const record = await this.fetchJson<IntakeDocument>('/api/intake/documents', {
        method: 'POST',
        body: formData
      });
      this.documents = [record, ...this.documents];
      this.uploadSuccess = `Uploaded ${record.originalFilename} successfully.`;
      this.selectedFile = null;
    } catch (error) {
      this.uploadError = error instanceof Error ? error.message : 'Upload failed.';
    } finally {
      this.uploadLoading = false;
    }
  }

  async submitManualEmployee() {
    this.manualLoading = true;
    this.manualError = '';
    this.manualSuccess = '';

    try {
      const record = await this.fetchJson<AtRiskSubmission>('/api/intake/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.manualForm)
      });
      this.submissions = [record, ...this.submissions];
      this.manualSuccess = `Saved details for ${record.name}.`;
      this.manualForm = {
        name: '',
        currentRole: '',
        department: '',
        email: '',
        skills: '',
        departureReason: ''
      };
    } catch (error) {
      this.manualError = error instanceof Error ? error.message : 'Submission failed.';
    } finally {
      this.manualLoading = false;
    }
  }

  formatSkills(skills: Array<{ id: number; name: string; proficiency: number }>): string {
    return skills.map((skill) => `${skill.name} (${skill.proficiency})`).join(', ');
  }

  formatVacancySkills(skills: Array<{ id: number; name: string; weight: number }>): string {
    return skills.map((skill) => `${skill.name} (${skill.weight})`).join(', ');
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
