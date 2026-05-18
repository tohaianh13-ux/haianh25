from PIL import Image

img_path = r"C:\Users\tohai\.gemini\antigravity\brain\15cf3826-75db-4c8e-9e4c-df2faa0c5485\media__1779079155939.png"
img = Image.open(img_path)
print("Image size:", img.size)
