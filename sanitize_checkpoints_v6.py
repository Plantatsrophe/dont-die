import re
import os

filepath = r'e:\Dont Die\dont-die\src\data\levels.ts'

with open(filepath, 'r') as f:
    text = f.read()

# Pattern for Sewer and Mine biome segments
biome_pattern = re.compile(r'({[^{}]*?level:\s*(\d+)[^{}]*?biome:\s*"(Sewer|Mine)"[^{}]*?map:\s*\[(.*?)\s*\])', re.DOTALL)

def sanitize_level(map_rows):
    num_rows = len(map_rows)
    num_cols = len(map_rows[0])
    grid = [list(r) for r in map_rows]
    enemies_removed = 0
    
    for r in range(num_rows):
        for c in range(num_cols):
            if grid[r][c] == 'C':
                # Check for platform beneath
                if r < num_rows - 1 and grid[r+1][c] in ['1', '3']:
                    # Find platform boundaries
                    left = c
                    while left > 0 and grid[r+1][left-1] in ['1', '3']:
                        left -= 1
                    right = c
                    while right < num_cols - 1 and grid[r+1][right+1] in ['1', '3']:
                        right += 1
                    
                    # Purge enemies in range [left, right] on row r
                    for x in range(left, right + 1):
                        if grid[r][x] in ['8', 'L']:
                            grid[r][x] = '0'
                            enemies_removed += 1
    
    return ["".join(row) for row in grid], enemies_removed

def process_level(match):
    full_block = match.group(1)
    level_num = int(match.group(2))
    biome_name = match.group(3)
    map_inner = match.group(4)
    
    # We only care about Sewer (20-39) and Mine (40-59)
    # The regex already filters for "Sewer" or "Mine", but let's double check levels if needed.
    # Note: Sewer starts at 20, Mine starts at 40.

    rows = re.findall(r'"([^"]+)"', map_inner)
    if not rows: return full_block
    
    final_rows, removed = sanitize_level(rows)
    
    if removed > 0:
        print(f"Level {level_num} ({biome_name}): Removed {removed} enemies from checkpoint platforms.")
    
    formatted_rows = ',\n'.join([f'            "{r}"' for r in final_rows])
    new_map_str = f'map: [\n{formatted_rows}\n        ]'
    res = re.sub(r'map:\s*\[.*?\]', new_map_str, full_block, flags=re.DOTALL)
    return res

new_text = biome_pattern.sub(process_level, text)

with open(filepath, 'w') as f:
    f.write(new_text)

print("Checkpoint safety sanitization complete.")
