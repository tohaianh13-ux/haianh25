from PIL import Image
import numpy as np

img = Image.open("cropped/bear_wide.png")
rgb = img.convert("RGB")
arr = np.array(rgb)

# The bear is brown. Let's find the typical brown color by looking for pixels with:
# 100 < R < 210, 70 < G < 170, 50 < B < 140
# And R > G + 15 (brown is reddish/orange), G > B + 5
brown_mask = (
    (arr[:, :, 0] >= 100) & (arr[:, :, 0] <= 220) &
    (arr[:, :, 1] >= 70)  & (arr[:, :, 1] <= 180) &
    (arr[:, :, 2] >= 50)  & (arr[:, :, 2] <= 150) &
    (arr[:, :, 0] > arr[:, :, 1] + 15) &
    (arr[:, :, 1] > arr[:, :, 2] + 5)
)

y_indices, x_indices = np.where(brown_mask)
if len(x_indices) > 0 and len(y_indices) > 0:
    min_x, max_x = x_indices.min(), x_indices.max()
    min_y, max_y = y_indices.min(), y_indices.max()
    
    # Map to absolute template coordinates (wide_box starts at X=580, Y=80)
    abs_min_x = 580 + min_x
    abs_max_x = 580 + max_x
    abs_min_y = 80 + min_y
    abs_max_y = 80 + max_y
    
    print(f"Brown bear detected in crop X:[{min_x}, {max_x}], Y:[{min_y}, {max_y}]")
    print(f"Absolute coordinates in template: ({abs_min_x}, {abs_min_y}, {abs_max_x}, {abs_max_y})")
    
    # Let's save a crop with padding to see the full bear including ears and paws
    pad_left = 15
    pad_right = 15
    pad_top = 20  # More padding at top for ears!
    pad_bottom = 15
    
    final_box = (
        max(500, abs_min_x - pad_left),
        max(50, abs_min_y - pad_top),
        min(900, abs_max_x + pad_right),
        min(450, abs_max_y + pad_bottom)
    )
    print("Suggested final crop box:", final_box)
    
    # Let's save this suggested crop
    template = Image.open(r"C:\Users\tohai\.gemini\antigravity\brain\15cf3826-75db-4c8e-9e4c-df2faa0c5485\media__1779079155939.png")
    suggested_crop = template.crop(final_box)
    suggested_crop.save("cropped/bear_suggested.png")
    print("Saved suggested crop to cropped/bear_suggested.png")
else:
    print("No brown pixels matching bear criteria found.")
