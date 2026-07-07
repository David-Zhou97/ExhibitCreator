/* global React, Icon, Button, Chip, CreditPill */
const { useState: useStateGen } = React;

function PromptComposer({ onGenerate }) {
  const [prompt, setPrompt] = useStateGen('1girl, silver hair, cat ears, white sailor uniform, soft lighting, pastel sky');
  const [neg, setNeg] = useStateGen('lowres, blurry, extra fingers');
  const [style, setStyle] = useStateGen('Anime');
  const [model, setModel] = useStateGen('Tsubaki 2.0');
  const [count, setCount] = useStateGen(4);

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 20, padding: 20,
      boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-soft)',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="wand-2" size={20} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Generate</h3>
        </div>
        <button style={{ border: 0, background: 'var(--pix-100)', color: 'var(--primary)', padding: '6px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <Icon name="sparkles" size={12} /> Smart Prompt
        </button>
      </div>

      <div>
        <label style={{ fontSize: 11, color: 'var(--fg-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Prompt</label>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} style={{
          width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 10,
          border: '1.5px solid var(--border)', fontFamily: 'Roboto', fontSize: 14,
          resize: 'vertical', background: 'var(--bg)', color: 'var(--fg)', outline: 'none',
          boxSizing: 'border-box',
        }} />
      </div>

      <div>
        <label style={{ fontSize: 11, color: 'var(--fg-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Negative prompt</label>
        <input value={neg} onChange={e => setNeg(e.target.value)} style={{
          width: '100%', marginTop: 6, padding: '10px 14px', borderRadius: 10,
          border: '1.5px solid var(--border)', fontFamily: 'Roboto', fontSize: 14,
          background: 'var(--bg)', color: 'var(--fg)', outline: 'none', boxSizing: 'border-box',
        }} />
      </div>

      <div>
        <label style={{ fontSize: 11, color: 'var(--fg-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Style</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {['Anime', 'Realistic', 'Fantasy', 'Chibi', 'Semi-real'].map(s => (
            <Chip key={s} active={style === s} onClick={() => setStyle(s)}>{s}</Chip>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--fg-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Model</label>
          <div style={{ marginTop: 6, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{model}</span>
            <Icon name="chevron-down" size={16} color="var(--fg-muted)" />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--fg-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Batch</label>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {[1, 2, 4, 8].map(n => (
              <button key={n} onClick={() => setCount(n)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: count === n ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                background: count === n ? 'var(--primary-soft)' : 'var(--bg)', color: count === n ? 'var(--primary)' : 'var(--fg)',
                fontWeight: count === n ? 700 : 500, cursor: 'pointer',
              }}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 }}>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Cost: <b style={{ color: 'var(--fg)' }}>{count * 30}</b> credits</div>
        <Button variant="generate" size="lg" icon="sparkles" onClick={() => onGenerate(prompt)}>Generate</Button>
      </div>
    </div>
  );
}

Object.assign(window, { PromptComposer });
