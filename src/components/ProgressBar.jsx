export default function ProgressBar({ value = 0, label, size }) {
  const clamped = Math.min(100, Math.max(0, value))

  let colorClass = 'green'
  if (clamped < 30) colorClass = 'red'
  else if (clamped < 60) colorClass = 'orange'

  return (
    <div className="progress-bar-container">
      {label !== undefined && (
        <div className="progress-bar-label">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className={`progress-bar-track ${size === 'lg' ? 'lg' : ''}`}>
        <div
          className={`progress-bar-fill ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
