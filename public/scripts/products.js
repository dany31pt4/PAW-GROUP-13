const swalCustom = Swal.mixin({
  background: "#1e1e1e",
  color: "#fff",
  confirmButtonColor: "#3498db",
  cancelButtonColor: "#2a2a2a",
  customClass: {
    confirmButton: "px-4 py-2 rounded-3",
    cancelButton: "px-4 py-2 rounded-3",
  },
});

async function loadCategories(selectId, selectedId = null) {
  try {
    const response = await fetch("/api/categories/list");
    if (!response.ok) throw new Error("Erro ao buscar categorias");
    const categories = await response.json();
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = "";
    categories.forEach((c) => {
      const option = document.createElement("option");
      option.value = c._id;
      option.textContent = c.name;
      if (selectedId && c._id === selectedId) option.selected = true;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar categorias:", err);
  }
}

async function loadProductTable() {
  try {
    const response = await fetch("/api/product/list/me");
    if (!response.ok) throw new Error("Erro ao buscar produtos");

    const data = await response.json();
    const products = data.data || [];
    const tbody = document.getElementById("productTableBody");
    if (!tbody) return;

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted">Nenhum produto encontrado.</td></tr>`;
      return;
    }

    let html = "";
    products.forEach((p) => {
      const imgSrc = p.image
        ? p.image
        : "https://t4.ftcdn.net/jpg/05/97/47/95/360_F_597479556_7bbQ7t4Z8k3xbAloHFHVdZIizWK1PdOo.jpg";
      const img = `<img src="${imgSrc}" onerror="this.src='https://t4.ftcdn.net/jpg/05/97/47/95/360_F_597479556_7bbQ7t4Z8k3xbAloHFHVdZIizWK1PdOo.jpg'" class="rounded-2 shadow-sm me-3" style="width: 45px; height: 45px; object-fit: cover; border: 1px solid #eee;">`;

      const stock =
        p.stock <= 5
          ? `<span class="text-danger fw-bold"><i class="bi bi-exclamation-circle me-1"></i>${p.stock}</span>`
          : `<span class="text-secondary">${p.stock} unid.</span>`;

      const activeBadge = p.isActive
        ? `<span class="badge bg-success bg-opacity-10 text-success border border-success-subtle px-2 py-1 rounded-pill">Ativo</span>`
        : `<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle px-2 py-1 rounded-pill">Inativo</span>`;

      const toggleIcon = p.isActive
        ? "bi-toggle-on text-success"
        : "bi-toggle-off text-secondary";
      const categoryName = p.category?.name || "Sem categoria";
      const categoryBadge = `<span class="badge bg-light text-dark border px-2 py-1">${categoryName}</span>`;

      html += `
        <tr class="align-middle">
          <td class="ps-4 py-3">
            <div class="d-flex align-items-center">
              ${img}
              <span class="fw-bold text-dark">${p.name}</span>
            </div>
          </td>
          <td>${categoryBadge}</td>
          <td class="text-dark fw-bold">${(p.price || 0).toFixed(2)}€</td>
          <td>${stock}</td>
          <td>${activeBadge}</td>
          <td class="text-end pe-4">
          <a href="/supermarket/product/${p._id}" class="btn btn-sm btn-light border shadow-sm me-1" title="Ver detalhes">
              <i class="bi bi-eye-fill text-primary"></i>
            </a>
            <button class="btn btn-sm btn-light border shadow-sm me-1" onclick="openEditModal('${p._id}')" title="Editar">
              <i class="bi bi-pencil text-primary"></i>
            </button>
            <button class="btn btn-sm btn-light border shadow-sm me-1" onclick="toggleProduct('${p._id}')" title="${p.isActive ? "Desativar" : "Ativar"}">
              <i class="bi ${toggleIcon} fs-6"></i>
            </button>
            <button class="btn btn-sm btn-light border shadow-sm" onclick="confirmDelete('${p._id}')" title="Eliminar">
              <i class="bi bi-trash text-danger"></i>
            </button>
          </td>
        </tr>`;
    });

    tbody.innerHTML = html;
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    const tbody = document.getElementById("productTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4"><i class="bi bi-exclamation-triangle me-2"></i>Erro ao carregar produtos.</td></tr>`;
    }
  }
}

function openAddModal() {
  swalCustom
    .fire({
      title: "Novo Produto",
      html: `
      <div class="text-start mt-3">
        <div class="mb-3">
          <label class="form-label-small">Nome do Produto</label>
          <input type="text" id="add-name" class="form-control w-100" required>
        </div>
        <div class="mb-3">
          <label class="form-label-small">Imagem do Produto</label>
          <div class="position-relative border rounded-3 p-3 text-center bg-light" style="border: 1px dashed #ccc !important; transition: 0.3s;">
            <i class="bi bi-cloud-arrow-up fs-3 text-secondary"></i>
            <p class="text-muted small mb-0 mt-1">Clique para procurar uma imagem</p>
            <input type="file" id="add-image" name="image" accept="image/*" class="position-absolute top-0 start-0 w-100 h-100 opacity-0" style="cursor: pointer;">
          </div>
        </div>
        <div class="row">
          <div class="col-6 mb-3">
            <label class="form-label-small">Preço (€)</label>
            <input type="number" step="0.01" id="add-price" class="form-control w-100" min="0" required>
          </div>
          <div class="col-6 mb-3">
            <label class="form-label-small">Stock</label>
            <input type="number" id="add-stock" class="form-control w-100" min="0" required>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label-small">Categoria</label>
          <select id="add-category" class="form-select w-100"></select>
        </div>
        <div class="mb-3">
          <label class="form-label-small">Descrição</label>
          <textarea id="add-description" class="form-control w-100" rows="3"></textarea>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Guardar Produto",
      cancelButtonText: "Cancelar",
      didOpen: () => loadCategories("add-category"),
      preConfirm: () => {
        const name = document.getElementById("add-name").value;
        const price = document.getElementById("add-price").value;
        const stock = document.getElementById("add-stock").value;
        const categoryId = document.getElementById("add-category").value;

        if (!name || !price || !stock || !categoryId) {
          Swal.showValidationMessage(
            "Nome, preço, stock e categoria são obrigatórios.",
          );
          return false;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("stock", stock);
        formData.append("categoryId", categoryId);
        formData.append(
          "description",
          document.getElementById("add-description").value,
        );

        const imageFile = document.getElementById("add-image").files[0];
        if (imageFile) formData.append("image", imageFile);

        return formData;
      },
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        swalCustom.fire({
          title: "A guardar...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        try {
          const response = await fetch("/api/product/create", {
            method: "POST",
            body: result.value,
          });
          const data = await response.json();

          if (response.ok) {
            swalCustom.fire(
              "Sucesso!",
              "Produto criado com sucesso.",
              "success",
            );
            loadProductTable();
          } else {
            swalCustom.fire(
              "Erro!",
              data.message || "Não foi possível criar.",
              "error",
            );
          }
        } catch {
          swalCustom.fire("Erro!", "Erro de conexão.", "error");
        }
      }
    });
}

async function openEditModal(id) {
  swalCustom.fire({
    title: "A carregar...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const response = await fetch(`/api/product/${id}`);
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Erro ao carregar produto.");

    const p = data.data;

    swalCustom
      .fire({
        title: "Editar Produto",
        html: `
        <div class="text-start mt-3">
          <div class="mb-3">
            <label class="form-label-small">Nome do Produto</label>
            <input type="text" id="edit-name" class="form-control w-100">
          </div>
          <div class="mb-3">
            <label class="form-label-small">Imagem do Produto</label>
            <div class="position-relative border rounded-3 p-3 text-center bg-light" style="border: 1px dashed #ccc !important; transition: 0.3s;">
              <i class="bi bi-cloud-arrow-up fs-3 text-secondary"></i>
              <p class="text-muted small mb-0 mt-1">Clique para procurar uma imagem</p>
              <input type="file" id="edit-image" name="image" accept="image/*" class="position-absolute top-0 start-0 w-100 h-100 opacity-0" style="cursor: pointer;">
            </div>
          </div>
          <div class="row">
            <div class="col-6 mb-3">
              <label class="form-label-small">Preço (€)</label>
              <input type="number" step="0.01" id="edit-price" class="form-control w-100">
            </div>
            <div class="col-6 mb-3">
              <label class="form-label-small">Stock</label>
              <input type="number" id="edit-stock" class="form-control w-100">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label-small">Categoria</label>
            <select id="edit-category" class="form-select w-100"></select>
          </div>
          <div class="mb-3">
            <label class="form-label-small">Descrição</label>
            <textarea id="edit-description" class="form-control w-100" rows="3"></textarea>
          </div>
        </div>
      `,
        showCancelButton: true,
        confirmButtonText: "Guardar Alterações",
        cancelButtonText: "Cancelar",
        didOpen: () => {
          document.getElementById("edit-name").value = p.name || "";
          document.getElementById("edit-price").value = p.price || "";
          document.getElementById("edit-stock").value = p.stock || "";
          document.getElementById("edit-description").value =
            p.description || "";
          loadCategories("edit-category", p.category?._id);
        },
        preConfirm: () => {
          const name = document.getElementById("edit-name").value;
          const price = document.getElementById("edit-price").value;
          const stock = document.getElementById("edit-stock").value;

          if (!name || !price || !stock) {
            Swal.showValidationMessage("Nome, preço e stock são obrigatórios.");
            return false;
          }

          const formData = new FormData();
          formData.append("name", name);
          formData.append("price", price);
          formData.append("stock", stock);
          formData.append(
            "categoryId",
            document.getElementById("edit-category").value,
          );
          formData.append(
            "description",
            document.getElementById("edit-description").value,
          );

          const imageFile = document.getElementById("edit-image").files[0];
          if (imageFile) formData.append("image", imageFile);

          return formData;
        },
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          swalCustom.fire({
            title: "A guardar...",
            didOpen: () => Swal.showLoading(),
          });

          try {
            const updateResponse = await fetch(`/api/product/update/${id}`, {
              method: "PUT",
              headers: {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
              },
              body: result.value,
            });
            const updateData = await updateResponse.json();

            if (updateResponse.ok) {
              swalCustom.fire(
                "Sucesso!",
                "Produto atualizado com sucesso.",
                "success",
              );
              loadProductTable();
            } else {
              swalCustom.fire(
                "Erro!",
                updateData.message || "Erro ao guardar.",
                "error",
              );
            }
          } catch {
            swalCustom.fire("Erro!", "Erro de conexão.", "error");
          }
        }
      });
  } catch (error) {
    swalCustom.fire(
      "Erro!",
      error.message || "Não foi possível carregar o produto.",
      "error",
    );
  }
}

async function toggleProduct(id) {
  try {
    const response = await fetch(`/api/product/toggle/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    const data = await response.json();

    if (response.ok) {
      loadProductTable();
    } else {
      swalCustom.fire(
        "Erro!",
        data.message || "Erro ao alterar estado.",
        "error",
      );
    }
  } catch {
    swalCustom.fire("Erro!", "Erro de conexão.", "error");
  }
}

function confirmDelete(id) {
  swalCustom
    .fire({
      title: "Eliminar Produto?",
      text: "Esta ação não pode ser revertida!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, eliminar!",
      cancelButtonText: "Cancelar",
      customClass: {
        confirmButton: "btn btn-danger px-4 py-2 ms-2 rounded-3",
        cancelButton: "btn btn-secondary px-4 py-2 me-2 rounded-3",
        popup: "rounded-4 border-0 shadow-lg",
      },
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/product/delete/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          });
          const data = await response.json();

          if (response.ok && data.success) {
            swalCustom
              .fire("Eliminado!", "Produto eliminado com sucesso.", "success")
              .then(() => loadProductTable());
          } else {
            swalCustom.fire(
              "Erro!",
              data.message || "Não foi possível eliminar.",
              "error",
            );
          }
        } catch {
          swalCustom.fire("Erro!", "Erro de conexão.", "error");
        }
      }
    });
}

loadProductTable();
