import re
import os

filepath = r'e:\Dont Die\dont-die\src\data\levels.ts'

with open(filepath, 'r') as f:
    text = f.read()

# Pattern for Mine biome segments
mine_pattern = re.compile(r'({[^{}]*?level:\s*(4[0-9]|5[0-9])[^{}]*?biome:\s*"Mine"[^{}]*?map:\s*\[(.*?)\s*\])', re.DOTALL)

def scale_map(rows):
    # original_width = 15, target_width = 20
    # interior 13 -> 18
    num_rows = len(rows)
    target_cols = 20
    
    # We'll work with the 15-char original logic. 
    # If a row is 20, we "de-pad" it first to 15 to get clean scaling.
    depadded_rows = []
    for r in rows:
        if len(r) == 20:
             # Our previous padding was 2 left, 3 right? No, v3 was messy.
             # Actually, if we just take 15 chars from a 20-char row, it's risky.
             # Better: find the walls.
             left_wall = r.find('1')
             right_wall = r.rfind('1')
             inner = r[left_wall+1 : right_wall]
             # Let's assume inner was roughly the content.
             depadded_rows.append(r[0] + inner[:13] + r[-1])
        else:
             depadded_rows.append(r)

    new_grid = [['0' for _ in range(target_cols)] for _ in range(num_rows)]

    # 1. Scale Coordinates
    for r in range(num_rows):
        old_row = depadded_rows[r]
        new_grid[r][0] = '1'
        new_grid[r][19] = '1'
        
        # Scaling inner 13 (indices 1-13) to 18 (indices 1-18)
        # Factor = 17 / 12
        for c in range(1, 14):
            char = old_row[c]
            if char != '0':
                new_c = 1 + round((c - 1) * 17 / 12)
                new_grid[r][new_c] = char

    # 2. Fill Platform Gaps and Widen
    for r in range(num_rows):
        for c in range(1, 18):
            if new_grid[r][c] == '1' and new_grid[r][c+2] == '1':
                new_grid[r][c+1] = '1'
            if new_grid[r][c] == '1' and (c < 18 and new_grid[r][c+1] == '0' and any(new_grid[r][next_c] == '1' for next_c in range(c+2, 19))):
                # If there's a platform further right, maybe bridge? 
                # No, just widen existing 1s by 1 tile to the right.
                pass
        
        # Simple widening: if a 1 is followed by a 0, make it 11?
        # Let's be careful not to close all gaps.
        row_str = "".join(new_grid[r])
        row_str = row_str.replace('101', '111')
        row_str = row_str.replace('1001', '1111')
        new_grid[r] = list(row_str)

    # 3. Ladder Continuity and Anchoring
    # Scale vertical ladders as columns
    for c in range(1, 19):
        for r in range(num_rows):
            if new_grid[r][c] == '2':
                # Ladder top
                if r == 0 or new_grid[r-1][c] != '2':
                    if r > 0: new_grid[r-1][c] = '1'
                # Ladder bottom
                if r == num_rows - 1 or new_grid[r+1][c] != '2':
                    if r < num_rows - 1: new_grid[r+1][c] = '1'
                    
    return ["".join(row) for row in new_grid]

def process_level(match):
    full_block = match.group(1)
    level_num = match.group(2)
    map_inner = match.group(3)
    
    rows = re.findall(r'"([^"]+)"', map_inner)
    final_rows = scale_map(rows)
    
    formatted_rows = ',\n'.join([f'            "{r}"' for r in final_rows])
    new_map_str = f'map: [\n{formatted_rows}\n        ]'
    res = re.sub(r'map:\s*\[.*?\]', new_map_str, full_block, flags=re.DOTALL)
    return res

new_text = mine_pattern.sub(process_level, text)

with open(filepath, 'w') as f:
    f.write(new_text)

print("Aggressive scaling and ladder anchoring complete.")
