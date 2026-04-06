import re

filepath = r'e:\Dont Die\dont-die\src\data\levels.ts'
with open(filepath, 'r') as f:
    text = f.read()

# Pattern for Mine biome segments
mine_pattern = re.compile(r'{\s*[^{}]*?level:\s*(\d+).*?biome:\s*"Mine".*?map:\s*\[(.*?)\s*\]', re.DOTALL)

matches = mine_pattern.findall(text)
print(f"Auditing {len(matches)} Mine levels...")

for l, m in matches:
    count = m.count('5')
    if count == 0:
        print(f"Level {l}: NO PORTAL")
    elif count > 1:
        print(f"Level {l}: MULTIPLE ({count})")
    
    # Check for "hidden" portals surrounded by solid tiles (1 or 9)
    # A tile is 'hidden' if it's '5' but doesn't have an '0' neighbor?
    # Or just if it's placed inside a platform.
    rows = [r.strip(' ",') for r in m.split('\n') if '"' in r]
    for r_idx, row in enumerate(rows):
        for c_idx, char in enumerate(row):
            if char == '5':
                # Check for space to breathe
                is_buried = True
                for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nr, nc = r_idx + dr, c_idx + dc
                    if 0 <= nr < len(rows) and 0 <= nc < len(rows[nr]):
                        if rows[nr][nc] in ['0', '2', '9']: # Air, ladder, or hybrid
                            is_buried = False
                            break
                if is_buried:
                    print(f"Level {l}: PORTAL IS BURIED at ({r_idx}, {c_idx})")
