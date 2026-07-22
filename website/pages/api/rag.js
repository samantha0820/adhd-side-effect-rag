import reviewData from '../../public/data/reviews.json'

const SYSTEM_INSTRUCTION = `You answer questions about ADHD medication side effects.
Use only the supplied user-report evidence. Cite evidence with [1], [2], and so on.
The candidate side-effect labels come from an automated NLP pipeline and are not
verified diagnoses. Only mention a side effect when the excerpt itself supports it.
User reports are anecdotal, cannot establish causation, and do not replace medical advice.
If the evidence is insufficient, say so explicitly. Answer in the user's language.`

function tokens(value) {
  return new Set(
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2)
  )
}

function retrieve(question, drugName, topK) {
  const record = reviewData.find(
    (item) => item.drugName.toLowerCase() === String(drugName || '').toLowerCase()
  )
  if (!record) return []

  const queryTokens = tokens(question)
  const candidates = []
  Object.entries(record.sideEffects || {}).forEach(([sideEffect, comments]) => {
    comments.forEach((comment, position) => {
      const evidenceTokens = tokens(`${sideEffect} ${comment}`)
      let score = 0
      queryTokens.forEach((token) => {
        if (evidenceTokens.has(token)) score += 1
      })
      candidates.push({ sideEffect, comment, position, score })
    })
  })

  candidates.sort((a, b) => b.score - a.score || a.position - b.position)
  const selected = []
  const effects = new Set()
  for (const candidate of candidates) {
    if (effects.has(candidate.sideEffect) && selected.length < Math.min(topK, 3)) continue
    selected.push(candidate)
    effects.add(candidate.sideEffect)
    if (selected.length === topK) break
  }
  return selected
}

function citationsFor(results, drugName) {
  return results.map((result, index) => ({
    number: index + 1,
    document_id: `${String(drugName).toLowerCase()}-${index + 1}-${result.position}`,
    excerpt: result.comment,
    drug: String(drugName).toLowerCase(),
    side_effect: result.sideEffect.toLowerCase(),
    source: 'indexed user reports',
  }))
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ detail: 'Method not allowed' })
  }

  const { question, drug, top_k: requestedTopK = 5 } = request.body || {}
  if (!question || String(question).trim().length < 3 || !drug) {
    return response.status(400).json({ detail: 'A question and drug are required.' })
  }

  const topK = Math.max(1, Math.min(Number(requestedTopK) || 5, 10))
  const evidence = retrieve(question, drug, topK)
  const citations = citationsFor(evidence, drug)
  if (!evidence.length) {
    return response.status(200).json({
      answer: 'The indexed sources do not contain enough evidence to answer this question.',
      citations: [],
      insufficient_evidence: true,
      model: null,
      generation_warning: null,
    })
  }

  const context = evidence
    .map((item, index) => `[${index + 1}] drug=${drug}; candidate_side_effect=${item.sideEffect}\n${item.comment}`)
    .join('\n\n')
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return response.status(503).json({ detail: 'Gemini is not configured on the server.' })
  }

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: 'user', parts: [{ text: `Question:\n${question}\n\nEvidence:\n${context}` }] }],
        }),
      }
    )
    const payload = await upstream.json()
    if (!upstream.ok) throw new Error(payload?.error?.message || `Gemini returned ${upstream.status}`)
    const answer = payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim()
    if (!answer) throw new Error('Gemini returned no text')
    return response.status(200).json({
      answer,
      citations,
      insufficient_evidence: false,
      model,
      generation_warning: null,
    })
  } catch (error) {
    const effects = [...new Set(evidence.map((item) => item.sideEffect))].join(', ')
    return response.status(200).json({
      answer: `Retrieved user reports mention: ${effects}. Review the cited excerpts below.`,
      citations,
      insufficient_evidence: false,
      model: null,
      generation_warning: error.message,
    })
  }
}
