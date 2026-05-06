export default function Badge({ niveau, children, className = '' }) {
  const nivLower = (niveau || '').toLowerCase()
  let cls = 'badge'
  if (nivLower === 'critique') cls += ' badge-critique'
  else if (nivLower === 'modere' || nivLower === 'modéré') cls += ' badge-modere'
  else if (nivLower === 'faible') cls += ' badge-faible'
  else if (nivLower === 'warning') cls += ' badge-warning'
  else if (nivLower === 'info') cls += ' badge-info'
  else if (nivLower === 'success') cls += ' badge-success'
  else if (nivLower === 'danger') cls += ' badge-danger'
  else if (nivLower === 'primary') cls += ' badge-primary'
  else cls += ' badge-secondary'

  return (
    <span className={`${cls} ${className}`}>
      {children || niveau}
    </span>
  )
}
