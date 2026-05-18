from PIL import Image
import numpy as np

# Load wide bear crop
img = Image.open("cropped/bear_wide.png")
# Convert to RGB
rgb_img = img.convert("RGB")
arr = np.array(rgb_img)

# The background is a very light cream/pink color. Let's find pixels that are significantly different
# from light colors (where R > 240, G > 240, B > 240 or similar cream tones)
# Let's count pixels that have R < 240 or G < 230 or B < 230
non_bg = (arr[:, :, 0] < 245) | (arr[:, :, 1] < 235) | (arr[:, :, 2] < 235)

# Find coordinates of non-background pixels
y_indices, x_indices = np.where(non_bg)
if len(x_indices) > 0 and len(y_indices) > 0:
    min_x, max_x = x_indices.min(), x_indices.max()
    min_y, max_y = y_indices.min(), y_indices.max()
    
    # Map back to original image coordinates
    # wide_box = (580, 80, 780, 320)
    orig_min_x = 580 + min_x
    orig_max_x = 580 + max_x
    orig_min_y = 80 + min_y
    orig_max_y = 80 + max_y
    
    print(f"Bear bounding box in bear_wide: X:[{min_x}, {max_x}], Y:[{min_y}, {max_y}]")
    print(f"Bear absolute bounding box in template: ({orig_min_x}, {orig_min_y}, {orig_max_x}, {orig_max_y})")
    
    # Save a crop of just the detected bear area with 5px padding
    pad = 5
    crop_box = (
        max(580, orig_min_x - pad),
        max(80, orig_min_y - pad),
        min(780, orig_max_x + pad),
        min(320, orig_max_y + pad)
    )
    detected_bear = Image.open(r"C:\Users\tohai\.gemini\antigravity\brain\15cf3826-75db-4c8e-9e4c-df2faa0c5485\media__1779079155939.png").crop(crop_box)
    detected_bear.save("cropped/bear_detected.png")
    print(f"Saved detected bear to cropped/bear_detected.png with box {crop_box}")
else:
    print("No non-background pixels found!")
