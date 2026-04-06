import re
import os

filepath = r'e:\Dont Die\dont-die\src\data\levels.ts'

with open(filepath, 'r') as f:
    text = f.read()

# Pattern for Mine biome segments
mine_pattern = re.compile(r'({[^{}]*?level:\s*(4[0-9]|5[0-9])[^{}]*?biome:\s*"Mine"[^{}]*?map:\s*\[(.*?)\s*\])', re.DOTALL)

def stretch_content(row):
    # original content was chars 1-13 of a 15-char row
    # our current row is 20 chars, content is at indices 3-15 (13 chars)
    inner = row[3:16] # 13 chars
    
    # We want to stretch 13 chars to 18 chars (cols 1-18)
    # Mapping 13 to 18: add 5 chars.
    # We'll add spaces/platform extensions at regular intervals.
    # Strategy: insert an extra char after indices 2, 5, 7, 10, 12 of the 13-char string.
    
    new_inner = []
    for i, char in enumerate(inner):
        new_inner.append(char)
        if i in [2, 5, 7, 10, 12]:
            # If it's a wall '1', repeat it to widen platform.
            # If it's a ladder '2', do NOT repeat it (keep 0 instead).
            # If it's anything else, add '0'.
            if char == '1':
                new_inner.append('1')
            else:
                new_inner.append('0')
    
    # Ensure it's exactly 18 chars
    result_inner = "".join(new_inner)[:18]
    if len(result_inner) < 18:
        result_inner += '0' * (18 - len(result_inner))
        
    return row[0] + result_inner + row[-1]

def fix_ladders(map_rows):
    # map_rows is a list of strings
    num_rows = len(map_rows)
    num_cols = len(map_rows[0])
    
    # Convert to mutable grid
    grid = [list(row) for row in map_rows]
    
    for col in range(1, num_cols - 1):
        for row in range(num_rows):
            if grid[row][col] == '2':
                # Check top of ladder sequence
                if row == 0 or grid[row-1][col] != '2':
                    # This is the top-most ladder tile. 
                    # User says "begin and end on platforms". 
                    # Usually means the user climbs ONTO a platform.
                    # We'll put a platform tile '1' above it if empty.
                    if row > 0 and grid[row-1][col] == '0':
                        grid[row-1][col] = '1'
                
                # Check bottom of ladder sequence
                if row == num_rows - 1 or grid[row+1][col] != '2':
                    # This is the bottom-most ladder tile.
                    # Must land on a platform.
                    if row < num_rows - 1 and grid[row+1][col] == '0':
                        grid[row+1][col] = '1'
                
    return ["".join(row) for row in grid]

def process_level(match):
    full_block = match.group(1)
    level_num = match.group(2)
    map_inner = match.group(3)
    
    # Extract rows
    rows = re.findall(r'"([^"]+)"', map_inner)
    
    # 1. Stretch
    stretched_rows = [stretch_content(r) for r in rows if len(r) == 20]
    
    # 2. Fix Ladders
    final_rows = fix_ladders(stretched_rows)
    
    # Reconstruct the map block
    formatted_rows = ',\n'.join([f'            "{r}"' for r in final_rows])
    
    # Replace standard map block in full match
    new_map_str = f'map: [\n{formatted_rows}\n        ]'
    old_map_str = f'map: [{map_inner}]'
    
    # This is tricky because map_inner might have different whitespace.
    # Better to just rebuild the level object string.
    
    # We'll return the modified full block.
    # Need to preserve isBoss etc.
    res = full_block
    # Replace the map: [...] part
    res = re.sub(r'map:\s*\[.*?\]', new_map_str, res, flags=re.DOTALL)
    return res

new_text = mine_pattern.sub(process_level, text)

with open(filepath, 'w') as f:
    f.write(new_text)

print("Level stretching and ladder integrity check complete.")
