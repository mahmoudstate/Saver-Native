import { OptionSheet } from 'saver-ui';

const noop = () => {};

export function FrequencyPicker() {
  return (
    <OptionSheet
      title="Repeat every"
      options={[
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' },
      ]}
      value="monthly"
      onPick={noop}
      onClose={noop}
    />
  );
}

export function CurrencyPicker() {
  return (
    <OptionSheet
      title="Currency"
      sub="Used for all amounts in the app"
      options={[
        { value: 'EGP', label: 'EGP — Egyptian Pound' },
        { value: 'USD', label: 'USD — US Dollar' },
        { value: 'EUR', label: 'EUR — Euro' },
        { value: 'AED', label: 'AED — UAE Dirham' },
      ]}
      value="EGP"
      onPick={noop}
      onClose={noop}
    />
  );
}
