/* global React */
const { useState } = React;

function Icon({ name, size = 20, stroke = 1.75, color }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = '';
      const i = document.createElement('i');
      i.setAttribute('data-lucide', name);
      i.setAttribute('width', size);
      i.setAttribute('height', size);
      i.setAttribute('stroke-width', stroke);
      if (color) i.style.color = color;
      ref.current.appendChild(i);
      window.lucide.createIcons({ attrs: { 'stroke-width': stroke } });
    }
  }, [name, size, stroke, color]);
  return <span ref={ref} style={{ display: 'inline-flex', lineHeight: 0 }} />;
}

function Wordmark({ size = 28 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src="../../assets/pixai-logo-mark.svg" alt="" style={{ width: size * 1.25, height: size * 1.25 }} />
      <span style={{ fontFamily: 'PixAI Rounded, Roboto, sans-serif', fontWeight: 900, fontSize: size, letterSpacing: '-0.01em', lineHeight: 1, color: 'var(--pix-800)' }}>
        Pix<span className="fill-gradient">AI</span>
      </span>
    </div>
  );
}

function Button({ variant = 'primary', size = 'md', children, onClick, icon }) {
  const sizes = {
    sm: { padding: '6px 14px', fontSize: 13 },
    md: { padding: '10px 20px', fontSize: 14 },
    lg: { padding: '12px 24px', fontSize: 15 },
  };
  const variants = {
    primary: { background: 'var(--primary)', color: '#fff', boxShadow: 'var(--shadow-sm)' },
    generate: { background: 'var(--pix-gradient)', color: '#fff', boxShadow: 'var(--shadow-glow)', fontWeight: 700 },
    ghost: { background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary)' },
    soft: { background: 'var(--primary-soft)', color: 'var(--primary)' },
    dim: { background: 'var(--surface)', color: 'var(--fg)', border: '1px solid var(--border)' },
  };
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: 'Roboto, sans-serif', fontWeight: 500, border: 0,
        borderRadius: 9999, cursor: 'pointer', transition: 'all 180ms var(--ease-out)',
        ...sizes[size], ...variants[variant],
      }}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 9999, border: 0, cursor: 'pointer',
      fontSize: 13, fontWeight: 500, fontFamily: 'Roboto',
      background: active ? 'var(--pix-gradient)' : 'var(--primary-soft)',
      color: active ? '#fff' : 'var(--primary)',
      transition: 'all 180ms var(--ease-out)',
    }}>{children}</button>
  );
}

function CreditPill({ amount = 1240 }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
      background: 'var(--pix-800)', color: '#fff', borderRadius: 9999,
      fontSize: 13, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pix-gradient-2)', boxShadow: '0 0 6px var(--pix-gradient-2)' }} />
      {amount.toLocaleString()}
    </div>
  );
}

Object.assign(window, { Icon, Wordmark, Button, Chip, CreditPill });
