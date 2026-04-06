import re
import os

filepath = r'e:\Dont Die\dont-die\src\data\levels.ts'

with open(filepath, 'r') as f:
    text = f.read()

# Pattern for Mine biome segments
mine_pattern = re.compile(r'({[^{}]*?level:\s*(4[0-9]|5[0-9])[^{}]*?biome:\s*"Mine"[^{}]*?map:\s*\[(.*?)\s*\])', re.DOTALL)

def bridge_gaps(map_rows):
    num_rows = len(map_rows)
    num_cols = len(map_rows[0])
    grid = [list(r) for r in map_rows]
    solid_types = ['1', '6', '9']
    bridges_added = 0
    
    for r in range(num_rows):
        # Find gaps on this row
        row_str = "".join(grid[r])
        # Find all sequences of '0'
        for match in re.finditer(r'0{6,}', row_str):
            start = match.start()
            end = match.end()
            width = end - start
            
            # Constraint: only if start-1 and end are solid?
            # Actually, just any gap >= 6.
            
            # Connectivity Check: Is there ANY platform nearby in the vertical range +/- 3?
            has_alternative = False
            for nr in range(max(0, r-3), min(num_rows, r+4)):
                if nr == r: continue
                # Look for ANY solid tile in the horizontal neighborhood of the gap
                # Buffer of 1 tile
                for nc in range(max(1, start-1), min(num_cols-1, end+1)):
                    if grid[nr][nc] in solid_types:
                        has_alternative = True
                        break
                if has_alternative: break
            
            if not has_alternative:
                # Add a 2-tile stepping stone in the middle
                mid = start + width // 2
                grid[r][mid] = '1'
                if mid + 1 < num_cols - 1:
                    grid[r][mid+1] = '1'
                bridges_added += 1
                
    return ["".join(row) for row in grid], bridges_added

def process_level(match):
    full_block = match.group(1)
    level_num = match.group(2)
    map_inner = match.group(3)
    
    rows = re.findall(r'"([^"]+)"', map_inner)
    if not rows: return full_block
    
    final_rows, count = bridge_gaps(rows)
    
    if count > 0:
        print(f"Level {level_num}: Added {count} bridges to impossible gaps.")
    
    formatted_rows = ',\n'.join([f'            "{r}"' for r in final_rows])
    new_map_str = f'map: [\n{formatted_rows}\n        ]'
    res = re.sub(r'map:\s*\[.*?\]', new_map_str, full_block, flags=re.DOTALL)
    return res

new_text = mine_pattern.sub(process_level, text)

with open(filepath, 'w') as f:
    f.write(new_text)

print("Refined gap compression complete.")
