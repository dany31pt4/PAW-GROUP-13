const main = document.querySelector("main");
const supermarketId = main.dataset.supermarketId;
const deliveryFee = parseFloat(main.dataset.deliveryFee) || 0;

const cart = [];
let appliedCoupon = null;

function findInCart(id) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === id) return cart[i];
  }
  return null;
}

function addToCart(btn) {
  const id = btn.dataset.id;
  const label = btn.dataset.label;
  const price = parseFloat(btn.dataset.price);
  const stock = parseInt(btn.dataset.stock, 10);
  const existing = findInCart(id);
  if (existing) {
    if (existing.quantity >= existing.stock) {
      return Swal.fire("Sem stock", "Não há mais unidades de " + label + ".", "warning");
    }
    existing.quantity++;
  } else {
    cart.push({ id, label, price, stock, quantity: 1 });
  }
  syncRow(id);
  renderCart();
}

function changeQty(id, delta) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].quantity += delta;
      if (cart[i].quantity <= 0) cart.splice(i, 1);
      syncRow(id);
      renderCart();
      return;
    }
  }
}

function syncRow(id) {
  const row = document.querySelector('tr[data-id="' + id + '"]');
  if (!row) return;
  const originalStock = parseInt(row.querySelector("button").dataset.stock, 10);
  const inCart = findInCart(id);
  let cartQty = 0;
  if (inCart) cartQty = inCart.quantity;
  const remaining = originalStock - cartQty;
  row.querySelector(".stock-display").textContent = remaining;
  const btn = row.querySelector("button");
  btn.disabled = remaining <= 0;
  btn.classList.toggle("btn-outline-primary", remaining > 0);
  btn.classList.toggle("btn-outline-secondary", remaining <= 0);
}

function renderCart() {
  if (cart.length === 0) {
    document.getElementById("cartItemsList").innerHTML =
      '<p class="text-muted text-center small py-3">O carrinho está vazio.</p>';
    updateTotals();
    checkValidity();
    return;
  }
  let html = "";
  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    html += '<div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">'
      + '<div style="font-size:13px;"><strong>' + item.label + '</strong><br>'
      + '<span class="text-muted">' + item.price.toFixed(2) + '€ × ' + item.quantity + ' = <strong>' + (item.price * item.quantity).toFixed(2) + '€</strong></span></div>'
      + '<div class="d-flex align-items-center gap-1">'
      + '<button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="changeQty(\'' + item.id + '\',-1)">−</button>'
      + '<span class="mx-1 small">' + item.quantity + '</span>'
      + '<button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="changeQty(\'' + item.id + '\',1)">+</button>'
      + '</div></div>';
  }
  document.getElementById("cartItemsList").innerHTML = html;
  updateTotals();
  checkValidity();
}

function onDeliveryChange() {
  const isCourier = document.getElementById("deliveryMethod").value === "courier";
  document.getElementById("addressBlock").classList.toggle("d-none", !isCourier);
  updateTotals();
  checkValidity();
}

function updateTotals() {
  let subtotal = 0;
  for (let i = 0; i < cart.length; i++) subtotal += cart[i].price * cart[i].quantity;

  let fee = 0;
  if (document.getElementById("deliveryMethod").value === "courier") fee = deliveryFee;

  let discount = 0;
  if (appliedCoupon) {
    discount = parseFloat((subtotal * appliedCoupon.discountValue / 100).toFixed(2));
    appliedCoupon.discount = discount;
  }

  const discountRow = document.getElementById("discountRow");
  if (discount > 0) {
    discountRow.classList.remove("d-none");
    document.getElementById("discountDisplay").textContent = "-" + discount.toFixed(2) + "€";
  } else {
    discountRow.classList.add("d-none");
  }

  const feeRow = document.getElementById("feeRow");
  if (fee > 0) {
    feeRow.style.removeProperty("display");
    document.getElementById("feeDisplay").textContent = fee.toFixed(2) + "€";
  } else {
    feeRow.style.display = "none";
  }

  document.getElementById("subtotalDisplay").textContent = subtotal.toFixed(2) + "€";
  document.getElementById("totalDisplay").textContent = (Math.max(0, subtotal - discount) + fee).toFixed(2) + "€";
}

function applyCoupon() {
  const code = document.getElementById("couponCode").value.trim();
  const resultEl = document.getElementById("couponResult");
  if (!code) {
    resultEl.innerHTML = '<span class="text-danger">Introduz um código.</span>';
    return;
  }
  let subtotal = 0;
  for (let i = 0; i < cart.length; i++) subtotal += cart[i].price * cart[i].quantity;

  fetch("/api/coupons/validate-customer?code=" + encodeURIComponent(code) + "&supermarketId=" + supermarketId + "&subtotal=" + subtotal)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.valid) {
        appliedCoupon = { code: code.toUpperCase(), discountValue: data.discountValue, discount: data.discount };
        resultEl.innerHTML = '<span class="text-success"><i class="bi bi-check-circle me-1"></i>Cupão aplicado: ' + data.discountValue + '% = -' + data.discount.toFixed(2) + '€</span>';
      } else {
        appliedCoupon = null;
        resultEl.innerHTML = '<span class="text-danger">' + data.message + '</span>';
      }
      updateTotals();
    })
    .catch(function () {
      resultEl.innerHTML = '<span class="text-danger">Erro ao validar cupão.</span>';
    });
}

function filterProducts() {
  const search = document.getElementById("prodSearch").value.toLowerCase();
  const cat = document.getElementById("catFilter").value;
  const rows = document.querySelectorAll("#productTableBody .product-row");
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const show = row.dataset.name.includes(search) && (cat === "all" || row.dataset.cat === cat);
    row.style.display = show ? "" : "none";
  }
}

function checkValidity() {
  const isCourier = document.getElementById("deliveryMethod").value === "courier";
  const address = document.getElementById("deliveryAddress").value.trim();
  const addressOk = !isCourier || address.length > 0;
  document.getElementById("btnConfirmSale").disabled = cart.length === 0 || !addressOk;
}

async function processOrder() {
  if (cart.length === 0) return;

  const deliveryMethod = document.getElementById("deliveryMethod").value;
  let deliveryAddress = null;
  if (deliveryMethod === "courier") {
    deliveryAddress = document.getElementById("deliveryAddress").value.trim();
  }

  const confirmed = await Swal.fire({
    title: "Confirmar Encomenda?",
    html: "Total: <strong>" + document.getElementById("totalDisplay").textContent + "</strong>",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#0d6efd",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Encomendar",
    cancelButtonText: "Cancelar",
  });
  if (!confirmed.isConfirmed) return;

  Swal.fire({ title: "A processar...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  const products = [];
  for (let i = 0; i < cart.length; i++) {
    products.push({ productId: cart[i].id, quantity: cart[i].quantity });
  }

  let couponCode = null;
  if (appliedCoupon) couponCode = appliedCoupon.code;

  try {
    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supermarketId, products, deliveryMethod, deliveryAddress, couponCode }),
    });
    const data = await res.json();
    if (res.ok) {
      await Swal.fire("Encomenda Realizada!", "A tua encomenda foi registada com sucesso.", "success");
      window.location.href = "/customer/orders";
    } else {
      Swal.fire("Erro!", data.message || "Não foi possível registar a encomenda.", "error");
    }
  } catch {
    Swal.fire("Erro", "Erro de conexão ao servidor.", "error");
  }
}

onDeliveryChange();
