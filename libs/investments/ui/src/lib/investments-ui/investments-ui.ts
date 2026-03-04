import { Component, input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CurrencyPipe } from '@angular/common';

export interface InvestmentItem {
  id: string;
  name: string;
  value: number;
}

@Component({
  selector: 'lib-investments-table',
  imports: [TableModule, CurrencyPipe],
  templateUrl: './investments-ui.html',
  styleUrl: './investments-ui.scss',
})
export class InvestmentsTable {
  investments = input<InvestmentItem[]>([]);
}
