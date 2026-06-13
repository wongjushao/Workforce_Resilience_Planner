import { Injectable } from '@angular/core';
import {
  Employee, Vacancy, MOCK_EMPLOYEES, MOCK_VACANCIES,
  isSameField, computeMatchScore, getSkillAxes, getRoleProfile,
} from '../mock-data';

export interface MatchedVacancy extends Vacancy {
  matchType: 'same-field' | 'cross-role';
  matchScore: number;
}

export interface EmployeePortfolio {
  employee: Employee;
  sameFieldMatches: MatchedVacancy[];
  crossRoleMatches: MatchedVacancy[];
  noMatch: boolean;
}

@Injectable({ providedIn: 'root' })
export class WorkforceService {

  getAtRiskEmployees(): Employee[] {
    return MOCK_EMPLOYEES.filter(e => e.riskScore >= 50)
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  getAllEmployees(): Employee[] {
    return [...MOCK_EMPLOYEES];
  }

  getEmployee(id: number): Employee | undefined {
    return MOCK_EMPLOYEES.find(e => e.id === id);
  }

  generatePortfolio(employee: Employee): EmployeePortfolio {
    const sameField: MatchedVacancy[] = [];
    const crossRole: MatchedVacancy[] = [];

    for (const vacancy of MOCK_VACANCIES) {
      if (vacancy.title === employee.currentRole) continue; // skip exact same role

      const isS = isSameField(employee.currentRole, vacancy.title);
      const score = computeMatchScore(employee.skillScores, vacancy.requiredSkillScores);

      if (isS) {
        sameField.push({ ...vacancy, matchType: 'same-field', matchScore: score });
      } else if (score >= 70) {
        crossRole.push({ ...vacancy, matchType: 'cross-role', matchScore: score });
      }
    }

    // Sort by match score desc, cap at 10 each
    sameField.sort((a, b) => b.matchScore - a.matchScore);
    crossRole.sort((a, b) => b.matchScore - a.matchScore);

    return {
      employee,
      sameFieldMatches: sameField.slice(0, 10),
      crossRoleMatches: crossRole.slice(0, 10),
      noMatch: sameField.length === 0 && crossRole.length === 0,
    };
  }

  getRiskColor(score: number): string {
    if (score >= 75) return '#ef4444';
    if (score >= 55) return '#f97316';
    return '#eab308';
  }

  getRiskLabel(score: number): string {
    if (score >= 75) return 'High Risk';
    if (score >= 55) return 'Medium Risk';
    return 'Low Risk';
  }
}
