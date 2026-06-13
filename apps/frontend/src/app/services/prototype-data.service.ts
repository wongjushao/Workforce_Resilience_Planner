import { Injectable } from '@angular/core';
import { ROLE_PROFILES } from '../mock-data';

export type IntakeDocument = {
  id: number;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  extractedText: string | null;
  rowCount: number | null;
  status: string;
  createdAt: string;
};

export type AtRiskSubmission = {
  id: number;
  employeeId: number;
  name: string;
  currentRole: string | null;
  department: string | null;
  performance: number | null;
  documentId: number | null;
  departureReason: string;
  source: string;
  createdAt: string;
};

export type Occupation = { id: number; title: string };

export type ManualSubmissionPayload = {
  name: string;
  age: number | null;
  gender: string | null;
  email: string | null;
  phone: string | null;
  department: string | null;
  currentRoleId: number;
  experience: number | null;
  skillsRaw: string;
  departureReason: string;
  submissionDepartment: string | null;
  performance: number | null;
  documentId: number | null;
};

const CAREER_PROFILE_FILENAME = 'Ethan_Lim_Wei_Jie_Career_Profile.pdf';

export const MOCK_OCCUPATIONS: Occupation[] = Object.keys(ROLE_PROFILES).map((title, index) => ({
  id: 151252 + index,
  title,
}));

const SEED_DOCUMENTS: IntakeDocument[] = [
  {
    id: 1,
    originalFilename: 'q1-reassignments.csv',
    fileType: 'csv',
    fileSize: 2840,
    extractedText: null,
    rowCount: 12,
    status: 'processed',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 2,
    originalFilename: 'role-redundancy-memo.pdf',
    fileType: 'pdf',
    fileSize: 156_800,
    extractedText: 'Department restructuring memo — Engineering headcount review Q1.',
    rowCount: null,
    status: 'processed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const SEED_SUBMISSIONS: AtRiskSubmission[] = [
  {
    id: 1,
    employeeId: 501,
    name: 'Siti Nurhaliza',
    currentRole: 'Frontend Developer',
    department: 'Engineering',
    performance: 78,
    documentId: 1,
    departureReason: 'Role restructuring',
    source: 'manual',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    employeeId: 502,
    name: 'Raj Kumar',
    currentRole: 'Data Analyst',
    department: 'Data',
    performance: 85,
    documentId: null,
    departureReason: 'Budget cuts',
    source: 'manual',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

@Injectable({ providedIn: 'root' })
export class PrototypeDataService {
  private documents: IntakeDocument[] = [];
  private submissions: AtRiskSubmission[] = [];
  private nextDocumentId = 100;
  private nextSubmissionId = 100;
  private nextEmployeeId = 600;

  reset() {
    this.documents = SEED_DOCUMENTS.map(d => ({ ...d }));
    this.submissions = SEED_SUBMISSIONS.map(s => ({ ...s }));
    this.nextDocumentId = Math.max(...this.documents.map(d => d.id), 0) + 1;
    this.nextSubmissionId = Math.max(...this.submissions.map(s => s.id), 0) + 1;
  }

  constructor() {
    this.reset();
  }

  listDocuments(): IntakeDocument[] {
    return [...this.documents];
  }

  listSubmissions(): AtRiskSubmission[] {
    return [...this.submissions];
  }

  searchOccupations(query: string): Occupation[] {
    const q = query.trim().toLowerCase();
    if (!q) return [...MOCK_OCCUPATIONS];
    return MOCK_OCCUPATIONS.filter(o => o.title.toLowerCase().includes(q));
  }

  occupationTitle(id: number): string {
    return MOCK_OCCUPATIONS.find(o => o.id === id)?.title ?? `Role #${id}`;
  }

  async uploadDocument(file: File): Promise<IntakeDocument> {
    const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
    const allowed = ['csv', 'pdf', 'doc', 'docx'];
    if (!allowed.includes(ext)) {
      throw new Error('Supported: CSV, PDF, DOC, DOCX.');
    }

    let rowCount: number | null = null;
    let extractedText: string | null = null;

    if (ext === 'csv') {
      const text = await file.text();
      rowCount = this.countCsvRows(text);
      extractedText = text.slice(0, 500) || null;
    } else if (ext === 'pdf') {
      extractedText = `Uploaded PDF: ${file.name} (preview unavailable in prototype).`;
    } else {
      extractedText = `Uploaded document: ${file.name}`;
    }

    const record: IntakeDocument = {
      id: this.nextDocumentId++,
      originalFilename: file.name,
      fileType: ext,
      fileSize: file.size,
      extractedText,
      rowCount,
      status: 'processed',
      createdAt: new Date().toISOString(),
    };
    this.documents = [record, ...this.documents];
    return record;
  }

  submitManualEmployee(payload: ManualSubmissionPayload): AtRiskSubmission {
    if (!payload.name.trim()) throw new Error('Name is required.');
    if (!payload.currentRoleId) throw new Error('Current role is required.');
    if (!payload.departureReason.trim()) throw new Error('Departure reason is required.');
    if (!payload.skillsRaw.trim()) throw new Error('At least one employee skill is required.');

    const occupation = MOCK_OCCUPATIONS.find(o => o.id === payload.currentRoleId);
    if (!occupation) throw new Error(`Occupation ${payload.currentRoleId} was not found.`);

    if (payload.documentId != null) {
      const doc = this.documents.find(d => d.id === payload.documentId);
      if (!doc) throw new Error(`Document ${payload.documentId} was not found.`);
    }

    const record: AtRiskSubmission = {
      id: this.nextSubmissionId++,
      employeeId: this.nextEmployeeId++,
      name: payload.name.trim(),
      currentRole: occupation.title,
      department: payload.submissionDepartment?.trim() || payload.department?.trim() || null,
      performance: payload.performance,
      documentId: payload.documentId,
      departureReason: payload.departureReason.trim(),
      source: 'manual',
      createdAt: new Date().toISOString(),
    };
    this.submissions = [record, ...this.submissions];
    return record;
  }

  downloadCareerProfile(): void {
    const link = document.createElement('a');
    link.href = `assets/${CAREER_PROFILE_FILENAME}`;
    link.download = CAREER_PROFILE_FILENAME;
    link.click();
  }

  private countCsvRows(text: string): number {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) return 0;
    return lines.length - 1;
  }
}
