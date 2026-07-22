import { useState } from 'react'

const starterQuestions = [
  'What side effects do users mention?',
  'What do users report about dizziness?',
  'Is irritability mentioned?',
]

function formatAnswer(answer) {
  return answer.split('\n').filter(Boolean).map((line, index) => {
    const cleaned = line.replace(/^\*\s*/, '').replace(/\*\*/g, '')
    return <p key={`${cleaned}-${index}`}>{cleaned}</p>
  })
}

export default function RagAssistant({ drugName = 'Adderall', compact = false }) {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const ask = async (event, suggestedQuestion) => {
    event?.preventDefault()
    const nextQuestion = suggestedQuestion || question.trim()
    if (nextQuestion.length < 3) return
    setQuestion(nextQuestion)
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: nextQuestion, drug: drugName, top_k: 5 }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.detail || 'The evidence assistant could not respond.')
      setResult(body)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={`rag-panel ${compact ? 'compact' : ''}`}>
      <div className="rag-heading">
        <div className="assistant-orb" aria-hidden="true"><span /></div>
        <div>
          <span className="eyebrow">Evidence assistant</span>
          <h2>Ask about {drugName}</h2>
          <p>Answers are grounded in the indexed user reports shown as evidence.</p>
        </div>
      </div>

      <div className="suggestion-row" aria-label="Suggested questions">
        {starterQuestions.map((prompt) => (
          <button key={prompt} type="button" onClick={() => ask(null, prompt)} disabled={loading}>{prompt}</button>
        ))}
      </div>

      <form className="ask-form" onSubmit={ask}>
        <label htmlFor={`rag-question-${drugName}`}>Your question</label>
        <div className="ask-input-wrap">
          <textarea
            id={`rag-question-${drugName}`}
            rows={compact ? 2 : 3}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={`What do people report about ${drugName}?`}
          />
          <button className="send-button" type="submit" disabled={loading || question.trim().length < 3}>
            {loading ? 'Searching…' : 'Ask'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="answer-loading" role="status">
          <span /><span /><span /> Retrieving relevant reports and preparing an answer…
        </div>
      )}
      {error && <div className="inline-error" role="alert"><strong>Unable to answer.</strong> {error}</div>}
      {result && (
        <div className="rag-result" aria-live="polite">
          <div className="answer-label"><span>Answer</span>{result.model && <small>{result.model}</small>}</div>
          <div className="answer-copy">{formatAnswer(result.answer)}</div>
          {result.generation_warning && <p className="warning-copy">Gemini is temporarily unavailable; this response uses retrieval results only.</p>}
          {result.citations?.length > 0 && (
            <div className="evidence-section">
              <div className="answer-label"><span>Supporting evidence</span><small>{result.citations.length} matches</small></div>
              <div className="evidence-list">
                {result.citations.map((citation, index) => (
                  <article className="evidence-card" key={citation.document_id}>
                    <span className="citation-number">{index + 1}</span>
                    <blockquote>“{citation.excerpt}”</blockquote>
                    <div><span>{citation.source || 'User report'}</span><span>candidate label: {citation.side_effect}</span><small>retrieved evidence</small></div>
                  </article>
                ))}
              </div>
            </div>
          )}
          <p className="rag-footnote">Generated from anecdotal reports. It is not medical advice and does not establish causation.</p>
        </div>
      )}
    </section>
  )
}
