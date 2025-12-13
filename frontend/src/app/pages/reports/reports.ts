import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';

import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, FormsModule, ChartModule, CardModule, TabsModule],
  templateUrl: './reports.html',
})
export class Reports implements OnInit {
  budgetService = inject(BudgetService);

  // Chart Data Configurations
  incomeExpenseData: any;
  budgetVarianceData: any;
  savingsProgressData: any;

  chartOptions: any;

  // Key Metrics
  periodIncome = 0;
  periodExpense = 0;

  constructor() {
    // Reactively update charts when data loads
    this.updateAllCharts();
  }

  ngOnInit() {
    this.initChartOptions();
    // Load all necessary data
    this.budgetService.loadTransactions();
    this.budgetService.loadBudgets();
    this.budgetService.loadGoals();
  }

  updateAllCharts() {
    this.updateIncomeVsExpense();
    this.updateBudgetVariance();
    this.updateSavingsProgress();
  }

  // --- REPORT 1: Income vs Expenses ---
  updateIncomeVsExpense() {
    const allTransactions = this.budgetService.getTransactions()();

    this.periodIncome = allTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    this.periodExpense = allTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    this.incomeExpenseData = {
      labels: ['Lifetime Totals'],
      datasets: [
        { label: 'Income', backgroundColor: '#6366f1', data: [this.periodIncome] },
        { label: 'Expenses', backgroundColor: '#ec4899', data: [this.periodExpense] },
      ],
    };
  }

  // --- REPORT 2: Budget Variance (Planned vs Actual Spending) ---
  updateBudgetVariance() {
    const budgetStatus = this.budgetService.getBudgetsWithStatus()();

    this.budgetVarianceData = {
      labels: budgetStatus.map((b) => b.category),
      datasets: [
        {
          label: 'Planned Limit',
          backgroundColor: '#9ca3af', // Gray
          data: budgetStatus.map((b) => b.limit),
        },
        {
          label: 'Actual Spent',
          // Red if over budget, Green if under
          backgroundColor: budgetStatus.map((b) =>
            (b.spent || 0) > b.limit ? '#ef4444' : '#22c55e'
          ),
          data: budgetStatus.map((b) => b.spent || 0),
        },
      ],
    };
  }

  // --- REPORT 3: Savings Progress (Goals) ---
  updateSavingsProgress() {
    const goals = this.budgetService.getGoals()();

    this.savingsProgressData = {
      labels: goals.map((g) => g.name),
      datasets: [
        {
          data: goals.map((g) => g.currentAmount),
          backgroundColor: goals.map((g) =>
            g.currentAmount >= g.targetAmount ? '#22c55e' : '#3b82f6'
          ),
          label: 'Saved Amount',
        },
        {
          data: goals.map((g) => Math.max(0, g.targetAmount - g.currentAmount)),
          backgroundColor: '#e5e7eb', // Gray for remaining
          label: 'Remaining',
        },
      ],
    };
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#4b5563';

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: { labels: { color: textColor } },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: '#f3f4f6' } },
      },
    };
  }
}
