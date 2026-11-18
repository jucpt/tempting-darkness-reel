"""Generates the complete soundtrack for the reel (numpy only).

Reads all timing from src/timing.json and writes public/soundtrack.wav.
Layers: dark ambient drone, ocean noise (scene 2), accelerating heartbeat
(scene 4), riser + deep hit on the title card (scene 5).
"""
import json
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "timing.json").read_text())
SR = T["audio"]["sampleRate"]
DUR = T["durationSec"]
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(16)
S = T["scenes"]


# ---------- helpers ----------
def fft_filter(x, lo=None, hi=None, slope=4.0):
    """Smooth band-pass via FFT magnitude shaping (Butterworth-like curves)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if hi:
        g *= 1 / np.sqrt(1 + (f / hi) ** (2 * slope))
    if lo:
        g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-6)) ** (2 * slope))
    return np.fft.irfft(X * g, len(x))


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


def window(start, end, fade_in, fade_out):
    """Envelope that is 1 between start and end with cosine fades."""
    e = np.zeros(N)
    a = np.clip((t - start) / fade_in, 0, 1)
    b = np.clip((end - t) / fade_out, 0, 1)
    e = np.minimum(a, b)
    return 0.5 - 0.5 * np.cos(np.pi * e)


def place(dst, src, at):
    i = int(at * SR)
    if i >= len(dst[0]):
        return
    n = min(len(src[0]), len(dst[0]) - i)
    dst[:, i:i + n] += src[:, :n]


def reverb(x, seconds=2.5, decay=4.0, mix=0.35):
    n = int(seconds * SR)
    tt = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-decay * tt)
    ir = fft_filter(ir, hi=3500)
    ir /= np.sqrt(np.sum(ir ** 2))
    L = len(x) + n
    wet = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[: len(x)]
    return (1 - mix) * x + mix * wet


# ---------- 1. drone ----------
def drone():
    lfo = lambda rate, ph=0: 0.5 + 0.5 * np.sin(2 * np.pi * rate * t + ph)
    out = np.zeros((2, N))
    voices = [(41.2, 0.9), (55.0, 0.8), (82.4, 0.45), (110.0, 0.22), (164.8, 0.08)]
    for ch, det in ((0, -0.18), (1, 0.21)):
        sig = np.zeros(N)
        for i, (f, a) in enumerate(voices):
            ph = rng.uniform(0, 2 * np.pi)
            sig += a * np.sin(2 * np.pi * (f + det * (i + 1)) * t + ph) * (0.6 + 0.4 * lfo(0.05 + 0.03 * i, ph))
        air = fft_filter(rng.standard_normal(N), lo=180, hi=700) * 0.6 * lfo(0.08, ch)
        out[ch] = sig + air
    out /= np.max(np.abs(out))
    # darker & tenser in the heart scene, slight swell in the split scene
    tension = 1 + 0.35 * window(S["split"]["from"], S["heart"]["to"], 2.5, 0.6)
    return out * tension


# ---------- 2. ocean ----------
def ocean():
    out = np.zeros((2, N))
    for ch in range(2):
        brown = np.cumsum(rng.standard_normal(N))
        brown = fft_filter(brown, lo=40, hi=900)
        brown = norm(brown)
        hiss = norm(fft_filter(rng.standard_normal(N), lo=900, hi=4500)) * 0.25
        # wave swells, ~5.5 s period, slightly offset per channel
        swell = 0.35 + 0.65 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 5.5 - 1.2 + ch * 0.6)) ** 2
        out[ch] = (brown + hiss * swell) * swell
    a, b = S["cuba"]["from"], S["cuba"]["to"]
    return norm(out) * window(a - 0.4, b + 0.3, 1.2, 1.2)


# ---------- 3. heartbeat ----------
def heart_times():
    hb = T["heartbeat"]
    dur = S["heart"]["to"] - S["heart"]["from"] - hb["endPaddingSec"]
    out, x = [], 0.3
    while x < dur:
        out.append(x)
        bpm = hb["startBpm"] + (hb["endBpm"] - hb["startBpm"]) * (x / dur)
        x += 60 / bpm
    return out


def thump(f0, f1, length, decay, amp):
    n = int(length * SR)
    tt = np.arange(n) / SR
    freq = f1 + (f0 - f1) * np.exp(-tt * 30)
    ph = 2 * np.pi * np.cumsum(freq) / SR
    env = (1 - np.exp(-tt * 400)) * np.exp(-tt * decay)
    body = np.sin(ph) + 0.25 * np.sin(2 * ph)
    click = fft_filter(rng.standard_normal(n), hi=600) * np.exp(-tt * 120) * 0.25
    return amp * (body + click) * env


def heartbeat():
    out = np.zeros((2, N))
    times = heart_times()
    start = S["heart"]["from"]
    for k, bt in enumerate(times):
        prog = bt / (S["heart"]["to"] - start)
        gap = 0.17 - 0.05 * prog            # lub-dub gets tighter
        amp = 0.65 + 0.35 * prog            # and a bit louder
        lub = thump(95, 48, 0.35, 16, amp)
        dub = thump(85, 44, 0.3, 20, amp * 0.6)
        s = np.zeros(int(0.6 * SR))
        s[: len(lub)] += lub
        j = int(gap * SR)
        s[j : j + len(dub)] += dub
        place(out, np.vstack([s, s]), start + bt)
    out[0] = reverb(out[0], 1.2, 6, 0.18)
    out[1] = reverb(out[1], 1.2, 6, 0.18)
    return norm(out)


# ---------- 4. riser + title hit ----------
def riser_and_hit():
    out = np.zeros((2, N))
    hit_at = S["title"]["from"] + T["titleHitOffsetSec"]
    # riser: filtered noise sweeping up during the last 1.6 s before the hit
    rl = 1.6
    n = int(rl * SR)
    tt = np.arange(n) / SR
    r = np.zeros(n)
    noise = rng.standard_normal(n)
    for seg in range(16):  # piecewise band sweep
        a, b = seg * n // 16, (seg + 1) * n // 16
        c = 300 + 2600 * (seg / 15) ** 2
        r[a:b] = fft_filter(noise, lo=c * 0.5, hi=c)[a:b]
    r *= (tt / rl) ** 2.5
    r = norm(r) * 0.35
    place(out, np.vstack([r, r]), hit_at - rl)

    # hit: sub drop + body + noise burst through a long dark reverb
    hl = 4.5
    n = int(hl * SR)
    tt = np.arange(n) / SR
    freq = 34 + 70 * np.exp(-tt * 9)
    ph = 2 * np.pi * np.cumsum(freq) / SR
    sub = np.sin(ph) * np.exp(-tt * 1.1) * (1 - np.exp(-tt * 600))
    body = np.sin(ph * 2.01) * np.exp(-tt * 4) * 0.35
    burst = fft_filter(rng.standard_normal(n), hi=1800) * np.exp(-tt * 14) * 0.5
    h = sub + body + burst
    hL = reverb(h, 3.5, 1.8, 0.45)
    hR = reverb(h, 3.5, 1.8, 0.45)
    hit = norm(np.vstack([hL, hR]))
    place(out, hit, hit_at)
    return out


# ---------- 5. light-streak swell in the hook ----------
def hook_swell():
    out = np.zeros((2, N))
    n = int(3.2 * SR)
    tt = np.arange(n) / SR
    tone = sum(np.sin(2 * np.pi * f * tt) * a for f, a in ((220, 0.5), (329.6, 0.3), (440, 0.15)))
    shimmer = fft_filter(rng.standard_normal(n), lo=2500, hi=7000) * 0.15
    env = np.sin(np.pi * np.clip(tt / 3.2, 0, 1)) ** 2
    s = norm((tone + shimmer) * env)
    s = reverb(s, 2.5, 2.5, 0.5)
    place(out, np.vstack([s, s * 0.9]), 0.4)
    return norm(out)


# ---------- mix ----------
mix = (
    0.30 * drone()
    + 0.16 * ocean()
    + 0.55 * heartbeat()
    + 0.70 * riser_and_hit()
    + 0.07 * hook_swell()
)
# gentle low cut + top roll-off for a soft, "expensive" tone
mix = np.vstack([fft_filter(c, lo=25, hi=9000, slope=2) for c in mix])

fi, fo = T["audio"]["fadeInSec"], T["audio"]["fadeOutSec"]
master = np.clip(t / fi, 0, 1) ** 2 * np.clip((DUR - t) / fo, 0, 1) ** 1.5
mix *= master

# soft-clip and normalise to -3 dBFS peak
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix *= 10 ** (-3 / 20) / np.max(np.abs(mix))

pcm = (mix.T * 32767).astype(np.int16)
out = ROOT / "public" / "soundtrack.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
rms = 20 * np.log10(np.sqrt(np.mean(mix ** 2)))
print(f"wrote {out} ({DUR}s, {SR} Hz, RMS {rms:.1f} dBFS, {len(heart_times())} heartbeats)")
