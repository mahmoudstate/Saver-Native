import { LinkBadge } from 'saver-ui';

export function Default() {
  return <LinkBadge groupId="txn-grp-482" />;
}

export function ShortCode() {
  return <LinkBadge groupId="001" size={12} />;
}

export function InContext() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--acText)' }}>
        Goal · Laptop
        <LinkBadge groupId="grp-291" />
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--acText)' }}>
        Goal · Emergency Fund
        <LinkBadge groupId="grp-482" />
      </div>
    </div>
  );
}
