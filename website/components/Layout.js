import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

const nav = [
  { href: '/explore', label: 'Explore' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/about', label: 'About' },
]

export default function Layout({ children, title, description }) {
  const router = useRouter()
  const pageTitle = title ? `${title} · MedSignal` : 'MedSignal · ADHD medication evidence explorer'
  const pageDescription = description || 'Explore FDA reports and real-world user discussions about ADHD medication side effects.'

  return (
    <div className="site-shell">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://side-effect-rag-415231429576.us-central1.run.app" />
        <meta property="og:image" content="https://side-effect-rag-415231429576.us-central1.run.app/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://side-effect-rag-415231429576.us-central1.run.app/og.png" />
      </Head>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="MedSignal home">
            <span className="brand-mark">M</span>
            <span><strong>MedSignal</strong><small>ADHD evidence explorer</small></span>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            {nav.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={router.pathname.startsWith(item.href) ? 'active' : ''}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <div className="brand footer-brand"><span className="brand-mark">M</span><strong>MedSignal</strong></div>
            <p>Making medication evidence easier to explore, not replacing clinical guidance.</p>
          </div>
          <div className="footer-links">
            <Link href="/explore">Explore medications</Link>
            <Link href="/methodology">How it works</Link>
            <Link href="/about">Project story</Link>
          </div>
          <p className="footer-note">For educational and research purposes only. User reports are anecdotal and do not establish causation.</p>
        </div>
      </footer>
    </div>
  )
}
