// ====== نظام الطلبات ======

// ====== إنشاء طلب جديد ======
function createOrder(customerName, items, total) {
    const order = {
        id: Date.now(),
        customer: customerName || 'زائر',
        items: items,
        total: total,
        status: 'pending', // pending, processing, shipped, delivered, cancelled
        createdAt: new Date().toISOString(),
        tracking: {
            steps: [
                { status: 'pending', label: 'تم استلام الطلب', completed: true, date: new Date().toISOString() },
                { status: 'processing', label: 'قيد التجهيز', completed: false, date: null },
                { status: 'shipped', label: 'تم الشحن', completed: false, date: null },
                { status: 'delivered', label: 'تم التسليم', completed: false, date: null }
            ]
        }
    };
    
    // حفظ الطلب
    const orders = JSON.parse(localStorage.getItem('oribad_orders')) || [];
    orders.push(order);
    localStorage.setItem('oribad_orders', JSON.stringify(orders));
    
    // إشعار للمستخدم
    addNotification(
        'تم استلام طلبك 📦',
        `تم استلام طلبك رقم #${order.id} بنجاح. سنقوم بتجهيزه قريباً.`,
        'update',
        'users'
    );
    
    return order;
}

// ====== الحصول على طلب حسب الرقم ======
function getOrderById(orderId) {
    const orders = JSON.parse(localStorage.getItem('oribad_orders')) || [];
    return orders.find(o => o.id === parseInt(orderId));
}

// ====== تحديث حالة الطلب ======
function updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('oribad_orders')) || [];
    const order = orders.find(o => o.id === parseInt(orderId));
    
    if (!order) return null;
    
    order.status = newStatus;
    
    // تحديث خطوات التتبع
    const stepMap = {
        'pending': 0,
        'processing': 1,
        'shipped': 2,
        'delivered': 3
    };
    
    const stepIndex = stepMap[newStatus];
    if (stepIndex !== undefined) {
        order.tracking.steps.forEach((step, index) => {
            if (index <= stepIndex) {
                step.completed = true;
                if (!step.date) step.date = new Date().toISOString();
            } else {
                step.completed = false;
            }
        });
    }
    
    localStorage.setItem('oribad_orders', JSON.stringify(orders));
    
    // إشعار للمستخدم
    const statusMessages = {
        'processing': 'طلبك قيد التجهيز ⚙️',
        'shipped': 'تم شحن طلبك 🚚',
        'delivered': 'تم تسليم طلبك ✅',
        'cancelled': 'تم إلغاء طلبك ❌'
    };
    
    if (statusMessages[newStatus]) {
        addNotification(
            statusMessages[newStatus],
            `طلبك رقم #${order.id} تحديث: ${statusMessages[newStatus]}`,
            'update',
            'users'
        );
    }
    
    return order;
}

// ====== عرض تتبع الطلب ======
function displayTracking(orderId) {
    const container = document.getElementById('tracking-result');
    if (!container) return;
    
    const order = getOrderById(orderId);
    
    if (!order) {
        container.innerHTML = `
            <div class="tracking-card no-order">
                <i class="fas fa-box"></i>
                <p>⚠️ لم يتم العثور على طلب برقم <strong>#${orderId}</strong></p>
                <p style="font-size: 0.9rem; margin-top: 5px;">يرجى التحقق من رقم الطلب والمحاولة مرة أخرى</p>
            </div>
        `;
        return;
    }
    
    const statusLabels = {
        'pending': '⏳ قيد الانتظار',
        'processing': '⚙️ قيد التجهيز',
        'shipped': '🚚 تم الشحن',
        'delivered': '✅ تم التسليم',
        'cancelled': '❌ ملغي'
    };
    
    const statusColors = {
        'pending': '#f59e0b',
        'processing': '#3b82f6',
        'shipped': '#4f46e5',
        'delivered': '#10b981',
        'cancelled': '#ef4444'
    };
    
    // تحديد الخطوة النشطة
    const stepMap = {
        'pending': 0,
        'processing': 1,
        'shipped': 2,
        'delivered': 3,
        'cancelled': -1
    };
    
    const activeStep = stepMap[order.status] || 0;
    
    container.innerHTML = `
        <div class="tracking-card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <span class="tracking-id">#${order.id}</span>
                    <span style="margin-right: 10px; color: #888;">${new Date(order.createdAt).toLocaleDateString('ar')}</span>
                </div>
                <span style="padding: 5px 15px; border-radius: 20px; background: ${statusColors[order.status]}20; color: ${statusColors[order.status]}; font-weight: 700;">
                    ${statusLabels[order.status] || order.status}
                </span>
            </div>
            
            <div class="tracking-steps">
                ${order.tracking.steps.map((step, index) => {
                    const isActive = index === activeStep && order.status !== 'cancelled';
                    const isCompleted = step.completed;
                    const isCancelled = order.status === 'cancelled';
                    
                    let circleClass = '';
                    if (isCancelled && index === 0) circleClass = 'active';
                    else if (isCompleted) circleClass = 'completed';
                    else if (isActive) circleClass = 'active';
                    
                    let labelClass = '';
                    if (isCancelled && index === 0) labelClass = 'active';
                    else if (isCompleted) labelClass = 'completed';
                    else if (isActive) labelClass = 'active';
                    
                    return `
                        <div class="step">
                            <div class="step-circle ${circleClass}">
                                ${isCompleted ? '<i class="fas fa-check"></i>' : (isActive ? '<i class="fas fa-spinner fa-pulse"></i>' : index + 1)}
                            </div>
                            <span class="step-label ${labelClass}">${step.label}</span>
                            ${step.date ? `<span style="font-size: 0.6rem; color: #aaa;">${new Date(step.date).toLocaleDateString('ar')}</span>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            
            ${order.status === 'cancelled' ? `
                <div style="text-align: center; padding: 15px; background: #fee2e2; border-radius: 10px; margin-top: 10px;">
                    <span style="color: #ef4444; font-weight: 700;">❌ تم إلغاء هذا الطلب</span>
                </div>
            ` : ''}
            
            <div class="order-details">
                <div class="detail-item">
                    <label>العميل</label>
                    <span>${order.customer}</span>
                </div>
                <div class="detail-item">
                    <label>عدد المنتجات</label>
                    <span>${order.items} منتج</span>
                </div>
                <div class="detail-item">
                    <label>الإجمالي</label>
                    <span style="color: #7c3aed; font-size: 1.2rem;">${order.total} دج</span>
                </div>
                <div class="detail-item">
                    <label>حالة الدفع</label>
                    <span style="color: #10b981;">✅ مدفوع</span>
                </div>
            </div>
        </div>
    `;
}

// ====== تتبع الطلب من الإدخال ======
function trackOrder() {
    const input = document.getElementById('order-id-input');
    if (!input) return;
    
    const orderId = input.value.trim().replace('#', '');
    if (!orderId) {
        showNotification('الرجاء إدخال رقم الطلب', 'error');
        return;
    }
    
    displayTracking(orderId);
}

// ====== الحصول على طلبات المستخدم ======
function getUserOrders(username) {
    const orders = JSON.parse(localStorage.getItem('oribad_orders')) || [];
    return orders.filter(o => o.customer === username);
}

// ====== إتمام الشراء (من السلة) ======
function checkout() {
    const cart = getCart();
    
    if (cart.length === 0) {
        showNotification('السلة فارغة! أضف منتجات أولاً', 'error');
        return;
    }
    
    // التحقق من تسجيل الدخول
    const session = checkSession();
    const customerName = session ? session.username : 'زائر';
    
    // حساب المجموع
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // إنشاء الطلب
    const order = createOrder(customerName, cart.length, total);
    
    // إفراغ السلة
    saveCart([]);
    updateCartCount();
    
    showNotification(`تم إنشاء الطلب بنجاح! رقم الطلب: #${order.id} 🎉`, 'success');
    
    // إعادة توجيه لتتبع الطلب
    setTimeout(() => {
        window.location.href = `order-tracking.html`;
    }, 2000);
}

// ====== تحميل الصفحة ======
document.addEventListener('DOMContentLoaded', function() {
    // إذا كان هناك رقم طلب في الرابط
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order');
    if (orderId && document.getElementById('tracking-result')) {
        document.getElementById('order-id-input').value = orderId;
        displayTracking(orderId);
    }
});
