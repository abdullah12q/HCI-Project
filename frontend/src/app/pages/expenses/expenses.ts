import { Component } from '@angular/core';
import { TransactionList } from '../../components/transaction-list/transaction-list';

@Component({
  selector: 'app-expenses',
  imports: [TransactionList],
  template: `<app-transaction-list type="expense" />`,
})
export class Expenses {}
