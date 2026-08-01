// ====== إدارة سلة التسوق ======

// الحصول على السلة من localStorage
function getCart() {
    const cart = localStorage.getItem('oribad_cart');
    return cart ? JSON.parse(cart) : [];
}

// حفظ السلة في localStorage
function saveCart(cart) {
    localStorage.setItem('oribad_cart', JSON.stringify(cart));
    updateCartCount();
}

// إضافة منتج للسلة
function addToCart(productId) {
    const cart = getCart();
    const product = productsData.find(p => p.id === productId);
    
    if (!product) {
        alert('المنتج غير موجود!');
        return;
    }

    // التحقق من المخزون
    if (product.stock <= 0) {
        alert('للأسف المنتج غير متوفر حالياً!');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('الكمية المطلوبة غير متوفرة!');
            return;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            size: product.size,
            image: product.image,
            quantity: 1,
            maxStock: product.stock
        });
    }

    saveCart(cart);
    showNotification('تم إضافة المنتج للسلة ✅');
    updateCartCount();
}

// حذف منتج من السلة
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartCount();
    displayCartItems(); // إذا كنا في صفحة السلة
}

// تحديث كمية منتج في السلة
function updateCartQuantity(productId, newQuantity) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    
    if (!item) return;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > item.maxStock) {
        alert('الكمية المطلوبة غير متوفرة!');
        return;
    }
    
    item.quantity = newQuantity;
    saveCart(cart);
    displayCartItems();
}

// عرض منتجات السلة
function displayCartItems() {
    const container = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    
    if (!container) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ccc;"></i>
                <p>سلة التسوق فارغة</p>
                <a href="categories.html" class="btn-primary">تسوق الآن</a>
            </div>
        `;
        if (totalElement) totalElement.textContent = '0 دج';
        return;
    }
    
    let total = 0;
    
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>📏 المقاس: ${item.size}</p>
                    <p class="cart-item-price">${item.price} دج</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button onclick="removeFromCart(${item.id})" class="btn-remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-total">
                    ${itemTotal} دج
                </div>
            </div>
        `;
    }).join('');
    
    if (totalElement) totalElement.textContent = `${total} دج`;
}

// تحديث عدد السلة في الهيدر
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline' : 'none';
    }
}

// إفراغ السلة
function clearCart() {
    if (confirm('هل أنت متأكد من إفراغ السلة؟')) {
        saveCart([]);
        displayCartItems();
        updateCartCount();
    }
}

// ====== إظهار إشعار مؤقت ======
function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'toast-notification';
    notif.innerHTML = `
        <i class="fas fa-check-circle" style="color: #10b981;"></i>
        ${message}
    `;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.classList.add('fade-out');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// إضافة تنسيق الإشعارات
const style = document.createElement('style');
style.textContent = `
    .toast-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        border-right: 4px solid #7c3aed;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 700;
        animation: slideUp 0.5s ease;
        direction: rtl;
    }
    
    .toast-notification.fade-out {
        animation: slideDown 0.3s ease forwards;
    }
    
    @keyframes slideUp {
        from { transform: translateY(100px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideDown {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(100px); opacity: 0; }
    }
`;
document.head.appendChild(style);
