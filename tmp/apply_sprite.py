import os

# Paths
ASSETS_PATH = 'assets.js'
NEW_ARRAY_PATH = 'tmp/septicus_array.txt'

# Read new arrays (UTF-16LE from PS redirection)
with open(NEW_ARRAY_PATH, 'r', encoding='utf-16') as f:
    new_code = f.read().strip()

# Read assets.js
with open(ASSETS_PATH, 'r') as f:
    lines = f.readlines()

# Find start and end of ANY sprSepticus constant
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if 'export const sprSepticus' in line:
        if start_idx == -1: start_idx = i
    if start_idx != -1 and '];' in line and i >= start_idx:
        end_idx = i
        # Keep looking to see if more sprSepticus constants follow (if we already applied it once)
        # But for now, we'll just replace the first block we find
        # Actually, let's replace ALL lines starting with sprSepticus if multiple exist
        pass

# Final end_idx search: Find the last '];' of the sprSepticus block
for i in range(len(lines)-1, -1, -1):
    if 'export const sprSepticus' in lines[i]:
        # Found the last one. Now find its ending ];
        for j in range(i, len(lines)):
            if '];' in lines[j]:
                end_idx = j
                break
        break

if start_idx != -1 and end_idx != -1:
    # Replace lines
    new_lines = lines[:start_idx] + [new_code + '\n'] + lines[end_idx+1:]
    with open(ASSETS_PATH, 'w') as f:
        f.writelines(new_lines)
    print(f"SUCCESS: Replaced Septicus block (Lines {start_idx+1} to {end_idx+1})")
else:
    print("ERROR: Could not find sprSepticus block in assets.js")
