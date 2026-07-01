import { ServiceLogo } from 'saver-ui';

const SERVICES = [
  { domain: 'netflix.com', name: 'Netflix', color: '#E50914' },
  { domain: 'spotify.com', name: 'Spotify', color: '#1DB954' },
  { domain: 'youtube.com', name: 'YouTube', color: '#FF0000' },
  { domain: 'openai.com', name: 'OpenAI', color: '#000000' },
  { domain: 'apple.com', name: 'Apple', color: '#555' },
  { domain: 'amazon.com', name: 'Amazon', color: '#FF9900' },
];

export function Grid() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {SERVICES.map(({ domain, name, color }) => (
        <div key={domain} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <ServiceLogo domain={domain} name={name} color={color} size={44} />
          <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>{name}</span>
        </div>
      ))}
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {[28, 36, 44, 56].map((size) => (
        <ServiceLogo key={size} domain="spotify.com" name="Spotify" color="#1DB954" size={size} />
      ))}
    </div>
  );
}

export function Monogram() {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <ServiceLogo name="My Bank" color="#5FE3C0" size={44} />
      <ServiceLogo name="Savings Club" color="#7C3AED" size={44} />
      <ServiceLogo name="Work Plan" color="#2563EB" size={44} />
    </div>
  );
}
