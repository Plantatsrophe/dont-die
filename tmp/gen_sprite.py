# Spr Septicus 32x32 Premium (5 frames) Sequential Arc Swings
import random

def generate_frame(frame_type="idle"):
    s = [0] * 1024
    def p(x, y, v):
        if 0 <= x < 32 and 0 <= y < 32:
            s[int(y) * 32 + int(x)] = v

    def dither(x, y, c1, c2):
        v = c1 if (x + y) % 2 == 0 else c2
        p(x, y, v)

    # --- GROUNDED LEGS ---
    for x in range(12, 15): # Left
        for y in range(24, 32): p(x, y, 12 if x > 12 else 5)
    for x in range(17, 20): # Right
        for y in range(24, 32): p(x, y, 12 if x < 19 else 13)

    # --- TORSO ---
    for x in range(10, 22):
        for y in range(8, 24): dither(x, y, 12, 13)
    
    # Vents
    surge = 14 if (frame_type != "idle") else 7
    for y in range(10, 22, 4):
        for x in range(12, 20): p(x, y, surge); p(x, y+1, 10)
    
    # Fuel lines
    for y in range(11, 23): p(11, y, 14); p(20, y, 14)

    # --- HEAD ---
    for x in range(12, 20):
        for y in range(0, 8): p(x, y, 12) # Rust base
        p(x, 0, 8) # Rim highlight
    for y in range(0, 8):
        p(12, y, 5); p(19, y, 13)
    for y in [2, 4, 6]:
        for x in range(13, 19): p(x, y, 13)
    
    # 2x2 EYES (Bigger and pulsing)
    eye_c = 14 if frame_type != "idle" else 10 # Surge or black
    for ex in [14, 15, 17, 18]:
        p(ex, 1, eye_c); p(ex, 2, eye_c)

    # --- PIPE ---
    for x in range(9, 11):
        for y in range(4, 8): p(x, y, 13)
    p(9, 3, 13); p(10, 3, 13)

    # --- ARC SWING ANIMATION LOGIC ---
    # Frame 1: Idle (Both Up)
    # Frame 2: Hammer Mid (Left Swing, Right Up)
    # Frame 3: Hammer Impact (Left Down, Right Up)
    # Frame 4: Wrench Mid (Left Up, Right Swing)
    # Frame 5: Wrench Impact (Left Up, Right Down)

    # Left Arm/Hammer states
    l_state = "up"
    if frame_type == "h_swing": l_state = "mid"
    elif frame_type == "h_impact": l_state = "down"
    
    if l_state == "up":
        for x in range(6, 10):
            for y in range(0, 10): p(x, y, 12)
        for x in range(2, 11):
            for y in range(0, 7): p(x, y, 12)
        for x in range(3, 10): p(x, 0, 8); p(x, 5, 13)
    elif l_state == "mid":
        # Left mid-arc (Extended outward)
        for i in range(12):
            p(10 - i, 8 + i, 12); p(10 - i, 9 + i, 12)
        # Hammer Head
        for x in range(0, 5):
            for y in range(16, 22): p(x, y, 12)
    elif l_state == "down":
        # Left impact (Vertical down)
        for x in range(6, 10):
            for y in range(8, 28): p(x, y, 12)
        for x in range(2, 11):
            for y in range(26, 32): p(x, y, 12)

    # Right Arm/Wrench states
    r_state = "up"
    if frame_type == "w_swing": r_state = "mid"
    elif frame_type == "w_impact": r_state = "down"

    if r_state == "up":
        for x in range(22, 26):
            for y in range(0, 10): p(x, y, 12)
        for x in range(22, 26): p(x, 0, 12) # Handle base
        for x in range(26, 31): p(x, 0, 13); p(x, 1, 13) # Hook
        for y in range(1, 5): p(30, y, 13); p(24, 2, 5) # Back and Nut
        for x in range(26, 30):
            for y in range(5, 8): p(x, y, 13) # Base
    elif r_state == "mid":
        # Right mid-arc (Extended outward)
        for i in range(12):
            p(21 + i, 8 + i, 12); p(21 + i, 9 + i, 12)
        # Wrench head (Hook outward)
        for x in range(27, 32):
            for y in range(16, 22): p(x, y, 13)
    elif r_state == "down":
        # Right impact (Vertical down)
        for x in range(22, 26):
            for y in range(8, 28): p(x, y, 12)
        for x in range(25, 31):
            for y in range(26, 32): p(x, y, 13)
        for x in range(25, 32): p(x, 31, 12) # Contact!

    return s

f1 = generate_frame("idle")
f2 = generate_frame("h_swing")
f3 = generate_frame("h_impact")
f4 = generate_frame("w_swing")
f5 = generate_frame("w_impact")

for i, f in enumerate([f1, f2, f3, f4, f5]):
    print(f'export const sprSepticus{i+1} = [{", ".join(map(str, f))}];')
