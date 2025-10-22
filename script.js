// Global variables
let currentUser = null;
let menuItems = [];
let currentOrder = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadMenuItems();
    loadMessages();
    setupEventListeners();
});

// Initialize application
function initializeApp() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Show home section by default
    showSection('home');
}

// Navigation functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    // Auth buttons
    document.getElementById('loginBtn').addEventListener('click', () => showModal('loginModal'));
    document.getElementById('registerBtn').addEventListener('click', () => showModal('registerModal'));

    // Modal close buttons
    document.getElementById('closeLogin').addEventListener('click', () => hideModal('loginModal'));
    document.getElementById('closeRegister').addEventListener('click', () => hideModal('registerModal'));
    document.getElementById('closeOrder').addEventListener('click', () => hideModal('orderModal'));

    // Forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('contactForm').addEventListener('submit', handleContact);
    document.getElementById('freewallForm').addEventListener('submit', handleFreeWall);

    // Category filters
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterMenuItems(category);
            
            // Update active button
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Close modals on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target.id);
        }
    });
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Authentication functions
async function checkAuthStatus() {
    try {
        const response = await fetch('api/auth.php?action=check');
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            updateAuthUI();
        }
    } catch (err) {
        console.error('Auth check failed:', err);
    }
}

function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    if (currentUser) {
        authButtons.innerHTML = `
            <span class="welcome-text">Welcome, ${currentUser.username}</span>
            <button class="btn logout-btn" onclick="handleLogout()">Logout</button>
        `;
    } else {
        authButtons.innerHTML = `
            <button id="loginBtn" class="btn">Login</button>
            <button id="registerBtn" class="btn">Register</button>
        `;
        // Re-attach event listeners
        document.getElementById('loginBtn').addEventListener('click', () => showModal('loginModal'));
        document.getElementById('registerBtn').addEventListener('click', () => showModal('registerModal'));
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('action', 'login');

    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            updateAuthUI();
            hideModal('loginModal');
            alert('Login successful!');
        } else {
            alert('Login failed: ' + data.error);
        }
    } catch (err) {
        alert('Login failed: Network error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('action', 'register');

    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            hideModal('registerModal');
            alert('Registration successful! Please login.');
        } else {
            alert('Registration failed: ' + data.error);
        }
    } catch (err) {
        alert('Registration failed: Network error');
    }
}

async function handleLogout() {
    try {
        const formData = new FormData();
        formData.append('action', 'logout');
        
        await fetch('api/auth.php', {
            method: 'POST',
            body: formData
        });
        
        currentUser = null;
        updateAuthUI();
        alert('Logout successful!');
    } catch (err) {
        console.error('Logout failed:', err);
    }
}

// Menu functions
async function loadMenuItems() {
    try {
        const response = await fetch('api/menu.php?action=list');
        const data = await response.json();
        
        if (data.success) {
            menuItems = data.items;
        } else {
            // Fallback data
            menuItems = getFallbackMenuItems();
        }
        
        displayMenuItems(menuItems);
    } catch (err) {
        console.error('Failed to load menu:', err);
        menuItems = getFallbackMenuItems();
        displayMenuItems(menuItems);
    }
}

function getFallbackMenuItems() {
    return [
        // Hot Drinks
        { id: 1, name: 'Espresso', description: 'Rich, full-bodied espresso with a perfect crema', price: 180.00, category_id: 1, image_url: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?fm=jpg&q=60&w=3000' },
        { id: 2, name: 'Caramel Latte', description: 'Espresso with steamed milk and caramel syrup', price: 230.00, category_id: 1, image_url: 'https://img.freepik.com/free-photo/view-3d-coffee-cup_23-2151083700.jpg' },
        { id: 3, name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 200.00, category_id: 1, image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?fm=jpg&q=60&w=3000' },
        { id: 4, name: 'Matcha Latte', description: 'Traditional matcha with steamed milk', price: 240.00, category_id: 1, image_url: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWF0Y2hhJTIwbGF0dGV8ZW58MHx8MHx8fDA%3D' },
        { id: 5, name: 'Hot Chocolate', description: 'Rich and creamy hot chocolate', price: 190.00, category_id: 1, image_url: 'https://bakerbynature.com/wp-content/uploads/2024/01/Hot-Chocolate-3.jpg' },
        { id: 6, name: 'Americano', description: 'Espresso with hot water', price: 170.00, category_id: 1, image_url: 'https://images.unsplash.com/photo-1580661869408-55ab23f2ca6e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YW1lcmljYW5vJTIwY29mZmVlfGVufDB8fDB8fHww&fm=jpg&q=60&w=3000' },
        
        // Cold Drinks
        { id: 7, name: 'Cold Brew', description: 'Smooth, refreshing cold brew coffee', price: 210.00, category_id: 2, image_url: 'https://media.istockphoto.com/id/1209718260/photo/cold-brew-coffee-with-milk-and-ice-cubes-in-glass.jpg?s=612x612&w=0&k=20&c=ZJRnsNhnEwHPvt6-EsU2dJmNhi2hmdFq-_w56YbR648=' },
        { id: 8, name: 'Mocha Frappe', description: 'Blended coffee with chocolate and whipped cream', price: 250.00, category_id: 2, image_url: 'https://img.freepik.com/free-photo/cup-coffee-with-whipped-cream-coffee-sprinkles_140725-5973.jpg?semt=ais_hybrid&w=740&q=80' },
        { id: 9, name: 'Iced Americano', description: 'Espresso with cold water over ice', price: 190.00, category_id: 2, image_url: 'https://static.vecteezy.com/system/resources/previews/023/010/472/non_2x/the-glass-of-ice-americano-coffee-in-the-black-background-with-ai-generated-free-photo.jpg' },
        { id: 10, name: 'Iced Latte', description: 'Espresso with cold milk over ice', price: 220.00, category_id: 2, image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
        { id: 11, name: 'Iced Matcha', description: 'Refreshing iced matcha latte', price: 230.00, category_id: 2, image_url: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWF0Y2hhJTIwbGF0dGV8ZW58MHx8MHx8fDA%3D' },
        { id: 12, name: 'Frappuccino', description: 'Blended coffee drink with ice', price: 260.00, category_id: 2, image_url: 'https://img.freepik.com/free-photo/cup-coffee-with-whipped-cream-coffee-sprinkles_140725-5973.jpg?semt=ais_hybrid&w=740&q=80' },
        
        // Pastries
        { id: 13, name: 'Croissant', description: 'Buttery, flaky French croissant', price: 90.00, category_id: 3, image_url: 'https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg?cs=srgb&dl=pexels-elkady-3892469.jpg&fm=jpg' },
        { id: 14, name: 'Blueberry Muffin', description: 'Fresh blueberry muffin with streusel topping', price: 120.00, category_id: 3, image_url: 'https://www.shutterstock.com/image-photo/blueberry-muffins-blueberries-on-top-600nw-2492319609.jpg' },
        { id: 15, name: 'Chocolate Cake', description: 'Rich chocolate cake with ganache frosting', price: 150.00, category_id: 3, image_url: 'https://static.vecteezy.com/system/resources/thumbnails/026/349/563/small/indulgent-chocolate-cake-slice-on-wooden-plate-generated-by-ai-free-photo.jpg' },
        { id: 16, name: 'Cinnamon Roll', description: 'Sweet cinnamon roll with cream cheese frosting', price: 110.00, category_id: 3, image_url: 'https://www.cookingclassy.com/wp-content/uploads/2020/09/mini-cinnamon-rolls-21.jpg' },
        { id: 17, name: 'Chocolate Chip Cookie', description: 'Fresh baked chocolate chip cookies', price: 80.00, category_id: 3, image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?fm=jpg&q=60&w=3000' },
        { id: 18, name: 'Banana Bread', description: 'Moist banana bread with walnuts', price: 100.00, category_id: 3, image_url: 'https://www.marthastewart.com/thmb/1dIq-Ds5zBaQ70zBzbVepDCUpuQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/MSL-312772-the-best-banana-bread-horiz-0723-886961edbbbe4aa59a839b6a24dc1dbb.jpg' },
        
        // Snacks
        { id: 19, name: 'Grilled Cheese Sandwich', description: 'Classic grilled cheese with tomato soup', price: 180.00, category_id: 4, image_url: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?fm=jpg&q=60&w=3000' },
        { id: 20, name: 'Caesar Salad', description: 'Fresh romaine lettuce with caesar dressing', price: 160.00, category_id: 4, image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?fm=jpg&q=60&w=3000' },
        { id: 21, name: 'Fruit Bowl', description: 'Fresh seasonal fruits', price: 120.00, category_id: 4, image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?fm=jpg&q=60&w=3000' },
        { id: 22, name: 'Avocado Toast', description: 'Smashed avocado on sourdough bread', price: 140.00, category_id: 4, image_url: 'https://www.rootsandradishes.com/wp-content/uploads/2017/08/avocado-toast-with-everything-bagel-seasoning-feat.jpg' }
    ];
}

function displayMenuItems(items) {
    const menuGrid = document.getElementById('menu-grid');
    menuGrid.innerHTML = '';

    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}" class="menu-item-image">
            <div class="menu-item-content">
                <h3 class="menu-item-name">${item.name}</h3>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <p class="menu-item-price">₱${item.price}</p>
                    <button class="btn order-btn" onclick="showOrderModal(${item.id})">Order Now</button>
                </div>
            </div>
        `;
        menuGrid.appendChild(menuItem);
    });
}

function filterMenuItems(categoryId) {
    let filteredItems = menuItems;
    
    if (categoryId !== 'all') {
        filteredItems = menuItems.filter(item => item.category_id == categoryId);
    }
    
    displayMenuItems(filteredItems);
}

function showOrderModal(itemId) {
    const item = menuItems.find(i => i.id == itemId);
    if (!item) return;

    const orderContent = document.getElementById('order-content');
    orderContent.innerHTML = `
        <div class="order-modal-content">
            <img src="${item.image_url}" alt="${item.name}" class="order-item-image">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p class="order-price">₱${item.price}</p>
            
            <div class="quantity-selector">
                <label>Quantity:</label>
                <div class="quantity-controls">
                    <button onclick="changeQuantity(-1)" class="quantity-btn">-</button>
                    <span class="quantity-display" id="quantity">1</span>
                    <button onclick="changeQuantity(1)" class="quantity-btn">+</button>
                </div>
            </div>
            
            <p class="total-price" id="total-price">Total: ₱${item.price}</p>
        </div>
        
        <div class="modal-actions">
            <button class="btn btn-secondary" onclick="hideModal('orderModal')">Cancel</button>
            <button class="btn btn-primary" onclick="confirmOrder(${item.id})">Confirm Order</button>
        </div>
    `;

    showModal('orderModal');
}

function changeQuantity(change) {
    const quantityElement = document.getElementById('quantity');
    const currentQuantity = parseInt(quantityElement.textContent);
    const newQuantity = Math.max(1, currentQuantity + change);
    quantityElement.textContent = newQuantity;
    
    // Update total price
    const item = menuItems.find(i => i.id == document.querySelector('.order-item-image').alt);
    if (item) {
        const totalPrice = item.price * newQuantity;
        document.getElementById('total-price').textContent = `Total: ₱${totalPrice.toFixed(2)}`;
    }
}

async function confirmOrder(itemId) {
    if (!currentUser) {
        alert('Please login to place an order');
        hideModal('orderModal');
        showModal('loginModal');
        return;
    }

    const quantity = parseInt(document.getElementById('quantity').textContent);
    const item = menuItems.find(i => i.id == itemId);

    try {
        const formData = new FormData();
        formData.append('action', 'create');
        formData.append('items', JSON.stringify([{
            id: itemId,
            quantity: quantity
        }]));

        const response = await fetch('api/orders.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            hideModal('orderModal');
            alert('Order placed successfully!');
        } else {
            alert('Order failed: ' + data.error);
        }
    } catch (err) {
        alert('Order failed: Network error');
    }
}

// Contact form
async function handleContact(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('action', 'contact');

    try {
        const response = await fetch('api/messages.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            alert('Message sent successfully!');
            e.target.reset();
        } else {
            alert('Failed to send message: ' + data.error);
        }
    } catch (err) {
        alert('Failed to send message: Network error');
    }
}

// Free wall functions
async function loadMessages() {
    try {
        const response = await fetch('api/messages.php?action=freewall');
        const data = await response.json();
        
        if (data.success) {
            displayMessages(data.messages);
        }
    } catch (err) {
        console.error('Failed to load messages:', err);
    }
}

function displayMessages(messages) {
    const messagesList = document.getElementById('messages-list');
    messagesList.innerHTML = '';

    if (messages.length === 0) {
        messagesList.innerHTML = '<p>No messages posted yet. Be the first to share!</p>';
        return;
    }

    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <strong>${message.username || message.full_name || 'Anonymous'}</strong>
            <p>${message.message}</p>
            <div class="timestamp">${formatDate(message.created_at)}</div>
        `;
        messagesList.appendChild(messageDiv);
    });
}

async function handleFreeWall(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login to post a message');
        hideModal('freewallForm');
        showModal('loginModal');
        return;
    }

    const formData = new FormData(e.target);
    formData.append('action', 'freewall');

    try {
        const response = await fetch('api/messages.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            alert('Message posted successfully!');
            e.target.reset();
            loadMessages(); // Refresh messages
        } else {
            alert('Failed to post message: ' + data.error);
        }
    } catch (err) {
        alert('Failed to post message: Network error');
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
