import { Money } from 'saver-ui';

export function Amount() {
  return (
    <Money v={1250.75} style={{ fontSize: 32, fontWeight: 800 }} />
  );
}

export function Income() {
  return (
    <Money v={12500} sign="+" style={{ fontSize: 28, fontWeight: 800, color: 'var(--ac)' }} />
  );
}

export function Expense() {
  return (
    <Money v={349.5} sign="−" style={{ fontSize: 28, fontWeight: 800, color: 'var(--red)' }} />
  );
}

export function Masked() {
  return (
    <Money v={5000} masked style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4 }} />
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Money v={25000} style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }} />
      <Money v={25000} style={{ fontSize: 28, fontWeight: 700 }} />
      <Money v={25000} style={{ fontSize: 20, fontWeight: 600 }} />
      <Money v={25000} style={{ fontSize: 14, fontWeight: 600 }} />
    </div>
  );
}
