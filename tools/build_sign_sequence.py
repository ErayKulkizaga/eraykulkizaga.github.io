"""One-time encoding of the repository's authentic demo into scroll atlases.

Requires Pillow. Input: the public SignTurk docs/images/signs/cay-preview.gif.
No generated imagery; preserve the recording's complete frames.
"""
from pathlib import Path
from PIL import Image
import math
import sys

ROOT = Path(__file__).resolve().parents[1]

def build(source):
    source = Image.open(source)
    if source.n_frames != 52 or source.size != (640, 360):
        raise ValueError('Expected the 52-frame 640×360 çay recording; update the renderer contract for a different source.')
    target = ROOT / 'images/projects/signturk-sequence'
    target.mkdir(parents=True, exist_ok=True)
    for name, stride, width, columns in [('desktop', 2, 640, 6), ('mobile', 4, 480, 4)]:
        indices = list(range(0, source.n_frames, stride))
        height = width * 9 // 16
        atlas = Image.new('RGB', (width * columns, height * math.ceil(len(indices) / columns)))
        for index, frame in enumerate(indices):
            source.seek(frame)
            image = source.convert('RGB').resize((width, height), Image.Resampling.LANCZOS)
            atlas.paste(image, ((index % columns) * width, (index // columns) * height))
        atlas.save(target / f'{name}.webp', quality=78, method=6)
        print(name, len(indices), atlas.size, (target / f'{name}.webp').stat().st_size)
    source.seek(source.n_frames // 2)
    source.convert('RGB').save(target / 'poster.webp', quality=84, method=6)

if __name__ == '__main__':
    build(sys.argv[1])
