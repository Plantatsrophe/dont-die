import re
import os

filepath = r'e:\Dont Die\dont-die\src\data\levels.ts'

with open(filepath, 'r') as f:
    text = f.read()

# Pattern for Mine biome segments
mine_pattern = re.compile(r'({[^{}]*?level:\s*(4[0-9]|5[0-9])[^{}]*?biome:\s*"Mine"[^{}]*?map:\s*\[(.*?)\s*\])', re.DOTALL)

def infill_right_side(rows):
    num_rows = len(rows)
    grid = [list(r) for r in rows]
    
    last_right_platform = 0
    
    for r in range(num_rows):
        row_str = "".join(grid[r])
        
        # 1. Extend existing right-side content to the wall
        # If any platform or entity is between index 14 and 18, and 18 is 0, bridge it.
        found_right_content = False
        for c in range(14, 19):
            if grid[r][c] != '0':
                found_right_content = True
                break
        
        if found_right_content:
            # Mirror the left-side behavior: platforms should touch the wall
            # If there's a '1' anywhere in 14-17, fill to index 18
            if '1' in grid[r][14:18]:
                for c in range(15, 19):
                    if grid[r][c] == '0': grid[r][c] = '1'
            last_right_platform = r

        # 2. Forced density: ensure a platform on the right every ~6 rows
        if r - last_right_platform > 6:
            # Add a 3-tile platform on the right
            grid[r][16] = '1'
            grid[r][17] = '1'
            grid[r][18] = '1'
            last_right_platform = r

        # 3. Zig-zag balancing: If left has a platform, maybe add one on right offset
        # We'll just rely on the forced density for now to keep it from being too cluttered.

    return ["".join(row) for row in grid]

def process_level(match):
    full_block = match.group(1)
    level_num = match.group(2)
    map_inner = match.group(3)
    
    rows = re.findall(r'"([^"]+)"', map_inner)
    final_rows = infill_right_side(rows)
    
    formatted_rows = ',\n'.join([f'            "{r}"' for r in final_rows])
    new_map_str = f'map: [\n{formatted_rows}\n        ]'
    res = re.sub(r'map:\s*\[.*?\]', new_map_str, full_block, flags=re.DOTALL)
    return res

new_text = mine_pattern.sub(process_level, text)

with open(filepath, 'w') as f:
    f.write(new_text)

print("Right-side platform infill complete.")
