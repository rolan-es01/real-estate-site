async function loginUser() {
    const userField = document.getElementById('username').value;
    const passField = document.getElementById('password').value;
    const messageDisplay = document.getElementById('errorMessage');

    if (!userField  || !passField) {
           console.error("Input fields missing in HTML");
            return;
        }

        const showMessage = (msg) => {
            if(messageDisplay)messageDisplay.innerText = msg;
            else alert(msg);
        };

        const loginData = {
            username: userField,
            password: passField
        };

        try {
            const response = await fetch('login_process.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
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
    const user = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    const messageDisplay = document.getElementById('errorMessage');

    if (!user || !email || !pass) {
        alert("please fill in all fields");
        return;
    }

    const regData = {username: user, 
        email: email, password: pass};

        try {
            const response = await fetch('register_process.php', {
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
        const response = await fetch('get_listings.php');
        const listings = await response.json();

        container.innerHTML = ''; // Clear static cards

      listings.forEach(house => {
    const propertyType = house.type || 'House'; 

    container.innerHTML += `
        <div class="house-card" data-type="${house.type || 'house'}" style="display: flex; flex-direction: column; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: #fff;">
            <img src="${house.image_url}" alt="${house.title}" class="house-img" style="width: 100%; height: 200px; object-fit: cover;">
            <div class="info" style="padding: 15px; display: block;">
                <h3 style="margin: 0 0 5px 0; color: #333;">${house.title}</h3>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">${house.location}</p>
                <div style="font-size: 0.85rem; color: #888; margin-bottom: 10px;">
                    ${house.beds} Bed | ${house.baths} Bath | ${house.sqft} sqft
                </div>
                <p style="font-size: 1.2rem; font-weight: bold; color: #ff8c00; margin-bottom: 15px;">$${Number(house.price).toLocaleString()}</p>
                <button class="btn-orange" onclick="openContactModal('${house.title}')" style="width: 100%; padding: 10px; cursor: pointer;">Contact Now</button>
            </div>
        </div>
    `;
});
    } catch (error) {
        console.error("Listing Error:", error);
    }
}

// 2. Handle Page Load Logic
window.onload = function() {
    const loggedUser = localStorage.getItem('username');
    const userProfile = document.getElementById('user-profile-header');
    const displayName = document.getElementById('display-name');

    if (loggedUser) {
        if(userProfile) userProfile.style.display = "flex";
        if(displayName) displayName.innerText ="Hi, " + loggedUser;
        
        const oldBtn = document.querySelector('.book-now-btn'); 
        if(oldBtn) oldBtn.style.display = "none";
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

window.onclick = function(event) {
    let modal = this.document.getElementById('contactModal');
    if (event.target == modal) {
        closeModal();
    }
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.onsubmit = async function(e) {
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
            // 3. Send to PHP
            const response = await fetch('save_message.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.text();
            console.log("PHP Output:", result);
            if (result.includes("Success")) {
                alert("Message sent to the owner!");
                document.getElementById('contactModal').style.display = "none";
                contactForm.reset(); // Clears the text area
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
container.addEventListener('scroll', () => {
    const leftBtn = document.querySelector('.scroll-btn.left');
    const rightBtn = document.querySelector('.scroll-btn.right');
    
    // Hide left button if at the start
    leftBtn.style.opacity = container.scrollLeft === 0 ? "0" : "1";
    
    // Hide right button if at the very end
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 1) {
        rightBtn.style.opacity = "0";
    } else {
        rightBtn.style.opacity = "1";
    }
});

// contact us section buttons
const callBtn = document.getElementById('call-btn').addEventListener('click', () => {
    window.location.href = "tel:+2348065879200";
});

const msgBtn = document.getElementById('msg-btn').addEventListener('click', () => {
    window.location.href = "sms:+2348065879200";
});

const whatsappBtn = document.getElementById('whatsapp-btn');
if (whatsappBtn) {
    whatsappBtn.onclick = function() {
       const houseNameInput = document.getElementById('form-house-title');
       const houseName = houseNameInput ? houseNameInput : "your property";

        const message = `Hello! I'm interested in ${houseName}. Can I get more details?`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/+2348065879200?text=${encodedMessage}`, '_blank');
    };
}
