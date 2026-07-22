export default function BarList({ entries, tone = 'teal', valueLabel = (value) => value.toFixed(2) }) {
  const max = Math.max(...entries.map(([, value]) => Number(value)), 1)
  return (
    <div className={`bar-list ${tone}`}>
      {entries.map(([label, value]) => (
        <div className="bar-row" key={label}>
          <div className="bar-label"><span>{label}</span><strong>{valueLabel(Number(value))}</strong></div>
          <div className="bar-track"><span style={{ width: `${Math.max((Number(value) / max) * 100, 4)}%` }} /></div>
        </div>
      ))}
    </div>
  )
}
