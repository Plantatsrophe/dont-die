import re
import os
from PIL import Image

# 1. Palette Mapping (Hex to RGB)
def hex_to_rgb(hex_str):
    if not hex_str: return (0, 0, 0, 0) # Transparent
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4)) + (255,)

raw_pal = {
    0: None, 1: '#f1c27d', 2: '#ff2222', 3: '#f1c40f', 4: '#5c4033',
    5: '#050505', 6: '#444444', 7: '#ffffff', 8: '#ffffff', 9: '#00ffff',
    10: '#C0C0C0', 11: '#00cccc', 12: '#8b4513', 13: '#222222', 14: '#3ee855', 15: '#1e90ff', 16: '#5e4533',
    17: '#ff00ff', 18: '#0066ff', 19: '#2ecc71'
}

palette = {k: hex_to_rgb(v) for k, v in raw_pal.items()}

# 2. Extract Sprite Arrays from TypeScript
TS_FILE = 'src/assets/sprites_glitch.ts'
with open(TS_FILE, 'r') as f:
    content = f.read()

def get_array(name):
    pattern = rf'export const {name} = \[(.*?)\];'
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        print(f"Error: Could not find {name}")
        return []
    # Clean up and split
    data_str = match.group(1).replace('\n', '').replace(' ', '')
    return [int(x) for x in data_str.split(',') if x]

frame_names = ['sprGlitch1', 'sprGlitch2', 'sprGlitch3', 'sprGlitch4']
frames_data = [get_array(name) for name in frame_names]

# 3. Render Frames
img_frames = []
for data in frames_data:
    if not data: continue
    
    # Each sprite is 64x64 (4096 pixels)
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    pixels = img.load()
    
    for i, val in enumerate(data):
        x = i % 64
        y = i // 64
        if val in palette:
            pixels[x, y] = palette[val]
            
    # Scale up using Nearest Neighbor (to keep pixel art sharp)
    img_big = img.resize((256, 256), Image.NEAREST)
    img_frames.append(img_big)

# 4. Save as Animated GIF
if img_frames:
    # Convert RGBA to P (Palette) mode for GIF, preserving transparency
    gif_frames = []
    for frame in img_frames:
        # Create a white background or use a specific color if needed
        # But for boss export, let's keep it simple
        alpha = frame.split()[3]
        frame = frame.convert('RGB')
        frame = frame.quantize(colors=256, method=Image.MAXCOVERAGE)
        gif_frames.append(frame)

    output_path = 'glitch_boss.gif'
    gif_frames[0].save(
        output_path,
        save_all=True,
        append_images=gif_frames[1:],
        duration=200, # 200ms per frame
        loop=0
    )
    print(f"SUCCESS: Exported {output_path}")
else:
    print("ERROR: No frames generated")
