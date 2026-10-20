#!/usr/bin/env python3
"""The landing page's opening film: ten slow seconds of her and the piano, looping without a seam.

Five moments from the performance videos in ../videos/ (never modified), each in slow motion (the two 60 fps
takes play at half speed, frame for frame), joined by long dissolves, with a slow camera drift on every shot:

  window   at home, the grand by the window: her at the keys
  keys     the same take, closer: her hands, the keyboard, the lid's reflection
  hall     Austrian Master Classes: her in the polka-dot dress at the concert grand
  stage    the theatre: the last chord, her hands rise off the keys in the dark
  release  at home again: her hands lift, she sits back, and the film dissolves into its first frame

The look is low-key warm monochrome in the site's own tones (ink shadows, felt and stone mids, highlights held
below ivory so the nav stays the brightest thing on screen). Only two colours survive: velvet, where the
source is pink or red (her concert dress, the wreath on the wall at home), and brass, where light blooms
(the window, the stage lights), with a soft halation on top, a gentle vignette and fine film grain.

  python3 scripts/hero-film.py                      # both cuts → out/hero-film/{wide,phone}.mp4 (masters)
  python3 scripts/hero-film.py --cut wide --stills 0 2 4.5   # review stills → out/hero-film/stills/
  bash scripts/encode-hero-film.sh                 # web encodes and posters into ../site/public/media/
"""
import argparse
import os
import subprocess

import numpy as np
from PIL import Image

FPS = 30
DUR = 10.0  # the loop
DISSOLVE = 1.0
HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.join(HERE, '..', '..', 'videos', 'WhatsApp Video 2026-10-06 at {}.mp4')
OUT = os.path.join(HERE, '..', 'out', 'hero-film')
CUTS = {'wide': (1920, 996), 'phone': (1080, 1820)}

# Every shot is on screen for `len` seconds starting at film time `at` (wrapping round the 10 s loop), fading in
# over the first second and out under the next shot's fade-in. `src` is the source time at the shot's first
# frame, `rate` the playback speed. Framing: x, y = centre of the view in the source (0–1), z = zoom (1 = the
# whole frame, cover-fitted to the cut); `a` → `b` is the camera move across the shot. `gain`/`gamma` set
# each take's exposure before the grade (the takes were filmed in very different light). The hall was filmed at
# 30 fps, so its in-between frames are motion-interpolated (`interp`) to play as smoothly as the 60 fps takes.
SHOTS = [
    dict(id='window', clip='14.22.50', src=5.5, rate=0.5, at=-1.0, len=3.0, gain=0.86, gamma=1.2,
         wide=dict(a=(0.36, 0.44, 1.32), b=(0.38, 0.45, 1.5)),
         phone=dict(a=(0.30, 0.5, 1.0), b=(0.31, 0.5, 1.06))),
    dict(id='keys', clip='14.22.50', src=40.0, rate=0.5, at=1.0, len=3.0, gain=0.86, gamma=1.2,
         wide=dict(a=(0.47, 0.5, 2.05), b=(0.43, 0.5, 2.15)),
         phone=dict(a=(0.42, 0.55, 1.2), b=(0.40, 0.55, 1.24))),
    dict(id='hall', clip='14.23.41', src=84.6, rate=0.5, at=3.0, len=3.0, gain=0.82, gamma=1.2, interp=True,
         wide=dict(a=(0.42, 0.5, 1.12), b=(0.40, 0.48, 1.24)),
         phone=dict(a=(0.36, 0.5, 1.0), b=(0.37, 0.49, 1.05))),
    dict(id='stage', clip='14.22.40', src=64.9, rate=0.5, at=5.0, len=3.0, gain=0.93, gamma=1.08,
         wide=dict(a=(0.5, 0.44, 1.75), b=(0.49, 0.43, 1.95)),
         phone=dict(a=(0.40, 0.48, 1.5), b=(0.40, 0.47, 1.6))),
    dict(id='release', clip='14.22.50', src=90.4, rate=0.5, at=7.0, len=3.0, gain=0.86, gamma=1.2,
         wide=dict(a=(0.33, 0.42, 1.55), b=(0.31, 0.39, 1.72)),
         phone=dict(a=(0.28, 0.5, 1.0), b=(0.27, 0.47, 1.08))),
]

# Grade: luminance → tone, in the site's palette (Ink #0B0B0C … Felt #6B665E, Stone #8F897F, Dust #A8A196,
# held below Ivory #F4EFE6).
TONE = [(0.0, (13, 12, 11)), (0.16, (26, 24, 21)), (0.38, (62, 58, 52)), (0.6, (107, 102, 94)),
        (0.78, (150, 143, 131)), (0.92, (190, 181, 167)), (1.0, (214, 205, 190))]
VELVET_DARK, VELVET_LIGHT = (44, 9, 16), (126, 30, 45)  # around Velvet #7A1C2A
BRASS = (210, 176, 122)  # Brass-hover #D2B07A
INK = np.array([11, 11, 12], np.float32) / 255

_tone_x = np.array([s[0] for s in TONE], np.float32)
_tone_c = np.array([s[1] for s in TONE], np.float32) / 255


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def grade(rgb, gain, gamma):
    """rgb: HxWx3 uint8 source frame → graded HxWx3 float32 (0–1)."""
    f = rgb.astype(np.float32) / 255
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    y = np.clip((0.2126 * r + 0.7152 * g + 0.0722 * b) * gain, 0, 1) ** gamma
    out = np.stack([np.interp(y, _tone_x, _tone_c[:, i]) for i in range(3)], -1).astype(np.float32)
    # velvet: where the source is pink or red (hue about 320°–10°, saturated, not in shadow)
    mx, mn = f.max(-1), f.min(-1)
    c = mx - mn
    sat = c / (mx + 1e-6)
    cz = np.where(c > 1e-6, c, 1)
    h = np.where(mx == r, ((g - b) / cz) % 6, np.where(mx == g, (b - r) / cz + 2, (r - g) / cz + 4)) * 60
    d = np.minimum(np.abs(h - 345), 360 - np.abs(h - 345))  # distance from 345°
    m = (1 - smoothstep(16, 28, d)) * smoothstep(0.5, 0.75, sat) * smoothstep(0.15, 0.35, mx) * 0.85
    vel = np.array(VELVET_DARK, np.float32) / 255 + (np.array(VELVET_LIGHT, np.float32) - VELVET_DARK) / 255 * y[..., None]
    out += (vel - out) * m[..., None]
    # brass: where light blooms
    hb = smoothstep(0.84, 1.0, y)[..., None] * 0.55
    out += (np.array(BRASS, np.float32) / 255 - out) * hb
    return out


def ease(t):
    return 0.5 - 0.5 * np.cos(np.pi * np.clip(t, 0, 1))


class Take:
    """One shot's window of source frames, decoded at a constant frame rate and graded."""

    def __init__(self, shot):
        self.shot = shot
        path = VIDEO.format(shot['clip'])
        w, h = map(int, subprocess.check_output(
            ['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
             '-of', 'csv=p=0', path]).decode().strip().split(','))
        self.fps = 60
        dur = shot['len'] * shot['rate'] + 0.2
        vf = f'fps={self.fps}'
        if shot.get('interp'):
            vf = f'fps=30,minterpolate=fps={self.fps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1'
        raw = subprocess.check_output(
            ['ffmpeg', '-v', 'error', '-ss', f"{shot['src']:.3f}", '-i', path, '-t', f'{dur:.3f}',
             '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])
        frames = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)
        self.w, self.h = w, h
        self.frames = [None] * len(frames)
        self._raw = frames

    def frame(self, u):
        """The graded source frame at internal shot time u (s), blending neighbours for sub-frame times."""
        p = u * self.shot['rate'] * self.fps
        i = int(np.floor(p))
        i = min(max(i, 0), len(self._raw) - 2)
        fr = min(max(p - i, 0.0), 1.0)
        a = self._graded(i)
        if fr < 0.02:
            return a
        return a * (1 - fr) + self._graded(i + 1) * fr

    def _graded(self, i):
        if self.frames[i] is None:
            self.frames[i] = grade(self._raw[i], self.shot['gain'], self.shot['gamma'])
        return self.frames[i]


def view(take, cut, u, ow, oh):
    fr = take.shot[cut]
    t = ease(u / take.shot['len'])
    x, y, z = (fa + (fb - fa) * t for fa, fb in zip(fr['a'], fr['b']))
    sw, sh = take.w, take.h
    A = ow / oh
    cw, ch = (sh * A, sh) if sw / sh > A else (sw, sw / A)
    cw, ch = cw / z, ch / z
    x0 = min(max(x * sw - cw / 2, 0), sw - cw)
    y0 = min(max(y * sh - ch / 2, 0), sh - ch)
    img = take.frame(u)
    out = []
    for ch_i in range(3):  # float warp per channel keeps the shadows free of 8-bit banding
        im = Image.fromarray(np.ascontiguousarray(img[..., ch_i], np.float32), 'F')
        out.append(np.asarray(im.transform((ow, oh), Image.AFFINE, (cw / ow, 0, x0, 0, ch / oh, y0),
                                           resample=Image.BICUBIC)))
    return np.stack(out, -1)


def blur(img, factor, radius):
    """Gaussian blur at a reduced size (fast), back at full size."""
    h, w = img.shape[:2]
    sw, sh = max(1, w // factor), max(1, h // factor)
    k = np.exp(-0.5 * (np.arange(-3 * radius, 3 * radius + 1) / radius) ** 2).astype(np.float32)
    k /= k.sum()
    pad = len(k) // 2
    chans = []
    for i in range(3):
        small = np.asarray(Image.fromarray(np.ascontiguousarray(img[..., i]), 'F').resize((sw, sh), Image.BOX))
        for axis in (0, 1):  # separable, edges held
            p = np.pad(small, [(pad, pad) if a == axis else (0, 0) for a in (0, 1)], mode='edge')
            n = small.shape[axis]
            small = sum(k[j] * (p[j:j + n] if axis == 0 else p[:, j:j + n]) for j in range(len(k)))
        chans.append(np.asarray(Image.fromarray(small.astype(np.float32), 'F').resize((w, h), Image.BILINEAR)))
    return np.stack(chans, -1)


def render_frame(takes, cut, t, ow, oh, vignette, rng):
    # Active shots at film time t, oldest first; the newest dissolves in over the one before.
    active = []
    for tk in takes:
        u = (t - tk.shot['at']) % DUR
        if u < tk.shot['len']:
            active.append((u, tk))
    active.sort(key=lambda a: -a[0])
    img = None
    swell = 0.0
    for u, tk in active:
        layer = view(tk, cut, u, ow, oh)
        if img is None:
            img = layer
        else:
            a = float(ease(u / DISSOLVE))
            img = img * (1 - a) + layer * a
            swell = max(swell, np.sin(np.pi * min(u / DISSOLVE, 1)))
    # halation: the highlights glow brass; the glow swells as one shot dissolves into the next
    y = img @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    hi = np.clip((y - 0.52) / 0.48, 0, 1)[..., None] * (np.array(BRASS, np.float32) / 255)
    glow = blur(np.ascontiguousarray(hi, np.float32), 8, 6)
    img = 1 - (1 - img) * (1 - glow * (0.55 + 0.45 * swell))
    # diffusion: a little of a soft copy laid over the picture
    img = img * 0.84 + blur(img.astype(np.float32), 4, 3) * 0.16
    # vignette toward ink
    img = INK + (img - INK) * vignette
    # grain, slightly larger than a pixel, stronger in the mids
    gh, gw = oh // 2 + 1, ow // 2 + 1
    n = rng.standard_normal((gh, gw)).astype(np.float32)
    n = np.asarray(Image.fromarray(n, 'F').resize((ow, oh), Image.BILINEAR))
    y = img @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    img = img + (n * (0.022 + 0.03 * y * (1 - y)))[..., None]
    return (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)


def make_vignette(ow, oh):
    yy, xx = np.mgrid[0:oh, 0:ow].astype(np.float32)
    nx, ny = (xx / ow - 0.5) * 2, (yy / oh - 0.5) * 2
    d = np.sqrt((nx * 0.85) ** 2 + (ny * 0.95) ** 2)
    return (1 - 0.6 * smoothstep(0.45, 1.35, d))[..., None]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cut', choices=list(CUTS), action='append')
    ap.add_argument('--stills', type=float, nargs='*')
    args = ap.parse_args()
    takes = [Take(s) for s in SHOTS]
    os.makedirs(OUT, exist_ok=True)
    for cut in args.cut or list(CUTS):
        ow, oh = CUTS[cut]
        vig = make_vignette(ow, oh)
        rng = np.random.default_rng(7)
        if args.stills is not None:
            os.makedirs(os.path.join(OUT, 'stills'), exist_ok=True)
            for t in args.stills:
                Image.fromarray(render_frame(takes, cut, t, ow, oh, vig, rng)).save(
                    os.path.join(OUT, 'stills', f'{cut}-{t:05.2f}.png'))
            continue
        path = os.path.join(OUT, f'{cut}.mp4')
        enc = subprocess.Popen(
            ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{ow}x{oh}',
             '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '10',
             '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
             '-vf', 'scale=out_color_matrix=bt709:out_range=tv', path], stdin=subprocess.PIPE)
        n = int(round(DUR * FPS))
        for k in range(n):
            enc.stdin.write(render_frame(takes, cut, k / FPS, ow, oh, vig, rng).tobytes())
            if k % 30 == 0:
                print(f'{cut}: {k}/{n}', flush=True)
        enc.stdin.close()
        enc.wait()
        print(path)


if __name__ == '__main__':
    main()
