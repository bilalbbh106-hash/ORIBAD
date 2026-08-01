// ====== نظام المصادقة ======

// المستخدمون المخزنون (محاكاة)
let users = JSON.parse(localStorage.getItem('oribad_users')) || [];

// ====== تسجيل مستخدم جديد ======
function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;
    const termsCheck = document.getElementById('terms-check');
    
    // التحقق من الحقول
    if (!username || !email || !password || !passwordConfirm) {
        showNotification('الرجاء ملء جميع الحقول', 'error');
        return;
    }
    
    // التحقق من تطابق كلمة المرور
    if (password !== passwordConfirm) {
        showNotification('كلمتا المرور غير متطابقتين', 'error');
        return;
    }
    
    // التحقق من طول كلمة المرور
    if (password.length < 6) {
        showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    // التحقق من الموافقة على الشروط
    if (!termsCheck.checked) {
        showNotification('يجب الموافقة على الشروط والأحكام', 'error');
        return;
    }
    
    // التحقق من عدم تكرار اسم المستخدم
    const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (userExists) {
        const errorDiv = document.getElementById('username-error');
        if (errorDiv) errorDiv.style.display = 'flex';
        showNotification('اسم المستخدم مستخدم بالفعل', 'error');
        return;
    }
    
    // إنشاء المستخدم
    const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: btoa(password), // تشفير بسيط
        createdAt: new Date().toISOString(),
        isAdmin: false
    };
    
    users.push(newUser);
    localStorage.setItem('oribad_users', JSON.stringify(users));
    
    showNotification('تم إنشاء الحساب بنجاح 🎉', 'success');
    
    // إعادة توجيه لتسجيل الدخول
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// ====== تسجيل الدخول ======
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    if (!username || !password) {
        showNotification('الرجاء إدخال اسم المستخدم وكلمة المرور', 'error');
        return;
    }
    
    // البحث عن المستخدم
    const user = users.find(u => 
        (u.username.toLowerCase() === username.toLowerCase() || 
         u.email.toLowerCase() === username.toLowerCase()) &&
        u.password === btoa(password)
    );
    
    if (!user) {
        showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
        return;
    }
    
    // تسجيل الدخول
    const session = {
        userId: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin || false,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('oribad_session', JSON.stringify(session));
    
    showNotification('تم تسجيل الدخول بنجاح ✅', 'success');
    
    // إعادة توجيه حسب الصلاحية
    setTimeout(() => {
        if (session.isAdmin) {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    }, 1000);
}

// ====== تسجيل الخروج ======
function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        localStorage.removeItem('oribad_session');
        showNotification('تم تسجيل الخروج', 'info');
        window.location.href = 'index.html';
    }
}

// ====== التحقق من الجلسة ======
function checkSession() {
    const session = JSON.parse(localStorage.getItem('oribad_session'));
    return session;
}

// ====== الحصول على المستخدم الحالي ======
function getCurrentUser() {
    const session = checkSession();
    if (!session) return null;
    
    const user = users.find(u => u.id === session.userId);
    return user || null;
}

// ====== التحقق من صلاحية الأدمن ======
function isAdmin() {
    const session = checkSession();
    return session && session.isAdmin === true;
}

// ====== تحديث واجهة المستخدم حسب الجلسة ======
function updateUIForAuth() {
    const session = checkSession();
    const loginBtn = document.querySelector('.btn-login');
    
    if (session) {
        if (loginBtn) {
            loginBtn.textContent = `👤 ${session.username}`;
            loginBtn.href = 'profile.html';
        }
    } else {
        if (loginBtn) {
            loginBtn.textContent = 'تسجيل الدخول';
            loginBtn.href = 'login.html';
        }
    }
}

// ====== إظهار/إخفاء كلمة المرور ======
function togglePassword(element) {
    const input = element.closest('.input-wrapper').querySelector('input');
    if (input.type === 'password') {
        input.type = 'text';
        element.classList.remove('fa-eye');
        element.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        element.classList.remove('fa-eye-slash');
        element.classList.add('fa-eye');
    }
}

// ====== تعديل دالة showNotification لدعم الأنواع ======
const originalShowNotification = window.showNotification;
window.showNotification = function(message, type = 'success') {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };
    
    const notif = document.createElement('div');
    notif.className = 'toast-notification';
    notif.style.borderRightColor = colors[type] || '#7c3aed';
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    notif.innerHTML = `
        <i class="fas ${icons[type] || 'fa-check-circle'}" style="color: ${colors[type] || '#7c3aed'};"></i>
        ${message}
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.classList.add('fade-out');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
};

// ====== تحميل الصفحة ======
document.addEventListener('DOMContentLoaded', function() {
    updateUIForAuth();
    updateCartCount();
    
    // إذا كان المستخدم مسجل دخول وفتح صفحة تسجيل الدخول، حوله للرئيسية
    const session = checkSession();
    const isLoginPage = window.location.pathname.includes('login.html');
    const isRegisterPage = window.location.pathname.includes('register.html');
    
    if (session && (isLoginPage || isRegisterPage)) {
        window.location.href = 'index.html';
    }
});
