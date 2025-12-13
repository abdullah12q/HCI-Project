import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetService } from '../../services/budget.service';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ChartModule, CardModule],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  budgetService = inject(BudgetService);

  // Chart Data
  incomeExpenseData: any;
  goalsData: any;

  // Chart Options
  chartOptions: any;
  barOptions: any;

  constructor() {
    // 1. Trigger data fetch
    this.budgetService.loadTransactions();
    this.budgetService.loadGoals();
    this.budgetService.loadBudgets();

    // 2. USE EFFECT HERE
    // This automatically re-runs whenever the signals (income, expense, goals) change
    effect(() => {
      const income = this.budgetService.monthlyIncome();
      const expense = this.budgetService.monthlyExpense();
      const goals = this.budgetService.getGoals()();

      this.updatePieChart(income, expense);
      this.updateBarChart(goals);
    });
  }

  ngOnInit() {
    this.initChartStyles();
  }

  updatePieChart(income: number, expense: number) {
    this.incomeExpenseData = {
      labels: ['Income', 'Expenses'],
      datasets: [
        {
          data: [income, expense],
          backgroundColor: ['#4ade80', '#f87171'],
          hoverBackgroundColor: ['#22c55e', '#ef4444'],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  }

  updateBarChart(goals: any[]) {
    // Map backend data to Chart.js format
    const labels = goals.map((g) => g.name);
    const currentAmounts = goals.map((g) => g.currentAmount);
    const targetAmounts = goals.map((g) => g.targetAmount);

    this.goalsData = {
      labels: labels,
      datasets: [
        {
          label: 'Saved So Far',
          backgroundColor: '#3b82f6',
          data: currentAmounts,
          borderRadius: 4,
        },
        {
          label: 'Goal Target',
          backgroundColor: '#e5e7eb',
          data: targetAmounts,
          borderRadius: 4,
          grouped: false,
          order: 1,
        },
      ],
    };
  }

  initChartStyles() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#4b5563';

    this.chartOptions = {
      plugins: { legend: { labels: { usePointStyle: true, color: textColor } } },
    };

    this.barOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: { legend: { labels: { color: textColor } } },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { display: false },
        },
        y: {
          ticks: { color: textColor },
          grid: { color: '#f3f4f6' },
        },
      },
    };
  }
}
