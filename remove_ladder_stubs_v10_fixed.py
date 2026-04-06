import re
import os

filepath = r'e:\Dont Die\dont-die\src\data\levels.ts'

with open(filepath, 'r') as f:
    text = f.read()

# Pattern for all level map segments
level_pattern = re.compile(r'(map:\s*\[(.*?)\s*\])', re.DOTALL)

def sanitize_stubs(map_rows):
    num_rows = len(map_rows)
    grid = [list(r) for r in map_rows]
    ladder_types = ['2', '9']
    stubs_removed = 0
    
    for r in range(num_rows):
        row_len = len(grid[r])
        for c in range(row_len):
            if grid[r][c] in ladder_types:
                # Check neighbors above and below
                has_ladder_above = (r > 0 and c < len(grid[r-1]) and grid[r-1][c] in ladder_types)
                has_ladder_below = (r < num_rows - 1 and c < len(grid[r+1]) and grid[r+1][c] in ladder_types)
                
                if not has_ladder_above and not has_ladder_below:
                    # Isolated stub ladder - replace with platform
                    grid[r][c] = '1'
                    stubs_removed += 1
    
    return ["".join(row) for row in grid], stubs_removed

def process_level(match):
    full_map_block = match.group(1)
    map_inner = match.group(2)
    
    rows = re.findall(r'"([^"]+)"', map_inner)
    if not rows: return full_map_block
    
    final_rows, count = sanitize_stubs(rows)
    
    formatted_rows = ',\n'.join([f'            "{r}"' for r in final_rows])
    return f'map: [\n{formatted_rows}\n        ]'

new_text = level_pattern.sub(process_level, text)

with open(filepath, 'w') as f:
    f.write(new_text)

print("Single-tile ladder sanitization (fixed) complete.")
