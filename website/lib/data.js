import scoreData from '../public/data/drugSideEffectsData.json'
import fdaData from '../public/data/formatted_drug_reactions.json'
import reviewData from '../public/data/reviews.json'

const NAME_ALIASES = {
  Lntuniv: 'Intuniv',
  Desxtrostat: 'Dexstrostat',
}

const DRUG_META = {
  Adderall: { type: 'Stimulant', ingredient: 'Mixed amphetamine salts' },
  Clonidine: { type: 'Non-stimulant', ingredient: 'Clonidine' },
  Concerta: { type: 'Stimulant', ingredient: 'Methylphenidate ER' },
  Dexedrine: { type: 'Stimulant', ingredient: 'Dextroamphetamine' },
  Dexstrostat: { type: 'Stimulant', ingredient: 'Dextroamphetamine' },
  Intuniv: { type: 'Non-stimulant', ingredient: 'Guanfacine ER' },
  Kapvay: { type: 'Non-stimulant', ingredient: 'Clonidine ER' },
  Qelbree: { type: 'Non-stimulant', ingredient: 'Viloxazine ER' },
  Ritalin: { type: 'Stimulant', ingredient: 'Methylphenidate' },
  Strattera: { type: 'Non-stimulant', ingredient: 'Atomoxetine' },
  Vyvanse: { type: 'Stimulant', ingredient: 'Lisdexamfetamine' },
  Wellbutrin: { type: 'Off-label', ingredient: 'Bupropion' },
}

const normalizeName = (name) => NAME_ALIASES[name] || name

function mergeEffects(items, mode = 'values') {
  const merged = {}
  items.forEach((item) => {
    const name = normalizeName(item.drugName)
    if (!merged[name]) merged[name] = {}
    Object.entries(item.sideEffects || {}).forEach(([effect, value]) => {
      if (mode === 'reviews') {
        merged[name][effect] = [...(merged[name][effect] || []), ...value]
      } else {
        const current = Number(merged[name][effect] || 0)
        merged[name][effect] = Math.max(current, Number(value))
      }
    })
  })
  return merged
}

const scoresByDrug = mergeEffects(scoreData)
const fdaByDrug = mergeEffects(fdaData)
const reviewsByDrug = mergeEffects(reviewData, 'reviews')

export const medications = Object.keys(DRUG_META)
  .map((name) => ({
    name,
    ...DRUG_META[name],
    scores: scoresByDrug[name] || {},
    fda: fdaByDrug[name] || {},
    reviews: reviewsByDrug[name] || {},
  }))
  .filter((drug) => Object.keys(drug.scores).length || Object.keys(drug.reviews).length)
  .sort((a, b) => a.name.localeCompare(b.name))

export const sideEffects = Array.from(
  new Set(medications.flatMap((drug) => Object.keys(drug.scores)))
).sort()

export function getMedication(name) {
  return medications.find((drug) => drug.name.toLowerCase() === name.toLowerCase()) || null
}

export function topEntries(object, limit = 5) {
  return Object.entries(object || {})
    .map(([label, value]) => [label, Number(value)])
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}
