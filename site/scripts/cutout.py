# Her at the grand piano at home, cut out of the film (public/media/cutouts/selin-grand.webp, WebP with alpha).
# The films ring on Home turns around it, lit like a hologram, and the About screen shows it as an ink silhouette
# (a CSS mask, so the one file serves both). The same frame, untouched and in the same crop, is written beside it
# (selin-grand-photo.webp): the About screen wipes from the silhouette to it.
#
# It also writes the matte of the people in the supplied photograph (cutouts/portrait-matte.webp), in the 4:5 crop of
# posters/portrait.webp: the Biography cover masks the portrait with it, so the photograph's own pixels stand in front
# of her name and the name passes behind her.
#
# The matte comes from the ISNet model that ships inside the @imgly/background-removal-node npm package:
#   npm pack @imgly/background-removal-node@1.4.5 && tar xzf imgly-background-removal-node-1.4.5.tgz
#   python3 -I scripts/cutout.py package/dist [grand | portrait]   (both when left out)
# Needs ffmpeg, numpy, Pillow and onnxruntime.
import json, os, subprocess, sys, tempfile
from collections import deque

import numpy as np
import onnxruntime as ort
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.join(HERE, '..', '..', 'videos', 'WhatsApp Video 2026-10-06 at 14.22.50.mp4')
AT = '34'  # seconds in: both hands on the keys, head bowed, the lid up
OUT = os.path.join(HERE, '..', 'public', 'media', 'cutouts')
PHOTO = os.path.join(HERE, '..', '..', 'photos', 'selin-incekara-austrian-master-classes.jpg')
PORTRAIT = (0, 100, 1200, 1600)  # posters/portrait.webp's crop of PHOTO (process-media.sh: crop=1200:1500:0:100)


def matte(dist, rgb):
    """Foreground alpha (0..1) at the image's size."""
    res = json.load(open(os.path.join(dist, 'resources.json')))['/models/medium']
    model = b''.join(open(os.path.join(dist, c['hash']), 'rb').read() for c in res['chunks'])
    sess = ort.InferenceSession(model, providers=['CPUExecutionProvider'])
    h, w = rgb.shape[:2]
    x = np.asarray(Image.fromarray(rgb).resize((1024, 1024), Image.BILINEAR), dtype=np.float32)
    x = ((x - 128.0) / 256.0).transpose(2, 0, 1)[None]  # the package's own normalisation
    y = sess.run(None, {sess.get_inputs()[0].name: x})[0][0, 0]
    a = Image.fromarray(np.clip(y * 255, 0, 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)
    return np.asarray(a, dtype=np.float32) / 255


def largest(mask):
    """Keep the largest 4-connected region of a boolean mask (her, the bench and the piano are one shape)."""
    h, w = mask.shape
    seen = np.zeros_like(mask)
    best = []
    for sy, sx in zip(*np.nonzero(mask)):
        if seen[sy, sx]:
            continue
        seen[sy, sx] = True
        q, region = deque([(sy, sx)]), []
        while q:
            y, x = q.popleft()
            region.append((y, x))
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    q.append((ny, nx))
        if len(region) > len(best):
            best = region
    keep = np.zeros_like(mask)
    ys, xs = zip(*best)
    keep[list(ys), list(xs)] = True
    return keep


def grand(dist):
    """Her at the grand piano at home, cut out of the film, and the same frame untouched."""
    with tempfile.TemporaryDirectory() as tmp:
        frame = os.path.join(tmp, 'frame.png')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', AT, '-i', VIDEO, '-frames:v', '1', frame], check=True)
        rgb = np.asarray(Image.open(frame).convert('RGB'))

    a = matte(dist, rgb)
    a[:, :130] = 0  # a pot plant at the left edge, half-caught by the model
    a = np.clip((a - 0.12) / 0.76, 0, 1)  # drop faint haze, keep soft edges
    # Only the main shape survives (a dilated copy finds it, so thin parts such as the bench legs stay joined).
    solid = a > 0.5
    grown = solid.copy()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (2, 0), (-2, 0), (0, 2), (0, -2)):
        grown |= np.roll(np.roll(solid, dy, 0), dx, 1)
    a *= largest(grown)

    h, w = a.shape
    ys, xs = np.nonzero(a > 0.02)
    x0, x1 = max(xs.min() - 8, 0), min(xs.max() + 9, w)
    y0, y1 = 0, h
    # The frame cuts the raised lid at the top and her feet at the bottom: both edges fade out instead.
    rows = np.arange(h, dtype=np.float32)
    fade = np.clip(rows / (h * 0.16), 0, 1) ** 1.4 * np.clip((h - 1 - rows) / (h * 0.09), 0, 1)
    a *= fade[:, None]

    # A little light in the blacks, so the piano reads as lacquer rather than a hole; warm, never cool.
    c = rgb.astype(np.float32) / 255
    c = 0.07 + c * 0.93
    c = c * np.array([1.03, 1.0, 0.95], dtype=np.float32)
    rgba = np.dstack([np.clip(c, 0, 1) * 255, a * 255]).astype(np.uint8)[y0:y1, x0:x1]

    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, 'selin-grand.webp')
    Image.fromarray(rgba, 'RGBA').save(out, 'WEBP', quality=90, method=6)
    print(out, rgba.shape[1], 'x', rgba.shape[0])
    photo = os.path.join(OUT, 'selin-grand-photo.webp')
    Image.fromarray(rgb[y0:y1, x0:x1]).save(photo, 'WEBP', quality=92, method=6)
    print(photo)


def portrait(dist):
    """The people in the supplied photograph as an alpha matte (black, opaque where they are), in the portrait's crop."""
    rgb = np.asarray(Image.open(PHOTO).convert('RGB'))
    # The whole photograph: him and the piano's body come through firm; the faint lid drops out.
    a = np.clip((matte(dist, rgb) - 0.15) / 0.45, 0, 1)
    # Her and the bench, matted again from close crops at the model's own resolution: the whole-photo pass leaves
    # her dotted dress and the bench half see-through, and the name would show through them.
    for x0, y0, x1, y1 in ((120, 520, 760, 1480), (180, 560, 680, 1200)):
        a[y0:y1, x0:x1] = np.maximum(a[y0:y1, x0:x1], matte(dist, rgb[y0:y1, x0:x1]))
    x0, y0, x1, y1 = PORTRAIT
    a = a[y0:y1, x0:x1]
    rgba = np.zeros(a.shape + (4,), np.uint8)
    rgba[..., 3] = np.clip(a * 255, 0, 255).astype(np.uint8)
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, 'portrait-matte.webp')
    Image.fromarray(rgba, 'RGBA').save(out, 'WEBP', lossless=True, method=6)
    print(out, rgba.shape[1], 'x', rgba.shape[0])


def main():
    dist = sys.argv[1]
    which = sys.argv[2] if len(sys.argv) > 2 else 'all'
    if which in ('portrait', 'all'):
        portrait(dist)
    if which in ('grand', 'all'):
        grand(dist)


if __name__ == '__main__':
    main()
