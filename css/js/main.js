// ====== بيانات المنتجات الوهمية (للتجربة) ======
const productsData = [
    {
        id: 1,
        name: 'قميص قطني كلاسيك',
        category: 'shirts',
        price: 250,
        size: 'M',
        stock: 15,
        image: 'https://via.placeholder.com/250x250/7c3aed/ffffff?text=ORIBAD+Shirt',
        description: 'قميص قطني مريح لمناسبة كل الأوقات'
    },
    {
        id: 2,
        name: 'سروال جينز عصري',
        category: 'pants',
        price: 450,
        size: 'L',
        stock: 8,
        image: 'https://via.placeholder.com/250x250/6d28d9/ffffff?text=ORIBAD+Jeans',
        description: 'سروال جينز عالي الجودة'
    },
    {
        id: 3,
        name: 'حذاء رياضي',
        category: 'shoes',
        price: 350,
        size: '42',
        stock: 5,
        image: 'https://via.placeholder.com/250x250/4f46e5/ffffff?text=ORIBAD+Shoes',
        description: 'حذاء رياضي مريح ومناسب للمشي'
    },
    {
        id: 4,
        name: 'ملابس داخلية قطنية',
        category: 'underwear',
        price: 120,
        size: 'M',
        stock: 20,
        image: 'https://via.placeholder.com/250x250/7c3aed/ffffff?text=ORIBAD+Underwear',
        description: 'ملابس داخلية مريحة من القطن'
    },
    {
        id: 5,
        name: 'جوارب رياضية',
        category: 'socks',
        price: 80,
        size: 'One Size',
        stock: 30,
        image: 'https://via.placeholder.com/250x250/6d28d9/ffffff?text=ORIBAD+Socks',
        description: 'جوارب رياضية عالية الجودة'
    },
    {
        id: 6,
        name: 'قميص أنيق رسمي',
        category: 'shirts',
        price: 320,
        size: 'XL',
        stock: 7,
        image: 'https://via.placeholder.com/250x250/4f46e5/ffffff?text=ORIBAD+Formal',
        description: 'قميص أنيق للمناسبات الرسمية'
    }
];

// ====== عرض المنتجات ======
function displayProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #ccc;"></i>
                <p>لا توجد منتجات متطابقة</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${getCategoryName(product.category)}</p>
                <p class="product-size">📏 المقاس: ${product.size}</p>
                <p class="product-price">💰 ${product.price} دج</p>
                <p class="product-stock">📦 المخزون: ${product.stock} قطعة</p>
                <button class="btn-add-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> أضف للسلة
                </button>
            </div>
        </div>
    `).join('');
}

// ====== الحصول على اسم القسم ======
function getCategoryName(category) {
    const names = {
        'shirts': '👕 القمصان',
        'pants': '👖 السراويل',
        'shoes': '👟 الأحذية',
        'underwear': '🩲 الملابس الداخلية',
        'socks': '🧦 الجوارب'
    };
    return names[category] || category;
}

// ====== فلترة المنتجات ======
function filterProducts(category) {
    const filtered = category === 'all' 
        ? productsData 
        : productsData.filter(p => p.category === category);
    displayProducts(filtered);
    
    const select = document.getElementById('filter-category');
    if (select) select.value = category;
}

// ====== تطبيق الفلاتر ======
function applyFilters() {
    const category = document.getElementById('filter-category')?.value || 'all';
    const size = document.getElementById('filter-size')?.value || 'all';
    const maxPrice = parseInt(document.getElementById('price-range')?.value || 1000);

    let filtered = productsData;

    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }

    if (size !== 'all') {
        filtered = filtered.filter(p => p.size === size);
    }

    filtered = filtered.filter(p => p.price <= maxPrice);

    displayProducts(filtered);
    updatePriceLabel(maxPrice);
}

// ====== تحديث تسمية السعر ======
function updatePriceLabel(value) {
    const label = document.getElementById('price-label');
    if (label) label.textContent = `حتى ${value} دج`;
}

// ====== إعادة تعيين الفلاتر ======
function resetFilters() {
    const categorySelect = document.getElementById('filter-category');
    const sizeSelect = document.getElementById('filter-size');
    const priceRange = document.getElementById('price-range');

    if (categorySelect) categorySelect.value = 'all';
    if (sizeSelect) sizeSelect.value = 'all';
    if (priceRange) {
        priceRange.value = 1000;
        updatePriceLabel(1000);
    }

    displayProducts(productsData);
}

// ====== القائمة في الجوال ======
function toggleMenu() {
    const nav = document.querySelector('.nav-links');
    if (nav) nav.classList.toggle('show');
}

// ====== تحميل الصفحة ======
document.addEventListener('DOMContentLoaded', function() {
    displayProducts(productsData);
    if (typeof updateCartCount === 'function') updateCartCount();
    if (typeof updateNotificationCount === 'function') updateNotificationCount();
    if (typeof updateUIForAuth === 'function') updateUIForAuth();
});

// ====== إغلاق القائمة عند النقر خارجها ======
document.addEventListener('click', function(event) {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav-links');
    
    if (hamburger && nav && !hamburger.contains(event.target) && !nav.contains(event.target)) {
        nav.classList.remove('show');
    }
});

// ====== تصدير الدوال للاستخدام في HTML ======
window.displayProducts = displayProducts;
window.filterProducts = filterProducts;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.toggleMenu = toggleMenu;
window.getCategoryName = getCategoryName;
