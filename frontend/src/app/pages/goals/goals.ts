import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';

import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Goal } from '../../models/goal.model';

@Component({
  selector: 'app-goals',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ProgressBarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
  ],
  templateUrl: './goals.html',
})
export class Goals implements OnInit {
  // Inject Services
  fb = inject(FormBuilder);
  budgetService = inject(BudgetService);

  // 1. Bind directly to the Service's Signal
  // This ensures the UI updates whenever the Service updates (e.g. after a load or add)
  goals = this.budgetService.getGoals();

  displayDialog = false;

  goalForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    targetAmount: [null, [Validators.required, Validators.min(1)]],
    currentAmount: [null, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    // 2. Load data from Backend on startup
    this.budgetService.loadGoals();
  }

  showDialog() {
    this.goalForm.reset({ currentAmount: null });
    this.displayDialog = true;
  }

  onSubmit() {
    if (this.goalForm.valid) {
      const val = this.goalForm.value;

      // 3. Prepare Object (No ID generated here, Backend does it)
      const newGoal: Omit<Goal, 'id'> = {
        name: val.name!,
        targetAmount: val.targetAmount!,
        currentAmount: val.currentAmount!,
      };

      // 4. Call Service API
      this.budgetService.addGoal(newGoal);

      this.displayDialog = false;
    } else {
      this.goalForm.markAllAsTouched();
    }
  }

  addFunds(id: string, amountToAdd: number | null) {
    if (!amountToAdd || amountToAdd <= 0) return;

    const goalToUpdate = this.goals().find((g) => g.id === id);

    if (goalToUpdate) {
      const newTotal = Math.min(
        goalToUpdate.currentAmount + amountToAdd,
        goalToUpdate.targetAmount
      );
      this.budgetService.updateGoal(id, newTotal);
    }
  }

  deleteGoal(id: string) {
    this.budgetService.deleteGoal(id);
  }

  // Helper for progress bar
  getPercentage(goal: Goal): number {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    return Math.round((goal.currentAmount / goal.targetAmount) * 100);
  }

  // Helper for color
  getColor(goal: Goal): string {
    return this.getPercentage(goal) >= 100 ? '#22c55e' : '#3b82f6';
  }
}
