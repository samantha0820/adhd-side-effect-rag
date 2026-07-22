import Link from 'next/link'
import Layout from '../../components/Layout'
import BarList from '../../components/BarList'
import MedicalDisclaimer from '../../components/MedicalDisclaimer'
import RagAssistant from '../../components/RagAssistant'
import { getMedication, medications, topEntries } from '../../lib/data'

export default function MedicationPage({ medication }) {
  const scoreEntries = topEntries(medication.scores, 7)
  const fdaEntries = topEntries(medication.fda, 7)
  const reviewEntries = Object.entries(medication.reviews).slice(0, 6)

  return (
    <Layout title={medication.name} description={`Explore FDA reports, user discussions, and evidence-grounded answers about ${medication.name}.`}>
      <section className="drug-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/explore">Explore</Link><span>/</span><span>{medication.name}</span></div>
          <div className="drug-title-row">
            <div><span className={`pill ${medication.type.toLowerCase().replace('-', '')}`}>{medication.type}</span><h1>{medication.name}</h1><p>{medication.ingredient}</p></div>
            <div className="drug-summary"><span>Dataset snapshot</span><strong>{Object.keys(medication.reviews).length}</strong><small>review-linked effect groups</small></div>
          </div>
          <div className="top-signal-row"><span>Leading model-linked signals</span>{scoreEntries.slice(0, 4).map(([effect]) => <span className="signal-chip" key={effect}>{effect}</span>)}</div>
        </div>
      </section>

      <section className="container drug-content">
        <MedicalDisclaimer />
        <div className="section-heading split-heading comparison-heading"><div><span className="eyebrow">Two evidence perspectives</span><h2>What appears in the data</h2></div><p>FDA counts and review relevance use different units. Read each panel independently rather than comparing bar lengths across panels.</p></div>
        <div className="comparison-grid">
          <article className="data-panel">
            <div className="data-panel-head"><div><span className="source-mark fda">FDA</span><h3>Adverse-event reports</h3></div><small>Report count</small></div>
            {fdaEntries.length ? <BarList entries={fdaEntries} tone="navy" valueLabel={(value) => value.toLocaleString()} /> : <div className="empty-panel">No matching FDA report summary is available for this medication.</div>}
            <p className="chart-note">Counts reflect submitted reports and cannot establish that the medication caused an event.</p>
          </article>
          <article className="data-panel">
            <div className="data-panel-head"><div><span className="source-mark reviews">NLP</span><h3>User-discussion signals</h3></div><small>Relevance score</small></div>
            <BarList entries={scoreEntries} tone="teal" />
            <p className="chart-note">Scores summarize language similarity after NLP processing; they are not prevalence estimates.</p>
          </article>
        </div>

        <section className="review-section">
          <div className="section-heading split-heading"><div><span className="eyebrow">Source text</span><h2>Read the conversations behind the signals</h2></div><p>These excerpts are anecdotal, may include unrelated details, and should be interpreted cautiously.</p></div>
          {reviewEntries.length ? <div className="review-accordion">
            {reviewEntries.map(([effect, comments], index) => (
              <details key={effect} open={index === 0}>
                <summary><span><small>{String(index + 1).padStart(2, '0')}</small>{effect}</span><span>{comments.length} excerpts <b>+</b></span></summary>
                <div className="review-grid">{comments.slice(0, 4).map((comment, commentIndex) => <blockquote key={`${effect}-${commentIndex}`}>“{comment}”<footer>User discussion excerpt</footer></blockquote>)}</div>
              </details>
            ))}
          </div> : <div className="empty-state"><strong>No review excerpts are available.</strong></div>}
        </section>

        <section className="drug-assistant"><RagAssistant drugName={medication.name} /></section>
      </section>
    </Layout>
  )
}

export function getStaticPaths() {
  return { paths: medications.map((drug) => ({ params: { drug: drug.name } })), fallback: false }
}

export function getStaticProps({ params }) {
  const medication = getMedication(params.drug)
  return medication ? { props: { medication } } : { notFound: true }
}
