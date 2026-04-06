import re
import os

filepath = r'e:\Dont Die\dont-die\src\data\levels.ts'

with open(filepath, 'r') as f:
    text = f.read()

# Pattern for all level map segments
level_pattern = re.compile(r'(map:\s*\[(.*?)\s*\])', re.DOTALL)

def upgrade_ladders(map_rows):
    num_rows = len(map_rows)
    grid = [list(r) for r in map_rows]
    upgraded = 0
    
    # We scan each row and column, checking bounds correctly.
    for r in range(num_rows):
        row_len = len(grid[r])
        for c in range(row_len):
            if grid[r][c] == '2' or grid[r][c] == '9':
                # Check tile above
                curr_r = r - 1
                while curr_r >= 0 and c < len(grid[curr_r]) and grid[curr_r][c] in ['1', '6']:
                    # Change platform to hybrid
                    if grid[curr_r][c] != '9':
                        grid[curr_r][c] = '9'
                        upgraded += 1
                    curr_r -= 1
                    # Note: We continue up to handle thick platforms
    
    return ["".join(row) for row in grid], upgraded

def process_level(match):
    full_map_block = match.group(1)
    map_inner = match.group(2)
    
    rows = re.findall(r'"([^"]+)"', map_inner)
    if not rows: return full_map_block
    
    final_rows, count = upgrade_ladders(rows)
    
    formatted_rows = ',\n'.join([f'            "{r}"' for r in final_rows])
    return f'map: [\n{formatted_rows}\n        ]'

new_text = level_pattern.sub(process_level, text)

with open(filepath, 'w') as f:
    f.write(new_text)

print("Ladder-to-Platform hybrid upgrade (fixed) complete.")
