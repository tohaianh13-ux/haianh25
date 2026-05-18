from PIL import Image
import os

try:
    from rembg import remove
except ImportError:
    print("rembg not installed, please install first")

img_path = r"C:\Users\tohai\.gemini\antigravity\brain\15cf3826-75db-4c8e-9e4c-df2faa0c5485\media__1779079155939.png"
img = Image.open(img_path)

# Bounding boxes (left, top, right, bottom)
# We add a bit of padding to ensure we don't cut off the characters
boxes = {
    "bunny": (260, 100, 385, 290),
    "bear": (615, 130, 735, 300),
    "cat": (280, 340, 415, 495),
    "sheep": (585, 350, 715, 495),
    "lock": (455, 30, 565, 130)
}

os.makedirs("cropped", exist_ok=True)

for name, box in boxes.items():
    cropped = img.crop(box)
    cropped.save(f"cropped/{name}_raw.png")
    print(f"Cropped {name} raw to cropped/{name}_raw.png")
    
    # Run background removal
    try:
        output = remove(cropped)
        output.save(f"cropped/{name}_nobg.png")
        print(f"Removed background for {name} -> cropped/{name}_nobg.png")
    except Exception as e:
        print(f"Failed background removal for {name}: {e}")
