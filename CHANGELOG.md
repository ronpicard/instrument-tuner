# Changelog

All notable changes to Instrument Tuner are documented in this file, following the [Keep a Changelog](https://keepachangelog.com/) format.

## [1.1.0] - 2026-11-07

### Added

- A switcher at the top links Tuner, Tones (Frequency Player), and Pitch (Pitch Tracker), so you can move between the three music tools.
- Flat (♭) and sharp (♯) marks either side of the note light up to show which way you are off.
- Each string gets a check mark once it has held in tune for a moment, and the Strings heading counts how many are done. Changing instrument or reference pitch clears them.

### Changed

- On desktops the reading and needle sit on the left and stay in view while the strings, reference tone, and reference pitch fill the right. Phones held sideways show the whole reading beside the strings without scrolling.

## [1.0.1] - 2026-11-07

### Fixed

- Quiet notes are now detected. With the microphone's automatic gain turned off, an instrument heard from a normal distance often arrives too quietly for the old silence threshold, so nothing was detected on many phones and laptops.
- When the microphone delivers no sound at all, the tuner now says so instead of waiting for a note, and the level meter uses a decibel scale so quiet input visibly moves it.

## [1.0.0] - 2026-11-07

### Added

- First release: a chromatic and instrument tuner with a cents needle gauge, string-by-string tuning for 15 instruments and tunings, reference tones for any note or frequency, and an adjustable A4 reference pitch. Works with mouse, keyboard, and touch on desktops and phones.
