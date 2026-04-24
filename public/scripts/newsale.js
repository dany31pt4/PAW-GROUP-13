const deliveryFee = parseFloat(document.querySelector("main").dataset.deliveryFee) || 0;

let selectedClient = null;
const cart = [];
let appliedCoupon = null;

// ─── Cliente ──────────────────────────────────────────────────────────────────

async function searchClient() {
  const email = document.getElementById("clientSearch").value.trim();
  if (!email)
    return Swal.fire("Atenção", "Introduz um email para pesquisar.", "warning");

  Swal.fire({ title: "A procurar...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const res  = await fetch(`/api/customers/email/${encodeURIComponent(email)}`);
    const data = await res.json();
    if (res.ok) {
      Swal.close();
      setClient(data._id, data.name, data.email, data.address);
    } else {
      Swal.fire("Não encontrado", data.message || "Nenhum cliente com este email.", "info");
    }
  } catch {
    Swal.fire("Erro", "Erro de conexão ao servidor.", "error");
  }
}

function setClient(id, name, email, address) {
  selectedClient = { id, name, email };
  document.getElementById("clientNameDisplay").textContent  = name;
  document.getElementById("clientEmailDisplay").textContent = email;
  document.getElementById("clientSearchBlock").classList.add("d-none");
  document.getElementById("newClientForm").classList.add("d-none");
  document.getElementById("selectedClientBlock").classList.remove("d-none");

  const addressInput = document.getElementById("deliveryAddress");
  if (address && addressInput.value === "") {
    addressInput.value = address;
  }

  checkSaleValidity();
}

function resetClient() {
  selectedClient = null;
  document.getElementById("clientSearch").value = "";
  document.getElementById("selectedClientBlock").classList.add("d-none");
  document.getElementById("clientSearchBlock").classList.remove("d-none");
  checkSaleValidity();
}

function toggleNewClientForm() {
  document.getElementById("newClientForm").classList.toggle("d-none");
}

async function createClient() {
  const name     = document.getElementById("nc-name").value.trim();
  const email    = document.getElementById("nc-email").value.trim();
  const phone    = document.getElementById("nc-phone").value.trim();
  const password = document.getElementById("nc-password").value;
  if (!name || !email || !password)
    return Swal.fire("Atenção", "Nome, email e password são obrigatórios.", "warning");

  Swal.fire({ title: "A criar cliente...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const res  = await fetch("/api/customers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });
    const data = await res.json();
    if (res.ok) {
      Swal.fire("Sucesso!", "Cliente criado.", "success");
      setClient(data.data._id, data.data.name, data.data.email, data.data.address);
    } else {
      Swal.fire("Erro!", data.message || "Não foi possível criar o cliente.", "error");
    }
  } catch {
    Swal.fire("Erro", "Erro de conexão ao servidor.", "error");
  }
}

// ─── Carrinho ─────────────────────────────────────────────────────────────────

function findInCart(id) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === id) return cart[i];
  }
  return null;
}

function addToCart(btn) {
  const { id, label, price, stock } = btn.dataset;
  const existing = findInCart(id);

  if (existing) {
    if (existing.quantity >= existing.stock)
      return Swal.fire("Sem stock", `Não há mais unidades de ${label}.`, "warning");
    existing.quantity++;
  } else {
    cart.push({ id, label, price: parseFloat(price), stock: parseInt(stock, 10), quantity: 1 });
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

function clearCart() {
  const ids = [];
  for (let i = 0; i < cart.length; i++) ids.push(cart[i].id);
  cart.splice(0, cart.length);
  for (let i = 0; i < ids.length; i++) syncRow(ids[i]);
  renderCart();
}

function syncRow(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;
  const originalStock = parseInt(row.querySelector("button").dataset.stock, 10);
  const inCart = findInCart(id);
  let cartQty = 0;
  if (inCart) {
    cartQty = inCart.quantity;
  }
  const remaining = originalStock - cartQty;
  row.querySelector(".stock-display").textContent = remaining;
  const btn = row.querySelector("button");
  btn.disabled = remaining <= 0;
  btn.classList.toggle("btn-outline-primary",   remaining > 0);
  btn.classList.toggle("btn-outline-secondary", remaining <= 0);
}

function renderCart() {
  if (cart.length === 0) {
    document.getElementById("cartItemsList").innerHTML =
      '<p class="text-muted text-center small py-3">O carrinho está vazio.</p>';
    updateTotals();
    checkSaleValidity();
    return;
  }

  let html = "";
  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    html += `
      <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
          <div style="font-size:13px;">
              <strong>${item.label}</strong><br>
              <span class="text-muted">${item.price.toFixed(2)}€ × ${item.quantity} = <strong>${(item.price * item.quantity).toFixed(2)}€</strong></span>
          </div>
          <div class="d-flex align-items-center gap-1">
              <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="changeQty('${item.id}', -1)">−</button>
              <span class="mx-1 small">${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="changeQty('${item.id}', 1)">+</button>
          </div>
      </div>`;
  }

  document.getElementById("cartItemsList").innerHTML = html;
  updateTotals();
  checkSaleValidity();
}

function onDeliveryChange() {
  const isCourier = document.getElementById("deliveryMethod").value === "courier";
  document.getElementById("addressBlock").classList.toggle("d-none", !isCourier);
  updateTotals();
  checkSaleValidity();
}

function updateTotals() {
  let subtotal = 0;
  for (let i = 0; i < cart.length; i++) {
    subtotal += cart[i].price * cart[i].quantity;
  }
  let fee = 0;
  if (document.getElementById("deliveryMethod").value === "courier") {
    fee = deliveryFee;
  }

  let discount = 0;
  if (appliedCoupon) {
    discount =  parseFloat((subtotal * appliedCoupon.discountValue / 100).toFixed(2));
  }

  const discountRow = document.getElementById("discountRow");
  if (discount > 0) {
    discountRow.classList.remove("d-none");
    document.getElementById("discountDisplay").textContent = "-" + discount.toFixed(2) + "€";
  } else {
    discountRow.classList.add("d-none");
  }

  document.getElementById("subtotalDisplay").textContent = subtotal.toFixed(2) + "€";
  document.getElementById("totalDisplay").textContent    = (Math.max(0, subtotal - discount) + fee).toFixed(2) + "€";
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

  fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.valid) {
        appliedCoupon = { code: code.toUpperCase(), discount: data.discount, discountType: data.discountType, discountValue: data.discountValue };
        const label = data.discountType === "percentage"
          ? data.discountValue + "% = -" + data.discount.toFixed(2) + "€"
          : "-" + data.discount.toFixed(2) + "€";
        resultEl.innerHTML = '<span class="text-success"><i class="bi bi-check-circle me-1"></i>Cupão aplicado: ' + label + '</span>';
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

function checkSaleValidity() {
  const isCourier = document.getElementById("deliveryMethod").value === "courier";
  const address = document.getElementById("deliveryAddress").value.trim();
  const addressOk = !isCourier || address.length > 0;
  document.getElementById("btnConfirmSale").disabled = !selectedClient || cart.length === 0 || !addressOk;
}

// ─── Filtro ───────────────────────────────────────────────────────────────────

function filterProducts() {
  const search = document.getElementById("prodSearch").value.toLowerCase();
  const cat    = document.getElementById("catFilter").value;
  const rows   = document.querySelectorAll("#productTableBody .product-row");
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const show = row.dataset.name.includes(search) && (cat === "all" || row.dataset.cat === cat);
    if (show) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  }
}

// ─── Finalizar venda ──────────────────────────────────────────────────────────

async function processSale() {
  if (!selectedClient || cart.length === 0) return;

  const deliveryMethod = document.getElementById("deliveryMethod").value;
  let fee = 0;
  if (deliveryMethod === "courier") {
    fee = deliveryFee;
  }
  let deliveryAddress = null;
  if (deliveryMethod === "courier") {
    deliveryAddress = document.getElementById("deliveryAddress").value.trim();
  }

  const confirmed = await Swal.fire({
    title: "Confirmar Venda?",
    html: `Cliente: <strong>${selectedClient.name}</strong><br>Total: <strong>${document.getElementById("totalDisplay").textContent}</strong>`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#0d6efd",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Finalizar",
    cancelButtonText: "Cancelar",
  });

  if (!confirmed.isConfirmed) return;

  Swal.fire({ title: "A processar...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  const products = [];
  for (let i = 0; i < cart.length; i++) {
    products.push({ productId: cart[i].id, quantity: cart[i].quantity });
  }

  try {
    let couponCode;
    if (appliedCoupon) {
      couponCode = appliedCoupon.code;
    } else {
      couponCode = null;
    }
    const payload = {
      customerId: selectedClient.id,
      products,
      deliveryMethod,
      deliveryCost: fee,
      deliveryAddress,
      couponCode,
    };
    const res = await fetch("/api/orders/sale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      Swal.fire("Venda Registada!", "A venda foi concluída com sucesso.", "success").then(() => location.reload());
    } else {
      Swal.fire("Erro!", data.message || "Não foi possível registar a venda.", "error");
    }
  } catch {
    Swal.fire("Erro", "Erro de conexão ao servidor.", "error");
  }
}
