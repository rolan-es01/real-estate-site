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
            localStorage.clear();
            localStorage.setItem('username', result.username);
            const nameForHeader = result.display_name ? result.display_name : result.username;
            localStorage.setItem('display_name', nameForHeader);

            localStorage.setItem('profile_pic', result.profile_pic);

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
               <div class="card-buttons" style="display: flex; gap: 5px; margin-top: 15px;">
                    <button class="register-nav-btn" onclick="openContactModal('${house.title}')" style="border: none; cursor: pointer;">
                        Contact Now
                    </button>
                    <button class="login-nav-btn" onclick="window.location.href='property-details.html?id=${house.id}'" style="cursor: pointer;">
                        View Details
                    </button>
                    <button class="fav-btn" onclick="toggleFavorite('${house.title}', 'assets/images/${house.image}', this)" style="flex: 0.5; padding: 10px; cursor: pointer;">
                        <i class="far fa-heart"></i>
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
    const displayName = localStorage.getItem('display_name');
    const userPic = localStorage.getItem('profile_pic');
    console.log("Current userPic value in storage:", userPic);

    const displaySpan = document.getElementById('display-name');
    const headerImg = document.querySelector('#user-profile-header img');

    // Only show name if it's not the actual string "undefined" or null
    let finalName = "User";
    if (displayName && displayName !== "undefined" && displayName !== "null") {
        finalName = displayName;
    } else if (loggedUser) {
        finalName = loggedUser;
    }

    if (displaySpan) {
        displaySpan.innerText = "Hi, " + finalName;
    }

    if (headerImg) {
    if (userPic && userPic !== "" && userPic !== "null" && userPic !== "undefined") {
        headerImg.src = "assets/images/profiles/" + userPic;
    } else {
        headerImg.src = "assets/images/profiles/default-user.jpeg";
    }
        const oldBtn = document.querySelector('.book-now-btn');
        if (oldBtn) oldBtn.style.display = "none";

        fetchListings();
    }
}

// 3. Logout
function logout() {
    localStorage.clear();
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
const callBtn = document.getElementById('call-btn');
if (callBtn) {
    callBtn.addEventListener('click', () => {
        window.location.href = "tel:+2348065879200";
    });
}

const msgBtn = document.getElementById('msg-btn');
if (msgBtn) {
    msgBtn.addEventListener('click', () => {
        window.location.href = "sms:+2348065879200";
    });
}

const whatsappBtn = document.getElementById('whatsapp-btn');
if (whatsappBtn) {
    whatsappBtn.onclick = function () {
        const titleElement = document.getElementById('prop-title');
        const houseName = titleElement ? titleElement.innerText : "this property"


        const message = `Hello! I'm interested in ${houseName}. Can I get more details?`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/+2348065879200?text=${encodedMessage}`, '_blank');
    };
}

//user dashboard section
async function toggleDashboard() {
    const dropdown = document.getElementById('dashboard-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
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
                // 3. Fetch Favorites 
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
    const historyList = document.getElementById('message-history-list');
    const favoritesList = document.getElementById('favorites-list');
    const profileSection = document.getElementById('profile-settings-section');

    // 1. Handle History Section
    if (sectionId === 'history-section') {
        historyList.classList.toggle('active');
        favoritesList.classList.remove('active');
        if (profileSection) profileSection.classList.remove('active');
    }
    // 2. Handle Favorites Section
    else if (sectionId === 'saved-section') {
        favoritesList.classList.toggle('active');
        historyList.classList.remove('active');
        if (profileSection) profileSection.classList.remove('active');
    }
    // 3. Handle Profile Section [New Branch]
    else if (sectionId === 'profile-settings-section') {
        profileSection.classList.toggle('active');
        historyList.classList.remove('active');
        favoritesList.classList.remove('active');
    }
}

function updateAuthUI() {
    const navContainer = document.querySelector('.profile-nav-container');
    const loggedUser = localStorage.getItem('username');

    if (!navContainer) return;

    if (loggedUser) {
        navContainer.innerHTML = `
            <div id="user-profile-header" onclick="toggleDashboard()" style="cursor: pointer;">
                <div class="user-avatar">
                    <img src="assets/images/user-line.png" alt="profile" id="user-icon-image">
                </div>
                <span id="display-name">Hi, ${loggedUser}</span>
            </div>
        `;
    } else {
        navContainer.innerHTML = `
            <div class="auth-buttons">
                <a href="register.html" class="register-nav-btn">Register</a>
                <a href="login.html" class="login-nav-btn">Login</a>
            </div>
        `;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateAuthUI);

window.addEventListener('click', function (e) {
    const dashboard = document.querySelector('.dashboard-menu');
    const profileHeader = document.getElementById('user-profile-header');

    // Check if the menu is actually open
    if (dashboard && dashboard.classList.contains('active')) {
        // If the click is NOT the profile icon AND NOT inside the dashboard...
        if (!profileHeader.contains(e.target) && !dashboard.contains(e.target)) {
            dashboard.classList.remove('active');
            console.log("Clicked outside: Closing Dashboard");
        }
    }
});

const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get('id');

if (propertyId) {

    fetch(`backend/get_property_details.php?id=${propertyId}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById('prop-title').innerText = "Property Not Found";
            } else {
                // Fills in the data and removes the 'Loading...' state
                document.getElementById('prop-title').innerText = data.title;
                document.getElementById('prop-price').innerText = `$${Number(data.price).toLocaleString()}`;


                document.getElementById('main-hero-image').src = `./assets/images/${data.image_url}`;

                document.getElementById('prop-beds').innerText = data.beds || '0';
                document.getElementById('prop-baths').innerText = data.baths || '0';
            }
            const thumbnails = document.querySelectorAll('.thumb');
            const mainHero = document.getElementById('main-hero-image');

            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', function () {
                    mainHero.src = this.src;
                });
            });

        })
        .catch(err => {
            console.error("Fetch error:", err);
            document.getElementById('prop-title').innerText = "Server Error";
        });
}

// --- PROFILE IMAGE PREVIEW LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const dashboardInput = document.getElementById('profile-input');
    const dashboardPreview = document.getElementById('dashboard-profile-preview');

    if (dashboardInput && dashboardPreview) {
        dashboardInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();


                reader.onload = function (e) {
                    dashboardPreview.src = e.target.result;
                    console.log("Preview updated successfully!");
                };

                reader.readAsDataURL(file);
            }
        });
    } else {
        console.error("Profile elements not found. Check if IDs match your HTML.");
    }
});

const settingsForm = document.getElementById('settings-profile-form');

if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Grab the name AT THE MOMENT of clicking Save
        const nameSpan = document.getElementById('display-name');
        let currentUsername = "";

        if (nameSpan) {
            // Cleans "Hi, somtee" into "somtee"
            currentUsername = nameSpan.innerText.replace('Hi, ', '').trim();
        }

        // 2. Emergency Backup: If the span is empty, check the URL
        if (!currentUsername) {
            const urlParams = new URLSearchParams(window.location.search);
            currentUsername = urlParams.get('display_name') || urlParams.get('user');
        }

        // 3. Final Check
        if (!currentUsername) {
            alert("Error: Could not identify user. Try refreshing the page.");
            return;
        }

        const formData = new FormData(settingsForm);
        formData.append('username', currentUsername); // Matches PHP $username

        try {
            const response = await fetch('backend/upload_profile.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.status === 'success') {
                // 1. Update the profile picture path
                localStorage.setItem('profile_pic', result.image_path);

                // 2. ONLY update 'display_name'. 
                // DO NOT touch 'username' here—this keeps your inquiries safe!
                if (result.name_to_show) {
                    localStorage.setItem('display_name', result.name_to_show);
                }

                alert("Profile Updated Successfully!");
                location.reload();
            } else {
                alert("Upload failed: " + result.message);
            }
        } catch (error) {
            console.error("Critical upload error:", error);
        }
    });
}