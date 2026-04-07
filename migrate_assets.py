import re
import os

def migrate_file(file_path_rel, swaps):
    # Construct absolute path
    file_path = os.path.join(r'e:\Dont Die', file_path_rel)
    
    if not os.path.exists(file_path):
        print(f"Skipping {file_path} (not found)")
        return
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Use re to swap safely
    # 7 -> 19
    content = re.sub(r'\b7\b', '19', content)
    # 8 -> 7
    content = re.sub(r'\b8\b', '7', content)
    
    # If standard_full, swap 10/5 and 11/18
    if 'full' in swaps:
        # Auh-Gr already had 10/5 swapped (Black/Silver)
        # 10 is currently Silver (#C0C0C0). 
        # 5 is currently Black (#050505).
        # In hero.ts, Black was 10. Now it's Silver. Swap 10 <-> 5.
        content = re.sub(r'\b10\b', 'TEMP_X', content)
        content = re.sub(r'\b5\b', '10', content)
        content = content.replace("TEMP_X", "5")
        
        # In hero.ts, Blue was 11. Now it's Turquoise. Swap 11 <-> 18.
        content = re.sub(r'\b11\b', 'TEMP_Y', content)
        content = re.sub(r'\b18\b', '11', content)
        content = content.replace("TEMP_Y", "18")
    else:
        # Auh-Gr: Just needs 11/18 swap (and the 7/8 already done above)
        content = re.sub(r'\b11\b', 'TEMP_Y', content)
        content = re.sub(r'\b18\b', '11', content)
        content = content.replace("TEMP_Y", "18")
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Migrated {file_path}")

files = [
    ('src/assets/sprites_hero.ts', 'full'),
    ('src/assets/sprites_enemies.ts', 'full'),
    ('src/assets/sprites_bosses.ts', 'full'),
    ('src/assets/sprites_biomes.ts', 'full'),
    ('src/assets/sprites_auhgr.ts', 'partial')
]

for fp, s in files:
    migrate_file(fp, s)
