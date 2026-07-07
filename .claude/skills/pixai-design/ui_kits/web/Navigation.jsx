/* global React, Wordmark, Icon, Button, CreditPill */
const { useState: useStateNav } = React;

function TopNav({ onTab, tab }) {
  const tabs = ['Generate', 'Models', 'Gallery', 'Contest'];
  return (
    <header style={{
      height: 64, padding: '0 24px',
      display: 'flex', alignItems: 'center', gap: 24,
      background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px) saturate(1.2)',
      borderBottom: '1px solid var(--border-soft)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      <Wordmark size={22} />
      <nav style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => onTab(t)} style={{
            padding: '8px 14px', borderRadius: 9999, border: 0,
            background: tab === t ? 'var(--primary-soft)' : 'transparent',
            color: tab === t ? 'var(--primary)' : 'var(--fg)',
            fontWeight: tab === t ? 600 : 500, fontSize: 14, cursor: 'pointer',
          }}>{t}</button>
        ))}
      </nav>
      <div style={{ flex: 1 }}>
        <div style={{
          maxWidth: 420, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', background: 'var(--pix-100)', borderRadius: 9999,
        }}>
          <Icon name="search" size={16} color="var(--fg-muted)" />
          <input placeholder="Search models, artists, tags…" style={{
            border: 0, outline: 0, background: 'transparent',
            flex: 1, fontFamily: 'Roboto', fontSize: 14, color: 'var(--fg)',
          }} />
        </div>
      </div>
      <CreditPill amount={1240} />
      <Button variant="generate" size="sm" icon="sparkles">Premium</Button>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pix-gradient)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>M</div>
    </header>
  );
}

function SideRail({ active, onPick }) {
  const items = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'generate', icon: 'wand-2', label: 'Generate' },
    { id: 'i2v', icon: 'film', label: 'Animate' },
    { id: 'lora', icon: 'layers', label: 'LoRA Training' },
    { id: 'market', icon: 'store', label: 'Model Market' },
    { id: 'gallery', icon: 'image', label: 'Gallery' },
    { id: 'contest', icon: 'trophy', label: 'Contest' },
    { id: 'following', icon: 'heart', label: 'Following' },
  ];
  return (
    <aside style={{
      width: 220, padding: '20px 14px', borderRight: '1px solid var(--border-soft)',
      background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 4,
      height: 'calc(100vh - 64px)', position: 'sticky', top: 64, overflowY: 'auto',
    }}>
      <div style={{ padding: '4px 10px 10px', fontSize: 11, color: 'var(--fg-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Create</div>
      {items.map(it => (
        <button key={it.id} onClick={() => onPick(it.id)} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
          borderRadius: 12, border: 0, cursor: 'pointer', textAlign: 'left',
          background: active === it.id ? 'var(--primary-soft)' : 'transparent',
          color: active === it.id ? 'var(--primary)' : 'var(--fg)',
          fontFamily: 'Roboto', fontSize: 14, fontWeight: active === it.id ? 600 : 500,
          transition: 'all 180ms var(--ease-out)',
        }}>
          <Icon name={it.icon} size={18} />
          {it.label}
        </button>
      ))}
      <div style={{ marginTop: 'auto', padding: 14, borderRadius: 16, background: 'var(--pix-gradient)', color: '#fff', boxShadow: 'var(--shadow-glow)' }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Go Premium</div>
        <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4, marginBottom: 10 }}>Unlock video + LoRA training.</div>
        <button style={{ width: '100%', background: '#fff', color: 'var(--pix-purple)', border: 0, borderRadius: 9999, padding: '6px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Upgrade</button>
      </div>
    </aside>
  );
}

Object.assign(window, { TopNav, SideRail });
