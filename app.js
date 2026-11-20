/* =========================================
   SUPAPASS DU
   MULTI-PAGE NAVIGATION + DATABASE
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const BASE = "/SupaPass-DU";

    /* =========================================
       GET HTML ELEMENTS
    ========================================= */

    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const eventGrid = document.getElementById("eventsGrid");
    const emptyState = document.getElementById("emptyState");
    const eventDetailsContent = document.getElementById("eventDetailsContent");

    const categoryButtons = document.querySelectorAll(".category-card");
    const quickLinkButtons = document.querySelectorAll(".quick-link");

    const schoolFilter = document.getElementById("schoolFilter");
    const typeFilter = document.getElementById("typeFilter");
    const categoryFilter = document.getElementById("categoryFilter");

    const resetSearch = document.getElementById("resetSearch");
    const resetEmptyState = document.getElementById("resetEmptyState");

    /* VERTICAL SLIDE-OUT MENU DRAWER */
    const menuToggleBtn = document.getElementById("menuToggleBtn");
    const drawerCloseBtn = document.getElementById("drawerCloseBtn");
    const navDrawer = document.getElementById("navDrawer");
    const navDrawerBackdrop = document.getElementById("navDrawerBackdrop");

    let loadedEventsMap = {};

    /* =========================================
       HELPER: SAFELY DISPLAY TEXT
    ========================================= */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            const characters = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };
            return characters[character];
        });
    }

    /* =========================================
       VERTICAL MENU DRAWER CONTROLS
    ========================================= */

    function openMenuDrawer() {
        if (navDrawer) {
            navDrawer.classList.add("open");
            navDrawer.setAttribute("aria-hidden", "false");
        }
        if (navDrawerBackdrop) {
            navDrawerBackdrop.classList.add("open");
        }
        if (menuToggleBtn) {
            menuToggleBtn.setAttribute("aria-expanded", "true");
        }
    }

    function closeMenuDrawer() {
        if (navDrawer) {
            navDrawer.classList.remove("open");
            navDrawer.setAttribute("aria-hidden", "true");
        }
        if (navDrawerBackdrop) {
            navDrawerBackdrop.classList.remove("open");
        }
        if (menuToggleBtn) {
            menuToggleBtn.setAttribute("aria-expanded", "false");
        }
    }

    if (menuToggleBtn) {
        menuToggleBtn.addEventListener("click", openMenuDrawer);
    }

    if (drawerCloseBtn) {
        drawerCloseBtn.addEventListener("click", closeMenuDrawer);
    }

    if (navDrawerBackdrop) {
        navDrawerBackdrop.addEventListener("click", closeMenuDrawer);
    }

    /* =========================================
       APPLY QUERY PARAMS ON events/events.html
    ========================================= */

    function applyUrlQueryFilters() {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        const cat = params.get("category");

        if (q && searchInput) {
            searchInput.value = q;
        }

        if (cat && categoryFilter) {
            const matchingOption = Array.from(categoryFilter.options).find(
                opt => opt.value.trim().toLowerCase() === cat.trim().toLowerCase()
            );
            if (matchingOption) {
                categoryFilter.value = matchingOption.value;
            }
        }
    }

    /* =========================================
       LOAD EVENTS FROM DATABASE
    ========================================= */

    function loadEventsFromDatabase() {
        if (!eventGrid && !eventDetailsContent) {
            return;
        }

        applyUrlQueryFilters();

        fetch(`${BASE}/api/get_events.php`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Unable to retrieve events.");
                }
                return response.json();
            })
            .then(data => {
                if (!data.success || !Array.isArray(data.events)) {
                    console.error("Could not load events:", data.message);
                    return;
                }

                loadedEventsMap = {};
                data.events.forEach(event => {
                    loadedEventsMap[String(event.id)] = event;
                });

                if (eventDetailsContent) {
                    const params = new URLSearchParams(window.location.search);
                    const eventId = params.get("id");
                    renderEventDetailsPage(eventId);
                }

                if (eventGrid) {
                    eventGrid.innerHTML = "";

                    if (data.events.length === 0) {
                        if (emptyState) {
                            emptyState.classList.remove("hidden");
                        }
                        return;
                    }

                    data.events.forEach(event => {
                        eventGrid.appendChild(createEventCard(event));
                    });

                    filterEvents();
                }
            })
            .catch(error => {
                console.error("Error loading events:", error);
                if (emptyState) {
                    emptyState.classList.remove("hidden");
                }
            });
    }

    /* =========================================
       RENDER event_details/event_details.html
    ========================================= */

    function renderEventDetailsPage(eventId) {
        if (!eventDetailsContent) return;

        const eventData = loadedEventsMap[String(eventId)];
const norm = val => String(val ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ");
        if (!eventData) {
            eventDetailsContent.innerHTML = `
                <div class="dashboard-body" style="text-align: center; padding: 48px 24px;">
                    <h3>Event not found</h3>
                    <p style="margin: 10px 0 20px; color: var(--muted);">
                        The event you selected could not be found.
                    </p>
                    <a href="${BASE}/events/events.html" class="btn btn-primary">
                        <i class="fa-solid fa-calendar-days"></i>
                        Browse All Events
                    </a>
                </div>
            `;
            return;
        }

        eventDetailsContent.innerHTML = `
            <div class="dashboard-hero">
                <div>
                    <span class="event-category">${escapeHTML(eventData.category || "Campus Event")}</span>
                    <h1>${escapeHTML(eventData.title || "Untitled Event")}</h1>
                    <p>${escapeHTML(eventData.school_faculty || "Daystar University")}</p>
                </div>
                <button
                    type="button"
                    class="btn btn-light book-btn"
                    data-event-id="${escapeHTML(eventData.id)}">
                    <i class="fa-solid fa-ticket"></i>
                    Book Ticket Now
                </button>
            </div>

            <div class="dashboard-body">
                <h3>About This Event</h3>
                <p style="margin-top: 8px; color: var(--muted);">
                    ${escapeHTML(eventData.description || "Join us for this exciting Daystar University event.")}
                </p>

                <div class="dashboard-specs">
                    <div class="spec-box">
                        <small>Date</small>
                        <strong>${escapeHTML(eventData.event_date || "Date TBA")}</strong>
                    </div>
                    <div class="spec-box">
                        <small>Time</small>
                        <strong>${escapeHTML(eventData.event_time || "Time TBA")}</strong>
                    </div>
                    <div class="spec-box">
                        <small>Venue</small>
                        <strong>${escapeHTML(eventData.venue || "Venue TBA")}</strong>
                    </div>
                    <div class="spec-box">
                        <small>Event Type</small>
                        <strong>${escapeHTML(eventData.event_type || "General")}</strong>
                    </div>
                </div>

                <button
                    type="button"
                    class="btn btn-primary book-btn"
                    data-event-id="${escapeHTML(eventData.id)}">
                    <i class="fa-solid fa-ticket"></i>
                    Reserve Pass
                </button>
            </div>
        `;
    }

    /* =========================================
       CREATE EVENT CARD
    ========================================= */

    function createEventCard(event) {
        const article = document.createElement("article");
        article.className = "event-card";

        article.dataset.eventId = event.id || "";
        article.dataset.category = (event.category || "").trim();
        article.dataset.school = (event.school_faculty || "").trim();
        article.dataset.type = (event.event_type || "").trim();

        let icon = "fa-calendar-days";
        let imageClass = "tech";

        switch ((event.category || "").trim()) {
            case "Entertainment":
                icon = "fa-music";
                imageClass = "entertainment";
                break;
            case "Academic":
            case "Workshop":
                icon = "fa-graduation-cap";
                imageClass = "academic";
                break;
            case "Dinner":
                icon = "fa-utensils";
                imageClass = "social";
                break;
            case "Sports":
                icon = "fa-futbol";
                imageClass = "sports";
                break;
            case "Faith":
                icon = "fa-church";
                imageClass = "faith";
                break;
            case "Social":
                icon = "fa-users";
                imageClass = "social";
                break;
        }

        let day = "";
        let month = "";

        if (event.event_date) {
            const eventDate = new Date(event.event_date + "T00:00:00");
            if (!isNaN(eventDate.getTime())) {
                day = eventDate.getDate();
                month = eventDate.toLocaleString("en-US", { month: "short" });
            }
        }

        let formattedTime = "Time TBA";

        if (event.event_time) {
            const timeParts = event.event_time.split(":");
            let hour = parseInt(timeParts[0], 10);
            const minutes = timeParts[1] || "00";

            if (!isNaN(hour)) {
                const period = hour >= 12 ? "PM" : "AM";
                if (hour > 12) hour -= 12;
                if (hour === 0) hour = 12;
                formattedTime = `${hour}:${minutes} ${period}`;
            }
        }

        article.innerHTML = `
            <div class="event-image ${imageClass}">
                <span class="pill">${escapeHTML(event.category || "Event")}</span>
                <button class="save-btn icon-btn" aria-label="Save event" type="button">
                    <i class="fa-regular fa-heart"></i>
                </button>
                <i class="fa-solid ${icon} big-event-icon"></i>
            </div>

            <div class="event-content">
                <div class="date-box">
                    <strong>${escapeHTML(day)}</strong>
                    <span>${escapeHTML(month)}</span>
                </div>

                <div class="event-info">
                    <h3>${escapeHTML(event.title || "Untitled Event")}</h3>
                    <p>${escapeHTML(event.description || "Join us for this exciting Daystar event.")}</p>

                    <div class="event-meta">
                        <span><i class="fa-regular fa-clock"></i> ${escapeHTML(formattedTime)}</span>
                        <span><i class="fa-solid fa-location-dot"></i> ${escapeHTML(event.venue || "Venue TBA")}</span>
                    </div>

                    <div class="event-bottom">
                        <span class="price">Free</span>
                        <button class="book-btn btn btn-primary" type="button" data-event-id="${escapeHTML(event.id)}">
                            <i class="fa-solid fa-ticket"></i>
                            Book Ticket
                        </button>
                    </div>
                </div>
            </div>
        `;

        return article;
    }

    /* =========================================
       CARD CLICK -> OPEN event_details/event_details.html
    ========================================= */

    document.addEventListener("click", function (event) {
        if (event.target.closest(".book-btn") || event.target.closest(".save-btn")) {
            return;
        }

        const card = event.target.closest(".event-card");
        if (card && card.dataset.eventId) {
            window.location.href = `${BASE}/event_details/event_details.html?id=${encodeURIComponent(card.dataset.eventId)}`;
        }
    });

    /* =========================================
       FILTER EVENTS
    ========================================= */

    function filterEvents() {
        if (!eventGrid) return;

        const norm = val => String(val ?? "").trim().toLowerCase();

        const selectedSchool = schoolFilter ? schoolFilter.value : "All";
        const selectedType = typeFilter ? typeFilter.value : "All";
        const selectedCategory = categoryFilter ? categoryFilter.value : "All";
        const searchTerm = searchInput ? norm(searchInput.value) : "";

        const cards = document.querySelectorAll(".event-card");
        let visibleCount = 0;

        cards.forEach(card => {
            const school = card.dataset.school || "";
            const type = card.dataset.type || "";
            const category = card.dataset.category || "";
            const cardText = norm(card.textContent);

            const matchesSchool = norm(selectedSchool) === "all" || norm(school) === norm(selectedSchool);
            const matchesType = norm(selectedType) === "all" || norm(type) === norm(selectedType);
            const matchesCategory = norm(selectedCategory) === "all" || norm(category) === norm(selectedCategory);
            const matchesSearch = searchTerm === "" || cardText.includes(searchTerm);

            const shouldDisplay = matchesSchool && matchesType && matchesCategory && matchesSearch;
            card.style.display = shouldDisplay ? "" : "none";

            if (shouldDisplay) {
                visibleCount++;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("hidden", visibleCount > 0);
        }
    }

    [schoolFilter, typeFilter, categoryFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener("change", filterEvents);
        }
    });

    /* =========================================
       SEARCH -> OPENS events/events.html
    ========================================= */

    function performSearch(event) {
        if (event) {
            event.preventDefault();
        }

        const query = searchInput ? searchInput.value.trim() : "";

        if (eventGrid) {
            filterEvents();
            return;
        }

        const targetUrl = query
            ? `${BASE}/events/events.html?q=${encodeURIComponent(query)}`
            : `${BASE}/events/events.html`;
        window.location.href = targetUrl;
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", performSearch);
    }

    if (searchInput) {
        if (eventGrid) {
            searchInput.addEventListener("input", filterEvents);
        }

        searchInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                performSearch(event);
            }
        });
    }

    /* =========================================
       CATEGORY & QUICK LINKS -> OPENS events/events.html?category=...
    ========================================= */

    function goToCategoryEvents(categoryName) {
        if (!categoryName) return;

        if (eventGrid && categoryFilter) {
            categoryFilter.value = categoryName;
            if (schoolFilter) schoolFilter.value = "All";
            if (typeFilter) typeFilter.value = "All";
            filterEvents();
            return;
        }

        window.location.href = `${BASE}/events/events.html?category=${encodeURIComponent(categoryName)}`;
    }

    categoryButtons.forEach(category => {
        category.addEventListener("click", function (event) {
            event.preventDefault();
            goToCategoryEvents(this.dataset.category);
        });
    });

    quickLinkButtons.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            goToCategoryEvents(this.dataset.category);
        });
    });

    /* =========================================
       RESET FILTERS
    ========================================= */

    function resetAllFilters(event) {
        if (event) {
            event.preventDefault();
        }

        if (searchInput) searchInput.value = "";
        if (schoolFilter) schoolFilter.value = "All";
        if (typeFilter) typeFilter.value = "All";
        if (categoryFilter) categoryFilter.value = "All";

        filterEvents();
    }

    if (resetSearch) {
        resetSearch.addEventListener("click", resetAllFilters);
    }

    if (resetEmptyState) {
        resetEmptyState.addEventListener("click", resetAllFilters);
    }

    /* =========================================
       AUTH / ORGANIZER BUTTONS
    ========================================= */

    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = `${BASE}/auth/auth.html`;
        });
    }

    ["organizerBtn", "organizerCta"].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                window.location.href = `${BASE}/organizer/organizer.html`;
            });
        }
    });

    /* =========================================
       SAVE / HEART BUTTON
    ========================================= */

    document.addEventListener("click", function (event) {
        const saveButton = event.target.closest(".save-btn");
        if (!saveButton) return;

        event.preventDefault();
        event.stopPropagation();

        const icon = saveButton.querySelector("i");
        if (icon) {
            icon.classList.toggle("fa-regular");
            icon.classList.toggle("fa-solid");
            saveButton.setAttribute(
                "aria-label",
                icon.classList.contains("fa-solid")
                    ? "Remove saved event"
                    : "Save event"
            );
        }
    });

    /* =========================================
       BOOK TICKET BUTTON
    ========================================= */

    document.addEventListener("click", function (event) {
        const bookButton = event.target.closest(".book-btn");
        if (!bookButton) return;

        event.preventDefault();
        event.stopPropagation();

        const eventId = bookButton.dataset.eventId || "";
        showBookingForm(eventId);
    });

    /* =========================================
       SHOW BOOKING FORM
    ========================================= */

    function showBookingForm(eventId) {
        const modalRoot = document.getElementById("modalRoot");
        if (!modalRoot) {
            alert("Booking system is unavailable.");
            return;
        }

        modalRoot.innerHTML = `
            <div class="modal-overlay">
                <div class="modal">
                    <button class="modal-close" type="button" aria-label="Close booking form">
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                    <div class="modal-icon">
                        <i class="fa-solid fa-ticket"></i>
                    </div>

                    <h2>Book Your Ticket</h2>
                    <p>Enter your details to reserve your place at this event.</p>

                    <form id="bookingForm">
                        <div class="form-group">
                            <label for="studentName">Full Name</label>
                            <input type="text" id="studentName" required maxlength="100" placeholder="Enter your name">
                        </div>

                        <div class="form-group">
                            <label for="studentEmail">Email Address</label>
                            <input type="email" id="studentEmail" required maxlength="150" placeholder="Enter your email">
                        </div>

                        <input type="hidden" id="bookingEventId" value="${escapeHTML(eventId)}">

                        <button type="submit" class="btn btn-primary">
                            <i class="fa-solid fa-ticket"></i>
                            Continue
                        </button>
                    </form>

                    <div id="bookingMessage" class="form-message"></div>
                </div>
            </div>
        `;

        const closeButton = modalRoot.querySelector(".modal-close");
        if (closeButton) {
            closeButton.addEventListener("click", function (event) {
                event.preventDefault();
                modalRoot.innerHTML = "";
            });
        }

        const bookingForm = modalRoot.querySelector("#bookingForm");
        if (bookingForm) {
            bookingForm.addEventListener("submit", function (event) {
                event.preventDefault();
                submitBooking();
            });
        }
    }

    /* =========================================
       GET EVENT INFORMATION
    ========================================= */

    function getEventCard(eventId) {
        const buttons = document.querySelectorAll(".book-btn");
        for (const button of buttons) {
            if (button.dataset.eventId === String(eventId)) {
                return button.closest(".event-card");
            }
        }
        return null;
    }

    function getEventTitle(eventId) {
        if (loadedEventsMap[String(eventId)]?.title) {
            return loadedEventsMap[String(eventId)].title;
        }
        const card = getEventCard(eventId);
        const title = card ? card.querySelector("h3") : null;
        return title ? title.textContent.trim() : "SupaPass DU Event";
    }

    function getEventDate(eventId) {
        if (loadedEventsMap[String(eventId)]?.event_date) {
            return loadedEventsMap[String(eventId)].event_date;
        }
        const card = getEventCard(eventId);
        if (!card) return "Date TBA";
        const day = card.querySelector(".date-box strong");
        const month = card.querySelector(".date-box span");
        if (!day || !month) return "Date TBA";
        return `${day.textContent.trim()} ${month.textContent.trim()}`;
    }

    function getEventTime(eventId) {
        if (loadedEventsMap[String(eventId)]?.event_time) {
            return loadedEventsMap[String(eventId)].event_time;
        }
        const card = getEventCard(eventId);
        if (!card) return "Time TBA";
        const time = card.querySelector(".event-meta span");
        if (!time) return "Time TBA";
        return time.textContent.replace(/\s+/g, " ").trim();
    }

    function getEventVenue(eventId) {
        if (loadedEventsMap[String(eventId)]?.venue) {
            return loadedEventsMap[String(eventId)].venue;
        }
        const card = getEventCard(eventId);
        if (!card) return "Venue TBA";
        const venue = card.querySelectorAll(".event-meta span")[1];
        if (!venue) return "Venue TBA";
        return venue.textContent.replace(/\s+/g, " ").trim();
    }

    /* =========================================
       SUBMIT BOOKING
    ========================================= */

    function submitBooking() {
        const nameInput = document.getElementById("studentName");
        const emailInput = document.getElementById("studentEmail");
        const eventIdInput = document.getElementById("bookingEventId");
        const message = document.getElementById("bookingMessage");
        const submitButton = document.querySelector("#bookingForm button[type='submit']");

        if (!nameInput || !emailInput || !eventIdInput || !message) {
            alert("The booking form could not be loaded correctly.");
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const eventId = eventIdInput.value;

        if (!name || !email || !eventId) {
            message.textContent = "Please fill in all the required fields.";
            return;
        }

        let loggedInUser = null;
        try {
            loggedInUser = JSON.parse(localStorage.getItem("supaPassUser"));
        } catch (error) {
            console.error("Could not read login information:", error);
        }

        if (!loggedInUser || !loggedInUser.id) {
            alert("Please sign in before booking an event.");
            window.location.href = `${BASE}/auth/auth.html`;
            return;
        }

        const formData = new URLSearchParams();
        formData.append("user_id", loggedInUser.id);
        formData.append("event_id", eventId);

        message.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Booking your ticket...';
        if (submitButton) {
            submitButton.disabled = true;
        }

        fetch(`${BASE}/api/book_event.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData.toString()
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Server returned an error.");
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showBookingSuccess({
                    ...data,
                    student_name: name,
                    student_email: email,
                    event_title: getEventTitle(eventId),
                    event_date: getEventDate(eventId),
                    event_time: getEventTime(eventId),
                    event_venue: getEventVenue(eventId)
                });
            } else {
                message.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${escapeHTML(data.message || "Booking failed.")}`;
                if (submitButton) {
                    submitButton.disabled = false;
                }
            }
        })
        .catch(error => {
            console.error("Booking error:", error);
            message.textContent = "Something went wrong while booking. Please try again.";
            if (submitButton) {
                submitButton.disabled = false;
            }
        });
    }

    /* =========================================
       BOOKING SUCCESS - DIGITAL TICKET
    ========================================= */

    function showBookingSuccess(data) {
        const modalRoot = document.getElementById("modalRoot");
        if (!modalRoot) return;

        const ticketNumber = escapeHTML(data.ticket_number || "Generated");
        const studentName = escapeHTML(data.student_name || "Student");
        const eventTitle = escapeHTML(data.event_title || "SupaPass DU Event");
        const eventDate = escapeHTML(data.event_date || "Date TBA");
        const eventTime = escapeHTML(data.event_time || "Time TBA");
        const eventVenue = escapeHTML(data.event_venue || "Venue TBA");

        modalRoot.innerHTML = `
            <div class="modal-overlay">
                <div class="modal ticket-modal">
                    <div class="modal-icon">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>

                    <h2>Booking Confirmed!</h2>
                    <p>Your place has been successfully reserved.</p>

                    <div
                        id="digitalTicket"
                        style="
                            background: #ffffff;
                            border: 1px solid #dbe7f0;
                            border-radius: 18px;
                            overflow: hidden;
                            margin-top: 20px;
                            text-align: left;
                            box-shadow: 0 10px 30px rgba(16,42,67,0.10);
                        ">

                        <div
                            style="
                                background: #102a43;
                                color: white;
                                padding: 20px;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                gap: 15px;
                            ">

                            <div>
                                <div style="font-size: 22px; font-weight: 800;">SUPAPASS DU</div>
                                <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">
                                    Your campus. Your events. Your pass.
                                </div>
                            </div>

                            <i class="fa-solid fa-ticket" style="font-size: 28px; color: #25aae1;"></i>

                        </div>

                        <div style="padding: 22px;">

                            <div style="font-size: 11px; color: #718096; text-transform: uppercase;">Event</div>
                            <h3 style="margin: 6px 0 18px; color: #102a43; font-size: 21px;">${eventTitle}</h3>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
                                <div>
                                    <div style="font-size: 11px; color: #718096; text-transform: uppercase;">Date</div>
                                    <strong style="display: block; margin-top: 5px; color: #102a43;">${eventDate}</strong>
                                </div>
                                <div>
                                    <div style="font-size: 11px; color: #718096; text-transform: uppercase;">Time</div>
                                    <strong style="display: block; margin-top: 5px; color: #102a43;">${eventTime}</strong>
                                </div>
                                <div>
                                    <div style="font-size: 11px; color: #718096; text-transform: uppercase;">Venue</div>
                                    <strong style="display: block; margin-top: 5px; color: #102a43;">${eventVenue}</strong>
                                </div>
                                <div>
                                    <div style="font-size: 11px; color: #718096; text-transform: uppercase;">Student</div>
                                    <strong style="display: block; margin-top: 5px; color: #102a43;">${studentName}</strong>
                                </div>
                            </div>

                            <div style="border-top: 1px dashed #cbd5e0; margin-top: 22px; padding-top: 18px; text-align: center;">
                                <div style="font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 1px;">
                                    Ticket Number
                                </div>
                                <div style="font-size: 22px; font-weight: 800; color: #25aae1; letter-spacing: 1px; margin-top: 6px;">
                                    ${ticketNumber}
                                </div>
                                <div style="display: inline-block; margin-top: 10px; padding: 5px 12px; border-radius: 20px; background: #e8f7fd; color: #1679a6; font-size: 11px; font-weight: 700;">
                                    <i class="fa-solid fa-circle-check"></i>
                                    CONFIRMED
                                </div>
                            </div>

                        </div>

                    </div>

                    <div class="ticket-actions" style="margin-top: 20px;">
                        <button class="btn btn-primary" id="downloadTicketBtn" type="button">
                            <i class="fa-solid fa-download"></i>
                            Download Ticket
                        </button>
                        <button class="btn btn-outline" id="printTicketBtn" type="button">
                            <i class="fa-solid fa-print"></i>
                            Print / Save PDF
                        </button>
                        <button class="btn btn-outline modal-ok" type="button">
                            Done
                        </button>
                    </div>

                </div>
            </div>
        `;

        const downloadButton = modalRoot.querySelector("#downloadTicketBtn");
        if (downloadButton) {
            downloadButton.addEventListener("click", function () {
                const ticket = document.getElementById("digitalTicket");
                if (!ticket) return;

                const ticketHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>SupaPass DU Ticket - ${ticketNumber}</title>
                        <style>
                            body { font-family: Arial, sans-serif; background: #eef5f9; margin: 0; padding: 40px 20px; color: #102a43; }
                            .ticket { max-width: 650px; margin: auto; background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(16,42,67,0.15); }
                            .ticket-header { background: #102a43; color: white; padding: 25px; }
                            .brand { font-size: 28px; font-weight: bold; }
                            .tagline { font-size: 13px; opacity: 0.85; margin-top: 5px; }
                            .content { padding: 30px; }
                            .label { font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 1px; }
                            .event-title { font-size: 25px; margin: 7px 0 25px; }
                            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
                            .detail strong { display: block; margin-top: 6px; }
                            .ticket-number { border-top: 1px dashed #cbd5e0; margin-top: 30px; padding-top: 25px; text-align: center; }
                            .number { font-size: 25px; font-weight: bold; color: #25aae1; margin-top: 8px; }
                            .status { display: inline-block; margin-top: 12px; padding: 7px 15px; border-radius: 20px; background: #e8f7fd; color: #1679a6; font-size: 12px; font-weight: bold; }
                            .footer { padding: 18px 30px; background: #f7fafc; font-size: 12px; color: #718096; text-align: center; }
                            @media print { body { background: white; padding: 0; } .ticket { box-shadow: none; } }
                        </style>
                    </head>
                    <body>
                        <div class="ticket">
                            <div class="ticket-header">
                                <div class="brand">SUPAPASS DU</div>
                                <div class="tagline">Your campus. Your events. Your pass.</div>
                            </div>
                            <div class="content">
                                <div class="label">Event</div>
                                <div class="event-title">${eventTitle}</div>
                                <div class="details">
                                    <div class="detail"><div class="label">Date</div><strong>${eventDate}</strong></div>
                                    <div class="detail"><div class="label">Time</div><strong>${eventTime}</strong></div>
                                    <div class="detail"><div class="label">Venue</div><strong>${eventVenue}</strong></div>
                                    <div class="detail"><div class="label">Student</div><strong>${studentName}</strong></div>
                                </div>
                                <div class="ticket-number">
                                    <div class="label">Ticket Number</div>
                                    <div class="number">${ticketNumber}</div>
                                    <div class="status">✓ CONFIRMED</div>
                                </div>
                            </div>
                            <div class="footer">
                                Present this ticket at event entry.<br>
                                SupaPass DU — Your campus. Your events. Your pass.
                            </div>
                        </div>
                    </body>
                    </html>
                `;

                const blob = new Blob([ticketHtml], { type: "text/html" });
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.download = `SupaPass-Ticket-${ticketNumber}.html`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);
            });
        }

        const printButton = modalRoot.querySelector("#printTicketBtn");
        if (printButton) {
            printButton.addEventListener("click", function () {
                const ticket = document.getElementById("digitalTicket");
                if (!ticket) return;

                const printWindow = window.open("", "_blank");
                if (!printWindow) {
                    alert("Please allow pop-ups to print your ticket.");
                    return;
                }

                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>SupaPass DU Ticket</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 30px; background: white; }
                            #digitalTicket { max-width: 650px; margin: auto; }
                            @media print { body { padding: 0; } }
                        </style>
                    </head>
                    <body>${ticket.outerHTML}</body>
                    </html>
                `);

                printWindow.document.close();
                printWindow.focus();
                printWindow.onload = function () {
                    printWindow.print();
                };
            });
        }

        const okButton = modalRoot.querySelector(".modal-ok");
        if (okButton) {
            okButton.addEventListener("click", function (event) {
                event.preventDefault();
                modalRoot.innerHTML = "";
            });
        }
    }

    /* =========================================
       CLOSE MODAL WHEN CLICKING OUTSIDE
    ========================================= */

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("modal-overlay")) {
            const modalRoot = document.getElementById("modalRoot");
            if (modalRoot) {
                modalRoot.innerHTML = "";
            }
        }
    });

    /* =========================================
       USER ACCOUNT AND LOGOUT
    ========================================= */

    const userAccount = document.getElementById("userAccount");
    const logoutBtn = document.getElementById("logoutBtn");

    let loggedInUser = null;
    try {
        loggedInUser = JSON.parse(localStorage.getItem("supaPassUser"));
    } catch (error) {
        console.error("Could not read user account:", error);
    }

    if (loggedInUser && userAccount) {
        userAccount.textContent = `Hi, ${loggedInUser.name || "Student"}`;
    }

    if (loggedInUser && logoutBtn) {
        logoutBtn.style.display = "inline-flex";
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.removeItem("supaPassUser");
            alert("You have successfully logged out.");
            window.location.href = `${BASE}/auth/auth.html`;
        });
    }

    /* =========================================
       START APPLICATION
    ========================================= */

    loadEventsFromDatabase();

});