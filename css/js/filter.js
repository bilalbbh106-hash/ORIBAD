// ====== وظائف الفلترة المتقدمة ======

// البحث عن المنتجات
function searchProducts(query) {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return productsData;
    
    return productsData.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        getCategoryName(product.category).includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
}

// ترتيب المنتجات
function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch(sortBy) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return sorted;
    }
}

// الحصول على المنتجات المتاحة
function getAvailableProducts() {
    return productsData.filter(p => p.stock > 0);
}

// الحصول على المنتجات حسب القسم
function getProductsByCategory(category) {
    return productsData.filter(p => p.category === category);
}

// الحصول على المنتجات حسب المقاس
function getProductsBySize(size) {
    return productsData.filter(p => p.size === size);
}

// الحصول على المنتجات حسب السعر
function getProductsByPriceRange(min, max) {
    return productsData.filter(p => p.price >= min && p.price <= max);
}

// ====== إضافة حقل البحث للسلة ======
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const results = searchProducts(this.value);
            displayProducts(results);
        });
    }
});
