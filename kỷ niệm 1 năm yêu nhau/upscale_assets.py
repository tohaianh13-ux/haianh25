import os
from PIL import Image, ImageFilter
try:
    from rembg import remove
except ImportError:
    print("rembg not installed, please install first")
    exit(1)

# Path to the original template image
img_path = r"C:\Users\tohai\.gemini\antigravity\brain\15cf3826-75db-4c8e-9e4c-df2faa0c5485\media__1779079155939.png"
if not os.path.exists(img_path):
    print(f"Error: Original template image not found at {img_path}")
    exit(1)

img = Image.open(img_path)

# Bounding boxes (left, top, right, bottom)
boxes = {
    "bunny": (260, 100, 385, 290),
    "bear": (615, 130, 735, 300),
    "cat": (280, 340, 415, 495),
    "sheep": (585, 350, 715, 495),
    "lock": (455, 30, 565, 130)
}

os.makedirs("cropped", exist_ok=True)

print("Starting high-resolution cropping and upscaling...")
for name, box in boxes.items():
    # 1. Crop raw from template
    cropped = img.crop(box)
    
    # 2. Upscale by 3x using high-quality LANCZOS resampling
    w, h = cropped.size
    upscaled = cropped.resize((w * 3, h * 3), Image.Resampling.LANCZOS)
    
    # 3. Apply UnsharpMask filter to make edges and details super crisp
    # radius=2, percent=150, threshold=3 is perfect for cartoon assets
    sharpened = upscaled.filter(ImageFilter.UnsharpMask(radius=2, percent=120, threshold=2))
    
    # Save the upscaled raw image for reference
    raw_path = f"cropped/{name}_upscaled_raw.png"
    sharpened.save(raw_path)
    print(f"Upscaled and sharpened {name} -> {raw_path} ({sharpened.size[0]}x{sharpened.size[1]})")
    
    # 4. Remove background from the high-res sharpened image
    try:
        nobg = remove(sharpened)
        
        # Save to cropped folder
        nobg_path = f"cropped/{name}_upscaled_nobg.png"
        nobg.save(nobg_path)
        
        # Also overwrite the active asset in the project root directory
        root_path = f"{name}.png"
        nobg.save(root_path)
        print(f"Successfully processed & saved high-res transparent {name} -> {root_path}")
    except Exception as e:
        print(f"Failed background removal for {name}: {e}")

print("All assets successfully upscaled and optimized!")
