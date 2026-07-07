/* global React, Icon, Button */

function HeroBanner() {
  return (
    <div style={{
      position: 'relative', borderRadius: 24, overflow: 'hidden',
      background: 'var(--pix-gradient)', padding: '48px 56px',
      color: '#fff', boxShadow: 'var(--shadow-lg)', minHeight: 220,
      display: 'flex', alignItems: 'center', gap: 32,
    }}>
      {/* soft light */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 20% 10%, rgba(255,255,255,0.25), transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85 }}>New · Animate v2.7</div>
        <h1 style={{
          fontFamily: 'PixAI Rounded, Roboto, sans-serif', fontWeight: 900,
          fontSize: 52, lineHeight: 1.05, letterSpacing: '-0.02em',
          margin: '10px 0 12px', color: '#fff',
        }}>Bring your still images to life</h1>
        <p style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.95, maxWidth: 440, margin: '0 0 20px' }}>
          Transform static illustrations into cinematic moments. Fluid motion for anime content, built-in.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ background: '#fff', color: 'var(--pix-purple)', border: 0, borderRadius: 9999, padding: '12px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}>
            Try Animate
          </button>
          <button style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 9999, padding: '12px 22px', fontWeight: 600, fontSize: 14, cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
            See examples
          </button>
        </div>
      </div>
      <img src="../../assets/mio-mascot.png" alt="Mio" style={{
        width: 260, height: 'auto', filter: 'drop-shadow(0 24px 48px rgba(59, 34, 80, 0.4))',
        position: 'relative', zIndex: 1,
      }} />
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h2>
        {subtitle && <div style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action && <button style={{ border: 0, background: 'transparent', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', gap: 4, alignItems: 'center' }}>
        {action} <Icon name="arrow-right" size={14} />
      </button>}
    </div>
  );
}

Object.assign(window, { HeroBanner, SectionHeader });
