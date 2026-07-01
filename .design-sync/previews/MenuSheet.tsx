import { MenuSheet } from 'saver-ui';

const noop = () => {};

export function EditDelete() {
  return (
    <MenuSheet
      title="Subscription"
      items={[
        { icon: 'pencil', label: 'Edit subscription', sub: 'Change amount or date', onClick: noop },
        { icon: 'bell', label: 'Manage reminders', onClick: noop },
        { icon: 'trash', label: 'Delete', danger: true, onClick: noop },
      ]}
      onClose={noop}
    />
  );
}

export function TransactionActions() {
  return (
    <MenuSheet
      title="Transaction"
      items={[
        { icon: 'pencil', label: 'Edit', onClick: noop },
        { icon: 'transfer', label: 'Move to goal', onClick: noop },
        { icon: 'trash', label: 'Delete transaction', danger: true, onClick: noop },
      ]}
      onClose={noop}
    />
  );
}
