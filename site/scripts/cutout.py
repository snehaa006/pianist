# Her at the grand piano at home, cut out of the film (public/media/cutouts/selin-grand.webp, WebP with alpha).
# The films ring on Home turns around it, lit like a hologram, and the About screen shows it as an ink silhouette
# (a CSS mask, so the one file serves both). The same frame, untouched and in the same crop, is written beside it
# (selin-grand-photo.webp): the About screen wipes from the silhouette to it.
#
# It also cuts her out at the black grand piano on the stage of the Austrian Master Classes concert, for the Biography
# cover: cutouts/selin-stage{,-720}.webp is her, the bench and the whole grand, the piano fading out
# toward the right where it runs on out of the frame; cutouts/selin-stage-front{,-720}.webp is her and the bench alone,
# in the same canvas, to stand in front of the cover's word. That frame is upscaled 4x first (scripts/upscale.mjs):
#   ffmpeg -ss 15 -i "../videos/WhatsApp Video 2026-10-06 at 14.23.41.mp4" -frames:v 1 in.png
#   node scripts/upscale.mjs <model-dir> in.png stage4x.png
#   python3 -I scripts/cutout.py package/dist stage stage4x.png
#
# The matte comes from the ISNet model that ships inside the @imgly/background-removal-node npm package:
#   npm pack @imgly/background-removal-node@1.4.5 && tar xzf imgly-background-removal-node-1.4.5.tgz
#   python3 -I scripts/cutout.py package/dist [grand]
# Needs ffmpeg, numpy, Pillow and onnxruntime.
import json, os, subprocess, sys, tempfile
from collections import deque

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.join(HERE, '..', '..', 'videos', 'WhatsApp Video 2026-10-06 at 14.22.50.mp4')
AT = '34'  # seconds in: both hands on the keys, head bowed, the lid up
OUT = os.path.join(HERE, '..', 'public', 'media', 'cutouts')


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


def stage(dist, frame):
    """Her at the black grand on the Austrian Master Classes stage, from a 4x frame of the concert film (848 x 480 at
    1x, 15 s in, the camera's closer shot). Two layers in the same canvas: the whole of it (her, the bench, the piano),
    which stands behind the cover's word, and her alone with the bench, which stands in front of it."""
    up = Image.open(frame).convert('RGB')
    W, H = up.size
    S = W / 848  # 1x pixels -> this frame's pixels
    rgb = np.asarray(up).astype(np.float32)
    r, b = rgb[..., 0], rgb[..., 2]
    lum = rgb @ np.array([0.299, 0.587, 0.114], np.float32)

    def poly(pts):
        m = Image.new('L', (W, H), 0)
        ImageDraw.Draw(m).polygon([(x * S, y * S) for x, y in pts], fill=255)
        return np.asarray(m) > 127

    # Her and the bench: the model on a close crop, at about 2x.
    x0, x1, y1 = int(250 * S), int(480 * S), int(330 * S)
    crop = up.crop((x0, 0, x1, y1))
    m = matte(dist, np.asarray(crop.resize((crop.width // 2, crop.height // 2), Image.LANCZOS)))
    her = np.zeros((H, W), np.float32)
    her[:y1, x0:x1] = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize(crop.size, Image.BILINEAR)) / 255
    her = np.clip((her - 0.3) / 0.6, 0, 1)
    her[:, :int(262 * S)] = 0  # a chair and a bag behind her
    her *= ~(poly([(215, 135), (292, 135), (296, 225), (280, 320), (215, 320)]) & (b < 0.42 * r))  # the red chair; her pink dress stays
    # The piano, which the model leaves half see-through: what is dark inside its traced outline. In the case the
    # reflections are filled in; below it the legs and the lyre keep to their own dark pixels.
    hull = poly([(408, 64), (570, 64), (572, 0), (848, 0), (848, 186), (614, 190), (614, 224), (602, 224), (602, 300),
                 (548, 316), (502, 316), (500, 202), (472, 202), (472, 256), (434, 256), (434, 186), (406, 184)])
    dark = hull & (lum < 72)
    mk = Image.fromarray((dark * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))
    for seed in ((0, 0), (W - 1, H - 1), (0, H - 1), (W - 1, int(250 * S))):
        if mk.getpixel(seed) == 0:
            ImageDraw.floodfill(mk, seed, 128)
    closed = np.asarray(Image.fromarray((dark * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))) > 127
    below = (np.arange(H) / S > 186)[:, None]
    piano = (((np.asarray(mk) != 128) & ~below) | (closed & below)) & hull
    piano = np.asarray(Image.fromarray((piano * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(S * 0.3))) / 255
    # The frame cuts the lid at the top and the tail at the right: both fade out.
    piano = piano * (np.clip(np.arange(H) / S / 40, 0, 1) ** 1.5)[:, None] * (np.clip((848 - np.arange(W) / S) / 110, 0, 1) ** 1.2)[None, :]
    # Colour: a little less saturated and warm, as the films; the piano's blacks lifted a touch, so it reads on ink.
    c = rgb / 255
    grey = (c * [0.299, 0.587, 0.114]).sum(-1, keepdims=True)
    c = (grey + (c - grey) * 0.85) * np.array([1.02, 1.0, 0.96])
    lift = (piano * (1 - her))[..., None]
    c = c * (1 - lift) + (0.06 + c * 0.94) * lift
    c = np.clip(c, 0, 1) * 255
    os.makedirs(OUT, exist_ok=True)
    box = (int(250 * S), 0, W, int(312 * S))  # from the bench to the right edge, down to the front row's chairs
    for name, a in (('selin-stage', np.maximum(her, piano)), ('selin-stage-front', her)):
        im = Image.fromarray(np.dstack([c, a * 255]).astype(np.uint8), 'RGBA').crop(box)
        for h, size in ((1248, ''), (624, '-720')):
            out = os.path.join(OUT, f'{name}{size}.webp')
            im.resize((round(im.width * h / im.height), h), Image.LANCZOS).save(out, 'WEBP', quality=86, method=6)
            print(out, im.width * h // im.height, h)


def main():
    dist = sys.argv[1]
    which = sys.argv[2] if len(sys.argv) > 2 else 'grand'
    if which == 'stage':
        stage(dist, sys.argv[3])
    else:
        grand(dist)


if __name__ == '__main__':
    main()
