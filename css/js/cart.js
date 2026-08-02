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
        showNotification('المنتج غير موجود!', 'error');
        return;
    }

    if (product.stock <= 0) {
        showNotification('للأسف المنتج غير متوفر حالياً!', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            showNotification('الكمية المطلوبة غير متوفرة!', 'error');
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
    showNotification('تم إضافة المنتج للسلة ✅', 'success');
    updateCartCount();
}

// حذف منتج من السلة
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartCount();
    if (typeof displayCartItems === 'function') displayCartItems();
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
        showNotification('الكمية المطلوبة غير متوفرة!', 'error');
        return;
    }
    
    item.quantity = newQuantity;
    saveCart(cart);
    if (typeof displayCartItems === 'function') displayCartItems();
}

// عرض منتجات السلة
function displayCartItems() {
    const container = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const itemCountElement = document.getElementById('cart-item-count');
    const shippingElement = document.getElementById('shipping-cost');
    const grandTotalElement = document.getElementById('grand-total');
    
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
        if (itemCountElement) itemCountElement.textContent = '0';
        if (shippingElement) shippingElement.textContent = '0 دج';
        if (grandTotalElement) grandTotalElement.textContent = '0 دج';
        return;
    }
    
    let total = 0;
    let itemCount = 0;
    
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemCount += item.quantity;
        
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
    
    // تحديث الملخص
    const shipping = total > 0 ? (total >= 500 ? 0 : 50) : 0;
    const grandTotal = total + shipping;
    
    if (totalElement) totalElement.textContent = `${total} دج`;
    if (itemCountElement) itemCountElement.textContent = itemCount;
    if (shippingElement) shippingElement.textContent = `${shipping} دج`;
    if (grandTotalElement) grandTotalElement.textContent = `${grandTotal} دج`;
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
        if (typeof displayCartItems === 'function') displayCartItems();
        updateCartCount();
        showNotification('تم إفراغ السلة', 'info');
    }
}

// إتمام الشراء
function checkout() {
    const cart = getCart();
    
    if (cart.length === 0) {
        showNotification('السلة فارغة! أضف منتجات أولاً', 'error');
        return;
    }
    
    // التحقق من تسجيل الدخول
    const session = checkSession ? checkSession() : null;
    if (!session) {
        showNotification('الرجاء تسجيل الدخول أولاً', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // حساب المجموع
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = total >= 500 ? 0 : 50;
    const grandTotal = total + shipping;
    
    // إشعار نجاح
    showNotification(`تم إنشاء الطلب بنجاح! الإجمالي: ${grandTotal} دج 🎉`, 'success');
    
    // إفراغ السلة
    saveCart([]);
    updateCartCount();
    
    // إعادة توجيه لتتبع الطلب
    setTimeout(() => {
        window.location.href = 'order-tracking.html';
    }, 2000);
}

// ====== تحميل الصفحة ======
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('cart-items')) {
        displayCartItems();
    }
    updateCartCount();
});

// ====== تصدير الدوال ======
window.getCart = getCart;
window.saveCart = saveCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.displayCartItems = displayCartItems;
window.updateCartCount = updateCartCount;
window.clearCart = clearCart;
window.checkout = checkout;
