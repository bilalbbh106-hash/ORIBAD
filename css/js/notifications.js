// ====== نظام الإشعارات ======

// ====== بيانات الإشعارات ======
let notifications = JSON.parse(localStorage.getItem('oribad_notifications')) || [];

// ====== إضافة إشعار جديد ======
function addNotification(title, message, type = 'general', target = 'all') {
    const newNotif = {
        id: Date.now(),
        title: title,
        message: message,
        type: type,
        target: target,
        read: false,
        createdAt: new Date().toISOString()
    };
    
    notifications.push(newNotif);
    localStorage.setItem('oribad_notifications', JSON.stringify(notifications));
    
    updateNotificationCount();
    
    if (document.getElementById('notifications-list')) {
        displayNotifications();
    }
    
    return newNotif;
}

// ====== عرض الإشعارات ======
function displayNotifications(filter = 'all') {
    const container = document.getElementById('notifications-list');
    if (!container) return;
    
    let filtered = notifications;
    
    if (filter !== 'all') {
        filtered = notifications.filter(n => n.type === filter);
    }
    
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="notif-empty">
                <i class="fas fa-bell-slash"></i>
                <p>لا توجد إشعارات</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(notif => {
        const typeIcons = {
            general: '📢',
            offer: '🎉',
            urgent: '⚠️',
            update: '🔄'
        };
        
        const typeClasses = {
            general: 'general',
            offer: 'offer',
            urgent: 'urgent',
            update: 'update'
        };
        
        return `
            <div class="notification-card ${notif.read ? '' : 'unread'}" data-id="${notif.id}">
                <div class="notif-icon ${typeClasses[notif.type] || 'general'}">
                    ${typeIcons[notif.type] || '📢'}
                </div>
                <div class="notif-body">
                    <h4>${notif.title}</h4>
                    <p>${notif.message}</p>
                    <span class="notif-time">${timeAgo(notif.createdAt)}</span>
                </div>
                <div class="notif-status">
                    ${!notif.read ? '<span class="unread-dot"></span>' : ''}
                    <button onclick="markAsRead(${notif.id})" style="background: none; border: none; color: #7c3aed; cursor: pointer; font-size: 0.8rem;">
                        ${notif.read ? '<i class="fas fa-check"></i>' : '<i class="fas fa-check-circle"></i>'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    updateNotificationCount();
}

// ====== فلترة الإشعارات ======
function filterNotifications(filter, button) {
    document.querySelectorAll('.notif-filters button').forEach(btn => {
        btn.classList.remove('active');
    });
    if (button) button.classList.add('active');
    
    displayNotifications(filter);
}

// ====== تحديد إشعار كمقروء ======
function markAsRead(notifId) {
    const notif = notifications.find(n => n.id === notifId);
    if (notif) {
        notif.read = true;
        localStorage.setItem('oribad_notifications', JSON.stringify(notifications));
        displayNotifications();
        updateNotificationCount();
    }
}

// ====== تحديد الكل كمقروء ======
function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    localStorage.setItem('oribad_notifications', JSON.stringify(notifications));
    displayNotifications();
    updateNotificationCount();
    showNotification('تم تحديد جميع الإشعارات كمقروءة ✅', 'success');
}

// ====== تحديث عدد الإشعارات ======
function updateNotificationCount() {
    const unread = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notif-count');
    if (badge) {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'inline' : 'none';
    }
}

// ====== وقت الإشعار ======
function timeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    if (minutes > 0) return `منذ ${minutes} دقيقة`;
    return 'الآن';
}

// ====== إشعارات تجريبية ======
function loadSampleNotifications() {
    if (notifications.length === 0) {
        addNotification(
            'مرحباً بك في ORIBAD! 🎉',
            'نشكرك لانضمامك إلينا. استمتع بتجربة تسوق مميزة.',
            'general',
            'all'
        );
        
        addNotification(
            'تخفيضات الصيف! ☀️',
            'خصم 30% على جميع القمصان لفترة محدودة. لا تفوت الفرصة!',
            'offer',
            'all'
        );
    }
}

// ====== تحميل الصفحة ======
document.addEventListener('DOMContentLoaded', function() {
    loadSampleNotifications();
    
    if (document.getElementById('notifications-list')) {
        displayNotifications();
    }
    
    updateNotificationCount();
});

// ====== تصدير الدوال ======
window.addNotification = addNotification;
window.displayNotifications = displayNotifications;
window.filterNotifications = filterNotifications;
window.markAsRead = markAsRead;
window.markAllAsRead = markAllAsRead;
window.updateNotificationCount = updateNotificationCount;
window.timeAgo = timeAgo;
