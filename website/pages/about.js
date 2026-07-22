import Link from 'next/link'
import Layout from '../components/Layout'

export default function About() {
  return (
    <Layout title="About the project">
      <section className="page-hero about-hero"><div className="container about-grid"><div><span className="eyebrow accent">Project story</span><h1>A data science project made useful beyond the notebook.</h1></div><p>MedSignal explores how NLP can surface medication side-effect language in real-world discussions. It now combines that analysis with a deployable, evidence-grounded RAG experience.</p></div></section>
      <section className="container about-content">
        <div className="about-principles"><article><span>01</span><h2>Transparent by default</h2><p>Answers expose the retrieved text so visitors can inspect where a summary came from.</p></article><article><span>02</span><h2>Careful with claims</h2><p>The interface distinguishes reporting signals, semantic relevance, and clinical evidence.</p></article><article><span>03</span><h2>Built end to end</h2><p>The project spans data processing, embeddings, vector retrieval, generation, API design, Docker, and cloud deployment.</p></article></div>
        <div className="stack-panel"><div><span className="eyebrow">Technology</span><h2>From raw text to a production demo</h2></div><div className="stack-list">{['Python', 'BioBERT', 'FAISS', 'Gemini', 'Next.js', 'Vercel'].map((item) => <span key={item}>{item}</span>)}</div></div>
        <div className="about-cta"><div><span className="eyebrow">Explore the work</span><h2>See the system in action.</h2></div><div><Link href="/explore" className="button primary">Explore medications <span>→</span></Link><Link href="/methodology" className="button secondary">Read the methodology</Link></div></div>
      </section>
    </Layout>
  )
}
