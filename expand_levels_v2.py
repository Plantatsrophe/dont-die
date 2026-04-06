import re
import os

filepath = r'e:\Dont Die\dont-die\src\data\levels.ts'

with open(filepath, 'r') as f:
    lines = f.readlines()

new_lines = []
in_mine_biome = False
level_num = -1

for line in lines:
    # Detect level number
    lvl_match = re.search(r'level:\s*(\d+)', line)
    if lvl_match:
        level_num = int(lvl_match.group(1))
        in_mine_biome = (40 <= level_num <= 59)
    
    # Detect biome (just to be safe)
    if 'biome:' in line and '"Mine"' in line:
        in_mine_biome = True
    elif 'biome:' in line:
        in_mine_biome = (40 <= level_num <= 59)

    # Transform map strings in Mine biome
    # Matches strings inside quotes, optionally followed by a comma
    match = re.search(r'"([^"]+)"', line)
    if in_mine_biome and match:
        content = match.group(1)
        if len(content) == 15:
            # Expand to 20
            if content == '111111111111111' or content.count('1') > 12:
                new_content = '1' * 20
            else:
                # Standard padding 2+3
                new_content = content[0] + '00' + content[1:14] + '000' + content[14]
            
            line = line.replace(f'"{content}"', f'"{new_content}"')
        elif len(content) == 20:
            # Integrity check for floor tiles (last line of map often missing 1s if shifted)
            # Level 50 row 60 check
            if ']' in lines[lines.index(line)+1] and content.count('1') < 5 and '2' in content:
                # If it's the last line and looks like a footer but sparse, make it a solid floor
                # except where the ladder base is
                new_content = '11111112111111111111' 
                line = line.replace(f'"{content}"', f'"{new_content}"')

    new_lines.append(line)

with open(filepath, 'w') as f:
    f.writelines(new_lines)

print("Level expansion and floor correction complete.")
