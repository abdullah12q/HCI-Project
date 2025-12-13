import { Component, Input, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { Transaction } from '../../models/transaction.model';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-transaction-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
  ],
  templateUrl: './transaction-list.html',
})
export class TransactionList implements OnInit {
  @Input() type: 'income' | 'expense' = 'expense';

  budgetService = inject(BudgetService);
  fb = inject(FormBuilder);

  transactions = computed(() =>
    this.budgetService
      .getTransactions()()
      .filter((t) => t.type === this.type)
  );

  displayDialog: boolean = false;
  transactionForm: FormGroup;
  categories: any[] = [];

  isEditing = false;
  currentId: string | null = null;

  constructor() {
    this.transactionForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [null, [Validators.required, Validators.min(1)]],
      category: [null, Validators.required],
      date: [new Date(), Validators.required],
    });
  }

  ngOnInit() {
    this.budgetService.loadTransactions();
    this.budgetService.loadGoals();
    this.budgetService.loadBudgets();

    this.categories =
      this.type === 'expense'
        ? [
            { label: 'Housing', value: 'Housing' },
            { label: 'Food', value: 'Food' },
            { label: 'Utilities', value: 'Utilities' },
            { label: 'Transport', value: 'Transport' },
            { label: 'Entertainment', value: 'Entertainment' },
            { label: 'Health', value: 'Health' },
            { label: 'Shopping', value: 'Shopping' },
            { label: 'Other', value: 'Other' },
          ]
        : [
            { label: 'Salary', value: 'Salary' },
            { label: 'Freelance', value: 'Freelance' },
            { label: 'Investments', value: 'Investments' },
            { label: 'Gifts', value: 'Gifts' },
            { label: 'Other', value: 'Other' },
          ];
  }

  showDialog() {
    this.isEditing = false;
    this.currentId = null;
    this.transactionForm.reset({ date: new Date() });
    this.displayDialog = true;
  }

  edit(item: Transaction) {
    this.isEditing = true;
    this.currentId = item.id!;

    this.transactionForm.patchValue({
      description: item.description,
      amount: item.amount,
      category: item.category,
      date: new Date(),
    });

    this.displayDialog = true;
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;

      const transactionData: Transaction = {
        ...formValue,
        type: this.type,
      };

      if (this.isEditing && this.currentId) {
        // CALL UPDATE
        this.budgetService.updateTransaction(this.currentId, transactionData);
      } else {
        // CALL ADD
        this.budgetService.addTransaction(transactionData);
      }

      this.displayDialog = false;
    } else {
      this.transactionForm.markAllAsTouched();
    }
  }

  delete(id: string) {
    this.budgetService.deleteTransaction(id);
  }
}
