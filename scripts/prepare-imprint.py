"""Generate responsive copies only; original cover bytes and aspect ratios remain intact.
Requires Pillow. The browser applies the existing user-approved upper square framing for song 08 in detail.
"""
from pathlib import Path
from PIL import Image
sources={1:'01-official.png',2:'02-official.png',3:'03-official.png',4:'04-official.png',5:'05-official.png',6:'06-official.png',7:'07-official.png',8:'08-official.jpg',9:'09-official.png',11:'chikina-official.png'}
root=Path(__file__).resolve().parent.parent
out=root/'public/imprint'
out.mkdir(exist_ok=True)
for key,name in sources.items():
    image=Image.open(root/'public/artwork'/name).convert('RGB')
    for width in (480,1200):
        copy=image.copy()
        copy.thumbnail((width,round(width*image.height/image.width)),Image.Resampling.LANCZOS)
        copy.save(out/f'{key}-{width}.webp',quality=84,method=6)
