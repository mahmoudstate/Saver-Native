import { CatTile } from 'saver-ui';

const CATEGORIES = [
  { cat: 'food', label: 'Food' },
  { cat: 'coffee', label: 'Coffee' },
  { cat: 'shopping', label: 'Shopping' },
  { cat: 'transport', label: 'Transport' },
  { cat: 'salary', label: 'Salary' },
  { cat: 'health', label: 'Health' },
  { cat: 'entertainment', label: 'Fun' },
  { cat: 'travel', label: 'Travel' },
  { cat: 'home', label: 'Home' },
  { cat: 'goal', label: 'Goal' },
  { cat: 'bill', label: 'Bill' },
  { cat: 'transfer', label: 'Transfer' },
];

export function Grid() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {CATEGORIES.map(({ cat, label }) => (
        <div key={cat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <CatTile cat={cat} size={44} />
          <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {[28, 36, 44, 56].map((size) => (
        <CatTile key={size} cat="food" size={size} />
      ))}
    </div>
  );
}

export function CustomColor() {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <CatTile cat="food" color="#5FE3C0" size={44} />
      <CatTile cat="shopping" color="#E5544E" size={44} />
      <CatTile cat="transport" color="#2563EB" size={44} />
      <CatTile cat="bill" color="#D97706" size={44} />
      <CatTile name="Custom" color="#7C3AED" size={44} />
    </div>
  );
}
