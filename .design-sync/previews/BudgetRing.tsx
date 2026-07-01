import { BudgetRing } from 'saver-ui';

export function Healthy() {
  return <BudgetRing spent={380} total={1000} />;
}

export function Warning() {
  return <BudgetRing spent={850} total={1000} />;
}

export function OverBudget() {
  return <BudgetRing spent={1250} total={1000} />;
}

export function CompactSize() {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <BudgetRing spent={300} total={1000} size={80} stroke={9} />
      <BudgetRing spent={850} total={1000} size={80} stroke={9} />
      <BudgetRing spent={1100} total={1000} size={80} stroke={9} />
    </div>
  );
}
