/**
 * САМООР RESTAURANT ORDERING SYSTEM - ADMIN PORTAL JS
 * Controls authorization, localStorage state manipulation (CRUD), and dish form validations.
 */

// ==========================================================================
// AUTHORIZATION CONFIG
// ==========================================================================
const ADMIN_PASSWORD = "admin";

// State variables
let dishesList = [];
let categoriesList = [];
let promoCodesList = [];

// ==========================================================================
// DOM ELEMENT MAPPINGS
// ==========================================================================
const DOM = {
  authOverlay: document.getElementById("auth-overlay"),
  authForm: document.getElementById("auth-form"),
  authPassword: document.getElementById("auth-password"),
  authErrorMsg: document.getElementById("auth-error-msg"),
  
  adminContainer: document.getElementById("admin-container"),
  logoutBtn: document.getElementById("admin-logout-btn"),
  
  // Stats
  statsTotalDishes: document.getElementById("stats-total-dishes"),
  statsDiscountedDishes: document.getElementById("stats-discounted-dishes"),
  statsCategories: document.getElementById("stats-categories"),
  
  // Actions
  searchInput: document.getElementById("admin-search"),
  addDishBtn: document.getElementById("add-dish-btn"),
  
  // CRUD table
  tableBody: document.getElementById("dishes-table-body"),
  
  // Form Modal
  dishModal: document.getElementById("dish-modal"),
  closeModalBtn: document.getElementById("close-modal-btn"),
  dishForm: document.getElementById("dish-form"),
  modalTitle: document.getElementById("modal-title"),
  
  // Form inputs
  formDishId: document.getElementById("form-dish-id"),
  formName: document.getElementById("form-name"),
  formCategory: document.getElementById("form-category"),
  formPortion: document.getElementById("form-portion"),
  formDescription: document.getElementById("form-description"),
  formImage: document.getElementById("form-image"),
  formPrice: document.getElementById("form-price"),
  formIsDiscounted: document.getElementById("form-is-discounted"),
  formDiscountPrice: document.getElementById("form-discount-price"),
  discountPriceContainer: document.getElementById("discount-price-container"),

  // Tab containers & switchers
  tabDishes: document.getElementById("tab-dishes"),
  tabPromocodes: document.getElementById("tab-promocodes"),
  dishesSection: document.getElementById("dishes-section-container"),
  promocodesSection: document.getElementById("promocodes-section-container"),

  // Promocode CRUD
  addPromoBtn: document.getElementById("add-promo-btn"),
  promosTableBody: document.getElementById("promos-table-body"),
  promoModal: document.getElementById("promo-modal"),
  closePromoModalBtn: document.getElementById("close-promo-modal-btn"),
  promoForm: document.getElementById("promo-form"),
  promoModalTitle: document.getElementById("promo-modal-title"),
  formPromoOldCode: document.getElementById("form-promo-old-code"),
  formPromoCode: document.getElementById("form-promo-code"),
  formPromoPercent: document.getElementById("form-promo-percent"),
  formPromoActive: document.getElementById("form-promo-active")
};

// ==========================================================================
// AUTHENTICATION LOGIC
// ==========================================================================
function checkAuth() {
  try {
    if (localStorage.getItem("samoor_admin_auth") === "true") {
      showDashboard();
    }
  } catch (e) {
    console.error("Auth check failed:", e);
  }
}

function handleLogin(e) {
  e.preventDefault();
  const password = DOM.authPassword.value;
  
  // Accept standard passwords 'admin', 'samoor' or config password
  if (password === ADMIN_PASSWORD || password === "admin" || password === "samoor") {
    try {
      localStorage.setItem("samoor_admin_auth", "true");
    } catch (e) {
      console.warn("Storage set failed:", e);
    }
    DOM.authErrorMsg.style.display = "none";
    showDashboard();
  } else {
    DOM.authErrorMsg.style.display = "block";
    DOM.authPassword.focus();
  }
}

function handleLogout() {
  try {
    localStorage.removeItem("samoor_admin_auth");
  } catch (e) {
    console.error("Logout failed:", e);
  }
  window.location.reload();
}

async function showDashboard() {
  DOM.authOverlay.style.display = "none";
  DOM.adminContainer.style.display = "block";
  document.body.classList.remove("auth-locked");
  
  // Load data & render
  await loadDatabase();
  await renderStats();
  renderDishesTable();
}

// ==========================================================================
// DATABASE STATE & LOADERS
// ==========================================================================
async function loadDatabase() {
  categoriesList = Object.values(CATEGORIES);
  
  // Populate categories dropdown
  DOM.formCategory.innerHTML = categoriesList.map(c => 
    `<option value="${c.id}">${c.name}</option>`
  ).join("");
  
  try {
    const res = await fetch('/api/dishes');
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    dishesList = await res.json();
    console.log(`Loaded ${dishesList.length} dishes from server.`);
  } catch (err) {
    console.error("Error loading dishes from server, falling back to localStorage:", err);
    const saved = localStorage.getItem("samoor_dishes");
    if (saved) {
      try {
        dishesList = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved dishes:", e);
        dishesList = getDefaultDishes();
      }
    } else {
      dishesList = getDefaultDishes();
      saveDatabase();
    }
  }

  // Load Promos
  await loadPromos();
}

async function loadPromos() {
  try {
    const res = await fetch('/api/promos');
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    promoCodesList = await res.json();
    console.log(`Loaded ${promoCodesList.length} promos from server.`);
  } catch (err) {
    console.error("Error loading promos from server, falling back to localStorage:", err);
    const saved = localStorage.getItem("samoor_promo_codes");
    if (saved) {
      try {
        promoCodesList = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved promos:", e);
        promoCodesList = getDefaultPromos();
      }
    } else {
      promoCodesList = getDefaultPromos();
      savePromosDatabase();
    }
  }
}

function getDefaultPromos() {
  return [
    { code: "SAMOR10", discount_percent: 10, is_active: true },
    { code: "BIZNES", discount_percent: 15, is_active: true }
  ];
}

function savePromosDatabase() {
  localStorage.setItem("samoor_promo_codes", JSON.stringify(promoCodesList));
}

function getDefaultDishes() {
  // Safe mapping from menu-data.js defaults
  return MENU_DATA.map(dish => ({
    id: dish.id,
    category: dish.category,
    name: dish.name,
    description: dish.description || "",
    price: dish.price,
    portion: dish.portion || "",
    image_url: dish.image || "",
    is_discounted: false,
    discount_price: 0
  }));
}

function saveDatabase() {
  localStorage.setItem("samoor_dishes", JSON.stringify(dishesList));
}

// ==========================================================================
// DASHBOARD RENDERING & ACTIONS
// ==========================================================================
async function renderStats() {
  DOM.statsTotalDishes.textContent = dishesList.length;
  DOM.statsDiscountedDishes.textContent = dishesList.filter(d => d.is_discounted).length;
  DOM.statsCategories.textContent = categoriesList.length;
  
  // Fetch and display monitoring stats
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const stats = await res.json();
      const visitsDinein = document.getElementById("stats-visits-dinein");
      const visitsDelivery = document.getElementById("stats-visits-delivery");
      const ordersDinein = document.getElementById("stats-orders-dinein");
      const ordersDelivery = document.getElementById("stats-orders-delivery");
      const totalRevenue = document.getElementById("stats-total-revenue");
      
      if (visitsDinein) visitsDinein.textContent = `🍽️ ${stats.visits.dine_in}`;
      if (visitsDelivery) visitsDelivery.textContent = `🚗 ${stats.visits.delivery}`;
      if (ordersDinein) ordersDinein.textContent = `🍽️ ${stats.orders.dine_in}`;
      if (ordersDelivery) ordersDelivery.textContent = `🚗 ${stats.orders.delivery}`;
      if (totalRevenue) totalRevenue.textContent = `${stats.revenue} сом`;
    }
  } catch (err) {
    console.warn("Failed to fetch monitoring stats:", err);
  }
}

function renderDishesTable(query = "") {
  DOM.tableBody.innerHTML = "";
  
  const filtered = dishesList.filter(dish => 
    dish.name.toLowerCase().includes(query.toLowerCase()) ||
    (dish.description && dish.description.toLowerCase().includes(query.toLowerCase()))
  );
  
  if (filtered.length === 0) {
    DOM.tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">
          Нет доступных блюд по вашему запросу.
        </td>
      </tr>
    `;
    return;
  }
  
  filtered.forEach(dish => {
    const categoryName = CATEGORIES[dish.category]?.name || dish.category;
    
    // Price rendering
    let priceCellHtml = "";
    if (dish.is_discounted) {
      priceCellHtml = `
        <span style="text-decoration: line-through; font-size: 0.8rem; color: var(--text-muted); display: block;">${dish.price} сом</span>
        <span style="font-weight: 700; color: var(--accent-gold);">${dish.discount_price} сом</span>
      `;
    } else {
      priceCellHtml = `<span style="font-weight: 600;">${dish.price} сом</span>`;
    }
    
    // Action active tag
    const discountBadgeHtml = dish.is_discounted 
      ? `<span class="admin-badge discount">-${Math.round((1 - dish.discount_price / dish.price) * 100)}%</span>`
      : `<span style="color: var(--text-muted); font-size: 0.85rem;">Нет</span>`;
    
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <img class="admin-dish-img" src="${dish.image_url}" alt="${dish.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=40'">
      </td>
      <td>
        <div style="font-weight: 600; color: var(--text-primary);">${dish.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${dish.description || ''}">${dish.description || 'Без описания'}</div>
      </td>
      <td><span class="admin-badge category">${categoryName}</span></td>
      <td><span style="font-size: 0.9rem; color: var(--text-secondary);">${dish.portion || '—'}</span></td>
      <td>${priceCellHtml}</td>
      <td>${discountBadgeHtml}</td>
      <td style="text-align: right;">
        <button class="admin-btn-icon edit" data-id="${dish.id}" title="Редактировать">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="admin-btn-icon delete" data-id="${dish.id}" title="Удалить">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </td>
    `;
    
    // Bind buttons programmatically
    row.querySelector(".edit").addEventListener("click", (e) => {
      const btn = e.target.closest(".edit");
      if (btn) openEditModal(dish.id);
    });
    row.querySelector(".delete").addEventListener("click", (e) => {
      const btn = e.target.closest(".delete");
      if (btn) handleDeleteDish(dish.id);
    });
    
    DOM.tableBody.appendChild(row);
  });
}

// ==========================================================================
// CRUD MODAL MANAGEMENT
// ==========================================================================
function openModal(modal) {
  modal.classList.add("visible");
}

function closeModal(modal) {
  modal.classList.remove("visible");
  DOM.dishForm.reset();
  DOM.discountPriceContainer.classList.remove("active");
  // Clean error styles
  document.querySelectorAll(".form-group").forEach(el => el.classList.remove("has-error"));
}

function openAddModal() {
  DOM.modalTitle.textContent = "Добавить блюдо";
  DOM.formDishId.value = "";
  document.getElementById("form-submit-text").textContent = "Добавить блюдо";
  openModal(DOM.dishModal);
}

function openEditModal(id) {
  const dish = dishesList.find(d => d.id === id);
  if (!dish) return;
  
  DOM.modalTitle.textContent = "Редактировать блюдо";
  DOM.formDishId.value = dish.id;
  
  DOM.formName.value = dish.name;
  DOM.formCategory.value = dish.category;
  DOM.formPortion.value = dish.portion || "";
  DOM.formDescription.value = dish.description || "";
  DOM.formImage.value = dish.image_url || "";
  DOM.formPrice.value = dish.price;
  
  DOM.formIsDiscounted.checked = dish.is_discounted;
  if (dish.is_discounted) {
    DOM.formDiscountPrice.value = dish.discount_price;
    DOM.discountPriceContainer.classList.add("active");
  } else {
    DOM.formDiscountPrice.value = "";
    DOM.discountPriceContainer.classList.remove("active");
  }
  
  document.getElementById("form-submit-text").textContent = "Сохранить изменения";
  openModal(DOM.dishModal);
}

async function handleDeleteDish(id) {
  const dish = dishesList.find(d => d.id === id);
  if (!dish) return;
  
  if (confirm(`Вы действительно хотите удалить блюдо «${dish.name}»?`)) {
    try {
      const res = await fetch(`/api/dishes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      dishesList = dishesList.filter(d => d.id !== id);
      console.log("Блюдо удалено:", dish.name);
      saveDatabase();
      renderStats();
      renderDishesTable(DOM.searchInput.value);
    } catch (err) {
      console.error("Failed to delete dish on server:", err);
      alert(`Ошибка удаления блюда на сервере: ${err.message}`);
    }
  }
}

// Form validations and submission
async function handleFormSubmit(e) {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  const id = DOM.formDishId.value;
  const name = DOM.formName.value.trim();
  const category = DOM.formCategory.value;
  const portion = DOM.formPortion.value.trim();
  const description = DOM.formDescription.value.trim();
  const image_url = DOM.formImage.value.trim() || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60";
  const price = parseFloat(DOM.formPrice.value);
  const is_discounted = DOM.formIsDiscounted.checked;
  const discount_price = is_discounted ? parseFloat(DOM.formDiscountPrice.value) : 0;
  
  const dishPayload = {
    name,
    category,
    portion,
    description,
    image_url,
    price,
    is_discounted,
    discount_price
  };
  
  try {
    if (id) {
      // Edit existing
      const res = await fetch(`/api/dishes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishPayload)
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const updated = await res.json();
      
      const idx = dishesList.findIndex(d => d.id === id);
      if (idx !== -1) {
        dishesList[idx] = updated;
      }
      console.log("Блюдо отредактировано:", name);
    } else {
      // Add new
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishPayload)
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const created = await res.json();
      dishesList.push(created);
      console.log("Добавлено новое блюдо:", name);
    }
    
    saveDatabase();
    renderStats();
    renderDishesTable(DOM.searchInput.value);
    closeModal(DOM.dishModal);
  } catch (err) {
    console.error("Failed to save dish on server:", err);
    alert(`Ошибка сохранения блюда на сервере: ${err.message}`);
  }
}

function validateForm() {
  let isValid = true;
  
  // Title
  const groupName = document.getElementById("group-name");
  if (!DOM.formName.value.trim()) {
    groupName.classList.add("has-error");
    isValid = false;
  } else {
    groupName.classList.remove("has-error");
  }
  
  // Price
  const groupPrice = document.getElementById("group-price");
  const priceVal = parseFloat(DOM.formPrice.value);
  if (isNaN(priceVal) || priceVal <= 0) {
    groupPrice.classList.add("has-error");
    isValid = false;
  } else {
    groupPrice.classList.remove("has-error");
  }
  
  // Discount Price
  if (DOM.formIsDiscounted.checked) {
    const groupDiscount = document.getElementById("group-discount-price");
    const discountVal = parseFloat(DOM.formDiscountPrice.value);
    const errorDiscount = document.getElementById("error-discount-price");
    
    if (isNaN(discountVal) || discountVal <= 0 || discountVal >= priceVal) {
      groupDiscount.classList.add("has-error");
      isValid = false;
    } else {
      groupDiscount.classList.remove("has-error");
    }
  }
  
  return isValid;
}

// ==========================================================================
// PROMOCODES CRUD RENDERING & ACTIONS
// ==========================================================================
function renderPromosTable() {
  DOM.promosTableBody.innerHTML = "";
  
  if (promoCodesList.length === 0) {
    DOM.promosTableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 32px;">
          Нет созданных промокодов.
        </td>
      </tr>
    `;
    return;
  }
  
  promoCodesList.forEach(promo => {
    const row = document.createElement("tr");
    
    const statusBadge = promo.is_active 
      ? `<span class="admin-badge category" style="background: rgba(39, 174, 96, 0.15); color: #27ae60; border-color: rgba(39, 174, 96, 0.3);">Активен</span>`
      : `<span class="admin-badge discount" style="background: rgba(192, 57, 43, 0.15); color: #c0392b; border-color: rgba(192, 57, 43, 0.3);">Неактивен</span>`;
      
    row.innerHTML = `
      <td style="font-weight: 700; color: var(--accent-gold); letter-spacing: 0.05em;">${promo.code}</td>
      <td style="font-weight: 600;">${promo.discount_percent}%</td>
      <td>${statusBadge}</td>
      <td style="text-align: right;">
        <button class="admin-btn-icon toggle-status" data-code="${promo.code}" title="${promo.is_active ? 'Деактивировать' : 'Активировать'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; color: ${promo.is_active ? '#c0392b' : '#27ae60'};">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </button>
        <button class="admin-btn-icon edit-promo" data-code="${promo.code}" title="Редактировать">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="admin-btn-icon delete-promo" data-code="${promo.code}" title="Удалить">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    `;
    
    row.querySelector(".toggle-status").addEventListener("click", (e) => {
      const btn = e.target.closest(".toggle-status");
      if (btn) handleTogglePromoActive(promo.code);
    });
    row.querySelector(".edit-promo").addEventListener("click", (e) => {
      const btn = e.target.closest(".edit-promo");
      if (btn) openEditPromoModal(promo.code);
    });
    row.querySelector(".delete-promo").addEventListener("click", (e) => {
      const btn = e.target.closest(".delete-promo");
      if (btn) handleDeletePromo(promo.code);
    });
    
    DOM.promosTableBody.appendChild(row);
  });
}

function openAddPromoModal() {
  DOM.promoModalTitle.textContent = "Добавить промокод";
  DOM.formPromoOldCode.value = "";
  DOM.formPromoCode.value = "";
  DOM.formPromoCode.disabled = false;
  DOM.formPromoPercent.value = "";
  DOM.formPromoActive.checked = true;
  openModal(DOM.promoModal);
}

function openEditPromoModal(code) {
  const promo = promoCodesList.find(p => p.code === code);
  if (!promo) return;
  
  DOM.promoModalTitle.textContent = "Редактировать промокод";
  DOM.formPromoOldCode.value = promo.code;
  DOM.formPromoCode.value = promo.code;
  DOM.formPromoCode.disabled = true;
  DOM.formPromoPercent.value = promo.discount_percent;
  DOM.formPromoActive.checked = promo.is_active;
  openModal(DOM.promoModal);
}

function closePromoModal() {
  closeModal(DOM.promoModal);
  DOM.promoForm.reset();
}

async function handleTogglePromoActive(code) {
  const promo = promoCodesList.find(p => p.code === code);
  if (!promo) return;
  
  const updatedPromo = { ...promo, is_active: !promo.is_active };
  
  try {
    const res = await fetch('/api/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPromo)
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    
    promo.is_active = !promo.is_active;
    console.log("Статус промокода", code, "изменен на:", promo.is_active ? "Активен" : "Неактивен");
    savePromosDatabase();
    renderPromosTable();
  } catch (err) {
    console.error("Failed to toggle promo on server:", err);
    alert(`Ошибка изменения статуса промокода на сервере: ${err.message}`);
  }
}

async function handleDeletePromo(code) {
  if (confirm(`Вы действительно хотите удалить промокод «${code}»?`)) {
    try {
      const res = await fetch(`/api/promos/${code}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      
      promoCodesList = promoCodesList.filter(p => p.code !== code);
      console.log("Промокод удален:", code);
      savePromosDatabase();
      renderPromosTable();
    } catch (err) {
      console.error("Failed to delete promo on server:", err);
      alert(`Ошибка удаления промокода на сервере: ${err.message}`);
    }
  }
}

async function handlePromoFormSubmit(e) {
  e.preventDefault();
  
  const oldCode = DOM.formPromoOldCode.value;
  const newCode = DOM.formPromoCode.value.trim().toUpperCase();
  const percent = parseInt(DOM.formPromoPercent.value);
  const is_active = DOM.formPromoActive.checked;
  
  let isValid = true;
  
  // Validate Code
  const groupCode = document.getElementById("group-promo-code");
  const errorMsgCode = document.getElementById("error-promo-code");
  if (!newCode) {
    if (groupCode) groupCode.classList.add("has-error");
    isValid = false;
  } else if (!oldCode && promoCodesList.some(p => p.code === newCode)) {
    // Unique check
    if (groupCode) groupCode.classList.add("has-error");
    if (errorMsgCode) errorMsgCode.textContent = "Такой промокод уже существует!";
    isValid = false;
  } else {
    if (groupCode) groupCode.classList.remove("has-error");
  }
  
  // Validate Percent
  const groupPercent = document.getElementById("group-promo-percent");
  if (isNaN(percent) || percent < 1 || percent > 100) {
    if (groupPercent) groupPercent.classList.add("has-error");
    isValid = false;
  } else {
    if (groupPercent) groupPercent.classList.remove("has-error");
  }
  
  if (!isValid) return;
  
  const promoPayload = {
    code: newCode,
    discount_percent: percent,
    is_active: is_active
  };
  
  try {
    // If the code was renamed, delete the old code first on the backend
    if (oldCode && oldCode !== newCode) {
      const delRes = await fetch(`/api/promos/${oldCode}`, { method: 'DELETE' });
      if (!delRes.ok) throw new Error(`HTTP error: ${delRes.status}`);
      promoCodesList = promoCodesList.filter(p => p.code !== oldCode);
    }
    
    // Save/update promo code on the backend
    const res = await fetch('/api/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promoPayload)
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const savedPromo = await res.json();
    
    if (oldCode) {
      const idx = promoCodesList.findIndex(p => p.code === oldCode);
      if (idx !== -1) {
        promoCodesList[idx] = savedPromo;
      } else {
        promoCodesList.push(savedPromo);
      }
      console.log("Промокод отредактирован:", newCode);
    } else {
      promoCodesList.push(savedPromo);
      console.log("Добавлен новый промокод:", newCode);
    }
    
    savePromosDatabase();
    renderPromosTable();
    closePromoModal();
  } catch (err) {
    console.error("Failed to save promo code on server:", err);
    alert(`Ошибка сохранения промокода на сервере: ${err.message}`);
  }
}

// Tab Switching logic
function switchTab(tabName) {
  if (tabName === "dishes") {
    DOM.tabDishes.classList.add("active");
    DOM.tabPromocodes.classList.remove("active");
    DOM.dishesSection.style.display = "block";
    DOM.promocodesSection.style.display = "none";
  } else {
    DOM.tabPromocodes.classList.add("active");
    DOM.tabDishes.classList.remove("active");
    DOM.dishesSection.style.display = "none";
    DOM.promocodesSection.style.display = "block";
    renderPromosTable();
  }
}

// ==========================================================================
// EVENT BINDINGS
// ==========================================================================
function setupListeners() {
  // Auth Submit
  DOM.authForm.addEventListener("submit", handleLogin);
  
  // Logout click
  DOM.logoutBtn.addEventListener("click", handleLogout);
  
  // Modal toggle actions
  DOM.addDishBtn.addEventListener("click", openAddModal);
  DOM.closeModalBtn.addEventListener("click", () => closeModal(DOM.dishModal));
  
  // Discount price toggle field wrapper slide animation
  DOM.formIsDiscounted.addEventListener("change", (e) => {
    if (e.target.checked) {
      DOM.discountPriceContainer.classList.add("active");
      DOM.formDiscountPrice.focus();
    } else {
      DOM.discountPriceContainer.classList.remove("active");
      DOM.formDiscountPrice.value = "";
    }
  });
  
  // Search query changes
  DOM.searchInput.addEventListener("input", (e) => {
    renderDishesTable(e.target.value);
  });
  
  // Form submission CRUD dispatcher
  DOM.dishForm.addEventListener("submit", handleFormSubmit);

  // Tab Selection Triggers
  if (DOM.tabDishes) {
    DOM.tabDishes.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab-btn");
      if (btn) switchTab("dishes");
    });
  }
  if (DOM.tabPromocodes) {
    DOM.tabPromocodes.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab-btn");
      if (btn) switchTab("promocodes");
    });
  }

  // Promocode CRUD Actions
  if (DOM.addPromoBtn) {
    DOM.addPromoBtn.addEventListener("click", (e) => {
      const btn = e.target.closest(".admin-btn");
      if (btn) openAddPromoModal();
    });
  }
  if (DOM.closePromoModalBtn) {
    DOM.closePromoModalBtn.addEventListener("click", closePromoModal);
  }
  if (DOM.promoForm) {
    DOM.promoForm.addEventListener("submit", handlePromoFormSubmit);
  }
}

// Run loader checks
document.addEventListener("DOMContentLoaded", () => {
  setupListeners();
  checkAuth();
});
