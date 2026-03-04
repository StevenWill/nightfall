import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Investment } from './models/investment.model';

const MOCK_INVESTMENTS: Investment[] = [
  { id: '1', name: 'S&P 500 Index Fund', value: 12500.0 },
  { id: '2', name: 'Bitcoin', value: 8340.5 },
  { id: '3', name: 'Apple Inc.', value: 4200.75 },
  { id: '4', name: 'Real Estate REIT', value: 22000.0 },
];

@Injectable({ providedIn: 'root' })
export class InvestmentsService {
  getAll(): Observable<Investment[]> {
    return of(MOCK_INVESTMENTS);
  }

  getById(id: string): Observable<Investment | undefined> {
    return of(MOCK_INVESTMENTS.find((i) => i.id === id));
  }
}
