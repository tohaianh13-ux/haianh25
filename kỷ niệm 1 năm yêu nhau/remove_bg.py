"""Remove background from bunny only using rembg."""
from rembg import remove
from PIL import Image
import os, io

base = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(base, "bunny.png")

with open(path, "rb") as inp:
    data = inp.read()
result = remove(data)
img = Image.open(io.BytesIO(result)).convert("RGBA")
img.save(path, "PNG")
print("OK: bunny.png")
