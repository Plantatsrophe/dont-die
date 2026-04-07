"""
GLITCH BOSS SPRITE GENERATOR V4
Generates 4 frames of a 64x64 pixel array for the 'Glitch' boss.
Focus: Detailed Face, 3-Point Jester Hat, and Wireframe Steed.
"""

def generate_frame(frame_idx):
    size = 64
    grid = [[0 for _ in range(size)] for _ in range(size)]
    
    # COLOR MAPPING
    BLACK = 5
    SILVER = 10
    TURQUOISE = 11
    METALLIC_BLUE = 18
    WHITE = 7
    
    # Animation Offsets
    y_off = 0
    if frame_idx == 1: y_off = -2 # Frame 2: Up 2
    if frame_idx == 3: y_off = 1  # Frame 4: Down 1
    
    # MOTIF GENERATOR
    def get_suit_color(r, c):
        # Flicker logic for Frame 3
        pattern_color = WHITE if frame_idx == 2 else BLACK
        is_pattern = (c + r // 2) % 3 == 0 or (c * 2 + r) % 5 == 0
        return pattern_color if is_pattern else SILVER

    # 1. WIREFRAME STEED
    # Body Main
    for r in range(35, 52):
        for c in range(12, 55):
            tr = r + y_off
            if 0 <= tr < size:
                # Wireframe geometry
                if r == 35 or r == 51 or c == 12 or c == 54 or (c + r) % 12 == 0:
                    grid[tr][c] = METALLIC_BLUE
                    
    # Steed Head & Muzzle
    for r in range(18, 30):
        for c in range(48, 64):
            tr = r + y_off
            if 0 <= tr < size and c < size:
                if c > 58: # Muzzle
                    grid[tr][c] = TURQUOISE
                elif r == 18 or r == 29 or c == 48:
                    grid[tr][c] = METALLIC_BLUE
                    
    # Googly Eye (Fixed position relative to head)
    eye_x, eye_y = 58, 22 + y_off # x:58, y:18 relative might be too high, using 22 for anatomy
    if 0 <= eye_y < size:
        for dr in range(-1, 2):
            for dc in range(-1, 2):
                grid[eye_y + dr][eye_x + dc] = WHITE
        grid[eye_y][eye_x] = BLACK

    # Legs (Animated)
    leg_ext = [12, 10, 12, 16][frame_idx] # F4: Legs extended
    for lx in [15, 25, 42, 50]:
        for dr in range(leg_ext):
            tr = 51 + dr + y_off
            if 0 <= tr < size:
                grid[tr][lx] = METALLIC_BLUE
                if dr % 5 == 0: grid[tr][lx] = TURQUOISE

    # 2. RIDER (GLITCH)
    rider_x = 22
    rider_y = 35 + y_off
    
    # Torso & Limbs (Slightly larger for detail)
    for dr in range(-20, 0):
        for dc in range(-10, 11):
            tr = rider_y + dr
            tc = rider_x + dc
            if 0 <= tr < size and 0 <= tc < size:
                # Droid silhouette
                d = abs(dc)
                if (dr < -15 and d < 6) or (-15 <= dr < -5 and d < 9) or (dr >= -5 and d < 8):
                    grid[tr][tc] = get_suit_color(tr, tc)

    # DETAILED FACE (Silver base with Black markings)
    face_y = rider_y - 20
    for dr in range(-6, 2):
        for dc in range(-4, 5):
            tr = face_y + dr
            tc = rider_x + dc
            if 0 <= tr < size and 0 <= tc < size:
                # Face Base
                grid[tr][tc] = SILVER
                
                # Eye Starbursts (Black points around eyes)
                is_eye = (dr == -3 or dr == -2) and (abs(dc) == 2)
                is_star = abs(dr + 2.5) + abs(abs(dc) - 2) < 2.5
                
                # Mouth circuitry
                is_mouth = (dr == 0) and abs(dc) < 3
                is_lip_line = (dr == 1) and abs(dc) < 2
                
                # Flicker Frame logic
                marking_color = WHITE if frame_idx == 2 else BLACK
                
                if is_eye:
                    grid[tr][tc] = BLACK # Eye socket
                    if (dr == -3 and abs(dc) == 2): grid[tr][tc] = WHITE # Glint
                elif is_star or is_mouth:
                    grid[tr][tc] = marking_color
                elif is_lip_line:
                    grid[tr][tc] = BLACK

    # 3-POINT JESTER HAT
    hat_y = face_y - 8
    for dr in range(-12, 0):
        for dc in range(-18, 19):
            # Points trailing for frame 2
            sway = 0
            if frame_idx == 1: sway = 6 # Trailing
            
            p_dist = abs(dc)
            # Three distinct points
            is_point = False
            p_idx = 0
            if p_dist > 12: # Outer points
                is_point = (dr + sway//2) > (p_dist - 20)
                p_idx = 1
            elif p_dist < 4: # Center point
                is_point = (dr) > -12
                p_idx = 2
                
            if is_point:
                tr_h = hat_y + dr
                tc_h = rider_x + dc
                if 0 <= tr_h < size and 0 <= tc_h < size:
                    # Silver points with Black tips
                    grid[tr_h][tc_h] = SILVER if dr > -10 else BLACK

    # 3. EMPTY ZONES (12x12)
    # Hair: Behind rider's head (approx x 10, y 5)
    for r in range(5, 17):
        for c in range(10, 22):
            tr = r + y_off
            if 0 <= tr < size:
                grid[tr][c] = 0
    # Tail: Behind horse
    for r in range(35, 47):
        for c in range(0, 12):
            tr = r + y_off
            if 0 <= tr < size:
                grid[tr][c] = 0

    return grid

def save_sprites():
    with open('src/assets/sprites_glitch.ts', 'w') as f:
        f.write("/**\n")
        f.write(" * GLITCH BOSS ASSETS V4\n")
        f.write(" * Focus: Detailed Face & 3-Point Hat\n")
        f.write(" */\n\n")
        for i in range(4):
            grid = generate_frame(i)
            flat = [p for r in grid for p in r]
            f.write(f"export const sprGlitch{i+1} = [\n")
            for row in range(64):
                f.write("  " + ",".join(map(str, flat[row*64:(row+1)*64])) + ",\n")
            f.write("];\n\n")

if __name__ == "__main__":
    save_sprites()
    print("Regenerated src/assets/sprites_glitch.ts with Facial Detail V4.")
