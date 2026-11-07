# Changelog

All notable changes to Instrument Tuner are documented in this file, following the [Keep a Changelog](https://keepachangelog.com/) format.

## [1.0.1] - 2026-11-07

### Fixed

- Quiet notes are now detected. With the microphone's automatic gain turned off, an instrument heard from a normal distance often arrives too quietly for the old silence threshold, so nothing was detected on many phones and laptops.
- When the microphone delivers no sound at all, the tuner now says so instead of waiting for a note, and the level meter uses a decibel scale so quiet input visibly moves it.

## [1.0.0] - 2026-11-07

### Added

- First release: a chromatic and instrument tuner with a cents needle gauge, string-by-string tuning for 15 instruments and tunings, reference tones for any note or frequency, and an adjustable A4 reference pitch. Works with mouse, keyboard, and touch on desktops and phones.
