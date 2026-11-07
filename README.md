# Instrument Tuner

Instrument Tuner is a chromatic and instrument tuner that runs in the browser. Play a note and it shows the note name with its octave (such as `A4`), the exact frequency it hears, and how many cents sharp or flat you are on a needle gauge. Pick an instrument to tune string by string, or tap any note to hear it as a reference tone. Try the [live app](https://ronpicard.github.io/instrument-tuner/); it works on phones and desktops.

## How to use it

- Tap **Start tuning** and allow the microphone. Play one string or note at a time.
- The big letter is the note you are tuning to. The needle shows cents from that note: the green zone is within 5 cents, amber within 15, red beyond. The ♭ or ♯ beside the note lights up when you are flat or sharp, and the hint under it says whether to tune up or down.
- **Heard** is the frequency the tuner measures, **Target** the exact frequency of the note, and **Cents** the difference between them.
- Choose an instrument from the menu at the top: guitar (standard, Drop D, DADGAD, Open G, 7-string), bass (4 and 5 string), ukulele, baritone ukulele, violin, viola, cello, double bass, mandolin, or banjo. **Chromatic** tunes to whichever note is nearest.
- In instrument mode the tuner picks the nearest string automatically. Tap a string to hear its pitch and lock the tuner to that string; tap **Auto detect** to go back. A string gets a check mark once it has held in tune for a moment. Tune them all and the tuner celebrates.
- **Reference tone** plays any note: tap a note name, change the octave, or type any frequency from 20 to 20,000 Hz. **Hold** keeps the tone sounding until you stop it.
- **Reference pitch** sets A4 anywhere from 400 to 480 Hz, with presets for 432, 440, 442, and 444 Hz. Your instrument and reference pitch are remembered.
- **App switcher:** the links at the top open the sibling tools, Frequency Player (Tones) and Pitch Tracker (Pitch).
- **Layout:** phones show one column with the reading and strings on the first screen; phones held sideways put the reading beside the strings; desktops keep the reading and needle in view on the left while the strings and reference controls sit on the right.

## How it works

- Pitch detection uses the McLeod Pitch Method: a normalized square difference function over a 4096-sample window, peak picking, and parabolic interpolation for sub-sample accuracy. It reads synthetic test tones to within 1 cent from 41 Hz (bass low E) to 1.76 kHz, and finds the fundamental of harmonic-rich plucked tones.
- A short median filter steadies the reading, and a jump of more than a fifth starts a fresh note instead of blending. The last note stays on screen briefly after the sound stops so a decaying string remains readable.
- The microphone is opened with echo cancellation, noise suppression, and auto gain turned off, because voice processing smears pitch. Audio is analysed on your device and never sent anywhere.
- Reference tones come from a Web Audio oscillator with short gain ramps, so starting, stopping, and retuning never click.

## Development

Requires Node.js 22 (see `.nvmrc`).

```bash
npm install
npm run dev
```

```bash
npm test
```

```bash
npm run build
```

`npm test` runs 35 Vitest unit tests covering note math, pitch detection on synthetic signals, tuning tables, and microphone error handling. Pushing to `main` runs the tests, builds, and deploys to GitHub Pages through `.github/workflows/deploy.yml`.

When embedded on another site whose iframe blocks the microphone, the app offers a link to open itself in its own tab.

Built with React 19, TypeScript, Vite, and the Web Audio API, with no other runtime dependencies. Contributor and AI agent rules are in [AGENTS.md](AGENTS.md).

## License

[MIT](LICENSE)
