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
    
    # Transform map strings in Mine biome
    if in_mine_biome and '"' in line and ',' in line:
        # Extract the string content
        match = re.search(r'"([^"]+)"', line)
        if match:
            content = match.group(1)
            if len(content) == 15:
                if content == '111111111111111':
                    new_content = '1' * 20
                else:
                    # Pad 2 left, 3 right
                    new_content = content[0] + '00' + content[1:14] + '000' + content[14]
                
                line = line.replace(f'"{content}"', f'"{new_content}"')
    
    new_lines.append(line)

with open(filepath, 'w') as f:
    f.writelines(new_lines)

print("Level expansion complete for levels 40-59.")
