import re

path = r'e:\Dont Die\dont-die\src\data\levels.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# We look for level objects: { map: [ ... ] }
# This is tricky because maps are strings in an array.
# Let's split by level objects specifically.
# Each level starts with "    {" and ends with "    }," or "    }" at the end of the array.

def get_biome(idx):
    if idx < 20: return "Slums"
    elif idx < 40: return "Sewer"
    elif idx < 60: return "Shaft"
    elif idx < 80: return "Factory"
    else: return "Goliath"

def is_boss(idx):
    return idx in [19, 39, 59, 79, 99]

# Simple splitting by { content } assuming they are top-level objects in the array
# We find everything between the first [ and the last ] of the array.
start_idx = content.find('[') + 1
end_idx = content.rfind(']')

levels_block = content[start_idx:end_idx].strip()

# Split by the level object closing brace
# Each level object is like { map: [...] }
level_objects = re.split(r'\},\s+\{', levels_block)

# Fix the first and last split
if len(level_objects) > 0:
    if level_objects[0].startswith('{'): level_objects[0] = level_objects[0][1:]
    if level_objects[-1].endswith('}'): level_objects[-1] = level_objects[-1][:-1]

new_levels = []
for i, obj in enumerate(level_objects):
    biome = get_biome(i)
    boss = "true" if is_boss(i) else "false"
    
    # obj is currently "map: [...]"
    # We want to reconstruct it as:
    # {
    #     level: i,
    #     biome: "biome",
    #     isBoss: boss,
    #     obj
    # }
    
    new_obj = f"""    {{
        level: {i},
        biome: "{biome}",
        isBoss: {boss},
        {obj.strip()}
    }}"""
    new_levels.append(new_obj)

header = content[:start_idx]
footer = content[end_idx:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(header + "\n" + ",\n".join(new_levels) + "\n" + footer)

print(f"Refactored {len(new_levels)} levels.")
