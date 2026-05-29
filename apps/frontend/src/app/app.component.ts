import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

type Employee = {
  id: number;
  name: string;
  email: string;
  riskScore: number;
  skills: Array<{ id: number; name: string; proficiency: number }>;
};

type Vacancy = {
  id: number;
  title: string;
  path: string;
  matchScore: number;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  employees: Employee[] = [];
  vacancies: Vacancy[] = [];
  loading = true;
  error = '';
  private readonly requestTimeoutMs = 10000;

  private get apiBaseUrl(): string {
    const apiPort = '5000';
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${apiPort}`;
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const response = await fetch(`${this.apiBaseUrl}${path}`, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Request failed for ${path} (${response.status})`);
      }
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`Request timed out for ${path}.`);
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async ngOnInit() {
    try {
      const [employees, vacancies] = await Promise.all([
        this.fetchJson<Employee[]>('/api/employees'),
        this.fetchJson<Vacancy[]>('/api/vacancies')
      ]);
      this.employees = employees;
      this.vacancies = vacancies;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }

  formatSkills(skills: Array<{ id: number; name: string; proficiency: number }>): string {
    return skills.map((skill) => `${skill.name} (${skill.proficiency})`).join(', ');
  }
}
