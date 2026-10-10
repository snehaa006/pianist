# Cut-outs for the reel's end card: her (and her piano) lifted out of five performances.
# Needs: pip install rembg onnxruntime scipy  (model isnet-general-use, downloaded on first run)
# Usage: python3 scripts/cutouts.py   → public/cutouts/<name>.png (RGBA, cropped)
import os, subprocess, tempfile
import numpy as np
from PIL import Image
from rembg import remove, new_session
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
VIDEOS = os.path.join(ROOT, '..', 'videos')
OUT = os.path.join(ROOT, 'public', 'cutouts')
# name | clip | time | drop: boxes (fractions of the frame) whose components are removed
CUTS = [
    ('home', '14.22.50', 12.0, []),
    ('hall', '14.23.41', 91.05, []),
    ('stage', '14.22.40', 69.9, [(0.0, 0.55, 0.38, 1.0)]),  # the stage speaker
    ('twilight', '14.22.59', 40.0, []),
    ('andante', '14.23.23', 18.0, []),
]
session = new_session('isnet-general-use')
os.makedirs(OUT, exist_ok=True)
for name, clip, t, drop in CUTS:
    with tempfile.TemporaryDirectory() as d:
        frame = os.path.join(d, 'f.png')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i',
                        os.path.join(VIDEOS, f'WhatsApp Video 2026-10-06 at {clip}.mp4'), '-frames:v', '1', frame], check=True)
        im = Image.open(frame).convert('RGB')
    rgba = np.array(remove(im, session=session)).astype(np.float32)
    a = rgba[..., 3] / 255
    # firm up the matte: drop the faint ghosts (music stands, floor), keep a soft edge
    a = np.clip((a - 0.45) / 0.3, 0, 1)
    lab, n = ndimage.label(a > 0.5)
    sizes = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
    keep = np.zeros(n + 1, bool)
    H, W = a.shape
    for i, s in enumerate(sizes, start=1):
        if s < 0.04 * sizes.max():
            continue
        ys, xs = np.nonzero(lab == i)
        cx, cy = xs.mean() / W, ys.mean() / H
        if any(x0 <= cx <= x1 and y0 <= cy <= y1 for x0, y0, x1, y1 in drop):
            continue
        keep[i] = True
    mask = ndimage.binary_dilation(keep[lab], iterations=2)
    a = a * mask
    a = ndimage.gaussian_filter(a, 0.6)
    rgba[..., 3] = np.clip(a, 0, 1) * 255
    out = Image.fromarray(rgba.astype(np.uint8), 'RGBA')
    out = out.crop(out.getbbox())
    out.save(os.path.join(OUT, f'{name}.png'))
    print(name, out.size)
