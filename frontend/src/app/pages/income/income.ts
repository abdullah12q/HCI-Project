import { Component } from '@angular/core';
import { TransactionList } from '../../components/transaction-list/transaction-list';

@Component({
  selector: 'app-income',
  imports: [TransactionList],
  template: `<app-transaction-list type="income" />`,
})
export class Income {}
