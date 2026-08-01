// ====== وظائف لوحة التحكم ======

// ====== التحقق من صلاحية الأدمن ======
function checkAdminAccess() {
    const session = checkSession();
    if (!session || !session.isAdmin) {
        showNotification('غير مصرح لك بالدخول إلى لوحة التحكم', 'error');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
        return false;
    }
    return true;
}

// ====== تحميل إحصائيات لوحة التحكم ======
function loadDashboardStats() {
    // تحديث عدد المنتجات
    const totalProducts = document.getElementById('total-products');
    if (totalProducts) {
        totalProducts.textContent = productsData.length;
    }
    
    // تحديث عدد المستخدمين
    const totalUsers = document.getElementById('total-users');
    if (totalUsers) {
        const users = JSON.parse(localStorage.getItem('oribad_users')) || [];
        totalUsers.textContent = users.length;
    }
    
    // تحديث عدد الإشعارات
    const totalNotifs = document.getElementById('total-notifications');
    if (totalNotifs) {
        const notifications = JSON.parse(localStorage.getItem('oribad_notifications')) || [];
        totalNotifs.textContent = notifications.length;
    }
    
    // تحديث عدد الطلبات
    const totalOrders = document.getElementById('total-orders');
    if (totalOrders) {
        const orders = JSON.parse(localStorage.getItem('oribad_orders')) || [];
        totalOrders.textContent = orders.length;
    }
}

// ====== عرض المنتجات الأخيرة ======
function loadRecentProducts() {
    const tbody = document.getElementById('recent-products');
    if (!tbody) return;
    
    const recent = productsData.slice(-5).reverse();
    
    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: #888;">لا توجد منتجات</td></tr>`;
        return;
    }
    
    tbody.innerHTML = recent.map((product, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><img src="${product.image}" alt="${product.name}" class="product-image-thumb"></td>
            <td><strong>${product.name}</strong></td>
            <td>${getCategoryName(product.category)}</td>
            <td><strong>${product.price} دج</strong></td>
            <td>${product.stock}</td>
            <td>
                <button class="btn-sm btn-edit" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-sm btn-delete" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ====== عرض الطلبات الأخيرة ======
function loadRecentOrders() {
    const tbody = document.getElementById('recent-orders');
    if (!tbody) return;
    
    const orders = JSON.parse(localStorage.getItem('oribad_orders')) || [];
    const recent = orders.slice(-5).reverse();
    
    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: #888;">لا توجد طلبات</td></tr>`;
        return;
    }
    
    tbody.innerHTML = recent.map((order, index) => {
        const statusClass = {
            'pending': 'status-pending',
            'processing': 'status-processing',
            'shipped': 'status-shipped',
            'delivered': 'status-delivered',
            'cancelled': 'status-cancelled'
        }[order.status] || 'status-pending';
        
        const statusText = {
            'pending': '⏳ قيد الانتظار',
            'processing': '⚙️ قيد التجهيز',
            'shipped': '🚚 تم الشحن',
            'delivered': '✅ تم التسليم',
            'cancelled': '❌ ملغي'
        }[order.status] || order.status;
        
        return `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customer || 'غير معروف'}</td>
                <td>${order.items || 0} منتج</td>
                <td><strong>${order.total} دج</strong></td>
                <td><span class="order-status ${statusClass}">${statusText}</span></td>
                <td>${new Date(order.createdAt).toLocaleDateString('ar')}</td>
                <td>
                    <button class="btn-sm btn-edit" onclick="updateOrderStatus(${order.id})">
                        <i class="fas fa-sync"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ====== إضافة منتج جديد ======
function handleAddProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const size = document.getElementById('product-size').value;
    const stock = parseInt(document.getElementById('product-stock').value);
    const description = document.getElementById('product-description').value.trim();
    const imageInput = document.getElementById('product-image');
    
    // التحقق من الحقول
    if (!name || !category || !price || !size || stock === undefined) {
        showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // التحقق من الصورة
    if (!imageInput.files || !imageInput.files[0]) {
        showNotification('الرجاء اختيار صورة للمنتج', 'error');
        return;
    }
    
    // قراءة الصورة وتحويلها إلى Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const newProduct = {
            id: Date.now(),
            name: name,
            category: category,
            price: price,
            size: size,
            stock: stock,
            description: description || '',
            image: e.target.result,
            createdAt: new Date().toISOString()
        };
        
        // إضافة المنتج للقائمة
        productsData.push(newProduct);
        
        // حفظ في localStorage
        localStorage.setItem('oribad_products', JSON.stringify(productsData));
        
        showNotification('تم إضافة المنتج بنجاح 🎉', 'success');
        
        // إعادة تعيين النموذج
        document.getElementById('add-product-form').reset();
        document.getElementById('image-preview').innerHTML = '';
        
        // تحديث الإحصائيات
        loadDashboardStats();
        loadRecentProducts();
    };
    
    reader.readAsDataURL(imageInput.files[0]);
}

// ====== حذف منتج ======
function deleteProduct(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    const index = productsData.findIndex(p => p.id === productId);
    if (index !== -1) {
        productsData.splice(index, 1);
        localStorage.setItem('oribad_products', JSON.stringify(productsData));
        showNotification('تم حذف المنتج', 'info');
        loadRecentProducts();
        loadDashboardStats();
    }
}

// ====== تعديل منتج (مؤقت) ======
function editProduct(productId) {
    showNotification('سيتم إضافة ميزة التعديل قريباً', 'info');
}

// ====== تحديث حالة الطلب ======
function updateOrderStatus(orderId) {
    const orders = JSON.parse(localStorage.getItem('oribad_orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showNotification('الطلب غير موجود', 'error');
        return;
    }
    
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const currentIndex = statuses.indexOf(order.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    order.status = statuses[nextIndex];
    
    localStorage.setItem('oribad_orders', JSON.stringify(orders));
    showNotification(`تم تحديث حالة الطلب إلى: ${order.status}`, 'success');
    loadRecentOrders();
    loadDashboardStats();
}

// ====== عرض جميع الطلبات ======
function loadAllOrders() {
    const tbody = document.getElementById('orders-list');
    if (!tbody) return;
    
    const orders = JSON.parse(localStorage.getItem('oribad_orders')) || [];
    const filter = document.getElementById('order-filter')?.value || 'all';
    
    let filtered = orders;
    if (filter !== 'all') {
        filtered = orders.filter(o => o.status === filter);
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: #888;">لا توجد طلبات</td></tr>`;
        return;
    }
    
    tbody.innerHTML = filtered.map((order, index) => {
        const statusClass = {
            'pending': 'status-pending',
            'processing': 'status-processing',
            'shipped': 'status-shipped',
            'delivered': 'status-delivered',
            'cancelled': 'status-cancelled'
        }[order.status] || 'status-pending';
        
        const statusText = {
            'pending': '⏳ قيد الانتظار',
            'processing': '⚙️ قيد التجهيز',
            'shipped': '🚚 تم الشحن',
            'delivered': '✅ تم التسليم',
            'cancelled': '❌ ملغي'
        }[order.status] || order.status;
        
        return `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customer || 'غير معروف'}</td>
                <td>${order.items || 0} منتج</td>
                <td><strong>${order.total} دج</strong></td>
                <td><span class="order-status ${statusClass}">${statusText}</span></td>
                <td>${new Date(order.createdAt).toLocaleDateString('ar')}</td>
                <td>
                    <button class="btn-sm btn-edit" onclick="updateOrderStatus(${order.id})">
                        <i class="fas fa-sync"></i> تحديث
                    </button>
                    <button class="btn-sm btn-delete" onclick="deleteOrder(${order.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ====== فلترة الطلبات ======
function filterOrders() {
    loadAllOrders();
}

// ====== حذف طلب ======
function deleteOrder(orderId) {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    
    let orders = JSON.parse(localStorage.getItem('oribad_orders')) || [];
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem('oribad_orders', JSON.stringify(orders));
    showNotification('تم حذف الطلب', 'info');
    loadAllOrders();
    loadDashboardStats();
}

// ====== إظهار نموذج الإشعار ======
function showAddNotificationForm() {
    const form = document.getElementById('add-notification-form');
    if (form) {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

// ====== إخفاء نموذج الإشعار ======
function hideAddNotificationForm() {
    const form = document.getElementById('add-notification-form');
    if (form) {
        form.style.display = 'none';
    }
}

// ====== معاينة الصورة ======
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('product-image');
    const preview = document.getElementById('image-preview');
    
    if (imageInput && preview) {
        imageInput.addEventListener('change', function() {
            preview.innerHTML = '';
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = 'معاينة الصورة';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // التحقق من صلاحية الأدمن
    if (window.location.pathname.includes('admin/')) {
        checkAdminAccess();
        
        // تحميل البيانات
        loadDashboardStats();
        loadRecentProducts();
        loadRecentOrders();
        
        // تحميل جميع الطلبات إذا كنا في صفحة الطلبات
        if (window.location.pathname.includes('manage-orders.html')) {
            loadAllOrders();
        }
        
        // تحميل الإشعارات إذا كنا في صفحة الإشعارات
        if (window.location.pathname.includes('manage-notifications.html')) {
            loadNotifications();
        }
    }
});

// ====== تحميل البيانات من localStorage عند بدء التشغيل ======
// تحميل المنتجات من localStorage إذا وجدت
const savedProducts = localStorage.getItem('oribad_products');
if (savedProducts) {
    const parsed = JSON.parse(savedProducts);
    if (parsed && parsed.length > 0) {
        // دمج البيانات المحفوظة مع البيانات الافتراضية
        productsData.length = 0;
        productsData.push(...parsed);
    }
}

// ====== أزرار صغيرة ======
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    .btn-sm {
        padding: 5px 10px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: transform 0.2s;
    }
    
    .btn-sm:hover {
        transform: scale(1.05);
    }
    
    .btn-edit {
        background: #dbeafe;
        color: #2563eb;
    }
    
    .btn-edit:hover {
        background: #2563eb;
        color: white;
    }
    
    .btn-delete {
        background: #fee2e2;
        color: #ef4444;
    }
    
    .btn-delete:hover {
        background: #ef4444;
        color: white;
    }
`;
document.head.appendChild(adminStyles);
