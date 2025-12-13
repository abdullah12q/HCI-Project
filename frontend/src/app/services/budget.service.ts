import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Transaction } from '../models/transaction.model';
import { Goal } from '../models/goal.model';
import { BudgetLimit } from '../models/budgetLimit.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private http = inject(HttpClient);

  // API URLs
  private transactionsUrl = 'http://localhost:3000/api/transactions';
  private goalsUrl = 'http://localhost:3000/api/goals';
  private budgetsUrl = 'http://localhost:3000/api/budgets';

  // State Signals
  private transactions = signal<Transaction[]>([]);
  private goals = signal<Goal[]>([]);
  private budgets = signal<BudgetLimit[]>([]);

  // Computed Values
  // 1. Get transactions for the current month only
  currentMonthTransactions = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.transactions().filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
  });

  // 2. Calculate Income based ONLY on this month
  monthlyIncome = computed(() =>
    this.currentMonthTransactions()
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)
  );

  // 3. Calculate Expense based ONLY on this month
  monthlyExpense = computed(() =>
    this.currentMonthTransactions()
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)
  );

  // 4. Net Balance (Income - Expense) for this month
  monthlyBalance = computed(() => this.monthlyIncome() - this.monthlyExpense());

  // 5. Total Budgeted (Sum of all category limits)
  totalBudgeted = computed(() => this.budgets().reduce((acc, b) => acc + b.limit, 0));

  // 6. Unallocated (Monthly Income - Total Limits)
  // This accurately reflects "Budgeting based on Income"
  unallocatedBalance = computed(() => this.monthlyIncome() - this.totalBudgeted());

  constructor() {
    // Load everything on startup
    this.loadTransactions();
    this.loadGoals();
    this.loadBudgets();
  }

  // Transaction Logic
  loadTransactions() {
    this.http.get<Transaction[]>(this.transactionsUrl).subscribe({
      next: (data) => this.transactions.set(data),
      error: (e) => console.error(e),
    });
  }

  addTransaction(t: Transaction) {
    this.http.post<{ id: string }>(this.transactionsUrl, t).subscribe({
      next: (res) => this.transactions.update((curr) => [...curr, { ...t, id: res.id }]),
    });
  }

  updateTransaction(id: string, transaction: Transaction) {
    this.http.put(`${this.transactionsUrl}/${id}`, transaction).subscribe({
      next: () => {
        this.transactions.update((curr) =>
          curr.map((t) => (t.id === id ? { ...transaction, id } : t))
        );
      },
      error: (e) => console.error('Error updating transaction', e),
    });
  }

  deleteTransaction(id: string) {
    this.http.delete(`${this.transactionsUrl}/${id}`).subscribe({
      next: () => this.transactions.update((curr) => curr.filter((t) => t.id !== id)),
    });
  }

  getTransactions() {
    return this.transactions;
  }

  // Goal Logic
  loadGoals() {
    this.http.get<Goal[]>(this.goalsUrl).subscribe({
      next: (data) => this.goals.set(data),
      error: (e) => console.error(e),
    });
  }

  addGoal(goal: Omit<Goal, 'id'>) {
    // We don't send an ID, the backend creates it
    this.http.post<{ id: string }>(this.goalsUrl, goal).subscribe({
      next: (res) => {
        // Update local signal immediately
        this.goals.update((curr) => [...curr, { ...goal, id: res.id }]);
      },
      error: (e) => console.error('Error adding goal', e),
    });
  }

  // 2. Update goal amount (for "Add Funds")
  updateGoal(id: string, newAmount: number) {
    const payload = { currentAmount: newAmount };

    this.http.put(`${this.goalsUrl}/${id}`, payload).subscribe({
      next: () => {
        // Update local signal to reflect change in UI
        this.goals.update((curr) =>
          curr.map((g) => {
            if (g.id === id) return { ...g, currentAmount: newAmount };
            return g;
          })
        );
      },
      error: (e) => console.error('Error updating goal', e),
    });
  }

  deleteGoal(id: string) {
    this.http.delete(`${this.goalsUrl}/${id}`).subscribe({
      next: () => this.goals.update((curr) => curr.filter((g) => g.id !== id)),
    });
  }

  getGoals() {
    return this.goals;
  }

  // Budget Logic
  loadBudgets() {
    this.http.get<BudgetLimit[]>(this.budgetsUrl).subscribe({
      next: (data) => {
        this.budgets.set(data);
      },
    });
  }

  setBudgetLimit(category: string, limit: number) {
    this.http.post(this.budgetsUrl, { category, limit }).subscribe({
      next: () => {
        this.loadBudgets();
      },
    });
  }

  deleteBudget(id: string) {
    this.http.delete(`${this.budgetsUrl}/${id}`).subscribe({
      next: () => this.loadBudgets(),
    });
  }

  // Helper for Budget Page: Combines Limit + Spent
  getBudgetsWithStatus() {
    return computed(() => {
      // Use the filtered monthly transactions
      const monthlyTrans = this.currentMonthTransactions();
      const allBudgets = this.budgets();

      const spendingMap = new Map<string, number>();

      monthlyTrans.forEach((t) => {
        if (t.type === 'expense') {
          const current = spendingMap.get(t.category) || 0;
          spendingMap.set(t.category, current + t.amount);
        }
      });

      return allBudgets.map((b) => ({
        ...b,
        spent: spendingMap.get(b.category) || 0,
      }));
    });
  }
}
