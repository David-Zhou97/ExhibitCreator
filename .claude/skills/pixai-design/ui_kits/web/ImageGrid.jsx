/* global React, Icon */

function ImageGrid({ items, generating }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
      {generating && Array.from({ length: 4 }).map((_, i) => (
        <div key={'g' + i} style={{
          aspectRatio: '1', borderRadius: 16, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(110deg, #F5EFFA 20%, #EBE3F3 40%, #F5EFFA 60%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s linear infinite',
        }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--primary)', gap: 6 }}>
            <Icon name="sparkles" size={24} />
            <div style={{ fontSize: 11, fontWeight: 500 }}>Generating…</div>
          </div>
        </div>
      ))}
      {items.map((item, i) => (
        <Card key={i} item={item} />
      ))}
      <style>{`@keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }`}</style>
    </div>
  );
}

function Card({ item }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--surface)', borderRadius: 16, overflow: 'hidden', position: 'relative',
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 180ms var(--ease-out)', cursor: 'pointer',
      }}>
      <div style={{
        aspectRatio: '1', background: item.bg || 'linear-gradient(135deg, #EEE5F6, #B27AE2)',
        backgroundImage: item.image ? `url('${item.image}')` : undefined,
        backgroundSize: item.image ? 'contain' : 'cover', backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: item.image ? '#FBF8FE' : undefined,
      }} />
      {item.premium && (
        <span style={{
          position: 'absolute', top: 10, left: 10, background: 'var(--pix-gradient)',
          color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 9999,
          letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: 'var(--shadow-glow)',
        }}>Pro</span>
      )}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '30px 12px 12px',
        background: 'linear-gradient(180deg, rgba(26,10,40,0) 0%, rgba(26,10,40,0.75) 100%)',
        color: '#fff', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        opacity: hover ? 1 : 0.0, transition: 'opacity 180ms var(--ease-out)',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>{item.author}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
          <span><Icon name="heart" size={14} /> {item.likes}</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ImageGrid });
