import { useState } from 'react';
import { SegToggle } from 'saver-ui';

export function TwoOption() {
  const [val, setVal] = useState('monthly');
  return (
    <SegToggle
      options={[{ id: 'daily', label: 'Daily' }, { id: 'monthly', label: 'Monthly' }]}
      value={val}
      onChange={setVal}
    />
  );
}

export function ThreeOption() {
  const [val, setVal] = useState('weekly');
  return (
    <SegToggle
      options={[{ id: 'daily', label: 'Daily' }, { id: 'weekly', label: 'Weekly' }, { id: 'monthly', label: 'Monthly' }]}
      value={val}
      onChange={setVal}
    />
  );
}

export function PeriodSelector() {
  const [val, setVal] = useState('year');
  return (
    <SegToggle
      options={[{ id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }, { id: 'year', label: 'Year' }]}
      value={val}
      onChange={setVal}
    />
  );
}
