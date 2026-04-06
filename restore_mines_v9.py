import re
import os

filepath = r'e:\Dont Die\dont-die\src\data\levels.ts'

with open(filepath, 'r') as f:
    text = f.read()

# Pattern for Mine biome segments
mine_pattern = re.compile(r'({[^{}]*?level:\s*(4[0-9]|5[0-9])[^{}]*?biome:\s*"Mine"[^{}]*?map:\s*\[(.*?)\s*\])', re.DOTALL)

def restore_and_fix(map_rows):
    num_rows = len(map_rows)
    num_cols = len(map_rows[0])
    grid = [list(r) for r in map_rows]
    solid_types = ['1', '6', '9']
    
    # 1. Removal Pass - Remove 1 or 2-tile isolated islands added by v8
    for r in range(num_rows):
        for c in range(1, num_cols - 2):
            # Check for 1-tile island
            if grid[r][c] == '1' and grid[r][c-1] == '0' and grid[r][c+1] == '0':
                grid[r][c] = '0'
            # Check for 2-tile island
            elif grid[r][c] == '1' and grid[r][c+1] == '1' and grid[r][c-1] == '0' and grid[r][c+2] == '0':
                grid[r][c] = '0'
                grid[r][c+1] = '0'
    
    # 2. Precision Pass - Fix 8-tile gaps by extending edges
    for r in range(num_rows):
        row_str = "".join(grid[r])
        # Find any sequence of 8+ zeros
        for match in re.finditer(r'0{7,}', row_str):
            start = match.start()
            end = match.end()
            width = end - start
            
            # If gap starts after solid and ends before solid
            if start > 0 and end < num_cols:
                if grid[r][start-1] in solid_types and grid[r][end] in solid_types:
                    # Extend left platform by 1
                    grid[r][start] = grid[r][start-1]
                    # Extend right platform by 1
                    grid[r][end-1] = grid[r][end]
                    # This reduces gap by 2 tiles (8 -> 6)
    
    return ["".join(row) for row in grid]

def process_level(match):
    full_block = match.group(1)
    level_num = match.group(2)
    map_inner = match.group(3)
    
    rows = re.findall(r'"([^"]+)"', map_inner)
    if not rows: return full_block
    
    final_rows = restore_and_fix(rows)
    
    formatted_rows = ',\n'.join([f'            "{r}"' for r in final_rows])
    new_map_str = f'map: [\n{formatted_rows}\n        ]'
    res = re.sub(r'map:\s*\[.*?\]', new_map_str, full_block, flags=re.DOTALL)
    return res

new_text = mine_pattern.sub(process_level, text)

with open(filepath, 'w') as f:
    f.write(new_text)

print("Restoration and surgical gap fix complete.")
