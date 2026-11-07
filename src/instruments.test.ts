import { describe, expect, it } from 'vitest'
import { noteFromMidi } from './audio/notes'
import { findInstrument, INSTRUMENTS, nearestString } from './instruments'

describe('instruments', () => {
  it('have unique ids and standard guitar tuning', () => {
    expect(new Set(INSTRUMENTS.map((i) => i.id)).size).toBe(INSTRUMENTS.length)
    expect(findInstrument('guitar').strings.map((m) => noteFromMidi(m).label)).toEqual(['E2', 'A2', 'D3', 'G3', 'B3', 'E4'])
  })

  it('falls back to chromatic for unknown ids', () => {
    expect(findInstrument('kazoo').id).toBe('chromatic')
    expect(findInstrument(null).id).toBe('chromatic')
  })

  it('picks the nearest string by pitch', () => {
    const guitar = findInstrument('guitar').strings
    expect(nearestString(84, guitar, 440)).toBe(0)
    expect(nearestString(107, guitar, 440)).toBe(1)
    expect(nearestString(250, guitar, 440)).toBe(4)
    expect(nearestString(330, guitar, 440)).toBe(5)
    expect(nearestString(null, guitar, 440)).toBe(-1)
    expect(nearestString(440, [], 440)).toBe(-1)
  })
})
