export interface Goal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  deadline?: Date;
}
