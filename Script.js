// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const productsContainer = document.querySelector('.products-container');
const cartCount = document.querySelector('.cart-count');
const cartItemsContainer = document.querySelector('.cart-items-container');
const totalAmount = document.querySelector('.total-amount');
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const categoryFilter = document.querySelector('.category-filter');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const pageInfo = document.querySelector('.page-info');

// Global Variables
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 1;
const productsPerPage = 4;
let filteredProducts = [];

// Initialize the app
function init() {
    loadProducts();
    updateCartCount();
    renderCartItems();
    setupEventListeners();
}

// Load products from JSON file
function loadProducts() {
    fetch('products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load products');
            }
            return response.json();
        })
        .then(data => {
            products = data;
            filteredProducts = [...products];
            renderProducts();
            populateCategoryFilter();
        })
        .catch(error => {
            console.error('Error loading products:', error);
            productsContainer.innerHTML = `<p class="error-message">Failed to load products. Please try again later.</p>`;
        });
}

// Render products to the page
function renderProducts() {
    // Calculate pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToDisplay = filteredProducts.slice(startIndex, endIndex);
    
    // Update pagination controls
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Clear previous products
    productsContainer.innerHTML = '';
    
    if (productsToDisplay.length === 0) {
        productsContainer.innerHTML = `<p class="no-products">No products found matching your criteria.</p>`;
        return;
    }
    
    // Render each product
    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="assets/products/${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
    
    // Add event listeners to the new "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Populate category filter dropdown
function populateCategoryFilter() {
    // Get unique categories
    const categories = [...new Set(products.map(product => product.category))];
    
    // Clear existing options (except the "All" option)
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Add product to cart
function addToCart(event) {
    const productId = parseInt(event.target.dataset.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Update cart in localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update UI
    updateCartCount();
    renderCartItems();
    
    // Show feedback
    event.target.textContent = 'Added!';
    setTimeout(() => {
        event.target.textContent = 'Add to Cart';
    }, 1000);
}

// Update cart count in the header
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Render cart items in the dropdown
function renderCartItems() {
    // Clear previous items
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        totalAmount.textContent = '0';
        return;
    }
    
    // Render each cart item
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="assets/products/${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div class="cart-item-controls">
                <button class="decrease-quantity" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="increase-quantity" data-id="${item.id}">+</button>
                <button class="remove-item" data-id="${item.id}">&times;</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Calculate and display total amount
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = total.toFixed(2);
    
    // Add event listeners to quantity controls
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', decreaseQuantity);
    });
    
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', increaseQuantity);
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', removeItem);
    });
}

// Decrease item quantity in cart
function decreaseQuantity(event) {
    const productId = parseInt(event.target.dataset.id);
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
        
        // Update cart in localStorage and UI
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems();
    }
}

// Increase item quantity in cart
function increaseQuantity(event) {
    const productId = parseInt(event.target.dataset.id);
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += 1;
        
        // Update cart in localStorage and UI
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems();
    }
}

// Remove item from cart
function removeItem(event) {
    const productId = parseInt(event.target.dataset.id);
    cart = cart.filter(item => item.id !== productId);
    
    // Update cart in localStorage and UI
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

// Filter products by search term
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                             product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    // Reset to first page when filtering
    currentPage = 1;
    renderProducts();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('href').substring(1);
            
            // Update active page
            pages.forEach(page => page.classList.remove('active-page'));
            document.getElementById(targetPage).classList.add('active-page');
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Search and filter
    searchBtn.addEventListener('click', filterProducts);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            filterProducts();
        }
    });
    categoryFilter.addEventListener('change', filterProducts);
    
    // Pagination
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts();
        }
    });
    
    // Checkout button
    document.querySelector('.checkout-btn').addEventListener('click', () => {
        alert('Checkout functionality would be implemented here!');
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);