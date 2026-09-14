import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import campusImage from "./campus.jpg";

const DEFAULT_LISTINGS = [
  {id:1,title:"Engineering Mathematics Textbook",category:"Books",price:650,condition:"Good",location:"Hostel B",seller:"Rajbir Singh",emoji:"📚",description:"Clean copy with useful highlights. Ideal for first-year engineering mathematics."},
  {id:2,title:"Scientific Calculator FX-991ES",category:"Electronics",price:800,condition:"Like New",location:"Hostel A",seller:"Chitesh Jindal",emoji:"🧮",description:"Casio scientific calculator, lightly used and fully functional."},
  {id:3,title:"Campus Bicycle",category:"Vehicles",price:3500,condition:"Good",location:"Thapar Campus",seller:"Ishan Garg",emoji:"🚲",description:"Well-maintained bicycle suitable for everyday campus travel."},
  {id:4,title:"Study Table Lamp",category:"Furniture",price:550,condition:"Like New",location:"Hostel C",seller:"Rajbir Singh",emoji:"💡",description:"Adjustable LED desk lamp with multiple brightness levels."},
  {id:5,title:"Lab Coat",category:"Clothing",price:300,condition:"Good",location:"Hostel D",seller:"Chitesh Jindal",emoji:"🥼",description:"Clean lab coat in good condition. Suitable for laboratory classes."},
  {id:6,title:"USB-C Multiport Hub",category:"Electronics",price:900,condition:"Like New",location:"Hostel E",seller:"Ishan Garg",emoji:"🔌",description:"USB-C hub with HDMI and multiple USB ports."},
  {id:7,title:"Data Structures Notes",category:"Books",price:250,condition:"Good",location:"Hostel A",seller:"Rajbir Singh",emoji:"📝",description:"Organised handwritten and printed notes for quick revision."},
  {id:8,title:"Mini Room Cooler",category:"Electronics",price:1800,condition:"Good",location:"Hostel F",seller:"Chitesh Jindal",emoji:"❄️",description:"Compact personal cooler, suitable for hostel rooms."}
];

const CATEGORIES = ["All","Books","Electronics","Furniture","Clothing","Vehicles","Services"];
const CATEGORY_ICONS = {
  Books:"📚",
  Electronics:"💻",
  Furniture:"🪑",
  Clothing:"👕",
  Vehicles:"🚲",
  Services:"🛠️"
};

function formatPrice(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function App() {
  const [page,setPage] = useState("docs");
  const [user,setUser] = useState(() => JSON.parse(localStorage.getItem("tt_user") || "null"));
  const [listings,setListings] = useState(() => JSON.parse(localStorage.getItem("tt_listings") || "null") || DEFAULT_LISTINGS);
  const [query,setQuery] = useState("");
  const [category,setCategory] = useState("All");
  const [selected,setSelected] = useState(null);
  const [authMode,setAuthMode] = useState("login");
  const [toast,setToast] = useState("");
  const [favorites,setFavorites] = useState(() => JSON.parse(localStorage.getItem("tt_favorites") || "[]"));

  useEffect(() => localStorage.setItem("tt_user",JSON.stringify(user)),[user]);
  useEffect(() => localStorage.setItem("tt_listings",JSON.stringify(listings)),[listings]);
  useEffect(() => localStorage.setItem("tt_favorites",JSON.stringify(favorites)),[favorites]);

  const notify = message => {
    setToast(message);
    window.clearTimeout(window.__ttToast);
    window.__ttToast = window.setTimeout(() => setToast(""),2500);
  };

  const navigate = next => {
    setPage(next);
    setSelected(null);
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const openAuth = mode => {
    setAuthMode(mode);
    navigate("auth");
  };

  const logout = () => {
    setUser(null);
    navigate("docs");
    notify("You have been logged out.");
  };

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();

    return listings.filter(item => {
      const matchesCategory = category === "All" || item.category === category;
      const haystack =
        `${item.title} ${item.category} ${item.location} ${item.seller} ${item.description}`.toLowerCase();

      return matchesCategory && (!q || haystack.includes(q));
    });
  },[listings,query,category]);

  const publishListing = item => {
    const newItem = {
      ...item,
      id:Date.now(),
      seller:user?.name || "You",
      emoji:CATEGORY_ICONS[item.category] || "📦"
    };

    setListings(prev => [newItem,...prev]);
    navigate("prototype-profile");
    notify("Listing published successfully.");
  };

  const toggleFavorite = id => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev,id]
    );

    notify(
      favorites.includes(id)
        ? "Removed from saved items."
        : "Saved to your favorites."
    );
  };

  return (
    <div className="app">

      <DocumentationHeader
        page={page}
        navigate={navigate}
        user={user}
        openAuth={openAuth}
        logout={logout}
      />

      {page === "docs" && (
        <DocumentationHome navigate={navigate}/>
      )}

      {page === "prototype" && (
        <PrototypeHome
          query={query}
          setQuery={setQuery}
          navigate={navigate}
          setCategory={setCategory}
          listings={listings}
        />
      )}

      {page === "marketplace" && (
        <Marketplace
          listings={filteredListings}
          query={query}
          setQuery={setQuery}
          category={category}
          setCategory={setCategory}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          onOpen={setSelected}
          navigate={navigate}
        />
      )}

      {page === "auth" && (
        <Auth
          mode={authMode}
          setMode={setAuthMode}
          onSuccess={account => {
            setUser(account);
            navigate("prototype");
            notify("Welcome to Thapar Trade.");
          }}
        />
      )}

      {page === "sell" && user && (
        <Sell
          onCancel={() => navigate("marketplace")}
          onPublish={publishListing}
        />
      )}

      {page === "prototype-profile" && user && (
        <Profile
          user={user}
          listings={listings.filter(
            x => x.seller === user.name || x.seller === "You"
          )}
          navigate={navigate}
          onOpen={setSelected}
        />
      )}

      {page === "guide" && <Guide navigate={navigate}/>}
      {page === "about" && <About/>}

      {page === "favorites" && (
        <Favorites
          listings={listings.filter(x => favorites.includes(x.id))}
          onOpen={setSelected}
          navigate={navigate}
        />
      )}

      {selected && (
        <ListingModal
          item={selected}
          favorite={favorites.includes(selected.id)}
          toggleFavorite={() => toggleFavorite(selected.id)}
          onClose={() => setSelected(null)}
          onContact={() => {
            setSelected(null);
            user
              ? notify("Seller contact request created.")
              : openAuth("login");
          }}
        />
      )}

      {toast && <div className="toast">{toast}</div>}

      {page !== "docs" && <Footer navigate={navigate}/>}
    </div>
  );
}


/* =========================================================
   DOCUMENTATION HEADER
========================================================= */

function DocumentationHeader({page,navigate,user,openAuth,logout}) {
  return (
    <header className="doc-header">
      <div className="doc-header-inner">

        <button className="doc-brand" onClick={() => navigate("docs")}>
          <span className="doc-logo">TT</span>
          <span>Thapar <b>Trade</b></span>
        </button>

        <nav className="doc-nav">
          <button
            className={page === "docs" ? "active" : ""}
            onClick={() => navigate("docs")}
          >
            Documentation
          </button>

          <button onClick={() => navigate("prototype")}>
            Interactive Prototype
          </button>

          <button onClick={() => navigate("marketplace")}>
            Marketplace
          </button>
        </nav>

        <div className="doc-header-right">
          {user ? (
            <>
              <button
                className="header-user"
                onClick={() => navigate("prototype-profile")}
              >
                {user.name.split(" ")[0]}
              </button>
              <button className="header-login" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <button
              className="header-login"
              onClick={() => openAuth("login")}
            >
              Login
            </button>
          )}
        </div>

      </div>
    </header>
  );
}


/* =========================================================
   DOCUMENTATION HOME
========================================================= */

function DocumentationHome({navigate}) {
  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });
  };

  return (
    <>
      <section className="documentation-hero">
        <div
          className="documentation-hero-image"
          style={{backgroundImage:`url(${campusImage})`}}
        />

        <div className="documentation-overlay"/>

        <div className="documentation-hero-content">

          <div className="doc-badge">
            SOFTWARE ENGINEERING PROJECT
          </div>

          <h1>Thapar Trade</h1>

          <p className="hero-subtitle">
            Campus Marketplace & Student Trading Platform
          </p>

          <p className="hero-description">
            A campus-focused peer-to-peer marketplace designed to make
            buying, selling and exchanging items within the Thapar
            community simple, organised and accessible.
          </p>

          <div className="hero-actions">
            <button
              className="hero-primary"
              onClick={() => navigate("prototype")}
            >
              Open Interactive Prototype →
            </button>

            <button
              className="hero-secondary"
              onClick={() => scrollTo("deliverables")}
            >
              View Project Deliverables
            </button>
          </div>

        </div>
      </section>


      <div className="docs-layout">

        <aside className="docs-sidebar">

          <div className="sidebar-title">
            THAPAR TRADE
          </div>

          <button onClick={() => scrollTo("profile")}>
            Academic & Team Profile
          </button>

          <button onClick={() => scrollTo("overview")}>
            Executive Overview
          </button>

          <button onClick={() => scrollTo("capabilities")}>
            Key Platform Capabilities
          </button>

          <button onClick={() => scrollTo("architecture")}>
            System Architecture
          </button>

          <button onClick={() => scrollTo("technology")}>
            Technology Stack
          </button>

          <button onClick={() => scrollTo("prototype-info")}>
            Interactive Prototype
          </button>

          <button onClick={() => scrollTo("deliverables")}>
            Engineering Deliverables
          </button>

          <button onClick={() => scrollTo("roadmap")}>
            Project Roadmap
          </button>

        </aside>


        <main className="documentation-content">

          <section id="profile" className="doc-section">
            <div className="section-number">01</div>
            <h2>Academic & Team Profile</h2>
            <p className="section-intro">
              Project information and team responsibilities for the
              Software Engineering implementation.
            </p>

            <div className="profile-table">
              <div className="table-row table-head">
                <span>Parameter</span>
                <span>Details</span>
              </div>

              <div className="table-row">
                <span>Project Title</span>
                <strong>Thapar Trade</strong>
              </div>

              <div className="table-row">
                <span>Project Type</span>
                <span>Software Engineering Project</span>
              </div>

              <div className="table-row">
                <span>Domain</span>
                <span>Campus Marketplace / Peer-to-Peer Commerce</span>
              </div>

              <div className="table-row">
                <span>Team Member 01</span>
                <span>Rajbir Singh</span>
              </div>

              <div className="table-row">
                <span>Team Member 02</span>
                <span>Chitesh Jindal</span>
              </div>

              <div className="table-row">
                <span>Team Member 03</span>
                <span>Ishan Garg</span>
              </div>
            </div>
          </section>


          <section id="overview" className="doc-section">
            <div className="section-number">02</div>
            <h2>Executive Overview</h2>

            <div className="overview-box">
              <strong>Project Abstract</strong>
              <p>
                Thapar Trade is a campus-first marketplace prototype
                created to provide a structured environment for students
                and members of the Thapar community to list, discover,
                save and exchange useful items.
              </p>
            </div>

            <p>
              The platform addresses the problem of scattered informal
              buying and selling by bringing listings into a single
              searchable marketplace. Users can browse categories,
              inspect item details, save listings, create accounts and
              publish their own items.
            </p>

            <p>
              The prototype emphasises a simple campus-local workflow:
              discover an item, review its details, connect with the
              seller and arrange an appropriate campus exchange.
            </p>
          </section>


          <section id="capabilities" className="doc-section">
            <div className="section-number">03</div>
            <h2>Key Platform Capabilities</h2>

            <div className="capability-grid">

              <Capability
                icon="🔎"
                title="Marketplace Search"
                text="Search listings by title, category, location, seller and description."
              />

              <Capability
                icon="🏷️"
                title="Category Browsing"
                text="Organise campus listings into books, electronics, furniture, clothing, vehicles and services."
              />

              <Capability
                icon="➕"
                title="Listing Management"
                text="Authenticated users can create listings with price, condition, location and description."
              />

              <Capability
                icon="♡"
                title="Saved Items"
                text="Users can save interesting listings and access them later through favourites."
              />

              <Capability
                icon="👤"
                title="User Profiles"
                text="Personal profiles provide an overview of active listings associated with an account."
              />

              <Capability
                icon="🔐"
                title="Thapar Authentication"
                text="Registration and login require an official @thapar.edu email address."
              />

            </div>
          </section>


          <section id="architecture" className="doc-section">
            <div className="section-number">04</div>
            <h2>System Architecture & Data Flow</h2>

            <p className="section-intro">
              The current prototype follows a client-side React
              architecture with browser-based persistence.
            </p>

            <div className="architecture">

              <div className="architecture-layer">
                <span>01</span>
                <div>
                  <b>Presentation Layer</b>
                  <p>
                    React components provide the documentation interface,
                    marketplace, authentication screens, listing forms,
                    profiles and modal views.
                  </p>
                </div>
              </div>

              <div className="architecture-arrow">↓</div>

              <div className="architecture-layer">
                <span>02</span>
                <div>
                  <b>Application Logic</b>
                  <p>
                    React state and component logic handle navigation,
                    filtering, authentication flow, listing creation,
                    favourites and user interactions.
                  </p>
                </div>
              </div>

              <div className="architecture-arrow">↓</div>

              <div className="architecture-layer">
                <span>03</span>
                <div>
                  <b>Persistence Layer</b>
                  <p>
                    Browser localStorage stores user information,
                    marketplace listings and saved items for the
                    prototype.
                  </p>
                </div>
              </div>

            </div>
          </section>


          <section id="technology" className="doc-section">
            <div className="section-number">05</div>
            <h2>Prototype Technology Stack</h2>

            <div className="technology-table">

              <div className="tech-row tech-head">
                <span>Technology</span>
                <span>Purpose</span>
              </div>

              <div className="tech-row">
                <strong>React.js</strong>
                <span>Component-based frontend application</span>
              </div>

              <div className="tech-row">
                <strong>JavaScript</strong>
                <span>Application logic and interaction handling</span>
              </div>

              <div className="tech-row">
                <strong>CSS3</strong>
                <span>Responsive interface and documentation styling</span>
              </div>

              <div className="tech-row">
                <strong>HTML5</strong>
                <span>Semantic application structure</span>
              </div>

              <div className="tech-row">
                <strong>LocalStorage</strong>
                <span>Client-side prototype persistence</span>
              </div>

              <div className="tech-row">
                <strong>GitHub Pages</strong>
                <span>Static deployment and project demonstration</span>
              </div>

            </div>
          </section>


          <section id="prototype-info" className="doc-section">
            <div className="section-number">06</div>
            <h2>Interactive Prototype Demonstration</h2>

            <div className="prototype-box">

              <div>
                <span className="prototype-label">
                  LIVE PROTOTYPE
                </span>

                <h3>Experience Thapar Trade</h3>

                <p>
                  Explore the working marketplace prototype, search
                  listings, view item details, create an account,
                  publish items and manage saved listings.
                </p>
              </div>

              <button
                className="prototype-button"
                onClick={() => navigate("prototype")}
              >
                Launch Prototype →
              </button>

            </div>

            <div className="flow-grid">

              <div>
                <span>01</span>
                <b>Discover</b>
                <p>Browse or search marketplace listings.</p>
              </div>

              <div>
                <span>02</span>
                <b>Evaluate</b>
                <p>Review price, condition, seller and pickup location.</p>
              </div>

              <div>
                <span>03</span>
                <b>Connect</b>
                <p>Use the contact workflow to connect with the seller.</p>
              </div>

              <div>
                <span>04</span>
                <b>Exchange</b>
                <p>Arrange a suitable campus-local exchange.</p>
              </div>

            </div>
          </section>


          <section id="deliverables" className="doc-section">
            <div className="section-number">07</div>
            <h2>Formal Software Engineering Deliverables</h2>

            <p className="section-intro">
              Project documentation and engineering artefacts can be
              placed inside the <code>public/docs</code> directory.
              Each item below is ready to become a clickable project
              deliverable.
            </p>

            <div className="deliverables-table">

              <Deliverable
                title="Project Proposal Report"
                file="project-proposal.pdf"
              />

              <Deliverable
                title="ER Diagram"
                file="er-diagram.pdf"
              />

              <Deliverable
                title="UML Activity Diagram"
                file="activity-diagram.pdf"
              />

              <Deliverable
                title="3-Level Data Flow Diagram"
                file="dfd.pdf"
              />

              <Deliverable
                title="UML Use Case Diagram"
                file="use-case.pdf"
              />

              <Deliverable
                title="Gantt Chart / Project Schedule"
                file="gantt.pdf"
              />

              <Deliverable
                title="Evaluation Presentation"
                file="presentation.pdf"
              />

              <Deliverable
                title="Prototype Report"
                file="prototype-report.pdf"
              />

            </div>
          </section>


          <section id="roadmap" className="doc-section">
            <div className="section-number">08</div>
            <h2>Project Roadmap & Development Phases</h2>

            <div className="roadmap">

              <RoadmapItem
                phase="Phase 01"
                title="Requirements & Analysis"
                text="Identify campus marketplace requirements, users, workflows and system boundaries."
              />

              <RoadmapItem
                phase="Phase 02"
                title="System Design"
                text="Develop UML diagrams, ER model, DFDs, architecture and interface specifications."
              />

              <RoadmapItem
                phase="Phase 03"
                title="Frontend Prototype"
                text="Implement marketplace navigation, authentication, listings, categories, profiles and saved items."
              />

              <RoadmapItem
                phase="Phase 04"
                title="Testing & Evaluation"
                text="Validate user workflows, interface behaviour, filtering, listing creation and prototype persistence."
              />

              <RoadmapItem
                phase="Phase 05"
                title="Future Development"
                text="Potential expansion includes a production backend, database integration, real messaging, moderation and deployment infrastructure."
              />

            </div>
          </section>


          <section className="final-cta">

            <div>
              <span>READY TO EXPLORE?</span>
              <h2>Open the Thapar Trade prototype.</h2>
              <p>
                See the marketplace functionality implemented in the
                project.
              </p>
            </div>

            <button onClick={() => navigate("prototype")}>
              Launch Interactive Prototype →
            </button>

          </section>

        </main>
      </div>


      <footer className="documentation-footer">

        <div>
          <div className="footer-doc-brand">
            <span className="doc-logo">TT</span>
            <strong>Thapar Trade</strong>
          </div>

          <p>
            Campus Marketplace & Student Trading Platform
          </p>
        </div>

        <div className="footer-team">
          <span>Rajbir Singh</span>
          <span>Chitesh Jindal</span>
          <span>Ishan Garg</span>
        </div>

        <div className="footer-copy">
          © 2026 Thapar Trade · Software Engineering Project
        </div>

      </footer>
    </>
  );
}


function Capability({icon,title,text}) {
  return (
    <div className="capability-card">
      <div className="capability-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}


function Deliverable({title,file}) {
  return (
    <div className="deliverable-row">
      <div>
        <span className="document-icon">PDF</span>
        <strong>{title}</strong>
      </div>

      <a
        href={`${process.env.PUBLIC_URL}/docs/${file}`}
        target="_blank"
        rel="noreferrer"
      >
        View Document ↗
      </a>
    </div>
  );
}


function RoadmapItem({phase,title,text}) {
  return (
    <div className="roadmap-item">
      <span>{phase}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}


/* =========================================================
   EXISTING INTERACTIVE PROTOTYPE
========================================================= */

function PrototypeHome({query,setQuery,navigate,setCategory,listings}) {
  const popular = listings.slice(0,4);

  return (
    <main>

      <section className="prototype-hero">
        <div
          className="prototype-bg"
          style={{backgroundImage:`url(${campusImage})`}}
        />

        <div className="prototype-shade"/>

        <div className="prototype-content">

          <div className="eyebrow light">
            ● THAPAR COMMUNITY MARKETPLACE
          </div>

          <h1>
            Buy smarter.
            <br/>
            <em>Sell easier.</em>
          </h1>

          <p>
            A trusted campus marketplace built exclusively for
            Thapar students, faculty and the community.
          </p>

          <div className="hero-buttons">

            <button
              className="primary"
              onClick={() => navigate("marketplace")}
            >
              Explore marketplace →
            </button>

            <button
              className="secondary-dark"
              onClick={() => navigate("sell")}
            >
              List something
            </button>

          </div>

          <div className="trust-row">
            <span>◈ Thapar-only access</span>
            <span>ϟ Fast campus exchange</span>
            <span>✓ Community focused</span>
          </div>

        </div>
      </section>


      <section className="section">

        <div className="section-heading">
          <div>
            <label>MARKETPLACE</label>
            <h2>Browse by category</h2>
          </div>

          <button
            className="link-button"
            onClick={() => navigate("marketplace")}
          >
            View all listings →
          </button>
        </div>

        <div className="category-grid">

          {CATEGORIES.slice(1).map(c => (
            <button
              className="category-card"
              key={c}
              onClick={() => {
                setCategory(c);
                navigate("marketplace");
              }}
            >
              <span className="category-icon">
                {CATEGORY_ICONS[c]}
              </span>

              <strong>{c}</strong>

              <small>Explore items</small>
            </button>
          ))}

        </div>

      </section>


      <section className="search-band">

        <div>
          <label>FIND SOMETHING</label>
          <h2>Search the campus marketplace.</h2>
          <p>Books, electronics, furniture, clothing and more.</p>
        </div>

        <div className="large-search">

          <span>⌕</span>

          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e =>
              e.key === "Enter" && navigate("marketplace")
            }
            placeholder="Search listings..."
          />

          <button onClick={() => navigate("marketplace")}>
            Search
          </button>

        </div>

      </section>


      <section className="section">

        <div className="section-heading">
          <div>
            <label>FEATURED</label>
            <h2>Popular on campus</h2>
          </div>

          <button
            className="link-button"
            onClick={() => navigate("marketplace")}
          >
            Explore marketplace →
          </button>
        </div>

        <div className="listing-grid compact">

          {popular.map(item => (
            <ListingCard
              key={item.id}
              item={item}
              preview
            />
          ))}

        </div>

      </section>

    </main>
  );
}


function Marketplace({
  listings,
  query,
  setQuery,
  category,
  setCategory,
  favorites,
  toggleFavorite,
  onOpen,
  navigate
}) {
  return (
    <main className="page">

      <div className="page-title">

        <div>
          <label>THAPAR TRADE</label>
          <h1>Marketplace</h1>
          <p>
            Find useful items from fellow members of the
            Thapar community.
          </p>
        </div>

        <button
          className="primary"
          onClick={() => navigate("sell")}
        >
          ＋ List an item
        </button>

      </div>


      <div className="market-toolbar">

        <div className="market-search">
          <span>⌕</span>

          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search listings..."
          />
        </div>

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <button
          className="saved-button"
          onClick={() => navigate("favorites")}
        >
          ♡ Saved ({favorites.length})
        </button>

      </div>


      <div className="chips">

        {CATEGORIES.map(c => (
          <button
            key={c}
            className={
              category === c
                ? "chip selected"
                : "chip"
            }
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}

      </div>


      <div className="result-line">
        <span>
          {listings.length}{" "}
          {listings.length === 1 ? "listing" : "listings"} found
        </span>

        <span>
          Campus exchange · No shipping required
        </span>
      </div>


      <div className="listing-grid">

        {listings.map(item => (
          <ListingCard
            key={item.id}
            item={item}
            favorite={favorites.includes(item.id)}
            toggleFavorite={() => toggleFavorite(item.id)}
            onOpen={() => onOpen(item)}
          />
        ))}

      </div>


      {!listings.length && (
        <div className="empty">
          <div>⌕</div>
          <h2>No listings found</h2>
          <p>Try a different keyword or category.</p>

          <button
            className="primary"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}

    </main>
  );
}


function ListingCard({
  item,
  favorite,
  toggleFavorite,
  onOpen,
  preview
}) {
  return (
    <article
      className="listing-card"
      onClick={onOpen}
    >

      <div className="listing-image">

        <span className="product-emoji">
          {item.emoji}
        </span>

        {!preview && (
          <span className="available">
            AVAILABLE
          </span>
        )}

        {!preview && (
          <button
            className="heart"
            onClick={e => {
              e.stopPropagation();
              toggleFavorite();
            }}
          >
            {favorite ? "♥" : "♡"}
          </button>
        )}

      </div>


      <div className="listing-info">

        <span className="category-label">
          {item.category}
        </span>

        <h3>{item.title}</h3>

        <div className="card-price">
          {formatPrice(item.price)}
        </div>

        <div className="card-meta">
          <span>{item.condition}</span>
          <i>•</i>
          <span>{item.location}</span>
        </div>

        <div className="seller-line">
          Seller: {item.seller}
        </div>

      </div>

    </article>
  );
}


function ListingModal({
  item,
  favorite,
  toggleFavorite,
  onClose,
  onContact
}) {
  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >

      <div
        className="listing-modal"
        onClick={e => e.stopPropagation()}
      >

        <button
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="modal-image">
          {item.emoji}
        </div>

        <div className="modal-category">
          {item.category}
        </div>

        <h2>{item.title}</h2>

        <div className="modal-price">
          {formatPrice(item.price)}
        </div>

        <p>{item.description}</p>

        <div className="detail-list">

          <div>
            <span>Condition</span>
            <b>{item.condition}</b>
          </div>

          <div>
            <span>Pickup</span>
            <b>{item.location}</b>
          </div>

          <div>
            <span>Seller</span>
            <b>{item.seller}</b>
          </div>

        </div>

        <div className="modal-actions">

          <button
            className="secondary"
            onClick={toggleFavorite}
          >
            {favorite ? "♥ Saved" : "♡ Save item"}
          </button>

          <button
            className="primary"
            onClick={onContact}
          >
            Contact seller →
          </button>

        </div>

      </div>

    </div>
  );
}


function Auth({mode,setMode,onSuccess}) {
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirm,setConfirm] = useState("");
  const [error,setError] = useState("");

  const submit = e => {
    e.preventDefault();
    setError("");

    const clean = email.trim().toLowerCase();

    if (!clean.endsWith("@thapar.edu")) {
      return setError(
        "Please use your official @thapar.edu email address."
      );
    }

    if (password.length < 6) {
      return setError(
        "Password must be at least 6 characters."
      );
    }

    if (mode === "register") {
      if (!name.trim()) {
        return setError("Please enter your full name.");
      }

      if (password !== confirm) {
        return setError("Passwords do not match.");
      }
    }

    onSuccess({
      id:Date.now(),
      name:name.trim() || clean.split("@")[0],
      email:clean
    });
  };

  return (
    <main className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          <span className="brand-icon">TT</span>
          <strong>Thapar Trade</strong>
        </div>

        <div className="auth-tabs">

          <button
            className={
              mode === "login"
                ? "tab active"
                : "tab"
            }
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Login
          </button>

          <button
            className={
              mode === "register"
                ? "tab active"
                : "tab"
            }
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Register
          </button>

        </div>

        <div className="auth-heading">
          <label>CAMPUS MARKETPLACE</label>

          <h1>
            {mode === "login"
              ? "Welcome back."
              : "Join your campus marketplace."}
          </h1>

          <p>
            {mode === "login"
              ? "Sign in with your Thapar account to continue."
              : "Create a Thapar-only account in less than a minute."}
          </p>
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <form
          className="form-stack"
          onSubmit={submit}
        >

          {mode === "register" && (
            <label>
              Full name
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Rajbir Singh"
              />
            </label>
          )}

          <label>
            Thapar email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="yourname@thapar.edu"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {mode === "register" && (
            <label>
              Confirm password
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </label>
          )}

          <button className="primary full">
            {mode === "login"
              ? "Sign in →"
              : "Create account →"}
          </button>

        </form>

        <div className="auth-note">
          🔒 Thapar-only access · Your campus identity stays
          within the community.
        </div>

      </div>

    </main>
  );
}


function Sell({onCancel,onPublish}) {
  const [form,setForm] = useState({
    title:"",
    price:"",
    category:"Books",
    condition:"Like New",
    location:"",
    description:""
  });

  const update = (key,value) => {
    setForm({...form,[key]:value});
  };

  const submit = e => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.price ||
      !form.location.trim() ||
      !form.description.trim()
    ) {
      alert("Please complete all required fields.");
      return;
    }

    onPublish({
      ...form,
      price:Number(form.price)
    });
  };

  return (
    <main className="page narrow">

      <button
        className="back-button"
        onClick={onCancel}
      >
        ← Back to marketplace
      </button>

      <div className="page-title">

        <div>
          <label>SELL ON THAPAR TRADE</label>
          <h1>List an item in minutes.</h1>
          <p>
            Give fellow students enough information to make
            a quick decision.
          </p>
        </div>

        <span className="secure-badge">
          ✓ Community listing
        </span>

      </div>

      <form
        className="sell-form"
        onSubmit={submit}
      >

        <section>

          <div className="form-section-title">
            <span>01</span>

            <div>
              <h3>Item details</h3>
              <p>Basic information buyers will see.</p>
            </div>
          </div>

          <div className="form-grid">

            <label className="wide">
              Item title *
              <input
                value={form.title}
                onChange={e =>
                  update("title",e.target.value)
                }
                placeholder="e.g. Apple Pencil 2nd Gen"
              />
            </label>

            <label>
              Price (₹) *
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={e =>
                  update("price",e.target.value)
                }
                placeholder="0"
              />
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={e =>
                  update("category",e.target.value)
                }
              >
                {CATEGORIES.slice(1).map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>

            <label>
              Condition
              <select
                value={form.condition}
                onChange={e =>
                  update("condition",e.target.value)
                }
              >
                <option>Like New</option>
                <option>Good</option>
                <option>Fair</option>
              </select>
            </label>

            <label>
              Pickup location *
              <input
                value={form.location}
                onChange={e =>
                  update("location",e.target.value)
                }
                placeholder="e.g. Hostel B"
              />
            </label>

            <label className="wide">
              Description *
              <textarea
                rows="6"
                value={form.description}
                onChange={e =>
                  update("description",e.target.value)
                }
                placeholder="Describe condition, what is included, and anything buyers should know..."
              />
            </label>

          </div>

        </section>


        <section>

          <div className="form-section-title">
            <span>02</span>

            <div>
              <h3>Listing preview</h3>
              <p>
                Your listing will appear like this in the
                marketplace.
              </p>
            </div>
          </div>

          <div className="preview-card">

            <div className="preview-icon">
              {CATEGORY_ICONS[form.category] || "📦"}
            </div>

            <div>
              <span className="category-label">
                {form.category}
              </span>

              <h3>
                {form.title || "Your item title"}
              </h3>

              <strong>
                {form.price
                  ? formatPrice(form.price)
                  : "₹0"}
              </strong>

              <p>
                {form.condition} ·{" "}
                {form.location || "Pickup location"}
              </p>
            </div>

          </div>

        </section>


        <div className="form-actions">

          <button
            type="button"
            className="secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button className="primary">
            Publish listing →
          </button>

        </div>

      </form>

    </main>
  );
}


function Profile({user,listings,navigate,onOpen}) {
  return (
    <main className="page">

      <div className="profile-header">

        <div className="profile-identity">

          <span className="avatar large">
            {user.name.slice(0,2).toUpperCase()}
          </span>

          <div>
            <label>MY ACCOUNT</label>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>

        </div>

        <button
          className="primary"
          onClick={() => navigate("sell")}
        >
          ＋ New listing
        </button>

      </div>


      <div className="stats-row">

        <div>
          <strong>{listings.length}</strong>
          <span>Active listings</span>
        </div>

        <div>
          <strong>0</strong>
          <span>Items sold</span>
        </div>

        <div>
          <strong>Thapar</strong>
          <span>Verified community</span>
        </div>

      </div>


      <div className="section-heading">
        <div>
          <label>MY MARKETPLACE</label>
          <h2>Your listings</h2>
        </div>
      </div>

      {listings.length ? (
        <div className="listing-grid">
          {listings.map(item => (
            <ListingCard
              key={item.id}
              item={item}
              onOpen={() => onOpen(item)}
            />
          ))}
        </div>
      ) : (
        <div className="empty">

          <div>＋</div>

          <h2>No listings yet</h2>

          <p>
            Start selling something useful to your campus community.
          </p>

          <button
            className="primary"
            onClick={() => navigate("sell")}
          >
            Create first listing
          </button>

        </div>
      )}

    </main>
  );
}


function Favorites({listings,onOpen,navigate}) {
  return (
    <main className="page">

      <div className="page-title">

        <div>
          <label>SAVED ITEMS</label>
          <h1>Your favorites</h1>
          <p>Listings you saved for later.</p>
        </div>

        <button
          className="secondary"
          onClick={() => navigate("marketplace")}
        >
          Browse marketplace
        </button>

      </div>

      {listings.length ? (
        <div className="listing-grid">
          {listings.map(item => (
            <ListingCard
              key={item.id}
              item={item}
              onOpen={() => onOpen(item)}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <div>♡</div>
          <h2>No saved items</h2>
          <p>
            Save listings from the marketplace to find them here.
          </p>
        </div>
      )}

    </main>
  );
}


function Guide({navigate}) {
  const steps = [
    ["01","Find an item","Search the marketplace, filter by category and compare listings."],
    ["02","Review details","Check the condition, price, seller and campus pickup location."],
    ["03","Connect","Contact the seller and discuss the exchange through the campus community."],
    ["04","Exchange safely","Meet at a suitable campus location and complete the transaction."]
  ];

  return (
    <main className="page">

      <div className="center-title">

        <label>HOW IT WORKS</label>

        <h1>Simple campus exchange.</h1>

        <p>
          Thapar Trade keeps campus exchange simple,
          local and transparent.
        </p>

      </div>


      <div className="process-grid">

        {steps.map(s => (
          <div
            className="process-card"
            key={s[0]}
          >
            <span>{s[0]}</span>
            <h2>{s[1]}</h2>
            <p>{s[2]}</p>
          </div>
        ))}

      </div>


      <div className="safety-banner">

        <div className="safety-icon">
          ✓
        </div>

        <div>
          <label>COMMUNITY TRUST</label>
          <h2>Built for campus exchange.</h2>

          <p>
            Use official Thapar accounts, meet in suitable
            campus locations, and report suspicious listings.
          </p>
        </div>

        <button
          className="primary"
          onClick={() => navigate("marketplace")}
        >
          Start browsing →
        </button>

      </div>

    </main>
  );
}


function About() {
  return (
    <main className="page">

      <div className="about-hero">

        <label>ABOUT THAPAR TRADE</label>

        <h1>
          The campus marketplace,
          redesigned.
        </h1>

        <p>
          Thapar Trade is a Software Engineering project focused
          on making peer-to-peer buying, selling and exchange
          within the Thapar community easier to discover,
          manage and organise.
        </p>

      </div>


      <div className="about-grid">

        <div>
          <span>01</span>
          <h2>Trust-first</h2>
          <p>
            Thapar-only account access and community-focused
            exchange create a relevant marketplace.
          </p>
        </div>

        <div>
          <span>02</span>
          <h2>Useful by design</h2>
          <p>
            Search, categories, listing status and profiles
            keep the workflow simple.
          </p>
        </div>

        <div>
          <span>03</span>
          <h2>Campus-local</h2>
          <p>
            Local pickup reduces friction and makes everyday
            student-to-student exchange convenient.
          </p>
        </div>

      </div>

    </main>
  );
}


function Footer({navigate}) {
  return (
    <footer>

      <div className="footer-main">

        <div>

          <button
            className="footer-brand"
            onClick={() => navigate("docs")}
          >
            <span className="brand-icon">TT</span>
            <strong>Thapar Trade</strong>
          </button>

          <p>
            A campus-first marketplace for the Thapar community.
          </p>

        </div>


        <div className="footer-links">

          <div>
            <b>Marketplace</b>
            <button onClick={() => navigate("marketplace")}>
              Browse items
            </button>
            <button onClick={() => navigate("guide")}>
              How it works
            </button>
          </div>

          <div>
            <b>Account</b>
            <button onClick={() => navigate("auth")}>
              Login
            </button>
            <button onClick={() => navigate("auth")}>
              Create account
            </button>
          </div>

          <div>
            <b>Project</b>
            <button onClick={() => navigate("docs")}>
              Documentation
            </button>
            <span>Software Engineering MVP</span>
          </div>

        </div>

      </div>


      <div className="footer-bottom">
        <span>© 2026 Thapar Trade</span>
        <span>Built for campus exchange.</span>
      </div>

    </footer>
  );
}

export default App;
