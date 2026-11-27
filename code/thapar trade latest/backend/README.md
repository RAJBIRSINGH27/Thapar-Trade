# Thapar Trade Backend

Optional FastAPI + SQLite backend for the complete Software Engineering prototype.

## Run

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

API documentation is available at `http://127.0.0.1:8001/docs`.

The frontend remains fully usable on GitHub Pages with browser localStorage. This backend is included for local full-stack demonstration and for future API integration; it is not required to run the static frontend.

Demo admin account:

- Email: `admin@thapar.edu`
- Password: `admin123`
