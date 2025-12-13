import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';

import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-budgets',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ProgressBarModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    InputNumberModule,
    TooltipModule,
  ],
  templateUrl: './budgets.html',
})
export class Budgets implements OnInit {
  budgetService = inject(BudgetService);
  fb = inject(FormBuilder);

  // 1. Data Signals: Combines Limits with Actual Monthly Spending
  budgetStatus = this.budgetService.getBudgetsWithStatus();

  // 2. State
  displayDialog = false;
  isEditing = false;

  // 3. Categories (Matches Expense Transaction Types)
  categories = [
    'Housing',
    'Food',
    'Utilities',
    'Transport',
    'Entertainment',
    'Health',
    'Shopping',
    'Other',
  ];

  budgetForm = this.fb.group({
    category: [{ value: null, disabled: false }, Validators.required],
    limit: [null, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    this.budgetService.loadTransactions();
    this.budgetService.loadBudgets();
  }

  showDialog() {
    this.isEditing = false;
    this.budgetForm.reset();
    this.budgetForm.get('category')?.enable();
    this.displayDialog = true;
  }

  editBudget(item: any) {
    this.isEditing = true;
    this.budgetForm.patchValue({
      category: item.category,
      limit: item.limit,
    });
    this.budgetForm.get('category')?.disable();
    this.displayDialog = true;
  }

  deleteBudget(id: string) {
    this.budgetService.deleteBudget(id);
  }

  onSubmit() {
    if (this.budgetForm.valid || (this.isEditing && this.budgetForm.get('limit')?.valid)) {
      const { category, limit } = this.budgetForm.getRawValue();
      this.budgetService.setBudgetLimit(category!, limit!);
      this.displayDialog = false;
    }
  }

  // --- Visual Helpers ---

  getPercent(item: any): number {
    if (!item.limit || item.limit === 0) return 0;
    return Math.round((item.spent / item.limit) * 100);
  }

  // Calculates: Total Planned Limits / This Month's Income
  getAllocationPercent(): number {
    // UPDATED: Uses monthlyIncome() to be accurate to the current month's budget
    const income = this.budgetService.monthlyIncome();
    const budgeted = this.budgetService.totalBudgeted();

    if (income === 0) return 0;
    return Math.round((budgeted / income) * 100);
  }
}
