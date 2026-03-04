import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'investments',
    loadComponent: () =>
      import('@nightfall/investments/feature').then(
        (m) => m.InvestmentsFeature,
      ),
  },
  {
    path: 'user-profile',
    loadComponent: () =>
      import('@nightfall/user-profile/feature').then(
        (m) => m.UserProfileFeature,
      ),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
