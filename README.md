# Thapar Trade
### A Campus Marketplace for the Thapar Community

<p align="center">
  **A Student-to-Student Marketplace | Software Engineering Project**
</p>

Thapar Trade is a campus-focused online marketplace designed to simplify the buying and selling of products within the Thapar Institute of Engineering and Technology community. It provides a centralized platform where students can list items, explore available products, connect with sellers, and manage their purchases through an organized marketplace experience.

The project aims to make campus transactions more accessible, convenient, and structured through a responsive web application.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Application Modules](#application-modules)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Current Limitations](#current-limitations)
- [Future Enhancements](#future-enhancements)
- [Project Documentation](#project-documentation)
- [Development Team](#development-team)

---

## Project Overview

Students frequently need a convenient way to buy, sell, or exchange items within their campus community. However, the absence of a dedicated marketplace can make discovering available products and connecting with potential buyers or sellers difficult.

**Thapar Trade addresses this problem** by providing a centralized digital marketplace specifically designed around campus requirements.

The platform supports the complete marketplace workflow, including user access, product listings, browsing, favourites, cart management, simulated checkout, order tracking, reviews, and administrative moderation.

### Project Objectives

- Establish a centralized marketplace for the Thapar community.
- Simplify the process of listing and discovering products.
- Provide an organized buying and selling experience.
- Support product management and transaction workflows.
- Improve transparency through order records and reviews.
- Provide administrative tools for marketplace moderation.

---

## Key Features

### 1. User Authentication
- Registration and login interface.
- Thapar institutional email-domain validation.
- Input validation for account details.
- Access to marketplace functionality through the user interface.

### 2. Marketplace
- Browse available product listings.
- Search products using keywords.
- Filter listings by category.
- View product details and seller information.
- Display appropriate empty states when no results are found.

### 3. Listing Management
- Create new product listings.
- Edit existing listings.
- Delete listings.
- Manage product information and availability.

### 4. Favourites
- Save products for later reference.
- Access favourite listings conveniently.

### 5. Shopping Cart
- Add products to the cart.
- Manage product quantities.
- Apply restrictions to prevent invalid purchases, including purchasing one's own or sold listings.

### 6. Checkout and Orders
- Checkout interface.
- Simulated payment processing.
- Order creation and order records.
- Order history and status tracking.
- Campus pickup selection.

### 7. Reviews and Reporting
- Submit product reviews and ratings.
- Report inappropriate listings.
- Support marketplace accountability.

### 8. Administration
- Administrative dashboard.
- Listing moderation.
- Order-status management.
- Review and report management.

### 9. Responsive Interface
- User interface designed for desktop and mobile screens.
- Organized navigation and marketplace components.

---

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Programming Language | JavaScript |
| Styling | CSS |
| Frontend Tooling | Create React App |
| Browser Storage | LocalStorage |
| Optional Backend | Python, FastAPI |
| Optional Database | SQLite |
| Version Control | Git and GitHub |
| Deployment | GitHub Pages |

---

## System Architecture

Thapar Trade follows a modular web-application structure.

**Frontend Layer**

The React frontend handles the user interface, marketplace navigation, listing operations, cart interactions, and other user-facing functionality.

**Application Logic**

JavaScript manages marketplace workflows, form validation, listing operations, cart functionality, and order-related interactions.

**Data Persistence**

The standalone frontend prototype uses browser LocalStorage to retain application data between sessions in the same browser.

**Optional Backend**

The repository also includes a FastAPI and SQLite backend component for local full-stack development and demonstration.

---

## Application Modules

| Module | Description |
|---|---|
| Authentication | User registration and login interface |
| Marketplace | Product browsing, search, and filtering |
| Listings | Create, edit, and delete product listings |
| Favourites | Save products for future reference |
| Cart | Manage selected products and quantities |
| Checkout | Simulated checkout and order creation |
| Order Management | Order history and status tracking |
| Reviews | Product ratings and feedback |
| Reporting | Report inappropriate listings |
| Administration | Listing moderation and order management |

---

## Getting Started

Follow these steps to run the frontend application locally.

### Prerequisites

Install the following:

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/RAJBIRSINGH27/Thapar-Trade.git
```

### 2. Navigate to the Project Directory

Open the directory containing the frontend `package.json` file.

If working from the repository's nested source folder:

```bash
cd "code/thapar trade latest"
```

If you have opened the frontend project directory directly, you can skip this step.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm start
```

The application should open at:

```text
http://localhost:3000
```

If it does not open automatically, enter the address in your browser.

---

## Project Structure

The project repository contains the following major components:

```text
Thapar-Trade/
│
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
│
├── Documentation/
│   ├── Activity Diagram
│   ├── Class Diagram
│   ├── Collaboration Diagram
│   ├── Deployment Diagram
│   ├── ER Diagram
│   ├── Sequence Diagram
│   ├── Use Case Diagram
│   └── DFD Diagrams
│
├── backend/
│   ├── main.py
│   └── requirements.txt
│
├── Final-Project-Report/
│
├── Journals/
│
├── Proposal/
│
├── Prototype/
│
├── public/
│
├── src/
│
├── package.json
├── package-lock.json
└── README.md
```

*The frontend source directory may be nested under `code/` in the repository.*

---

## Testing

The application has been reviewed through functional testing of its major workflows.

Testing areas include:

- User input validation.
- Registration and login flows.
- Product listing creation and management.
- Marketplace search and category filtering.
- Favourites functionality.
- Cart operations and purchase restrictions.
- Checkout and order creation.
- Order history and status management.
- Reviews and reporting.
- Administrative moderation.
- Browser LocalStorage persistence.

---

## Current Limitations

The current implementation is a functional academic prototype. The following limitations should be considered:

- Payment processing is simulated and is not connected to a live payment gateway.
- Frontend authentication and administrative checks are prototype-level and should not be treated as production-grade security.
- LocalStorage persistence is browser-specific and does not provide centralized multi-user data synchronization.
- The optional backend requires further integration and deployment work before it can serve as a production backend.

---

## Future Enhancements

Potential improvements include:

- Secure server-side authentication and authorization.
- Centralized cloud database integration.
- Real-time communication between buyers and sellers.
- Integration with a payment gateway.
- Automated email and order notifications.
- Advanced product filtering and recommendations.
- Improved administrative analytics.
- Production deployment with secure backend infrastructure.

---

## Project Documentation

The repository includes supporting Software Engineering documentation:

- Project proposal.
- Final project report.
- Software design diagrams.
- UML diagrams.
- Data Flow Diagrams.
- Entity Relationship Diagram.
- Project presentation.
- Individual weekly project journals.
- Test case documentation.

Refer to the `Documentation/`, `Final-Project-Report/`, `Proposal/`, and `Journals/` directories for the relevant materials.

---

## Development Team

**Project: Thapar Trade**

| Team Member | Roll Number |
|---|---|
| Rajbir Singh | 1024030453 |
| Chitesh Jindal | 1024030454 |
| Ishan Garg | 1024031095 |

**Institution:** Thapar Institute of Engineering and Technology  
**Course:** UCS503P – Software Engineering

---

## Repository

**GitHub:**  
https://github.com/RAJBIRSINGH27/Thapar-Trade

---

<p align="center">
  **Thapar Trade**
  
  *Making Campus Buying and Selling Simpler.*
</p>
