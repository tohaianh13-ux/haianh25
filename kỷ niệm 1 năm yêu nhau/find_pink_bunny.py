from PIL import Image
import numpy as np

# Load a very wide crop around the bunny in template
template = Image.open(r"C:\Users\tohai\.gemini\antigravity\brain\15cf3826-75db-4c8e-9e4c-df2faa0c5485\media__1779079155939.png")
# Crop a very wide box around bunny
wide_box = (200, 50, 420, 320)
bunny_wide = template.crop(wide_box)
bunny_wide.save("cropped/bunny_wide.png")

# Convert to RGB array
rgb = bunny_wide.convert("RGB")
arr = np.array(rgb)

# The bunny is white/pink. Let's find bunny pixels.
# The bunny has white fur with pink blush. But the outline is a dark color (brownish/pink outline)
# Let's find all pixels that are significantly different from the background cream/pink (#fff9f3, #fffdf9)
# Let's use the non-background mask
non_bg = (arr[:, :, 0] < 248) | (arr[:, :, 1] < 240) | (arr[:, :, 2] < 240)

# Filter out the left edge (which might contain the background stars or other elements)
# Let's look for bunny pixels in the crop
y_indices, x_indices = np.where(non_bg)
if len(x_indices) > 0 and len(y_indices) > 0:
    min_x, max_x = x_indices.min(), x_indices.max()
    min_y, max_y = y_indices.min(), y_indices.max()
    
    # Map to absolute template coordinates (wide_box starts at X=200, Y=50)
    abs_min_x = 200 + min_x
    abs_max_x = 200 + max_x
    abs_min_y = 50 + min_y
    abs_max_y = 50 + max_y
    
    print(f"Bunny detected in crop X:[{min_x}, {max_x}], Y:[{min_y}, {max_y}]")
    print(f"Absolute coordinates in template: ({abs_min_x}, {abs_min_y}, {abs_max_x}, {abs_max_y})")
    
    pad = 10
    final_box = (
        max(200, abs_min_x - pad),
        max(50, abs_min_y - pad),
        min(420, abs_max_x + pad),
        min(320, abs_max_y + pad)
    )
    print("Suggested bunny crop box:", final_box)
    
    suggested_crop = template.crop(final_box)
    suggested_crop.save("cropped/bunny_suggested.png")
    print("Saved suggested crop to cropped/bunny_suggested.png")
else:
    print("No bunny pixels found.")
