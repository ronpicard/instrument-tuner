import { centsBetween, midiToFrequency, parseNote } from './audio/notes'

export type Instrument = {
  id: string
  name: string
  /** String MIDI numbers from lowest-pitched string to highest. Empty = chromatic. */
  strings: number[]
}

function notes(...labels: string[]): number[] {
  return labels.map((label) => {
    const midi = parseNote(label)
    if (midi === null) throw new Error(`Bad note in tuning table: ${label}`)
    return midi
  })
}

export const INSTRUMENTS: readonly Instrument[] = [
  { id: 'chromatic', name: 'Chromatic', strings: [] },
  { id: 'guitar', name: 'Guitar', strings: notes('E2', 'A2', 'D3', 'G3', 'B3', 'E4') },
  { id: 'guitar-drop-d', name: 'Guitar · Drop D', strings: notes('D2', 'A2', 'D3', 'G3', 'B3', 'E4') },
  { id: 'guitar-dadgad', name: 'Guitar · DADGAD', strings: notes('D2', 'A2', 'D3', 'G3', 'A3', 'D4') },
  { id: 'guitar-open-g', name: 'Guitar · Open G', strings: notes('D2', 'G2', 'D3', 'G3', 'B3', 'D4') },
  { id: 'guitar-7', name: '7-string guitar', strings: notes('B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4') },
  { id: 'bass', name: 'Bass', strings: notes('E1', 'A1', 'D2', 'G2') },
  { id: 'bass-5', name: '5-string bass', strings: notes('B0', 'E1', 'A1', 'D2', 'G2') },
  { id: 'ukulele', name: 'Ukulele', strings: notes('G4', 'C4', 'E4', 'A4') },
  { id: 'ukulele-baritone', name: 'Baritone ukulele', strings: notes('D3', 'G3', 'B3', 'E4') },
  { id: 'violin', name: 'Violin', strings: notes('G3', 'D4', 'A4', 'E5') },
  { id: 'viola', name: 'Viola', strings: notes('C3', 'G3', 'D4', 'A4') },
  { id: 'cello', name: 'Cello', strings: notes('C2', 'G2', 'D3', 'A3') },
  { id: 'double-bass', name: 'Double bass', strings: notes('E1', 'A1', 'D2', 'G2') },
  { id: 'mandolin', name: 'Mandolin', strings: notes('G3', 'D4', 'A4', 'E5') },
  { id: 'banjo', name: 'Banjo · Open G', strings: notes('G4', 'D3', 'G3', 'B3', 'D4') },
]

export function findInstrument(id: string | null | undefined): Instrument {
  return INSTRUMENTS.find((instrument) => instrument.id === id) ?? INSTRUMENTS[0]!
}

/** Index of the string closest in pitch to `frequency`, or -1 for chromatic / no reading. */
export function nearestString(frequency: number | null, strings: readonly number[], a4: number): number {
  if (!frequency || strings.length === 0) return -1
  let best = -1
  let bestDistance = Infinity
  strings.forEach((midi, index) => {
    const distance = Math.abs(centsBetween(frequency, midiToFrequency(midi, a4)))
    if (distance < bestDistance) {
      bestDistance = distance
      best = index
    }
  })
  return best
}
