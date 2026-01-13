async function loginUser() {
    const userField = document.getElementById('username').value;
    const passField = document.getElementById('password').value;
    const messageDisplay = document.getElementById('errorMessage');

    if (!userField || !passField) {
        console.error("Input fields missing in HTML");
        return;
    }

    const showMessage = (msg) => {
        if (messageDisplay) messageDisplay.innerText = msg;
        else alert(msg);
    };

    const loginData = {
        username: userField,
        password: passField
    };

    try {
        const response = await fetch('backend/login_process.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (result.status === "success") {
            // saving the username to show on index.html
            localStorage.setItem('username', userField);
            window.location.href = "index.html";
        } else {
            messageDisplay.innerText = result.message;
        }
    } catch (error) {
        console.error("Error:", error);
        messageDisplay.innerText = "Connection error. Is XAMPP running?";
    }

}


//registering user
async function registerUser() {
    const user = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    const messageDisplay = document.getElementById('errorMessage');

    if (!user || !email || !pass) {
        alert("please fill in all fields");
        return;
    }

    const regData = {
        username: user,
        email: email, password: pass
    };

    try {
        const response = await fetch('backend/register_process.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(regData)
        });

        const result = await response.json();
        if (result.status === "success") {
            alert("Account created successfully! You can now login");
            window.location.href = "login.html";
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Registration Error:", error);
    }
}

// 1. Fetch Houses from DB
async function fetchListings() {
    const container = document.getElementById('listings-container');
    if (!container) return;

    try {
        const response = await fetch('backend/get_listings.php');
        const listings = await response.json();

        container.innerHTML = ''; // Clear static cards

        listings.forEach(house => {
            const propertyType = house.type || 'House';

            container.innerHTML += `
        <div class="house-card" data-type="${house.type || 'house'}" style="display: flex; flex-direction: column; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: #fff;">
            <img src="assets/images/${house.image_url}" alt="${house.title}" class="house-img" style="width: 100%; height: 200px; object-fit: cover;">
            <div class="info" style="padding: 15px; display: block;">
                <h3 style="margin: 0 0 5px 0; color: #333;">${house.title}</h3>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">${house.location}</p>
                <div style="font-size: 0.85rem; color: #888; margin-bottom: 10px;">
                    ${house.beds} Bed | ${house.baths} Bath | ${house.sqft} sqft
                </div>
                <p style="font-size: 1.2rem; font-weight: bold; color: #ff8c00; margin-bottom: 15px;">$${Number(house.price).toLocaleString()}</p>
                <div class="card-buttons">
                <button class="btn-orange" onclick="openContactModal('${house.title}')" style="width: 100%; padding: 10px; cursor: pointer;">Contact Now</button>
                <button class="fav-btn" onclick="toggleFavorite('${house.title}', 'assets/images/${house.image}', this)">
    <i class="far fa-heart"></i>
</button>
            </button>
            </div>
        </div>
    `;
        });
    } catch (error) {
        console.error("Listing Error:", error);
    }
}

// 2. Handle Page Load Logic
window.onload = function () {
    const loggedUser = localStorage.getItem('username');
    const userProfile = document.getElementById('user-profile-header');
    const displayName = document.getElementById('display-name');

    if (loggedUser) {
        if (userProfile) userProfile.style.display = "flex";
        if (displayName) displayName.innerText = "Hi, " + loggedUser;

        const oldBtn = document.querySelector('.book-now-btn');
        if (oldBtn) oldBtn.style.display = "none";
    }

    fetchListings();
};

// 3. Logout
function logout() {
    localStorage.removeItem('username');
    window.location.href = "login.html";
}

//contact modal
function openContactModal(houseTitle) {
    const loggedUser = localStorage.getItem('username');

    if (!loggedUser) {
        alert("Please log in to contact an agent.");
        window.location.href = "login.html";
        return;
    }

    // show modal and fill data
    document.getElementById('contactModal').style.display = "block";
    document.getElementById('modal-house-title').innerText = "Inquiry: " + houseTitle;
    document.getElementById('modal-user-name').innerText = loggedUser;
    document.getElementById('form-house-title').value = houseTitle;
}

function closeModal() {
    document.getElementById('contactModal').style.display = "none";
}

window.onclick = function (event) {
    let modal = this.document.getElementById('contactModal');
    if (event.target == modal) {
        closeModal();
    }
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.onsubmit = async function (e) {
        e.preventDefault();

        // 1. Get the data from the modal
        const messageText = document.getElementById('user-message').value;
        const houseTitle = document.getElementById('modal-house-title').innerText.replace("Inquiry: ", "");
        const sender = localStorage.getItem('username')

        // 2. Prepare the data for the DB
        const formData = new FormData();
        formData.append('username', sender);
        formData.append('property', houseTitle);
        formData.append('message', messageText);

        try {
            const response = await fetch('backend/save_message.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.text();
            console.log("PHP Output:", result);
            if (result.includes("Success")) {
                alert("Message sent to the owner!");
                document.getElementById('contactModal').style.display = "none";
                contactForm.reset();
            }
        } catch (error) {
            console.error("Submission Error:", error);
        }
    };
}

function filterType(category) {
    const container = document.getElementById('listings-container');
    const cards = document.querySelectorAll('.house-card');

    // Ensure the container ALWAYS stays on one line
    container.style.flexWrap = 'nowrap';
    container.style.display = 'flex';

    cards.forEach(card => {
        const cardType = card.getAttribute('data-type');

        // Match the category (case-insensitive)
        if (category === 'all' || (cardType && cardType.toLowerCase() === category.toLowerCase())) {
            card.style.display = "flex"; // Show matching cards
        } else {
            card.style.display = "none"; // Hide non-matching cards
        }
    });

    // Reset the scroll position to the start when a filter changes
    container.scrollLeft = 0;
}

function scrollGrid(direction) {
    const container = document.getElementById('listings-container');
    const scrollAmount = 320; // Card width (300) + gap (20)

    container.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

const container = document.getElementById('listings-container');
if (container) {
    container.addEventListener('scroll', () => {
        const leftBtn = document.querySelector('.scroll-btn.left');
        const rightBtn = document.querySelector('.scroll-btn.right');

        // Your existing opacity logic here...
        leftBtn.style.opacity = container.scrollLeft === 0 ? "0" : "1";

        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 1) {
            rightBtn.style.opacity = "0";
        } else {
            rightBtn.style.opacity = "1";
        }
    });
}

// contact us section buttons
const callBtn = document.getElementById('call-btn').addEventListener('click', () => {
    window.location.href = "tel:+2348065879200";
});

const msgBtn = document.getElementById('msg-btn').addEventListener('click', () => {
    window.location.href = "sms:+2348065879200";
});

const whatsappBtn = document.getElementById('whatsapp-btn');
if (whatsappBtn) {
    whatsappBtn.onclick = function () {
        const houseNameInput = document.getElementById('form-house-title');
        const houseName = houseNameInput ? houseNameInput : "your property";

        const message = `Hello! I'm interested in ${houseName}. Can I get more details?`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/+2348065879200?text=${encodedMessage}`, '_blank');
    };
}

//user dashboard section
async function toggleDashboard() {
    const dropdown = document.getElementById('dashboard-dropdown');
    dropdown.classList.toggle('active');

    if (dropdown.classList.contains('active')) {
        const loggedUser = localStorage.getItem('username');
        const historyList = document.getElementById('message-history-list');

        if (loggedUser) {
            try {
                const statsRes = await fetch(`backend/get_user_stats.php?user=${encodeURIComponent(loggedUser)}`);
                const statsData = await statsRes.json();
                if (statsData.success) document.getElementById('stat-count').innerText = statsData.inquiry_count;

                // 2. Fetch History
                const historyRes = await fetch(`backend/get_message_history.php?user=${encodeURIComponent(loggedUser)}`);
                const historyData = await historyRes.json();

                if (historyData.success) {
                    historyList.innerHTML = '';

                    if (historyData.history.length === 0) {
                        historyList.innerHTML = '<li>No inquiries yet.</li>';
                    } else {
                        historyData.history.forEach(item => {
                            const li = document.createElement('li');
                            li.className = "history-item";
                            // Inside your forEach loop for inquiry history:
                            li.innerHTML = `
                                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <a href="#">🏠 ${item.property_title} <br><small>${item.created_at}</small></a>
                                    <button class="delete-btn" onclick="deleteInquiry('${item.property_title}', this)" style="border:none; background:none; cursor:pointer;">
                                        <i class="fas fa-trash-can" style="color: #e74c3c;"></i>
                                    </button>
                                </div>
                            `;
                            historyList.appendChild(li);
                        });
                    }
                }
                // 3. Fetch Favorites (Inject this right after your history loop)
                const favRes = await fetch(`backend/get_favorites.php?user=${encodeURIComponent(loggedUser)}`);
                const favData = await favRes.json();
                const favList = document.getElementById('favorites-list');

                if (favData.success) {
                    favList.innerHTML = ''; // This clears the "Loading favorites..." text
                    if (favData.favorites.length === 0) {
                        favList.innerHTML = '<li>No saved homes yet.</li>';
                    } else {
                        favData.favorites.forEach(house => {
                            const li = document.createElement('li');
                            li.className = "fav-item";
                            li.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                            <a href="#">❤️ ${house.property_title}</a>
                            <button class="delete-btn" onclick="toggleFavorite('${house.property_title}', '', this)">
                                <i class="fas fa-trash-can" style="color: #e74c3c;"></i>
                            </button>
                        </div>`;
                            favList.appendChild(li);
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }


        }
    }
}

// Close dropdown when clicking outside
window.addEventListener('click', function (e) {
    const container = document.querySelector('.profile-nav-container');
    const dropdown = document.getElementById('dashboard-dropdown');

    if (container && !container.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

async function deleteInquiry(houseTitle) {
    const loggedUser = localStorage.getItem('username');
    if (!confirm(`Are you sure you want to remove your inquiry for ${houseTitle}?`)) return;

    const response = await fetch('delete_inquiry.php', {
        method: 'POST',
        body: JSON.stringify({ username: loggedUser, property_title: houseTitle })
    });

    const result = await response.json();
    if (result.success) {
        toggleDashboard();
        toggleDashboard();
    }
}

async function toggleFavorite(houseTitle, houseImage, buttonElement) {
    const loggedUser = localStorage.getItem('username');

    if (!loggedUser) {
        alert("Please log in to save favorites!");
        return;
    }

    try {
        const response = await fetch('backend/save_favorite.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: loggedUser,
                property_title: houseTitle,
                property_image: houseImage
            })
        });

        const data = await response.json();

        if (data.success) {
            // Toggle the look of the heart icon
            const icon = buttonElement.querySelector('i');
            if (data.status === 'added') {
                icon.classList.replace('far', 'fas'); // Change to solid heart
                buttonElement.classList.add('favorited');
            } else {
                icon.classList.replace('fas', 'far'); // Change back to outline
                buttonElement.classList.remove('favorited');
            }
        }
    } catch (error) {
        console.error("Error saving favorite:", error);
    }
}

async function deleteInquiry(houseTitle, btnElement) {
    const loggedUser = localStorage.getItem('username');
    if (!confirm(`Delete inquiry for ${houseTitle}?`)) return;

    try {
        const response = await fetch('backend/delete_message.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loggedUser, property_title: houseTitle })
        });

        const data = await response.json();
        if (data.success) {
            // Remove the item from the UI immediately
            btnElement.closest('li').remove();
            // Refresh the inquiry count
            updateInquiryCount(loggedUser);
        }
    } catch (error) {
        console.error("Delete failed:", error);
    }
}

function toggleSection(sectionId) {
    // Find the lists
    const historyList = document.getElementById('message-history-list');
    const favoritesList = document.getElementById('favorites-list');

    if (sectionId === 'history-section') {
        historyList.classList.toggle('active');
        // Optional: Close favorites when history opens
        favoritesList.classList.remove('active');
    } else {
        favoritesList.classList.toggle('active');
        // Optional: Close history when favorites opens
        historyList.classList.remove('active');
    }
}

function updateAuthUI() {
    const navContainer = document.querySelector('.profile-nav-container');
    const loggedUser = localStorage.getItem('username');

    if (loggedUser) {
        // User is logged in: Keep your existing profile structure
        navContainer.innerHTML = `
            <div id="user-profile-header" onclick="toggleDashboard()">
                <div class="user-avatar">
                    <img src="assets/images/user-line.png" alt="profile png" id="user-icon-image">
                </div>
                <span id="display-name">Hi, ${loggedUser}</span>
            </div>
        `;
    } else {
        // User is NOT logged in: Show the orange Login button
        navContainer.innerHTML = `
            <a href="login.html" class="login-nav-btn">Login</a>
        `;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateAuthUI);