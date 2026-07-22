export default function MedicalDisclaimer({ compact = false }) {
  return (
    <aside className={`medical-note ${compact ? 'compact' : ''}`}>
      <span className="note-icon" aria-hidden="true">i</span>
      <div><strong>Read as evidence, not advice.</strong><p>This project summarizes reporting signals and anecdotal discussions. It cannot estimate personal risk, diagnose symptoms, or replace a clinician.</p></div>
    </aside>
  )
}
