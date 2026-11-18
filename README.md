# Tempting Darkness – Instagram Reel

Remotion-Projekt für ein 25-Sekunden-Reel (1080×1920, 30 fps) zur Buchvorstellung
„Tempting Darkness – Rette mich“ von Carol Delight.

- `src/timing.json` – zentrales Timing (Szenen, Herzschlag, Title-Hit, Audio-Fades), von Video **und** Ton genutzt
- `src/config.ts` – Texte, Farben, abgeleitete Frame-Werte
- `src/scenes/*` – eine Komponente pro Szene
- `scripts/make_audio.py` – erzeugt `public/soundtrack.wav` (Drone, Meer, Herzschlag, Hit) mit numpy

```bash
npm install
npm run render   # erzeugt Tonspur + out/tempting-darkness.mp4
```
