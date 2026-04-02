import json
import http.client

# Configuration
API_TOKEN = '893a8478-e84f-4f63-9dd1-6c49e68abcc2'
JOB_ID = 'b26ef34a-e8ac-4a2e-9529-71026f80eb8f'
BASE_URL = 'api.pixellab.ai'

def get_result():
    conn = http.client.HTTPSConnection(BASE_URL)
    headers = {'Authorization': f'Bearer {API_TOKEN}'}
    conn.request("GET", f"/v2/background-jobs/{JOB_ID}", headers=headers)
    res = conn.getresponse()
    data = json.loads(res.read().decode())
    print(json.dumps(data, indent=2))

if __name__ == "__main__":
    get_result()
