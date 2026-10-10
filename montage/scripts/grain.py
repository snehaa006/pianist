# Film-grain tiles for the overlays: public/grain/0–5.png (960x540 grey noise, shown at 7.5% in overlay mode).
import os
import numpy as np
from PIL import Image

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'grain')
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(3)
for i in range(6):
    n = rng.normal(0.5, 0.17, (540, 960)).clip(0, 1)
    Image.fromarray((n * 255).astype('uint8'), 'L').save(os.path.join(out, f'{i}.png'))
