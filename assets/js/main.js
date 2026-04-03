// Simple front-end state for demo cart
const PRODUCTS = {
  1: { id: 1, name: "Morning Linen", price: 24 },
  2: { id: 2, name: "Forest Ember", price: 26 },
  3: { id: 3, name: "Citrus Atelier", price: 22 },
  4: { id: 4, name: "Midnight Fig", price: 28 },
  5: { id: 5, name: "Amber Library", price: 30 },
  6: { id: 6, name: "Sunday Bloom", price: 26 }
};

const STORAGE_KEY = "candel-demo-cart";

function loadCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // ignore
  }
}

function cartTotals(cart) {
  let count = 0;
  let total = 0;
  Object.entries(cart).forEach(([id, qty]) => {
    const product = PRODUCTS[id];
    if (!product) return;
    count += qty;
    total += product.price * qty;
  });
  return { count, total };
}

function formatCurrency(value) {
  return `$${value.toFixed(0)}`;
}

function renderCart(cart) {
  const drawer = document.querySelector("[data-cart-drawer]");
  const body = document.querySelectorAll("[data-cart-body]");
  const countEls = document.querySelectorAll("[data-cart-count]");
  const totalEls = document.querySelectorAll("[data-cart-total]");
  const { count, total } = cartTotals(cart);

  countEls.forEach((el) => {
    el.textContent = String(count);
  });
  totalEls.forEach((el) => {
    el.textContent = formatCurrency(total);
  });

  body.forEach((container) => {
    container.innerHTML = "";
    if (!count) {
      const p = document.createElement("p");
      p.className = "cart-empty";
      p.textContent = "Your cart is empty. Add a candle to begin.";
      container.appendChild(p);
      return;
    }

    Object.entries(cart).forEach(([id, qty]) => {
      const product = PRODUCTS[id];
      if (!product) return;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-meta">${qty} × ${formatCurrency(
        product.price
      )}</div>
        </div>
        <div class="cart-item-qty">
          <button class="cart-qty-button" type="button" data-cart-decrease="${id}">−</button>
          <span>${qty}</span>
          <button class="cart-qty-button" type="button" data-cart-increase="${id}">+</button>
        </div>
      `;
      container.appendChild(row);
    });
  });

  if (drawer) {
    drawer.addEventListener("click", (event) => {
      if (event.target === drawer) {
        drawer.classList.remove("is-open");
      }
    });
  }
}

function syncCartPage(cart) {
  const container = document.querySelector("[data-cart-page-items]");
  if (!container) return;

  const { count } = cartTotals(cart);
  container.innerHTML = "";

  if (!count) {
    const p = document.createElement("p");
    p.className = "cart-empty";
    p.textContent = "Your cart is empty.";
    container.appendChild(p);
    return;
  }

  Object.entries(cart).forEach(([id, qty]) => {
    const product = PRODUCTS[id];
    if (!product) return;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${product.name}</div>
        <div class="cart-item-meta">${qty} × ${formatCurrency(
      product.price
    )}</div>
      </div>
      <div class="cart-item-qty">
        <button class="cart-qty-button" type="button" data-cart-decrease="${id}">−</button>
        <span>${qty}</span>
        <button class="cart-qty-button" type="button" data-cart-increase="${id}">+</button>
      </div>
    `;
    container.appendChild(row);
  });
}

function addEventListeners() {
  const cartToggleButtons = document.querySelectorAll("[data-cart-toggle]");
  const drawer = document.querySelector("[data-cart-drawer]");
  const contactForm = document.querySelector("[data-contact-form]");
  const contactNote = document.querySelector("[data-contact-note]");
  const checkoutButton = document.querySelector("[data-checkout]");
  const checkoutNote = document.querySelector("[data-checkout-note]");

  let cart = loadCart();
  renderCart(cart);
  syncCartPage(cart);

  document.body.addEventListener("click", (event) => {
    const target = event.target;

    if (target.matches("[data-add-to-cart]")) {
      const card = target.closest("[data-product-id]");
      if (!card) return;
      const id = card.getAttribute("data-product-id");
      if (!id || !PRODUCTS[id]) return;
      cart[id] = (cart[id] || 0) + 1;
      saveCart(cart);
      renderCart(cart);
      syncCartPage(cart);
    }

    if (target.matches("[data-cart-increase]")) {
      const id = target.getAttribute("data-cart-increase");
      if (!id) return;
      cart[id] = (cart[id] || 0) + 1;
      saveCart(cart);
      renderCart(cart);
      syncCartPage(cart);
    }

    if (target.matches("[data-cart-decrease]")) {
      const id = target.getAttribute("data-cart-decrease");
      if (!id) return;
      if (!cart[id]) return;
      cart[id] -= 1;
      if (cart[id] <= 0) {
        delete cart[id];
      }
      saveCart(cart);
      renderCart(cart);
      syncCartPage(cart);
    }
  });

  cartToggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!drawer) return;
      drawer.classList.toggle("is-open");
    });
  });

  if (contactForm && contactNote) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      contactNote.textContent =
        "Thank you—this demo form has been captured locally.";
    });
  }

  if (checkoutButton && checkoutNote) {
    checkoutButton.addEventListener("click", () => {
      const { count } = cartTotals(cart);
      if (!count) {
        checkoutNote.textContent = "Add at least one candle before checkout.";
        return;
      }
      checkoutNote.textContent =
        "Checkout is simulated in this demo. No payment will be processed.";
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addEventListeners);
} else {
  addEventListeners();
}


