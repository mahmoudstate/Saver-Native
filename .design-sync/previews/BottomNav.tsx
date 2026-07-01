import { BottomNav } from 'saver-ui';

const wrap = (children: React.ReactNode) => (
  <div style={{ position: 'relative', height: 100, background: 'var(--bg)', borderRadius: 20, overflow: 'hidden' }}>
    {children}
  </div>
);

export function HomeActive() {
  return wrap(<BottomNav active="home" onTab={() => {}} onAdd={() => {}} />);
}

export function ActivityActive() {
  return wrap(<BottomNav active="activity" onTab={() => {}} onAdd={() => {}} />);
}

export function BillsActive() {
  return wrap(<BottomNav active="bills" onTab={() => {}} onAdd={() => {}} />);
}

export function ProfileActive() {
  return wrap(<BottomNav active="profile" onTab={() => {}} onAdd={() => {}} />);
}
