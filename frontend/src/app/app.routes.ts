import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Budgets } from './pages/budgets/budgets';
import { Expenses } from './pages/expenses/expenses';
import { Income } from './pages/income/income';
import { Goals } from './pages/goals/goals';
import { Reports } from './pages/reports/reports';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // Protected Routes
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'budgets', component: Budgets },
      { path: 'expenses', component: Expenses },
      { path: 'income', component: Income },
      { path: 'goals', component: Goals },
      { path: 'reports', component: Reports },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
