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
  const [cart,setCart] = useState(() => JSON.parse(localStorage.getItem("tt_cart") || "[]"));
  const [orders,setOrders] = useState(() => JSON.parse(localStorage.getItem("tt_orders") || "[]"));
  const [payments,setPayments] = useState(() => JSON.parse(localStorage.getItem("tt_payments") || "[]"));
  const [reviews,setReviews] = useState(() => JSON.parse(localStorage.getItem("tt_reviews") || "[]"));
  const [reports,setReports] = useState(() => JSON.parse(localStorage.getItem("tt_reports") || "[]"));
  const [editing,setEditing] = useState(null);
  const [checkoutItems,setCheckoutItems] = useState([]);

  useEffect(() => localStorage.setItem("tt_user",JSON.stringify(user)),[user]);
  useEffect(() => localStorage.setItem("tt_listings",JSON.stringify(listings)),[listings]);
  useEffect(() => localStorage.setItem("tt_favorites",JSON.stringify(favorites)),[favorites]);
  useEffect(() => localStorage.setItem("tt_cart",JSON.stringify(cart)),[cart]);
  useEffect(() => localStorage.setItem("tt_orders",JSON.stringify(orders)),[orders]);
  useEffect(() => localStorage.setItem("tt_payments",JSON.stringify(payments)),[payments]);
  useEffect(() => localStorage.setItem("tt_reviews",JSON.stringify(reviews)),[reviews]);
  useEffect(() => localStorage.setItem("tt_reports",JSON.stringify(reports)),[reports]);

  const notify = message => {
    setToast(message);
    window.clearTimeout(window.__ttToast);
    window.__ttToast = window.setTimeout(() => setToast(""),2500);
  };

  const navigate = next => {
    setPage(next);
    setSelected(null);
    setEditing(null);
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

  const requireUser = action => {
    if (!user) {
      openAuth("login");
      notify("Please sign in with your @thapar.edu account first.");
      return false;
    }
    action?.();
    return true;
  };

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter(item => {
      const matchesCategory = category === "All" || item.category === category;
      const haystack = `${item.title} ${item.category} ${item.location} ${item.seller} ${item.description}`.toLowerCase();
      return item.status !== "hidden" && matchesCategory && (!q || haystack.includes(q));
    });
  },[listings,query,category]);

  const publishListing = item => {
    const newItem = {
      ...item,
      id:Date.now(),
      sellerId:user?.id,
      seller:user?.name || "You",
      status:"available",
      createdAt:new Date().toISOString(),
      emoji:CATEGORY_ICONS[item.category] || "📦"
    };
    setListings(prev => [newItem,...prev]);
    navigate("prototype-profile");
    notify("Listing published successfully.");
  };

  const updateListing = item => {
    setListings(prev => prev.map(x => x.id === item.id ? {...x,...item} : x));
    navigate("prototype-profile");
    notify("Listing updated successfully.");
  };

  const deleteListing = id => {
    setListings(prev => prev.filter(x => x.id !== id));
    setCart(prev => prev.filter(x => x.id !== id));
    notify("Listing deleted.");
  };

  const toggleFavorite = id => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev,id]);
    notify(favorites.includes(id) ? "Removed from saved items." : "Saved to your favorites.");
  };

  const addToCart = item => {
    if (!requireUser()) return;
    if (item.sellerId && item.sellerId === user.id) {
      notify("You cannot buy your own listing.");
      return;
    }
    if (item.status === "sold") {
      notify("This listing is already sold.");
      return;
    }
    setCart(prev => {
      const found = prev.find(x => x.id === item.id);
      return found ? prev.map(x => x.id === item.id ? {...x,quantity:Math.min(5,x.quantity+1)} : x) : [...prev,{...item,quantity:1}];
    });
    notify("Added to cart.");
  };

  const removeFromCart = id => setCart(prev => prev.filter(x => x.id !== id));
  const changeQuantity = (id,quantity) => setCart(prev => prev.map(x => x.id === id ? {...x,quantity:Math.max(1,Math.min(5,quantity))} : x));

  const beginCheckout = items => {
    if (!requireUser()) return;
    if (!items.length) { notify("Your cart is empty."); return; }
    setCheckoutItems(items);
    navigate("checkout");
  };

  const placeOrder = ({paymentMethod,pickupLocation}) => {
    const items = checkoutItems;
    if (!user || !items.length) return;
    const orderId = `TT-${Date.now().toString().slice(-8)}`;
    const total = items.reduce((sum,item) => sum + Number(item.price)*Number(item.quantity || 1),0);
    const payment = {
      id:`PAY-${Date.now().toString().slice(-8)}`,
      orderId,
      userId:user.id,
      amount:total,
      method:paymentMethod,
      status:"success",
      createdAt:new Date().toISOString()
    };
    const order = {
      id:orderId,
      buyerId:user.id,
      buyer:user.name,
      items:items.map(item => ({...item,quantity:item.quantity || 1})),
      total,
      pickupLocation,
      paymentId:payment.id,
      paymentMethod,
      status:"placed",
      createdAt:new Date().toISOString(),
      timeline:[
        {status:"placed",label:"Order placed",at:new Date().toISOString()},
        {status:"paid",label:"Payment confirmed",at:new Date().toISOString()}
      ]
    };
    setPayments(prev => [payment,...prev]);
    setOrders(prev => [order,...prev]);
    setListings(prev => prev.map(item => items.some(x => x.id === item.id) ? {...item,status:"sold"} : item));
    setCart(prev => prev.filter(x => !items.some(i => i.id === x.id)));
    setCheckoutItems([]);
    navigate("orders");
    notify(`Payment successful. Order ${orderId} created.`);
  };

  const updateOrderStatus = (orderId,status) => {
    const labels = {processing:"Seller processing",ready:"Ready for pickup",completed:"Completed",cancelled:"Cancelled"};
    setOrders(prev => prev.map(order => order.id === orderId ? {...order,status,timeline:[...(order.timeline || []),{status,label:labels[status] || status,at:new Date().toISOString()}]} : order));
    notify("Order status updated.");
  };

  const submitReview = (orderId,rating,comment) => {
    const order = orders.find(x => x.id === orderId);
    if (!order || !user) return;
    setReviews(prev => [...prev,{id:Date.now(),orderId,userId:user.id,user:user.name,rating,comment,createdAt:new Date().toISOString()}]);
    notify("Review submitted.");
  };

  const submitReport = (target,reason) => {
    if (!user) return openAuth("login");
    setReports(prev => [{id:Date.now(),reporterId:user.id,reporter:user.name,targetId:target.id,targetType:target.type,targetTitle:target.title,reason,status:"open",createdAt:new Date().toISOString()},...prev]);
    notify("Report submitted to admin moderation.");
  };

  const isAdmin = user?.email === "admin@thapar.edu" || user?.role === "admin";

  return (
    <div className="app">
      <DocumentationHeader page={page} navigate={navigate} user={user} openAuth={openAuth} logout={logout} cartCount={cart.reduce((s,x)=>s+(x.quantity||1),0)} isAdmin={isAdmin}/>

      {page === "docs" && <DocumentationHome navigate={navigate}/>} 
      {page === "prototype" && <PrototypeHome query={query} setQuery={setQuery} navigate={navigate} setCategory={setCategory} listings={listings}/>} 
      {page === "marketplace" && <Marketplace listings={filteredListings} query={query} setQuery={setQuery} category={category} setCategory={setCategory} favorites={favorites} toggleFavorite={toggleFavorite} onOpen={setSelected} navigate={navigate} onAddToCart={addToCart}/>} 
      {page === "auth" && <Auth mode={authMode} setMode={setAuthMode} onSuccess={account => {setUser(account);navigate("prototype");notify("Welcome to Thapar Trade.");}}/>}
      {page === "sell" && user && <Sell onCancel={()=>navigate("marketplace")} onPublish={publishListing}/>} 
      {page === "prototype-profile" && user && <Profile user={user} listings={listings.filter(x => x.sellerId === user.id || x.seller === user.name)} navigate={navigate} onOpen={setSelected} onEdit={setEditing} onDelete={deleteListing} orders={orders}/>} 
      {page === "favorites" && <Favorites listings={listings.filter(x => favorites.includes(x.id))} onOpen={setSelected} navigate={navigate}/>} 
      {page === "cart" && <CartPage cart={cart} removeFromCart={removeFromCart} changeQuantity={changeQuantity} beginCheckout={beginCheckout} navigate={navigate}/>} 
      {page === "checkout" && user && <CheckoutPage items={checkoutItems} onBack={()=>navigate("cart")} onPlaceOrder={placeOrder}/>} 
      {page === "orders" && user && <OrdersPage orders={orders.filter(x=>x.buyerId===user.id || x.items.some(i=>i.sellerId===user.id))} user={user} navigate={navigate} onTrack={order=>{setSelected(order);navigate("tracking")}} onReview={submitReview}/>} 
      {page === "tracking" && user && <TrackingPage order={selected} onBack={()=>navigate("orders")} onStatus={updateOrderStatus} isAdmin={isAdmin}/>} 
      {page === "admin" && isAdmin && <AdminPortal listings={listings} setListings={setListings} orders={orders} updateOrderStatus={updateOrderStatus} payments={payments} reviews={reviews} reports={reports} setReports={setReports} users={[user]} notify={notify}/>} 
      {page === "guide" && <Guide navigate={navigate}/>} 
      {page === "about" && <About/>}

      {editing && <EditListingModal item={editing} onClose={()=>setEditing(null)} onSave={updateListing}/>} 
      {selected && page !== "tracking" && selected.items ? <TrackingPage order={selected} onBack={()=>{setSelected(null);navigate("orders")}} onStatus={updateOrderStatus} isAdmin={isAdmin}/> : null}
      {selected && !selected.items && <ListingModal item={selected} favorite={favorites.includes(selected.id)} toggleFavorite={()=>toggleFavorite(selected.id)} onClose={()=>setSelected(null)} onAddToCart={()=>{addToCart(selected);setSelected(null)}} onContact={()=>{setSelected(null);requireUser(()=>notify("Seller contact request created. Use the seller details and campus pickup location to coordinate."));}} onReport={(reason)=>submitReport({id:selected.id,type:"listing",title:selected.title},reason)}/>} 
      {toast && <div className="toast">{toast}</div>}
      {page !== "docs" && <Footer navigate={navigate}/>} 
    </div>
  );
}

/* =========================================================
   DOCUMENTATION HEADER
========================================================= */

function DocumentationHeader({page,navigate,user,openAuth,logout,cartCount,isAdmin}) {
  return (
    <header className="doc-header">
      <div className="doc-header-inner">
        <button className="doc-brand" onClick={() => navigate("docs")}><span className="doc-logo">TT</span><span>Thapar <b>Trade</b></span></button>
        <nav className="doc-nav">
          <button className={page === "docs" ? "active" : ""} onClick={() => navigate("docs")}>Documentation</button>
          <button className={page === "prototype" ? "active" : ""} onClick={() => navigate("prototype")}>Interactive Prototype</button>
          <button className={page === "marketplace" ? "active" : ""} onClick={() => navigate("marketplace")}>Marketplace</button>
          {user && <button className={page === "orders" ? "active" : ""} onClick={() => navigate("orders")}>Orders</button>}
          {user && <button className={page === "cart" ? "active" : ""} onClick={() => navigate("cart")}>Cart ({cartCount})</button>}
        </nav>
        <div className="doc-header-right">
          {user ? <>
            {isAdmin && <button className="header-user" onClick={() => navigate("admin")}>Admin</button>}
            <button className="header-user" onClick={() => navigate("prototype-profile")}>{user.name.split(" ")[0]}</button>
            <button className="header-login" onClick={logout}>Logout</button>
          </> : <button className="header-login" onClick={() => openAuth("login")}>Login</button>}
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
              The completed prototype extends that marketplace into a full
              campus transaction workflow: cart management, checkout,
              simulated payment, order creation, order tracking, reviews,
              reporting and administrator moderation are included alongside
              listing and profile management.
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

              <Capability icon="👤" title="User Profiles" text="Personal profiles provide an overview of listings, favourites and order activity associated with an account." />
              <Capability icon="🔐" title="Thapar Authentication" text="Registration and login require an official @thapar.edu email address." />
              <Capability icon="🛒" title="Cart & Checkout" text="Users can add listings to a cart, adjust quantities and complete a structured campus pickup checkout." />
              <Capability icon="💳" title="Payment Processing" text="The prototype records a simulated successful payment with payment method, amount and transaction identifier." />
              <Capability icon="📦" title="Order Tracking" text="Orders move through placed, paid, processing, ready-for-pickup and completed states." />
              <Capability icon="⭐" title="Reviews & Feedback" text="Completed purchases can receive ratings and comments for the campus community." />
              <Capability icon="⚑" title="Reporting" text="Users can report suspicious, prohibited, misleading or duplicate listings for moderation." />
              <Capability icon="🛡️" title="Admin Management" text="An administrator dashboard provides listing moderation, order status, payment, review and report management." />

            </div>
          </section>


          <section id="architecture" className="doc-section">
            <div className="section-number">04</div>
            <h2>System Architecture & Data Flow</h2>

            <p className="section-intro">
              The deployable prototype uses a client-side React architecture
              with browser-based persistence. An optional FastAPI + SQLite
              backend is included in the project for local full-stack
              demonstration.
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
                    filtering, authentication, listing management, favourites,
                    cart, checkout, orders, payments, tracking, reviews,
                    reports and admin moderation.
                  </p>
                </div>
              </div>

              <div className="architecture-arrow">↓</div>

              <div className="architecture-layer">
                <span>03</span>
                <div>
                  <b>Persistence Layer</b>
                  <p>
                    Browser localStorage stores users, listings, favourites,
                    cart contents, orders, payments, reviews and reports so
                    the complete prototype remains usable without a server.
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
                <strong>FastAPI + SQLite</strong>
                <span>Optional local backend for users, listings, orders, payments, reviews and reports</span>
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
                  Explore the complete working prototype: search listings,
                  create an account, publish and edit items, save favourites,
                  add products to cart, checkout, simulate payment, track orders,
                  submit reviews and report listings.
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
                <b>Order</b>
                <p>Add the item to cart and complete the campus checkout.</p>
              </div>

              <div>
                <span>04</span>
                <b>Track & Review</b>
                <p>Track fulfilment, complete pickup and submit feedback.</p>
              </div>

            </div>
          </section>


         <section id="deliverables" className="doc-section">
  <div className="section-number">07</div>

  <h2>Formal Software Engineering Deliverables</h2>

  <p className="section-intro">
    The following engineering artefacts document the analysis,
    design and implementation of the Thapar Trade system.
  </p>

  <div className="deliverables-table">

    <Deliverable title="ER Diagram" file="ER_diagram.png" />
    <Deliverable title="UML Activity Diagram" file="Activity_diagram.jpg" />
    <Deliverable title="UML Class Diagram" file="Class-diagram.png" />
    <Deliverable title="UML Collaboration Diagram" file="Collaboration-diagram.png" />
    <Deliverable title="UML Sequence Diagram" file="Sequence-diagram.png" />
    <Deliverable title="UML Deployment Diagram" file="Deployment-Diagram.png" />
    <Deliverable title="Data Flow Diagram — Level 0" file="DFD_level0.png" />
    <Deliverable title="Data Flow Diagram — Level 1" file="DFD_level1.png" />
    <Deliverable title="UML Use Case Diagram" file="User_case_diagram.png" />
    <Deliverable title="Software Engineering Presentation (Keynote)" file="SE_presentation.key" />

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
                title="Complete Frontend Prototype"
                text="Implement marketplace navigation, authentication, listings, profiles, favourites, cart, checkout, payments, orders, tracking, reviews, reports and admin moderation."
              />

              <RoadmapItem
                phase="Phase 04"
                title="Testing & Evaluation"
                text="Validate marketplace search, authentication, listing CRUD, cart and checkout, order lifecycle, tracking, reviews, reports and administrator workflows."
              />

              <RoadmapItem
                phase="Phase 05"
                title="Backend & Production Expansion"
                text="An optional FastAPI + SQLite backend is included for local full-stack demonstration. Future work can replace the demo payment and local persistence with production services."
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
        href={`${process.env.PUBLIC_URL || ""}/docs/${encodeURIComponent(file)}`}
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
  navigate,
  onAddToCart
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
            onAddToCart={onAddToCart}
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


function ListingCard({item,favorite,toggleFavorite,onOpen,preview,onAddToCart}) {
  return (
    <article className="listing-card" onClick={onOpen}>
      <div className="listing-image">
        <span className="product-emoji">{item.emoji || CATEGORY_ICONS[item.category] || "📦"}</span>
        {!preview && <span className="available">{item.status === "sold" ? "SOLD" : "AVAILABLE"}</span>}
        {!preview && <button className="heart" onClick={e=>{e.stopPropagation();toggleFavorite?.();}}>{favorite ? "♥" : "♡"}</button>}
      </div>
      <div className="listing-info">
        <span className="category-label">{item.category}</span>
        <h3>{item.title}</h3>
        <div className="card-price">{formatPrice(item.price)}</div>
        <div className="card-meta"><span>{item.condition}</span><i>•</i><span>{item.location}</span></div>
        <div className="seller-line">Seller: {item.seller}</div>
        {onAddToCart && item.status !== "sold" && <button className="card-cart-button" onClick={e=>{e.stopPropagation();onAddToCart(item);}}>＋ Add to cart</button>}
      </div>
    </article>
  );
}

function ListingModal({item,favorite,toggleFavorite,onClose,onAddToCart,onContact,onReport}) {
  const [showReport,setShowReport] = useState(false);
  const [reason,setReason] = useState("Misleading or incorrect listing");
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="listing-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-image">{item.emoji || CATEGORY_ICONS[item.category] || "📦"}</div>
        <div className="modal-category">{item.category}</div>
        <h2>{item.title}</h2>
        <div className="modal-price">{formatPrice(item.price)}</div>
        <p>{item.description}</p>
        <div className="detail-list">
          <div><span>Condition</span><b>{item.condition}</b></div>
          <div><span>Pickup</span><b>{item.location}</b></div>
          <div><span>Seller</span><b>{item.seller}</b></div>
          <div><span>Status</span><b>{item.status === "sold" ? "Sold" : "Available"}</b></div>
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={toggleFavorite}>{favorite ? "♥ Saved" : "♡ Save item"}</button>
          {item.status !== "sold" && <button className="primary" onClick={onAddToCart}>＋ Add to cart</button>}
          <button className="secondary" onClick={onContact}>Contact seller</button>
        </div>
        <button className="report-link" onClick={()=>setShowReport(v=>!v)}>⚑ Report listing</button>
        {showReport && <div className="report-box">
          <select value={reason} onChange={e=>setReason(e.target.value)}>
            <option>Misleading or incorrect listing</option><option>Prohibited item</option><option>Suspicious seller</option><option>Duplicate listing</option><option>Other</option>
          </select>
          <button className="primary" onClick={()=>{onReport(reason);setShowReport(false);}}>Submit report</button>
        </div>}
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


function Profile({user,listings,navigate,onOpen,onEdit,onDelete,orders}) {
  const sold = orders.filter(o => o.items.some(i=>i.sellerId === user.id) && ["completed","ready"].includes(o.status)).length;
  return (
    <main className="page">
      <div className="profile-header">
        <div className="profile-identity"><span className="avatar large">{user.name.slice(0,2).toUpperCase()}</span><div><label>MY ACCOUNT</label><h1>{user.name}</h1><p>{user.email}</p></div></div>
        <button className="primary" onClick={()=>navigate("sell")}>＋ New listing</button>
      </div>
      <div className="stats-row"><div><strong>{listings.length}</strong><span>Active listings</span></div><div><strong>{sold}</strong><span>Completed sales</span></div><div><strong>Verified</strong><span>Thapar community</span></div></div>
      <div className="profile-action-row"><button className="secondary" onClick={()=>navigate("favorites")}>♡ Favorites</button><button className="secondary" onClick={()=>navigate("orders")}>▣ My orders</button><button className="secondary" onClick={()=>navigate("cart")}>🛒 Cart</button></div>
      <div className="section-heading"><div><label>MY MARKETPLACE</label><h2>Your listings</h2></div></div>
      {listings.length ? <div className="listing-grid">{listings.map(item=><div className="managed-listing" key={item.id}><ListingCard item={item} onOpen={()=>onOpen(item)} preview/><div className="managed-actions"><button className="secondary" onClick={()=>onEdit(item)}>Edit</button><button className="danger-button" onClick={()=>{if(window.confirm("Delete this listing?"))onDelete(item.id)}}>Delete</button></div></div>)}</div> : <div className="empty"><div>＋</div><h2>No listings yet</h2><p>Start selling something useful to your campus community.</p><button className="primary" onClick={()=>navigate("sell")}>Create first listing</button></div>}
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



function CartPage({cart,removeFromCart,changeQuantity,beginCheckout,navigate}) {
  const total = cart.reduce((s,x)=>s+Number(x.price)*(x.quantity||1),0);
  return <main className="page"><div className="page-title"><div><label>SHOPPING CART</label><h1>Your cart</h1><p>Review your selected campus listings before checkout.</p></div><button className="secondary" onClick={()=>navigate("marketplace")}>Continue shopping</button></div>
    {cart.length ? <><div className="cart-layout"><div className="cart-list">{cart.map(item=><div className="cart-item" key={item.id}><div className="cart-icon">{item.emoji}</div><div className="cart-info"><b>{item.title}</b><span>{item.seller} · {item.location}</span><small>{formatPrice(item.price)} each</small></div><div className="qty-control"><button onClick={()=>changeQuantity(item.id,(item.quantity||1)-1)}>-</button><b>{item.quantity||1}</b><button onClick={()=>changeQuantity(item.id,(item.quantity||1)+1)}>+</button></div><strong>{formatPrice(Number(item.price)*(item.quantity||1))}</strong><button className="icon-danger" onClick={()=>removeFromCart(item.id)}>×</button></div>)}</div><aside className="summary-card"><label>ORDER SUMMARY</label><h2>{formatPrice(total)}</h2><p>{cart.length} product{cart.length===1?"":"s"} · campus pickup</p><button className="primary full" onClick={()=>beginCheckout(cart)}>Proceed to checkout →</button></aside></div></> : <div className="empty"><div>🛒</div><h2>Your cart is empty</h2><p>Add listings from the marketplace to start an order.</p><button className="primary" onClick={()=>navigate("marketplace")}>Browse marketplace</button></div>}
  </main>;
}

function CheckoutPage({items,onBack,onPlaceOrder}) {
  const [method,setMethod]=useState("UPI / Demo payment");
  const [pickup,setPickup]=useState("Thapar Main Gate");
  const [confirmed,setConfirmed]=useState(false);
  const total=items.reduce((s,x)=>s+Number(x.price)*(x.quantity||1),0);
  if(!items.length) return <main className="page"><div className="empty"><h2>No items selected</h2><button className="primary" onClick={onBack}>Back to cart</button></div></main>;
  return <main className="page"><button className="back-button" onClick={onBack}>← Back to cart</button><div className="page-title"><div><label>CHECKOUT</label><h1>Complete your order</h1><p>Academic prototype checkout with simulated payment confirmation.</p></div><span className="secure-badge">✓ Secure demo payment</span></div><div className="checkout-layout"><section className="checkout-card"><h2>Pickup details</h2><label>Pickup location<select value={pickup} onChange={e=>setPickup(e.target.value)}><option>Thapar Main Gate</option><option>Hostel Area</option><option>Library</option><option>Student Activity Centre</option></select></label><h2>Payment method</h2><div className="payment-options">{["UPI / Demo payment","Card / Demo payment","Cash on campus"].map(x=><button key={x} className={method===x?"payment-option selected":"payment-option"} onClick={()=>setMethod(x)}><b>{x}</b><span>{x==="Cash on campus"?"Pay during campus handover":"Simulated successful transaction"}</span></button>)}</div><label className="confirm-check"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> I confirm the item details and campus pickup arrangement.</label></section><aside className="summary-card"><label>ORDER SUMMARY</label>{items.map(i=><div className="summary-line" key={i.id}><span>{i.title} × {i.quantity||1}</span><b>{formatPrice(Number(i.price)*(i.quantity||1))}</b></div>)}<hr/><div className="summary-total"><span>Total</span><strong>{formatPrice(total)}</strong></div><button className="primary full" disabled={!confirmed} onClick={()=>onPlaceOrder({paymentMethod:method,pickupLocation:pickup})}>Confirm order & pay →</button></aside></div></main>;
}

function OrdersPage({orders,user,navigate,onTrack,onReview}) {
  const [reviewing,setReviewing]=useState(null);
  const myOrders=orders;
  return <main className="page"><div className="page-title"><div><label>ORDER MANAGEMENT</label><h1>Orders</h1><p>Track purchases, seller fulfilment and completed exchanges.</p></div><button className="secondary" onClick={()=>navigate("marketplace")}>Browse marketplace</button></div>{myOrders.length ? <div className="order-list">{myOrders.map(order=><OrderCard key={order.id} order={order} user={user} onTrack={()=>onTrack(order)} onReview={()=>setReviewing(order)}/>)}</div> : <div className="empty"><div>▣</div><h2>No orders yet</h2><p>Your purchases and sales will appear here.</p><button className="primary" onClick={()=>navigate("marketplace")}>Find an item</button></div>}{reviewing&&<ReviewModal order={reviewing} onClose={()=>setReviewing(null)} onSubmit={(r,c)=>{onReview(reviewing.id,r,c);setReviewing(null)}}/>}</main>;
}

function OrderCard({order,user,onTrack,onReview}) {
  const isSeller=order.items.some(i=>i.sellerId===user.id);
  return <article className="order-card"><div className="order-top"><div><label>ORDER {order.id}</label><h2>{order.items.map(i=>i.title).join(", ")}</h2><p>{new Date(order.createdAt).toLocaleString("en-IN")} · {order.pickupLocation}</p></div><span className={`status-pill status-${order.status}`}>{order.status}</span></div><div className="order-items">{order.items.map(i=><div key={i.id}><span>{i.emoji} {i.title} × {i.quantity}</span><b>{formatPrice(Number(i.price)*(i.quantity||1))}</b></div>)}</div><div className="order-bottom"><strong>{formatPrice(order.total)}</strong><span>{isSeller?"Seller view":"Buyer view"} · {order.paymentMethod}</span><div><button className="secondary" onClick={onTrack}>Track order</button>{order.status==="completed"&&!isSeller&&<button className="primary" onClick={onReview}>Leave review</button>}</div></div></article>;
}

function TrackingPage({order,onBack,onStatus,isAdmin}) {
  if(!order) return <main className="page"><div className="empty"><h2>Select an order first</h2><button className="primary" onClick={onBack}>Back to orders</button></div></main>;
  const steps=["placed","paid","processing","ready","completed"];
  const current=Math.max(0,steps.indexOf(order.status));
  return <main className="page"><button className="back-button" onClick={onBack}>← Back to orders</button><div className="page-title"><div><label>ORDER TRACKING</label><h1>{order.id}</h1><p>{order.pickupLocation} · {formatPrice(order.total)}</p></div><span className={`status-pill status-${order.status}`}>{order.status}</span></div><div className="tracking-card"><div className="tracking-steps">{steps.map((s,i)=><div className={i<=current?"tracking-step done":"tracking-step"} key={s}><span>{i<=current?"✓":i+1}</span><b>{({placed:"Order placed",paid:"Payment confirmed",processing:"Seller processing",ready:"Ready for pickup",completed:"Completed"})[s]}</b></div>)}</div><div className="timeline">{(order.timeline||[]).slice().reverse().map((x,i)=><div key={i}><span>{new Date(x.at).toLocaleString("en-IN")}</span><b>{x.label}</b></div>)}</div>{isAdmin&&order.status!=="completed"&&order.status!=="cancelled"&&<div className="admin-status-controls"><button onClick={()=>onStatus(order.id,"processing")}>Processing</button><button onClick={()=>onStatus(order.id,"ready")}>Ready for pickup</button><button onClick={()=>onStatus(order.id,"completed")}>Completed</button></div>}</div></main>;
}

function ReviewModal({order,onClose,onSubmit}) {
  const [rating,setRating]=useState(5); const [comment,setComment]=useState("");
  return <div className="modal-backdrop" onClick={onClose}><div className="listing-modal review-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><div className="modal-category">ORDER REVIEW</div><h2>How was your experience?</h2><p>{order.items.map(i=>i.title).join(", ")}</p><div className="rating-picker">{[1,2,3,4,5].map(n=><button key={n} className={n<=rating?"rated":""} onClick={()=>setRating(n)}>★</button>)}</div><textarea rows="5" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share your feedback..."/><button className="primary full" onClick={()=>onSubmit(rating,comment)}>Submit review</button></div></div>;
}

function EditListingModal({item,onClose,onSave}) {
  const [form,setForm]=useState({...item}); const update=(k,v)=>setForm(f=>({...f,[k]:v}));
  return <div className="modal-backdrop" onClick={onClose}><div className="listing-modal edit-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><div className="modal-category">EDIT LISTING</div><h2>Update item</h2><div className="form-stack"><label>Title<input value={form.title} onChange={e=>update("title",e.target.value)}/></label><label>Price<input type="number" value={form.price} onChange={e=>update("price",e.target.value)}/></label><label>Category<select value={form.category} onChange={e=>update("category",e.target.value)}>{CATEGORIES.slice(1).map(c=><option key={c}>{c}</option>)}</select></label><label>Condition<select value={form.condition} onChange={e=>update("condition",e.target.value)}><option>Like New</option><option>Good</option><option>Fair</option></select></label><label>Location<input value={form.location} onChange={e=>update("location",e.target.value)}/></label><label>Description<textarea rows="5" value={form.description} onChange={e=>update("description",e.target.value)}/></label><button className="primary full" onClick={()=>onSave({...form,price:Number(form.price),emoji:CATEGORY_ICONS[form.category]||form.emoji})}>Save changes</button></div></div></div>;
}

function AdminPortal({listings,setListings,orders,updateOrderStatus,payments,reviews,reports,setReports,users,notify}) {
  const [tab,setTab]=useState("overview");
  const openReports=reports.filter(r=>r.status==="open").length;
  const hideListing=id=>{setListings(prev=>prev.map(x=>x.id===id?{...x,status:"hidden"}:x));notify("Listing hidden from marketplace.");};
  return <main className="page"><div className="page-title"><div><label>ADMIN MANAGEMENT</label><h1>Thapar Trade Admin</h1><p>Moderate users, listings, orders, payments and reports.</p></div><span className="admin-badge">ADMIN</span></div><div className="admin-tabs">{[["overview","Overview"],["listings","Listings"],["orders","Orders"],["payments","Payments"],["reports","Reports"],["reviews","Reviews"]].map(([id,label])=><button className={tab===id?"active":""} key={id} onClick={()=>setTab(id)}>{label}</button>)}</div>{tab==="overview"&&<div className="admin-stat-grid"><div><strong>{users.length}</strong><span>Current users</span></div><div><strong>{listings.length}</strong><span>Total listings</span></div><div><strong>{orders.length}</strong><span>Total orders</span></div><div><strong>{payments.length}</strong><span>Payments</span></div><div><strong>{reviews.length}</strong><span>Reviews</span></div><div><strong>{openReports}</strong><span>Open reports</span></div></div>}{tab==="listings"&&<div className="admin-table">{listings.map(x=><div className="admin-row" key={x.id}><span>{x.emoji} <b>{x.title}</b><small>{x.seller} · {formatPrice(x.price)}</small></span><span className={`status-pill status-${x.status||"available"}`}>{x.status||"available"}</span><button className="danger-button" onClick={()=>hideListing(x.id)}>Hide</button></div>)}</div>}{tab==="orders"&&<div className="admin-table">{orders.map(o=><div className="admin-row" key={o.id}><span><b>{o.id}</b><small>{o.buyer} · {formatPrice(o.total)}</small></span><span className={`status-pill status-${o.status}`}>{o.status}</span><select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}><option value="placed">placed</option><option value="processing">processing</option><option value="ready">ready</option><option value="completed">completed</option><option value="cancelled">cancelled</option></select></div>)}</div>}{tab==="payments"&&<div className="admin-table">{payments.map(p=><div className="admin-row" key={p.id}><span><b>{p.id}</b><small>{p.orderId} · {p.method}</small></span><strong>{formatPrice(p.amount)}</strong><span className="status-pill status-completed">{p.status}</span></div>)}</div>}{tab==="reports"&&<div className="admin-table">{reports.length?reports.map(r=><div className="admin-row" key={r.id}><span><b>{r.targetTitle}</b><small>{r.reporter} · {r.reason}</small></span><span className={`status-pill status-${r.status}`}>{r.status}</span><button className="secondary" onClick={()=>setReports(prev=>prev.map(x=>x.id===r.id?{...x,status:"resolved"}:x))}>Resolve</button></div>):<div className="empty"><h2>No reports</h2></div>}</div>}{tab==="reviews"&&<div className="admin-table">{reviews.length?reviews.map(r=><div className="admin-row" key={r.id}><span><b>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</b><small>{r.user} · {r.comment||"No comment"}</small></span><span>{r.orderId}</span></div>):<div className="empty"><h2>No reviews yet</h2></div>}</div>}</main>;
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