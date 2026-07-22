import Layout from '../components/Layout'
import MedicalDisclaimer from '../components/MedicalDisclaimer'

const stages = [
  { number: '01', title: 'Collect & structure', text: 'Reddit and Drugs.com discussions are cleaned and grouped with medication and candidate side-effect metadata.', detail: 'Python · pandas · NLTK' },
  { number: '02', title: 'Analyze offline', text: 'The research pipeline uses BioBERT embeddings and FAISS to study semantic similarity across the review corpus.', detail: 'BioBERT · FAISS' },
  { number: '03', title: 'Retrieve for the public demo', text: 'The serverless demo filters evidence by medication, ranks passages with lexical relevance, and selects a diverse evidence set.', detail: 'Next.js · serverless retrieval' },
  { number: '04', title: 'Answer with citations', text: 'Gemini receives the question and retrieved passages, producing a concise answer that remains tied to inspectable evidence.', detail: 'Gemini · grounded generation' },
]

export default function Methodology() {
  return (
    <Layout title="Methodology" description="How MedSignal turns medication discussions into evidence-grounded RAG answers.">
      <section className="page-hero methodology-hero"><div className="container narrow"><span className="eyebrow accent">Methodology</span><h1>Designed to keep the answer connected to the evidence.</h1><p>This project combines an offline biomedical NLP pipeline with a lightweight serverless RAG demo. Gemini does not search the open web; it receives only passages selected from this project&apos;s review dataset.</p></div></section>
      <section className="container methodology-body">
        <div className="pipeline-list">{stages.map((stage) => <article key={stage.number}><span className="stage-number">{stage.number}</span><div><h2>{stage.title}</h2><p>{stage.text}</p></div><small>{stage.detail}</small></article>)}</div>
        <div className="architecture-card">
          <div><span>User question</span><small>Natural language</small></div><b>→</b><div><span>Medication filter</span><small>Dataset scope</small></div><b>→</b><div><span>Lexical ranking</span><small>Diverse evidence</small></div><b>→</b><div><span>Gemini</span><small>Cited answer</small></div>
        </div>
        <div className="method-grid">
          <article><span className="eyebrow">What the scores mean</span><h2>Relevance, not incidence</h2><p>The NLP score describes how closely discussion text aligns with a side-effect concept. It does not measure how often an effect occurs, how severe it is, or whether a medication caused it.</p></article>
          <article><span className="eyebrow">What FDA counts mean</span><h2>Reports, not confirmed causality</h2><p>Adverse-event reporting systems are valuable for signal detection but are affected by reporting behavior, duplicate submissions, missing context, and exposure differences.</p></article>
        </div>
        <MedicalDisclaimer />
      </section>
    </Layout>
  )
}
