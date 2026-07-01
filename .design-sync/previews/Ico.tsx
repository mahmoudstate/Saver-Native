import { Ico } from 'saver-ui';

const ICONS_GRID = [
  'home', 'wallet', 'activity', 'cal', 'bills', 'card',
  'plus', 'close', 'check', 'back', 'search', 'gear',
  'you', 'target', 'bell', 'shield', 'sparkles', 'zap',
  'pencil', 'trash', 'layers', 'transfer', 'note', 'more',
];

export function Showcase() {
  return (
    <div style={{ padding: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>Icon set</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {ICONS_GRID.map((name) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ico name={name} size={20} color="var(--text)" />
            </div>
            <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600 }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Sizes() {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>Sizes</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {[12, 16, 20, 24, 28, 32].map((size) => (
          <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Ico name="home" size={size} color="var(--text)" />
            <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>{size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SemanticColors() {
  const icons = [
    { name: 'check', color: 'var(--ac)', label: 'ac' },
    { name: 'zap', color: 'var(--yellow)', label: 'yellow' },
    { name: 'close', color: 'var(--red)', label: 'red' },
    { name: 'info', color: 'var(--blue)', label: 'blue' },
    { name: 'sparkles', color: 'var(--purple)', label: 'purple' },
    { name: 'activity', color: 'var(--muted)', label: 'muted' },
  ];
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>Colors</div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {icons.map(({ name, color, label }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Ico name={name} size={24} color={color} />
            <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
