// ===== Menu Data (from highlighted menu + physical board) =====
const menuData = {
  chicken: [
    { id: 'c1', name: 'Quarter Chicken', price: 40 },
    { id: 'c2', name: 'Half Chicken', price: 80 },
    { id: 'c3', name: 'Full Chicken', price: 140 }
  ],
  salad: [
    { id: 's1', name: 'Quarter Chicken & Salad', price: 45 },
    { id: 's2', name: 'Half Chicken & Salad', price: 85 },
    { id: 's3', name: 'Full Chicken & Salad', price: 145 }
  ],
  pap: [
    { id: 'p1', name: 'Quarter Chicken, Pap & Salad', price: 50 },
    { id: 'p2', name: 'Half Chicken, Pap & Salad', price: 90 },
    { id: 'p3', name: 'Full Chicken, Pap & Salad', price: 150 }
  ],
  wings: [
    { id: 'w1', name: '2x Stick Juicy Gizzards & Fries', price: 25 },
    { id: 'w2', name: '2x Wings & Fries', price: 35 },
    { id: 'w3', name: '3x Wings & Fries', price: 45 }
  ],
  platters: [
    { id: 'pl1', name: '1x Wing, 1x Gizzards & Quarter Chicken', price: 55 },
    { id: 'pl2', name: '2x Wings, 2x Gizzards & Half Chicken', price: 100 },
    { id: 'pl3', name: '4x Wings, 4x Gizzards & Full Chicken', price: 180 }
  ]
};

// WhatsApp number (SA format with country code)
const WHATSAPP_NUMBER = '27608837294';

// Cart state
let cart = JSON.parse(localStorage.getItem('harvestCart') || '[]');

// ===== Render Menu =====
function renderMenu() {
  const containers = {
    chicken: document.getElementById('chicken-items'),
    salad: document.getElementById('salad-items'),
    pap: document.getElementById('pap-items'),
    wings: document.getElementById('wings-items'),
    platters: document.getElementById('platter-items')
  };

  Object.keys(menuData).forEach(cat => {
    const container = containers[cat];
    if (!container) return;
    container.innerHTML = menuData[cat].map(item => `
      <article class="menu-card" data-id="${item.id}">
        <div class="menu-card-header">
          <h4>${item.name}</h4>
          <span class="price">R${item.price}</span>
        </div>
        <div class="menu-card-actions">
          <div class="qty-control">
            <button type="button" class="qty-minus" data-id="${item.id}" aria-label="Decrease">−</button>
            <span class="qty-value" data-id="${item.id}">1</span>
            <button type="button" class="qty-plus" data-id="${item.id}" aria-label="Increase">+</button>
          </div>
          <button type="button" class="add-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
            Add to Cart
          </button>
          <button type="button" class="wa-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" title="Order this item on WhatsApp">
            WA
          </button>
        </div>
      </article>
    `).join('');
  });
}

// ===== Cart Functions =====
function saveCart() {
  localStorage.setItem('harvestCart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id, name, price, qty = 1) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, name, price, qty });
  }
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else saveCart();
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  countEl.textContent = totalQty;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    checkoutBtn.disabled = true;
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h5>${item.name}</h5>
          <p>R${item.price} each</p>
        </div>
        <div class="cart-item-right">
          <div class="price">R${item.price * item.qty}</div>
          <div class="cart-item-actions">
            <button type="button" onclick="updateQty('${item.id}', -1)">−</button>
            <span>${item.qty}</span>
            <button type="button" onclick="updateQty('${item.id}', 1)">+</button>
            <button type="button" class="remove-item" onclick="removeFromCart('${item.id}')" title="Remove">🗑</button>
          </div>
        </div>
      </div>
    `).join('');
    checkoutBtn.disabled = false;
  }
  totalEl.textContent = `R${getCartTotal()}`;
}

// ===== Direct WhatsApp for single item =====
function orderItemOnWhatsApp(name, price, qty) {
  const text = `Hi Harvest Chicken Dust! 🐔\n\nI would like to order:\n• ${qty}x ${name} – R${price * qty}\n\nPlease confirm availability. Thank you!`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
}

// ===== Checkout =====
function openCheckout() {
  if (cart.length === 0) return;
  const summary = document.getElementById('orderSummary');
  summary.innerHTML = `
    <h4>Order Summary</h4>
    <ul>
      ${cart.map(i => `<li>${i.qty}x ${i.name} – R${i.price * i.qty}</li>`).join('')}
    </ul>
    <div class="total-line">
      <span>Total</span>
      <span>R${getCartTotal()}</span>
    </div>
  `;
  document.getElementById('checkoutModal').classList.add('open');
}

function buildWhatsAppMessage(formData) {
  let msg = `*NEW ORDER – Harvest Chicken Dust*\n\n`;
  msg += `*Customer Details*\n`;
  msg += `Name: ${formData.name}\n`;
  msg += `Phone: ${formData.phone}\n`;
  msg += `Address: ${formData.address}\n`;
  msg += `Order Type: ${formData.orderType}\n`;
  if (formData.notes) msg += `Notes: ${formData.notes}\n`;
  msg += `\n*Order Items*\n`;
  cart.forEach(i => {
    msg += `• ${i.qty}x ${i.name} – R${i.price * i.qty}\n`;
  });
  msg += `\n*TOTAL: R${getCartTotal()}*\n`;
  msg += `\nPlease confirm this order. Thank you! 🐔`;
  return msg;
}

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  updateCartUI();

  // Quantity controls on menu cards
  document.body.addEventListener('click', (e) => {
    // Qty plus/minus on cards
    if (e.target.classList.contains('qty-plus')) {
      const id = e.target.dataset.id;
      const span = document.querySelector(`.qty-value[data-id="${id}"]`);
      span.textContent = parseInt(span.textContent) + 1;
    }
    if (e.target.classList.contains('qty-minus')) {
      const id = e.target.dataset.id;
      const span = document.querySelector(`.qty-value[data-id="${id}"]`);
      const val = parseInt(span.textContent);
      if (val > 1) span.textContent = val - 1;
    }

    // Add to cart
    if (e.target.classList.contains('add-btn')) {
      const { id, name, price } = e.target.dataset;
      const qty = parseInt(document.querySelector(`.qty-value[data-id="${id}"]`).textContent);
      addToCart(id, name, parseInt(price), qty);
      // Reset qty display
      document.querySelector(`.qty-value[data-id="${id}"]`).textContent = '1';
      // Brief feedback
      e.target.textContent = 'Added ✓';
      setTimeout(() => { e.target.textContent = 'Add to Cart'; }, 900);
    }

    // Direct WhatsApp order for single item
    if (e.target.classList.contains('wa-btn')) {
      const { name, price } = e.target.dataset;
      const id = e.target.dataset.id;
      const qty = parseInt(document.querySelector(`.qty-value[data-id="${id}"]`).textContent);
      orderItemOnWhatsApp(name, parseInt(price), qty);
    }
  });

  // Cart open/close
  document.getElementById('cartBtn').addEventListener('click', () => {
    document.getElementById('cartSidebar').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
  });
  document.getElementById('closeCart').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);

  function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
  }

  // Checkout
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
  document.getElementById('closeCheckout').addEventListener('click', () => {
    document.getElementById('checkoutModal').classList.remove('open');
  });

  // Form submit → WhatsApp
  document.getElementById('checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
      name: document.getElementById('name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      address: document.getElementById('address').value.trim(),
      notes: document.getElementById('notes').value.trim(),
      orderType: document.querySelector('input[name="orderType"]:checked').value
    };
    const message = buildWhatsAppMessage(formData);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    // Optional: clear cart after sending
    // cart = []; saveCart();
    document.getElementById('checkoutModal').classList.remove('open');
  });

  // Mobile nav toggle
  const toggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.nav');
  if (toggle) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
});

// Expose for inline onclick
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;
