import os
from PIL import Image, ImageFilter
try:
    from rembg import remove
except ImportError:
    print("rembg not installed, please install first")
    exit(1)

# Path to the original template image
img_path = r"C:\Users\tohai\.gemini\antigravity\brain\15cf3826-75db-4c8e-9e4c-df2faa0c5485\media__1779079155939.png"
img = Image.open(img_path)
width, height = img.size
print(f"Original image size: {width}x{height}")

# Safe expanded bounding boxes to ensure absolutely nothing gets cut off
# (left, top, right, bottom)
boxes = {
    "bunny": (240, 70, 405, 305),
    "bear": (600, 80, 790, 330),
    "cat": (260, 320, 435, 499),
    "sheep": (565, 330, 735, 499),
    "lock": (440, 10, 580, 140)
}

os.makedirs("cropped", exist_ok=True)

print("Starting high-resolution cropping with expanded boxes...")
for name, box in boxes.items():
    # Clip coordinates to image boundaries to prevent errors
    x1 = max(0, box[0])
    y1 = max(0, box[1])
    x2 = min(width, box[2])
    y2 = min(height, box[3])
    
    # 1. Crop raw from template
    cropped = img.crop((x1, y1, x2, y2))
    
    # 2. Upscale by 3x using high-quality LANCZOS resampling
    w, h = cropped.size
    upscaled = cropped.resize((w * 3, h * 3), Image.Resampling.LANCZOS)
    
    # 3. Apply UnsharpMask filter to make details and outlines extremely sharp
    sharpened = upscaled.filter(ImageFilter.UnsharpMask(radius=2.5, percent=130, threshold=2))
    
    # Save the raw upscaled image for reference
    raw_path = f"cropped/{name}_expanded_raw.png"
    sharpened.save(raw_path)
    print(f"Cropped and upscaled {name} -> {raw_path} ({sharpened.size[0]}x{sharpened.size[1]})")
    
    # 4. Remove background from the high-res sharpened image
    try:
        nobg = remove(sharpened)
        
        # Save to cropped folder
        nobg_path = f"cropped/{name}_expanded_nobg.png"
        nobg.save(nobg_path)
        
        # Overwrite the active asset in the project root directory
        root_path = f"{name}.png"
        nobg.save(root_path)
        print(f"Successfully processed & saved high-res transparent {name} -> {root_path}")
    except Exception as e:
        print(f"Failed background removal for {name}: {e}")

print("All expanded high-res assets generated successfully!")
