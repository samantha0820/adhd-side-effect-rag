import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import MedicationCard from '../components/MedicationCard'
import BarList from '../components/BarList'
import MedicalDisclaimer from '../components/MedicalDisclaimer'
import { medications, sideEffects } from '../lib/data'

export default function Explore({ drugs, effects }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [effect, setEffect] = useState('')

  const filtered = useMemo(() => drugs.filter((drug) => {
    const matchesText = `${drug.name} ${drug.ingredient}`.toLowerCase().includes(query.toLowerCase())
    const matchesType = type === 'All' || drug.type === type
    return matchesText && matchesType
  }), [drugs, query, type])

  const ranked = useMemo(() => effect
    ? drugs.map((drug) => [drug.name, Number(drug.scores[effect] || 0)]).filter(([, score]) => score > 0).sort((a, b) => b[1] - a[1])
    : [], [drugs, effect])

  return (
    <Layout title="Explore medications" description="Search ADHD medications and compare model-linked side-effect signals.">
      <section className="page-hero compact-hero">
        <div className="container"><span className="eyebrow accent">Explore the data</span><h1>Find a medication or follow a side-effect signal.</h1><p>Search across stimulant, non-stimulant, and off-label medications. Scores describe semantic relevance in this dataset—not frequency or personal risk.</p></div>
      </section>
      <section className="container explore-shell">
        <div className="explore-controls">
          <label className="search-field"><span>Search medication</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Adderall or methylphenidate" /></label>
          <div className="filter-group" aria-label="Medication type">
            {['All', 'Stimulant', 'Non-stimulant', 'Off-label'].map((item) => <button key={item} className={type === item ? 'selected' : ''} onClick={() => setType(item)}>{item}</button>)}
          </div>
        </div>
        <div className="result-summary"><span>{filtered.length} medications</span><small>Sorted alphabetically</small></div>
        <div className="medication-grid">{filtered.map((drug) => <MedicationCard key={drug.name} medication={drug} />)}</div>
        {!filtered.length && <div className="empty-state"><strong>No medication matched that search.</strong><p>Try a brand name, active ingredient, or a different category.</p></div>}
      </section>

      <section className="section effect-explorer">
        <div className="container effect-grid">
          <div><span className="eyebrow">Reverse lookup</span><h2>Start with a side effect</h2><p>Select a term to see which medications have the strongest semantic association in the processed review dataset.</p><label className="select-field"><span>Side-effect term</span><select value={effect} onChange={(event) => setEffect(event.target.value)}><option value="">Choose a side effect</option>{effects.map((item) => <option key={item}>{item}</option>)}</select></label><MedicalDisclaimer compact /></div>
          <div className="ranking-card">
            <div className="card-heading"><div><span>Model relevance ranking</span><h3>{effect || 'Choose a term to compare'}</h3></div>{effect && <small>{ranked.length} matches</small>}</div>
            {effect ? <BarList entries={ranked} /> : <div className="chart-placeholder"><span>∿</span><p>Your comparison will appear here.</p></div>}
            {effect && <p className="chart-note">Bars are normalized within this selected term. They do not represent incidence rates or clinical severity.</p>}
          </div>
        </div>
      </section>
    </Layout>
  )
}

export function getStaticProps() {
  return { props: { drugs: medications, effects: sideEffects } }
}
