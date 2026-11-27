# Thapar Trade

Thapar Trade is a complete Software Engineering campus marketplace prototype for the Thapar community.

## Included workflows

- Documentation and project presentation
- Thapar-only authentication
- Marketplace search and category filtering
- Listing creation, editing and deletion
- Product details and seller information
- Favourite/saved listings
- Cart and quantity management
- Checkout and campus pickup selection
- Simulated payment processing
- Order creation and order history
- Order tracking and status lifecycle
- Ratings and reviews
- Listing reporting
- Admin moderation dashboard
- Payment, order, review and report records
- Responsive desktop/mobile UI
- Optional FastAPI + SQLite backend for local full-stack demonstration

## Frontend

The frontend is intentionally self-contained so it can run on GitHub Pages. Browser localStorage provides persistence for the academic prototype.

```bash
npm install
npm start
```

Open `http://localhost:3000`.

Production build:

```bash
npm run build
```

## Demo admin

Use an official-looking Thapar account with:

- Email: `admin@thapar.edu`
- Password: `admin123`

The frontend uses the email to expose the administrator dashboard.

## Optional backend

A FastAPI + SQLite backend is included under `backend/` and mirrors the major DFD modules: users, listings, orders, payments, reviews, reports and admin operations.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

API docs: `http://127.0.0.1:8001/docs`

The backend is provided for local full-stack demonstration. The GitHub Pages build remains frontend-only and does not require the backend.

## GitHub Pages

The repository is configured with `.github/workflows/deploy-pages.yml`.

In GitHub, set **Settings → Pages → Source → GitHub Actions**, then push to `main`.

Target URL:

`https://rajbirsingh27.github.io/Thapar-Trade/`

## Project structure

```text
Thapar Trade-2/
├── .github/workflows/deploy-pages.yml
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
├── public/
├── src/
│   ├── App.js
│   ├── App.css
│   ├── campus.jpg
│   └── index.js
├── build/
├── package.json
├── package-lock.json
└── README.md
```

## Academic prototype note

Payment is simulated in the frontend, and browser localStorage is used for standalone persistence. These are deliberate prototype choices; real payment credentials, production authentication and cloud infrastructure should not be placed in this repository.


## Final project documentation

The project includes the official Software Engineering diagrams in `Documentation/` and in `public/docs/` for the running React app:

- `Activity_diagram.jpg`
- `DFD_level0.png`
- `DFD_level1.png`
- `ER_diagram.png`
- `User_case_diagram.png`
- `project-proposal.pdf`
- `ThaparTrade_PPT.pdf`

The team members are **Rajbir Singh, Chitesh Jindal, and Ishan Garg**.

The frontend prototype implements user authentication, listings, search/filtering, favourites, cart, checkout, demo payment processing, orders, tracking, reviews, reports, and admin management using browser storage. The FastAPI backend is included separately for the Software Engineering/full-stack extension.


## Added UML diagrams and presentation

The following supplied diagrams are included in `Documentation/` and `public/docs/`.
The React documentation page links to these files, so they are available on GitHub Pages after the updated source is pushed and redeployed.

- `Class-diagram.png`
- `Collaboration-diagram.png`
- `Sequence-diagram.png`
- `Deployment-Diagram.png`
- `SE_presentation.key` (original Keynote presentation)
