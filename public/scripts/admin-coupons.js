async function loadCoupons() {
  Swal.fire({ title: "A carregar...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  try {
    const res = await fetch("/api/coupons/list");
    const data = await res.json();
    Swal.close();
    let tableData;
    if (Array.isArray(data)) {
      tableData = data;
    } else {
      tableData = [];
    }
    renderTable(tableData);
  } catch {
    Swal.fire("Erro", "Não foi possível carregar os cupões.", "error");
  }
}

function renderTable(coupons) {
  const tbody = document.getElementById("couponTableBody");
  if (coupons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Nenhum cupão criado.</td></tr>';
    return;
  }
  let html = "";
  coupons.forEach(function (c) {
    let store;
    if (c.supermarket) {
      store = c.supermarket.name;
    } else {
      store = "—";
    }

    let expiry;
    if (c.expiresAt) {
      expiry = new Date(c.expiresAt).toLocaleDateString("pt-PT");
    } else {
      expiry = "—";
    }

    let uses;
    if (c.maxUses > 0) {
      uses = c.usedCount + "/" + c.maxUses;
    } else {
      uses = c.usedCount + "/∞";
    }

    let status;
    if (c.active) {
      status = '<span class="badge bg-success">Ativo</span>';
    } else {
      status = '<span class="badge bg-secondary">Inativo</span>';
    }

    const toggleIcon = c.active ? 'bi-toggle-on text-success' : 'bi-toggle-off text-secondary';
    const toggleTitle = c.active ? 'Desativar' : 'Ativar';
    const toggleBtn = '<button class="btn btn-sm btn-light border shadow-sm me-1" title="' + toggleTitle + '" onclick="toggleCoupon(\'' + c._id + '\')"><i class="bi ' + toggleIcon + ' fs-6"></i></button>';

    let expiryIso;
    if (c.expiresAt) {
      expiryIso = new Date(c.expiresAt).toISOString().slice(0, 10);
    } else {
      expiryIso = "";
    }

    html += '<tr>'
      + '<td><strong>' + c.code + '</strong></td>'
      + '<td>' + c.discountValue + '%</td>'
      + '<td>' + store + '</td>'
      + '<td>' + expiry + '</td>'
      + '<td>' + uses + '</td>'
      + '<td>' + status + '</td>'
      + '<td class="text-end">'
      + '<a class="btn btn-sm btn-light border shadow-sm me-1" title="Ver" href="/admin/coupon/' + c._id + '"><i class="bi bi-eye-fill text-primary"></i></a>'
      + '<button class="btn btn-sm btn-light border shadow-sm me-1" title="Editar" onclick="openEditModal(\'' + c._id + '\',\'' + c.code + '\',' + c.discountValue + ',\'' + expiryIso + '\',' + c.maxUses + ')"><i class="bi bi-pencil text-primary"></i></button>'
      + toggleBtn
      + '<button class="btn btn-sm btn-light border shadow-sm" title="Eliminar" onclick="deleteCoupon(\'' + c._id + '\',\'' + c.code + '\')"><i class="bi bi-trash text-danger"></i></button>'
      + '</td>'
      + '</tr>';
  });
  tbody.innerHTML = html;
}


function openEditModal(id, code, discountValue, expiresAt, maxUses) {
  Swal.fire({
    title: "Editar Cupão",
    html: `
      <div class="text-start mt-2">
        <div class="mb-3">
          <label class="form-label fw-bold">Código <span class="text-danger">*</span></label>
          <input type="text" id="ec-code" class="form-control text-uppercase" value="${code}">
        </div>
        <div class="mb-3">
          <label class="form-label fw-bold">Desconto (%) <span class="text-danger">*</span></label>
          <div class="input-group">
            <input type="number" id="ec-value" class="form-control" value="${discountValue}" min="0.01" max="100" step="0.01">
            <span class="input-group-text">%</span>
          </div>
        </div>
        <div class="row g-3">
          <div class="col-6">
            <label class="form-label fw-bold">Data de Validade</label>
            <input type="date" id="ec-expires" class="form-control" value="${expiresAt}">
            <div class="form-text">Em branco = sem validade.</div>
          </div>
          <div class="col-6">
            <label class="form-label fw-bold">Usos Máximos</label>
            <input type="number" id="ec-maxuses" class="form-control" value="${maxUses}" placeholder="0 = ilimitado" min="0">
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#0d6efd",
    preConfirm: () => {
      const code = document.getElementById("ec-code").value.trim();
      const discountValue = document.getElementById("ec-value").value;
      if (!code || !discountValue) {
        Swal.showValidationMessage("Código e valor são obrigatórios.");
        return false;
      }
      return {
        code,
        discountValue,
        expiresAt: document.getElementById("ec-expires").value || null,
        maxUses: document.getElementById("ec-maxuses").value || 0,
      };
    },
  }).then(async (result) => {
    if (!result.isConfirmed) return;
    Swal.fire({ title: "A guardar...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await fetch("/api/coupons/update/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.value),
      });
      const data = await res.json();
      if (res.ok) {
        await loadCoupons();
        Swal.fire("Guardado!", "Cupão atualizado com sucesso.", "success");
      } else {
        Swal.fire("Erro", data.message || "Não foi possível atualizar.", "error");
      }
    } catch {
      Swal.fire("Erro", "Erro de conexão ao servidor.", "error");
    }
  });
}

async function toggleCoupon(id) {
  try {
    const res = await fetch("/api/coupons/toggle/" + id, { method: "PUT" });
    if (res.ok) {
      await loadCoupons();
    } else {
      Swal.fire("Erro", "Não foi possível alterar o estado.", "error");
    }
  } catch {
    Swal.fire("Erro", "Erro de conexão ao servidor.", "error");
  }
}

async function deleteCoupon(id, code) {
  const confirmed = await Swal.fire({
    title: 'Eliminar cupão "' + code + '"?',
    text: "Esta ação não pode ser revertida.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
  });
  if (!confirmed.isConfirmed) return;

  Swal.fire({ title: "A eliminar...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  try {
    const res = await fetch("/api/coupons/delete/" + id, { method: "DELETE" });
    if (res.ok) {
      await loadCoupons();
      Swal.fire("Eliminado!", "Cupão removido com sucesso.", "success");
    } else {
      Swal.fire("Erro", "Não foi possível eliminar.", "error");
    }
  } catch {
    Swal.fire("Erro", "Erro de conexão ao servidor.", "error");
  }
}

loadCoupons();
