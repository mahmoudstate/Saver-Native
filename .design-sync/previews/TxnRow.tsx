import { TxnRow } from 'saver-ui';

const expense = { id: '1', type: 'expense', cat: 'food', catName: 'Food & Dining', amount: 85, date: '2026-06-20', bankName: 'CIB' };
const income = { id: '2', type: 'income', catName: 'Salary', amount: 12500, date: '2026-06-01', bankName: 'NBE' };
const saving = { id: '3', type: 'saving', amount: 1000, date: '2026-06-10', goalName: 'Laptop', bankName: 'Misr' };
const transfer = { id: '4', type: 'transfer', amount: 3500, date: '2026-06-15', bankName: 'CIB', toBankName: 'NBE' };

export function Expense() {
  return <TxnRow txn={expense} />;
}

export function Income() {
  return <TxnRow txn={income} />;
}

export function SavingToGoal() {
  return <TxnRow txn={saving} />;
}

export function Transfer() {
  return <TxnRow txn={transfer} />;
}

export function Feed() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <TxnRow txn={expense} />
      <TxnRow txn={income} />
      <TxnRow txn={saving} />
      <TxnRow txn={transfer} />
    </div>
  );
}
