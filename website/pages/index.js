import Link from 'next/link'
import Layout from '../components/Layout'
import MedicationCard from '../components/MedicationCard'
import MedicalDisclaimer from '../components/MedicalDisclaimer'
import RagAssistant from '../components/RagAssistant'
import { medications } from '../lib/data'

export default function Home({ featured }) {
  return (
    <Layout>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow accent">ADHD medication evidence explorer</span>
            <h1>See the signals behind the side-effect conversation.</h1>
            <p className="hero-lede">Explore how FDA reports and real-world user discussions describe ADHD medication side effects—then ask an evidence-grounded AI assistant.</p>
            <div className="hero-actions">
              <Link href="/explore" className="button primary">Explore medications <span>→</span></Link>
              <Link href="/methodology" className="button secondary">See how it works</Link>
            </div>
            <div className="trust-line"><span>Built with</span><strong>Python NLP</strong><strong>Next.js</strong><strong>Gemini</strong></div>
          </div>
          <div className="signal-preview" aria-label="Example evidence explorer interface">
            <div className="preview-header"><span className="status-dot" /> Live evidence query <small>Adderall</small></div>
            <h2>What side effects do users mention?</h2>
            <div className="preview-answer">
              <span className="quote-mark">“</span>
              <p>Retrieved discussions mention dizziness, breathing difficulty, irritability, and individual differences in response.</p>
            </div>
            <div className="preview-sources">
              <div><span>01</span><p>“I take l-theanine before bed. It helps me sleep…”</p><small>Retrieved user discussion</small></div>
              <div><span>02</span><p>“There is a sweet spot… try a lower dose.”</p><small>Retrieved user discussion</small></div>
            </div>
            <div className="preview-footer"><span>2 sources retrieved</span><span>Grounded response</span></div>
          </div>
        </div>
      </section>

      <section className="metrics-strip">
        <div className="container metrics-grid">
          <div><strong>12</strong><span>medications explored</span></div>
          <div><strong>320</strong><span>indexed evidence passages</span></div>
          <div><strong>2</strong><span>evidence perspectives</span></div>
          <div><strong>Gemini</strong><span>grounded generation</span></div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading split-heading">
          <div><span className="eyebrow">Medication library</span><h2>Start with a medication</h2></div>
          <div><p>Review leading text signals, FDA report counts, and the source comments behind each result.</p><Link href="/explore" className="text-link">View all medications →</Link></div>
        </div>
        <div className="medication-grid">{featured.map((medication) => <MedicationCard key={medication.name} medication={medication} />)}</div>
      </section>

      <section className="section process-section">
        <div className="container">
          <div className="section-heading centered"><span className="eyebrow">From conversation to evidence</span><h2>A clearer path through messy health data</h2><p>Every answer stays connected to the underlying text instead of presenting a black-box conclusion.</p></div>
          <div className="process-grid">
            <article><span>01</span><div className="process-icon">Aa</div><h3>Structure the reports</h3><p>Reddit and Drugs.com discussions are cleaned and organized by medication and candidate side effect.</p></article>
            <article><span>02</span><div className="process-icon">∿</div><h3>Retrieve relevant evidence</h3><p>The public demo filters by medication and ranks passages from the curated review dataset; the offline research pipeline separately evaluates BioBERT and FAISS retrieval.</p></article>
            <article><span>03</span><div className="process-icon">✦</div><h3>Generate with evidence</h3><p>Gemini receives only the retrieved context and returns an answer with inspectable citations.</p></article>
          </div>
        </div>
      </section>

      <section className="section container assistant-showcase">
        <div className="showcase-intro"><span className="eyebrow">Try the live system</span><h2>Ask a question.<br />Inspect the evidence.</h2><p>The assistant retrieves the most relevant indexed passages before generating an answer. Every result stays traceable to source text.</p><MedicalDisclaimer compact /></div>
        <RagAssistant drugName="Adderall" compact />
      </section>
    </Layout>
  )
}

export function getStaticProps() {
  const featuredNames = ['Adderall', 'Vyvanse', 'Concerta', 'Strattera', 'Qelbree', 'Intuniv']
  return { props: { featured: medications.filter((drug) => featuredNames.includes(drug.name)) } }
}
