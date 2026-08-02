// ====== نظام المصادقة مع Supabase ======

// ====== التحقق من الجلسة ======
function checkSession() {
    const session = JSON.parse(localStorage.getItem('oribad_session'));
    return session;
}

// ====== الحصول على المستخدم الحالي ======
function getCurrentUser() {
    const session = checkSession();
    if (!session) return null;
    return session;
}

// ====== التحقق من صلاحية الأدمن ======
function isAdmin() {
    const session = checkSession();
    return session && session.isAdmin === true;
}

// ====== تحديث واجهة المستخدم حسب الجلسة ======
function updateUIForAuth() {
    const session = checkSession();
    const loginBtn = document.getElementById('auth-btn');
    const adminLink = document.getElementById('admin-link');
    
    if (session) {
        if (loginBtn) {
            loginBtn.textContent = `👤 ${session.username}`;
            loginBtn.href = 'profile.html';
            loginBtn.classList.remove('btn-login');
            loginBtn.classList.add('btn-profile');
        }
        
        // إظهار زر الأدمن إذا كان المستخدم أدمن
        if (session.isAdmin === true) {
            if (adminLink) adminLink.style.display = 'block';
        } else {
            if (adminLink) adminLink.style.display = 'none';
        }
    } else {
        if (loginBtn) {
            loginBtn.textContent = 'تسجيل الدخول';
            loginBtn.href = 'login.html';
            loginBtn.classList.remove('btn-profile');
            loginBtn.classList.add('btn-login');
        }
        if (adminLink) adminLink.style.display = 'none';
    }
}

// ====== تسجيل مستخدم جديد ======
async function handleRegister(event) {
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
    
    if (password !== passwordConfirm) {
        showNotification('كلمتا المرور غير متطابقتين', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    if (termsCheck && !termsCheck.checked) {
        showNotification('يجب الموافقة على الشروط والأحكام', 'error');
        return;
    }
    
    try {
        // التحقق من عدم تكرار اسم المستخدم في Supabase
        const { data: existingUser, error: checkError } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single();
        
        if (existingUser) {
            showNotification('اسم المستخدم مستخدم بالفعل', 'error');
            return;
        }
        
        // إنشاء المستخدم في Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { 
                    username: username,
                    full_name: username
                }
            }
        });
        
        if (authError) {
            if (authError.message.includes('already registered')) {
                showNotification('البريد الإلكتروني مستخدم بالفعل', 'error');
            } else {
                showNotification(authError.message, 'error');
            }
            return;
        }
        
        if (!authData.user) {
            showNotification('حدث خطأ أثناء إنشاء الحساب', 'error');
            return;
        }
        
        // إدراج الملف الشخصي (يتم تلقائياً عن طريق Trigger، لكن نضعه للإحتياط)
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                username: username,
                email: email,
                full_name: username
            }, { onConflict: 'id' });
        
        if (profileError) {
            console.warn('Profile creation warning:', profileError);
        }
        
        showNotification('تم إنشاء الحساب بنجاح 🎉', 'success');
        
        // إعادة توجيه لتسجيل الدخول
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('حدث خطأ غير متوقع', 'error');
    }
}

// ====== تسجيل الدخول ======
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me')?.checked || false;
    
    if (!email || !password) {
        showNotification('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 'error');
        return;
    }
    
    try {
        // محاولة تسجيل الدخول
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
            } else {
                showNotification(error.message, 'error');
            }
            return;
        }
        
        if (!data.user) {
            showNotification('حدث خطأ أثناء تسجيل الدخول', 'error');
            return;
        }
        
        // جلب بيانات المستخدم من جدول profiles
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        if (profileError) {
            console.warn('Profile fetch warning:', profileError);
        }
        
        // حفظ الجلسة في localStorage
        const session = {
            userId: data.user.id,
            email: data.user.email,
            username: profile?.username || email,
            isAdmin: profile?.is_admin || false,
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
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('حدث خطأ غير متوقع', 'error');
    }
}

// ====== تسجيل الخروج ======
async function logout() {
    if (!confirm('هل أنت متأكد من تسجيل الخروج؟')) return;
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        localStorage.removeItem('oribad_session');
        showNotification('تم تسجيل الخروج', 'info');
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
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

// ====== إظهار إشعار مؤقت ======
function showNotification(message, type = 'success') {
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
}

// ====== تحميل الصفحة ======
document.addEventListener('DOMContentLoaded', function() {
    updateUIForAuth();
    
    // تحديث عدد السلة والإشعارات
    if (typeof updateCartCount === 'function') updateCartCount();
    if (typeof updateNotificationCount === 'function') updateNotificationCount();
    
    // إذا كان المستخدم مسجل دخول وفتح صفحة تسجيل الدخول، حوله للرئيسية
    const session = checkSession();
    const isLoginPage = window.location.pathname.includes('login.html');
    const isRegisterPage = window.location.pathname.includes('register.html');
    
    if (session && (isLoginPage || isRegisterPage)) {
        window.location.href = 'index.html';
    }
    
    // ربط نموذج تسجيل الدخول
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // ربط نموذج التسجيل
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// ====== تصدير الدوال للاستخدام في HTML ======
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.togglePassword = togglePassword;
window.checkSession = checkSession;
window.updateUIForAuth = updateUIForAuth;
window.isAdmin = isAdmin;
window.getCurrentUser = getCurrentUser;
window.showNotification = showNotification;
