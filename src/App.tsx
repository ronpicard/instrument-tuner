import { useEffect, useMemo, useRef, useState } from 'react'
import { centsBetween, clampA4, midiToFrequency, noteFromMidi, readNote, type NoteReading } from './audio/notes'
import { ToneVoice } from './audio/tone'
import { isEmbedded, useMicPitch } from './audio/useMicPitch'
import { Gauge, tuneState } from './components/Gauge'
import { ReferencePanel } from './components/ReferencePanel'
import { SuiteNav } from './components/SuiteNav'
import { findInstrument, INSTRUMENTS, nearestString } from './instruments'
import { load, save } from './storage'

/** How long the last note stays on screen after the sound stops. */
const HOLD_MS = 1500
/** How long a string must stay in tune to count as tuned. */
const TUNED_MS = 700

export function App() {
  const [instrumentId, setInstrumentId] = useState(() => findInstrument(load('tuner.instrument') ?? 'guitar').id)
  const [a4, setA4] = useState(() => clampA4(Number(load('tuner.a4') ?? 440)))
  const [lockedString, setLockedString] = useState<number | null>(null)
  const [playingString, setPlayingString] = useState<number | null>(null)
  const voice = useMemo(() => new ToneVoice(), [])
  const mic = useMicPitch({ fftSize: 4096, minFrequency: 28, maxFrequency: 2100 })
  const instrument = findInstrument(instrumentId)

  useEffect(() => save('tuner.instrument', instrumentId), [instrumentId])
  useEffect(() => save('tuner.a4', String(a4)), [a4])
  useEffect(() => () => voice.stop(), [voice])

  // Keep the last reading on screen briefly so a decaying string stays readable.
  const held = useRef<{ reading: NoteReading; at: number } | null>(null)
  const live = mic.frame.frequency ? readNote(mic.frame.frequency, a4) : null
  if (live) held.current = { reading: live, at: mic.frame.time }
  const reading = live ?? (held.current && mic.frame.time - held.current.at < HOLD_MS ? held.current.reading : null)
  const stale = !live && reading !== null

  const autoString = nearestString(reading?.measured ?? null, instrument.strings, a4)
  const targetIndex = lockedString ?? autoString
  const targetMidi = instrument.strings[targetIndex]
  const target = targetMidi !== undefined ? noteFromMidi(targetMidi, a4) : reading
  const cents = reading && target ? centsBetween(reading.measured, target.frequency) : null
  const state = stale ? 'idle' : tuneState(cents)

  // A string earns a check once it has held in tune for a moment.
  const [tuned, setTuned] = useState<ReadonlySet<number>>(() => new Set())
  const inTuneSince = useRef<{ index: number; at: number } | null>(null)
  useEffect(() => {
    if (state !== 'in-tune' || targetIndex < 0) {
      inTuneSince.current = null
      return
    }
    const since = inTuneSince.current
    if (!since || since.index !== targetIndex) inTuneSince.current = { index: targetIndex, at: mic.frame.time }
    else if (mic.frame.time - since.at > TUNED_MS && !tuned.has(targetIndex)) setTuned((prev) => new Set(prev).add(targetIndex))
  }, [state, targetIndex, mic.frame.time, tuned])

  // A new reference pitch moves every target, so earlier checks no longer hold.
  useEffect(() => setTuned(new Set()), [a4])

  const chooseInstrument = (id: string) => {
    setInstrumentId(id)
    setLockedString(null)
    setTuned(new Set())
  }

  const playString = (index: number, midi: number) => {
    setLockedString(index)
    setPlayingString(index)
    void voice.pluck(midiToFrequency(midi, a4), 2)
    window.setTimeout(() => setPlayingString((current) => (current === index ? null : current)), 2000)
  }

  const listening = mic.status === 'listening'

  // Exact digital silence for a while means the mic isn't delivering audio
  // at all (muted input, wrong device, or an iOS audio-session hiccup).
  const lastSound = useRef(0)
  const renderedAt = performance.now()
  if (!listening || mic.frame.level > 0) lastSound.current = renderedAt
  const micSilent = listening && renderedAt - lastSound.current > 2000

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="brand">
          <span className="brand__mark" aria-hidden="true">♪</span> Tuner
        </h1>
        <SuiteNav current="instrument-tuner" />
        <label className="select">
          <span className="visually-hidden">Instrument</span>
          <select value={instrumentId} onChange={(e) => chooseInstrument(e.target.value)}>
            {INSTRUMENTS.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      <main className="layout">
        <div className="layout__primary">
          <section className={`display display--${state}`} aria-label="Tuner display">
            <div className="readout">
              <div className="readout__row">
                <span className={`readout__arrow ${state === 'flat' || (state === 'close' && cents! < 0) ? 'readout__arrow--on' : ''}`} aria-hidden="true">
                  ♭
                </span>
                <div className="readout__note" aria-live="off">
                  {target ? (
                    <>
                      {target.name}
                      <sub>{target.octave}</sub>
                    </>
                  ) : (
                    <span className="readout__dash">–</span>
                  )}
                </div>
                <span className={`readout__arrow ${state === 'sharp' || (state === 'close' && cents! > 0) ? 'readout__arrow--on' : ''}`} aria-hidden="true">
                  ♯
                </span>
              </div>
              <div className="readout__hint">{micSilent ? 'No sound from the microphone. Check that it isn’t muted.' : hint(state, cents, listening)}</div>
            </div>
            <Gauge cents={stale ? null : cents} />
            <dl className="stats">
              <div>
                <dt>Heard</dt>
                <dd>{reading ? `${reading.measured.toFixed(1)} Hz` : '— Hz'}</dd>
              </div>
              <div>
                <dt>Cents</dt>
                <dd>{cents !== null ? `${cents > 0 ? '+' : ''}${cents.toFixed(1)}` : '—'}</dd>
              </div>
              <div>
                <dt>Target</dt>
                <dd>{target ? `${target.frequency.toFixed(2)} Hz` : '— Hz'}</dd>
              </div>
            </dl>
            <p className="detected">{reading && instrument.strings.length > 0 && target && reading.label !== target.label ? `Hearing ${reading.label}` : '\u00a0'}</p>
            <div className="meter" aria-hidden="true">
              <span style={{ transform: `scaleX(${listening ? mic.frame.level : 0})` }} />
            </div>
          </section>

          <MicControl status={mic.status} onStart={() => void mic.start()} onStop={mic.stop} />
        </div>

        <div className="layout__secondary">
          {instrument.strings.length > 0 ? (
            <section className="strings" aria-label={`${instrument.name} strings`}>
              <div className="strings__head">
                <h2>
                  Strings <span className="strings__count">{tuned.size ? `${tuned.size}/${instrument.strings.length} tuned` : ''}</span>
                </h2>
                <button type="button" className={`chip ${lockedString === null ? 'chip--on' : ''}`} onClick={() => setLockedString(null)}>
                  Auto detect
                </button>
              </div>
              <div className="strings__row" style={{ gridTemplateColumns: `repeat(${instrument.strings.length}, minmax(0, 1fr))` }}>
                {instrument.strings.map((midi, index) => {
                  const note = noteFromMidi(midi, a4)
                  const active = index === targetIndex && reading && !stale
                  return (
                    <button
                      key={`${instrument.id}-${index}`}
                      type="button"
                      className={[
                        'string',
                        active ? `string--active string--${state}` : '',
                        lockedString === index ? 'string--locked' : '',
                        playingString === index ? 'string--playing' : '',
                        tuned.has(index) ? 'string--tuned' : '',
                      ].join(' ')}
                      onClick={() => playString(index, midi)}
                      aria-label={`Play ${note.label}, ${note.frequency.toFixed(2)} hertz, and tune to it${tuned.has(index) ? '. Tuned' : ''}`}
                    >
                      <span className="string__check" aria-hidden="true">✓</span>
                      <span className="string__note">
                        {note.name}
                        <sub>{note.octave}</sub>
                      </span>
                      <span className="string__hz">{note.frequency.toFixed(1)}</span>
                    </button>
                  )
                })}
              </div>
              <p className="footnote">Tap a string to hear it and tune to it. Auto detect follows whichever string you play; a string gets a check once it holds in tune.</p>
            </section>
          ) : null}

          <ReferencePanel voice={voice} a4={a4} />

          <section className="calibrate" aria-label="Calibration">
            <h2>Reference pitch</h2>
            <div className="calibrate__row">
              <div className="stepper">
                <button type="button" onClick={() => setA4((v) => clampA4(v - 1))} aria-label="Lower A4 by 1 hertz">
                  −
                </button>
                <output>A4 = {a4} Hz</output>
                <button type="button" onClick={() => setA4((v) => clampA4(v + 1))} aria-label="Raise A4 by 1 hertz">
                  +
                </button>
              </div>
              <div className="presets">
                {[432, 440, 442, 444].map((v) => (
                  <button key={v} type="button" className={`chip ${a4 === v ? 'chip--on' : ''}`} onClick={() => setA4(v)}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        Works best in a quiet room. Audio stays on your device.{' '}
        <a href="https://github.com/ronpicard/instrument-tuner" target="_blank" rel="noopener noreferrer">
          Source
        </a>
      </footer>
    </div>
  )
}

function hint(state: string, cents: number | null, listening: boolean): string {
  if (!listening) return 'Tap Start to listen'
  if (cents === null || state === 'idle') return 'Play a note'
  if (state === 'in-tune') return 'In tune'
  return cents < 0 ? 'Tune up ↑' : 'Tune down ↓'
}

function MicControl({ status, onStart, onStop }: { status: string; onStart: () => void; onStop: () => void }) {
  if (status === 'listening') {
    return (
      <button type="button" className="primary primary--stop" onClick={onStop}>
        Stop listening
      </button>
    )
  }
  if (status === 'denied' && isEmbedded()) {
    return (
      <div className="notice">
        <p>The microphone is blocked inside this embedded preview.</p>
        <a className="primary" href={window.location.href} target="_blank" rel="noopener noreferrer">
          Open the tuner in its own tab
        </a>
      </div>
    )
  }
  return (
    <div className="mic">
      <button type="button" className="primary" onClick={onStart} disabled={status === 'starting'}>
        {status === 'starting' ? 'Starting…' : 'Start tuning'}
      </button>
      {status === 'denied' ? <p className="notice">Microphone access was denied. Allow it in your browser’s site settings and try again.</p> : null}
      {status === 'unsupported' ? <p className="notice">No microphone was found, or this browser can’t record audio.</p> : null}
      {status === 'error' ? <p className="notice">The microphone couldn’t start. Try again.</p> : null}
    </div>
  )
}
