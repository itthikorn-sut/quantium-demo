import { Component } from '@angular/core';
import { CapitalService } from '../capital/capital.service';

@Component({
  selector: 'app-irr',
  template: `
    <h2>IRR Simulator</h2>
    <select [(ngModel)]="selectedFund">
      <option *ngFor="let f of funds" [value]="f.id">{{ f.name }}</option>
    </select>
    <button (click)="calculate()">Generate</button>
    <div *ngIf="result !== null">
      IRR: {{ result * 100 | number:'1.2-2' }}%
    </div>
  `
})
export class IrrComponent {
  funds = [
    { id: '1', name: 'USD Fund I' },
    { id: '2', name: 'Euro Fund I' },
  ];
  selectedFund: string = '';
  result: number | null = null;
  // LOW: typo in property name — should be 'cashFlows'
  cashflows: number[] = [];

  constructor(private capitalService: CapitalService) {}

  calculate(): void {
    // MEDIUM: no validation — Generate allowed with no fund selected
    // MEDIUM: cashflows hardcoded instead of fetched from API
    this.cashflows = [-1000000, 200000, 300000, 400000, 500000];
    this.result = this.capitalService.calculateIRR(this.cashflows);
  }
}
