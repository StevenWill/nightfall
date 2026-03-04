import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'investments',
    loadComponent: () =>
      import('@nightfall/investments/feature').then(
        (m) => m.InvestmentsFeature,
      ),
  },
  { path: '', redirectTo: 'investments', pathMatch: 'full' },
];
