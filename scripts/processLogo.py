from PIL import Image
import os

src_path = r'C:\Users\raman\.gemini\antigravity-ide\brain\25aceccf-9125-4940-aec8-fe4c356e0f01\.user_uploaded\media_1788844240000.png'
img = Image.open(src_path).convert('RGBA')

# 1. Save original to public
os.makedirs('public', exist_ok=True)
img.save('public/respire-logo.png')

# 2. Create high-quality transparent version
# Smooth alpha based on whiteness
datas = img.getdata()
new_data = []
for item in datas:
    r, g, b, a = item
    # Check if pixel is near white
    whiteness = min(r, g, b)
    if whiteness > 240:
        # Fully transparent
        new_data.append((255, 255, 255, 0))
    elif whiteness > 200:
        # Smooth anti-aliasing edge
        alpha = int(255 * (1.0 - (whiteness - 200) / 40.0))
        new_data.append((r, g, b, alpha))
    else:
        new_data.append((r, g, b, 255))

transparent_img = Image.new('RGBA', img.size)
transparent_img.putdata(new_data)
transparent_img.save('public/respire-logo-transparent.png')

# 3. Find bounding box of the circular emblem on the left
# Looking from x: 0 to 500
emblem_box = None
left_min = 1000
top_min = 1000
right_max = 0
bottom_max = 0

for x in range(0, 480):
    for y in range(img.size[1]):
        r, g, b, a = transparent_img.getpixel((x, y))
        if a > 50:
            if x < left_min: left_min = x
            if x > right_max: right_max = x
            if y < top_min: top_min = y
            if y > bottom_max: bottom_max = y

print(f"Emblem bounds: left={left_min}, top={top_min}, right={right_max}, bottom={bottom_max}")

# Pad slightly and make square
width = right_max - left_min
height = bottom_max - top_min
size = max(width, height) + 20
cx = (left_min + right_max) // 2
cy = (top_min + bottom_max) // 2

crop_box = (cx - size // 2, cy - size // 2, cx + size // 2, cy + size // 2)
emblem_cropped = transparent_img.crop(crop_box)
emblem_cropped.save('public/respire-emblem.png')
emblem_cropped.save('public/favicon.png')

# Also generate favicon.svg
import base64
with open('public/respire-emblem.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')
svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 450">
  <image width="450" height="450" href="data:image/png;base64,{b64}"/>
</svg>'''
with open('public/favicon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

# Also copy to dist if dist exists
if os.path.exists('dist'):
    img.save('dist/respire-logo.png')
    transparent_img.save('dist/respire-logo-transparent.png')
    emblem_cropped.save('dist/respire-emblem.png')
    emblem_cropped.save('dist/favicon.png')
    with open('dist/favicon.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content)

print("Successfully processed logo assets.")
