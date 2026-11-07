import { useEffect, useState } from 'react'
import { NOTE_NAMES, midiToFrequency, readNote } from '../audio/notes'
import type { ToneVoice } from '../audio/tone'

/** Pick any note or type any frequency and hear it as a reference tone. */
export function ReferencePanel({ voice, a4 }: { voice: ToneVoice; a4: number }) {
  const [octave, setOctave] = useState(4)
  const [pc, setPc] = useState(9)
  const [hz, setHz] = useState('440')
  const [playing, setPlaying] = useState(false)

  const midi = (octave + 1) * 12 + pc
  const parsed = Number(hz)
  const valid = Number.isFinite(parsed) && parsed >= 20 && parsed <= 20000

  useEffect(() => {
    setHz(midiToFrequency(midi, a4).toFixed(2))
  }, [midi, a4])

  useEffect(() => {
    if (playing && valid) voice.setFrequency(parsed)
  }, [playing, valid, parsed, voice])

  const toggle = () => {
    if (playing) {
      voice.stop()
      setPlaying(false)
    } else if (valid) {
      void voice.start(parsed)
      setPlaying(true)
    }
  }

  const pick = (index: number) => {
    setPc(index)
    if (!playing) void voice.pluck(midiToFrequency((octave + 1) * 12 + index, a4), 1.5)
  }

  const typed = valid ? readNote(parsed, a4) : null

  return (
    <section className="reference" aria-label="Reference tone">
      <h2>Reference tone</h2>
      <div className="keys" role="group" aria-label="Notes">
        {NOTE_NAMES.map((name, index) => (
          <button
            key={name}
            type="button"
            className={`key ${name.length > 1 ? 'key--sharp' : ''} ${index === pc ? 'key--on' : ''}`}
            onClick={() => pick(index)}
            aria-pressed={index === pc}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="reference__row">
        <div className="stepper stepper--small">
          <button type="button" onClick={() => setOctave((o) => Math.max(0, o - 1))} aria-label="Octave down">
            −
          </button>
          <output>Octave {octave}</output>
          <button type="button" onClick={() => setOctave((o) => Math.min(8, o + 1))} aria-label="Octave up">
            +
          </button>
        </div>
        <label className="hz-input">
          <input
            inputMode="decimal"
            value={hz}
            onChange={(e) => setHz(e.target.value)}
            aria-label="Frequency in hertz"
            aria-invalid={!valid}
          />
          <span>Hz</span>
        </label>
        <button type="button" className={`play ${playing ? 'play--on' : ''}`} onClick={toggle} disabled={!valid && !playing}>
          {playing ? '■ Stop' : '▶ Hold'}
        </button>
      </div>
      <p className="footnote">
        {typed ? `${parsed.toFixed(2)} Hz is ${typed.label} ${formatCents(typed.cents)}.` : 'Enter a frequency from 20 to 20,000 Hz.'}
      </p>
    </section>
  )
}

function formatCents(cents: number): string {
  const rounded = Math.round(cents)
  return rounded === 0 ? '(in tune)' : `(${rounded > 0 ? '+' : ''}${rounded} cents)`
}
