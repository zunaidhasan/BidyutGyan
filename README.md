# ⚡ BidyutGyan (বিদ্যুতজ্ঞান)

Load shedding schedule & electricity utility information for Bangladesh.

## Features

- **📍 Location-based lookup** — Find your electricity supplier automatically via GPS
- **🔍 District search** — Search any of the 64 districts in Bangla or English
- **🗺️ Division browser** — Browse all districts by division
- **⚡ Utility info** — Learn about DESCO, DPDC, NESCO, WZPDCL, BPDB, and BREB
- **📊 Load shedding schedule** — View expected power cut times (coming with community reports)
- **📢 Community reports** — Report power cuts/restoration to help others

## Quick Start

```bash
# Clone the repo
git clone https://github.com/zunaidhasan/bidyutgyan.git
cd bidyutgyan

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn backend.main:app --reload
```

Open http://localhost:8000 in your browser.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api` | API root with available endpoints |
| `GET /api/health` | Health check |
| `GET /api/divisions` | List all 8 divisions |
| `GET /api/districts` | List all 64 districts |
| `GET /api/district/{slug}` | District details (e.g. `/api/district/dhaka`) |
| `GET /api/search?q={name}` | Search district by name |
| `GET /api/lookup?lat={lat}&lon={lon}` | Find nearest district by GPS |
| `GET /api/utilities` | List all electricity utility companies |

## Deployment

### Render (recommended)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New+ → Blueprint
3. Connect your repo — `render.yaml` will auto-configure everything

### Docker

```bash
docker build -t bidyutgyan .
docker run -p 8000:8000 bidyutgyan
```

## Data Sources

The utility-to-district mapping is compiled from the official coverage areas of:
- Bangladesh Power Development Board (BPDB)
- Dhaka Electric Supply Company (DESCO)
- Dhaka Power Distribution Company (DPDC)
- Northern Electricity Supply Company (NESCO)
- West Zone Power Distribution Company (WZPDCL)
- Bangladesh Rural Electrification Board (BREB)

## Tech Stack

- **Backend:** Python, FastAPI
- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Hosting:** Render / Docker

---

⚡ নির্মিত বাংলাদেশের জন্য — Built for Bangladesh
