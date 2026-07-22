import Link from 'next/link'
import { topEntries } from '../lib/data'

export default function MedicationCard({ medication }) {
  const effects = topEntries(medication.scores, 3)
  return (
    <Link href={`/medicine/${encodeURIComponent(medication.name)}`} className="med-card">
      <div className="card-topline">
        <span className={`pill ${medication.type.toLowerCase().replace('-', '')}`}>{medication.type}</span>
        <span className="arrow-link" aria-hidden="true">↗</span>
      </div>
      <h3>{medication.name}</h3>
      <p>{medication.ingredient}</p>
      <div className="effect-tags" aria-label="Top model-linked effects">
        {effects.map(([effect]) => <span key={effect}>{effect}</span>)}
      </div>
    </Link>
  )
}
