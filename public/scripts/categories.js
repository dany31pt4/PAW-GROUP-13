function openAddCategoryModal() {
  Swal.fire({
    title: "Nova Categoria",
    html: `
            <div class="text-start">
                <label class="form-label mt-2">Nome da Categoria</label>
                <input type="text" id="name" class="form-control" placeholder="Ex: Eletrónicos">
                
                <label class="form-label mt-2">Descrição</label>
                <input type="text" id="description" class="form-control" placeholder="Descrição da categoria">
                
                <label for="editCatStatus" class="form-label">Estado</label>
                <select class="form-select" id="editCatStatus" name="status">
                    <option value="active">Ativa</option>
                    <option value="inactive">Inativa</option>
                </select>
            </div>
        `,
    confirmButtonText: "Criar",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#0d6efd",
    preConfirm: () => {
      const name = document.getElementById("name").value;
      const description = document.getElementById("description").value;
      const status = document.getElementById("editCatStatus").value;

      if (!name || !description || !status) {
        Swal.showValidationMessage("Nome, Descrição e Estado são obrigatórios");
        return false;
      }

      return {
        name: name,
        description: description,
        status: status,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "A guardar...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      fetch("/api/categories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // ver o data size
        body: JSON.stringify(result.value),
      })
        .then(async (response) => {
          const data = await response.json();
          console.log(data);

          if (response.ok) {
            Swal.fire("Sucesso!", "Categoria criada com sucesso.", "success");
            loadCategoryTable();
          } else {
            Swal.fire(
              "Erro!",
              data.message || "Não foi possível criar.",
              "error",
            );
          }
        })
        .catch(() => Swal.fire("Erro!", "Erro de conexão.", "error"));
    }
  });
}

async function openViewCategoryModal(categoryId) {
  Swal.fire({
    title: "A carregar...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const response = await fetch(`/api/categories/${categoryId}`);

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Erro no servidor: A resposta não é JSON.");
    }

    const category = await response.json();

    if (!response.ok) {
      throw new Error(category.message || "Erro ao carregar detalhes.");
    }

    const estadoTexto =
      category.status === true || category.status === "active"
        ? '<span class="badge bg-success">Ativa</span>'
        : '<span class="badge bg-secondary">Inativa</span>';

    Swal.fire({
      title: `<i class="bi bi-tag-fill text-primary me-2"></i> Detalhes da Categoria`,
      html: `
        <div class="text-start border-top pt-3" style="font-size: 16px;">
            <p class="mb-2"><strong>Nome:</strong> ${category.name || "Não definido"}</p>
            <p class="mb-2"><strong>Descrição:</strong> ${category.description || "Nenhuma descrição disponível."}</p>
            <p class="mb-2"><strong>Estado:</strong> ${estadoTexto}</p>
        </div>
      `,
      confirmButtonText: "Fechar",
      confirmButtonColor: "#6c757d",
    });
  } catch (error) {
    console.error("Erro ao visualizar categoria:", error);
    Swal.fire(
      "Erro!",
      "Não foi possível carregar os detalhes desta categoria.",
      "error",
    );
  }
}

async function openEditCategoryModal(id) {
  Swal.fire({
    title: "A carregar dados...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await fetch(`/api/categories/${id}`);

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        "A rota da API falhou ou não devolveu JSON. Verifica o backend!",
      );
    }

    const category = await response.json();

    if (!response.ok) {
      throw new Error(category.message || "Erro ao carregar dados.");
    }

    Swal.fire({
      title: "Editar Categoria",
      html: `
        <div class="text-start">
            <label class="form-label mt-2">Nome da Categoria</label>
            <input type="text" id="edit-name" class="form-control" value="${category.name || ""}">
            
            <label class="form-label mt-2">Descrição</label>
            <input type="text" id="edit-description" class="form-control" value="${category.description || ""}">
            
            <label class="form-label mt-2">Estado</label>
            <select class="form-select" id="edit-status" name="status">
                <option value="active" ${category.status === true ? "selected" : ""}>Ativa</option>
                <option value="inactive" ${category.status === false ? "selected" : ""}>Inativa</option>
            </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Guardar Alterações",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const name = document.getElementById("edit-name").value;
        const description = document.getElementById("edit-description").value;
        const status = document.getElementById("edit-status").value;

        if (!name || !status) {
          Swal.showValidationMessage("O Nome e Estado não podem estar vazios!");
          return false;
        }

        return {
          name: name,
          description: description,
          status: status === "active" ? true : false,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: "A guardar...", didOpen: () => Swal.showLoading() });

        try {
          const updateResponse = await fetch(`/api/categories/update/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify(result.value),
          });

          const updateData = await updateResponse.json();

          if (updateResponse.ok) {
            Swal.fire("Sucesso!", "Os dados foram atualizados.", "success");
            loadCategoryTable();
          } else {
            Swal.fire(
              "Erro!",
              updateData.message || "Erro ao guardar.",
              "error",
            );
          }
        } catch (error) {
          Swal.fire(
            "Erro!",
            "Erro ao enviar os dados de atualização.",
            "error",
          );
        }
      }
    });
  } catch (error) {
    console.error("Erro no processo de edição:", error);
    Swal.fire(
      "Erro",
      error.message || "Não foi possível contactar o servidor.",
      "error",
    );
  }
}

function openRemoveCategoryModal(id) {
  Swal.fire({
    title: "Tens a certeza?",
    text: "Não vais poder reverter isto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sim, eliminar!",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/categories/delete/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Mostrar sucesso
          Swal.fire({
            title: "Eliminado!",
            text: "A categoria foi eliminada com sucesso.",
            icon: "success",
          }).then(() => {
            loadCategoryTable();
          });
        } else {
          Swal.fire({
            title: "Erro!",
            text: data.message || "Não foi possível eliminar a categoria.",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Erro no pedido:", error);
        Swal.fire({
          title: "Erro de Ligação!",
          text: "Ocorreu um problema ao contactar o servidor.",
          icon: "error",
        });
      }
    }
  });
}

async function loadCategoryTable() {
  try {
    const response = await fetch("/api/categories/list");

    if (!response.ok) {
      throw new Error("Erro ao buscar a lista de categorias");
    }

    const categories = await response.json();
    const tbody = document.getElementById("categoryTableBody");

    if (!tbody) {
      console.error("Aviso: Tabela de categorias não encontrada nesta página.");
      return;
    }

    let html = "";

    categories.forEach((c) => {
      let statusBadge = "";
      if (c.status === true) {
        statusBadge = '<span class="badge bg-success">Ativa</span>';
      } else {
        statusBadge = '<span class="badge bg-danger">Rejeitado</span>';
      }

      html += `
                <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${statusBadge}</td>
                    <td class="text-end">
                        <a href="/admin/category/${c._id}" class="btn btn-sm btn-light border shadow-sm me-1" title="Ver"><i class="bi bi-eye-fill text-primary"></i></a>
                        <button class="btn btn-sm btn-light border shadow-sm me-1" onclick="openEditCategoryModal('${c._id}')" title="Editar"><i class="bi bi-pencil text-primary"></i></button>
                        <button class="btn btn-sm btn-light border shadow-sm" onclick="openRemoveCategoryModal('${c._id}')" title="Eliminar"><i class="bi bi-trash text-danger"></i></button>
                    </td>
                </tr>
            `;
    });

    tbody.innerHTML = html;
  } catch (err) {
    console.error("Erro ao carregar tabela de supermercados:", err);
  }
}

loadCategoryTable();
