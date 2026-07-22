import Layout from '../../components/Layout'
import MedicationCard from '../../components/MedicationCard'
import { medications } from '../../lib/data'

export default function MedicationIndex({ drugs }) {
  return (
    <Layout title="Medication library">
      <section className="page-hero compact-hero"><div className="container"><span className="eyebrow accent">Medication library</span><h1>Explore every medication in the dataset.</h1><p>Open a medication to compare FDA reports, NLP-linked discussion signals, source excerpts, and RAG answers.</p></div></section>
      <section className="section container"><div className="medication-grid">{drugs.map((drug) => <MedicationCard key={drug.name} medication={drug} />)}</div></section>
    </Layout>
  )
}

export function getStaticProps() { return { props: { drugs: medications } } }
