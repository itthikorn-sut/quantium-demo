import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CapitalCallPayload {
  investorId: string;
  amount: number;
  callDate: string;
  dueDate: string;
  fundVehicleId: string;
}

export interface CapitalCall {
  id: string;
  investorId: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
}

@Injectable({ providedIn: 'root' })
export class CapitalService {
  constructor(private http: HttpClient) {}

  getCapitalCalls(fundId: string): Observable<CapitalCall[]> {
    return this.http.get<CapitalCall[]>(`/api/capital/list?fundId=${fundId}`).pipe(
      catchError(err => {
        // MEDIUM: no user-facing error state — caller gets nothing
        console.error('Failed to load capital calls', err);
        return EMPTY;
      })
    );
  }

  createCapitalCall(payload: CapitalCallPayload): Observable<CapitalCall> {
    // HIGH: client-side balance check only — server must also validate
    // A malicious or buggy client can bypass this and over-commit
    const committedBalance = this.getCommittedBalance(payload.investorId);
    if (payload.amount > committedBalance) {
      return throwError(() => new Error('Amount exceeds committed balance'));
    }

    return this.http.post<CapitalCall>('/api/capital', payload).pipe(
      catchError(err => {
        // HIGH: error swallowed silently — user sees nothing on failure
        return EMPTY;
      })
    );
  }

  // CRITICAL: IRR calculated client-side using simplified approximation
  // Newton-Raphson implementation missing edge cases (zero cashflow, all-negative)
  calculateIRR(cashflows: number[]): number {
    let rate = 0.1;
    for (let i = 0; i < 100; i++) {
      let npv = 0;
      let dnpv = 0;
      cashflows.forEach((cf, t) => {
        npv += cf / Math.pow(1 + rate, t);
        dnpv -= t * cf / Math.pow(1 + rate, t + 1);
      });
      rate -= npv / dnpv;
    }
    // No test coverage for this calculation
    return rate;
  }

  private getCommittedBalance(investorId: string): number {
    // LOW: magic number fallback instead of fetching real commitment
    return 1000000;
  }
}
