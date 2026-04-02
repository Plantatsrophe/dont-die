import base64
import json
import http.client
import subprocess

# Configuration
API_TOKEN = '893a8478-e84f-4f63-9dd1-6c49e68abcc2'
IMAGE_PATH = r'C:\Users\Brandon\.gemini\antigravity\brain\1ad1e771-8a45-4ecd-b22a-e8a39c438c28\media__1775164205299.jpg'
BASE_URL = 'api.pixellab.ai'

ps_cmd = f'[Reflection.Assembly]::LoadWithPartialName("System.Drawing"); $img = [System.Drawing.Image]::FromFile("{IMAGE_PATH}"); "$($img.Width),$($img.Height)"'
proc = subprocess.run(["powershell", "-Command", ps_cmd], capture_output=True, text=True)
raw_output = proc.stdout.strip().splitlines()
w, h = map(int, raw_output[-1].split(','))

# Load Image Data
with open(IMAGE_PATH, 'rb') as f:
    img_data = base64.b64encode(f.read()).decode()

# Payload for /v2/generate-image-v2
payload = {
    "description": "8-bit NES style pixel art of the Industrial Bio-Knight Colossus from the reference image. Heavy Rusted Slat-Armor, glowing green horizontal vents, bucket helm with glowing eyes, massive sledgehammer left arm, beefy Stillson wrench right arm. Sharp contrasts, hard shading, high-fidelity pixel art.",
    "image_size": {"width": 128, "height": 128},
    "reference_images": [
        {
            "image": {
                "type": "base64",
                "base64": img_data,
                "format": "jpg"
            },
            "size": {"width": w, "height": h}
        }
    ],
    "no_background": True,
    "seed": 42
}

# POST Request
conn = http.client.HTTPSConnection(BASE_URL)
headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}
conn.request("POST", "/v2/generate-image-v2", body=json.dumps(payload), headers=headers)

response = conn.getresponse()
res_data = json.loads(response.read().decode())

if res_data.get('background_job_id'):
    print(f"SUCCESS: Job ID {res_data['background_job_id']}")
elif res_data.get('success'):
     # Some endpoints might return success: true with data
    job_id = res_data.get('data', {}).get('job_id') or res_data.get('data', {}).get('background_job_id')
    print(f"SUCCESS: Job ID {job_id}")
else:
    print(f"ERROR FULL RESPONSE: {json.dumps(res_data, indent=2)}")

conn.close()
