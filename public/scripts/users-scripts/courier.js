// --- ESTAFETAS (COURIERS) ---

// Abre modal para adicionar novo estafeta
function openAddCourierModal() {
  Swal.fire({
    title: "Novo Estafeta",
    html: `
            <div class="text-start">
                <label class="form-label mt-2">Nome Completo</label>
                <input type="text" id="swal-name" class="form-control" placeholder="Ex: Ricardo Entregas">
                
                <label class="form-label mt-2">Email</label>
                <input type="email" id="swal-email" class="form-control" placeholder="estafeta@mail.com">
                
                <label class="form-label mt-2">Palavra-passe</label>
                <input type="password" id="swal-password" class="form-control" placeholder="Min. 6 caracteres">
                
                <label class="form-label mt-2">Morada (Opcional)</label>
                <input type="text" id="swal-address" class="form-control" placeholder="Rua, Cidade">
                
                <label class="form-label mt-2">Telefone (Opcional)</label>
                <input type="text" id="swal-phone" class="form-control" placeholder="9xxxxxxxx">
            </div>
        `,
    confirmButtonText: "Guardar",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#0d6efd",
    preConfirm: () => {
      const name = document.getElementById("swal-name").value;
      const email = document.getElementById("swal-email").value;
      const password = document.getElementById("swal-password").value;

      if (!name || !email || !password) {
        Swal.showValidationMessage("Nome, Email e Password são obrigatórios");
        return false;
      }

      return {
        name: name,
        email: email,
        password: password,
        address: document.getElementById("swal-address").value,
        phone: document.getElementById("swal-phone").value,
        role: "courier",
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "A guardar...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      fetch("/api/users/createCourier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.value),
      })
        .then(async (response) => {
          const data = await response.json();
          if (response.ok) {
            Swal.fire("Sucesso!", "Estafeta criado com sucesso.", "success");
            loadCourierTable(); // Atualiza a tabela
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

// Remove estafeta
function openRemoveCourierModal(courierId) {
  Swal.fire({
    title: "Tens a certeza?",
    text: "Esta ação não pode ser revertida!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Sim, eliminar!",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/users/deleteCourier/${courierId}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (response.ok && data.success) {
          Swal.fire("Eliminado!", "O estafeta foi removido.", "success");
          loadCourierTable();
        } else {
          Swal.fire("Erro!", data.message || "Erro ao eliminar.", "error");
        }
      } catch (error) {
        Swal.fire("Erro!", "Erro de ligação.", "error");
      }
    }
  });
}

// Edita estafeta
async function openEditCourierModal(courierId) {
  Swal.fire({ title: "A carregar...", didOpen: () => Swal.showLoading() });

  try {
    const response = await fetch(`/api/users/courier/${courierId}`);
    const courier = await response.json();

    Swal.fire({
      title: "Editar Estafeta",
      html: `
        <div class="text-start">
            <label class="form-label mt-2">Nome Completo</label>
            <input type="text" id="edit-name" class="form-control" value="${courier.name || ""}">
            
            <label class="form-label mt-2">Email</label>
            <input type="email" id="edit-email" class="form-control" value="${courier.email || ""}">
            
            <label class="form-label mt-2">Nova Palavra-passe</label>
            <input type="password" id="edit-password" class="form-control" placeholder="Vazio para manter">
            
            <label class="form-label mt-2">Morada</label>
            <input type="text" id="edit-address" class="form-control" value="${courier.address || ""}">
            
            <label class="form-label mt-2">Telefone</label>
            <input type="text" id="edit-phone" class="form-control" value="${courier.phone || ""}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar Alterações",
      preConfirm: () => {
        return {
          name: document.getElementById("edit-name").value,
          email: document.getElementById("edit-email").value,
          password: document.getElementById("edit-password").value,
          address: document.getElementById("edit-address").value,
          phone: document.getElementById("edit-phone").value,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updateRes = await fetch(`/api/users/updateCourier/${courierId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result.value),
        });
        if (updateRes.ok) {
          Swal.fire("Sucesso!", "Dados atualizados.", "success");
          loadCourierTable();
        } else {
          Swal.fire("Erro!", "Erro ao atualizar.", "error");
        }
      }
    });
  } catch (error) {
    Swal.fire("Erro!", "Não foi possível carregar os dados.", "error");
  }
}

async function openViewCourierModal(courierId) {
  Swal.fire({ title: "A carregar...", didOpen: () => Swal.showLoading() });

  try {
    const response = await fetch(`/api/users/courier/${courierId}`);
    const courier = await response.json();

    Swal.fire({
      title: `<i class="bi bi-person-badge"></i> Perfil do Estafeta`,
      html: `
                <div class="text-start border-top pt-3">
                    <p><strong>Nome:</strong> ${courier.name}</p>
                    <p><strong>Email:</strong> ${courier.email}</p>
                    <p><strong>Telefone:</strong> ${courier.phone || "Não definido"}</p>
                    <p><strong>Morada:</strong> ${courier.address || "Não definida"}</p>
                </div>
            `,
      confirmButtonText: "Fechar",
      confirmButtonColor: "#6c757d",
    });
  } catch (error) {
    Swal.fire("Erro!", "Erro ao visualizar detalhes.", "error");
  }
}


async function loadCourierTable() {
  try {
    const response = await fetch("/api/users/listCouriers");
    const couriers = await response.json();
    const tbody = document.getElementById("courierTableBody");

    if (!tbody) return;

    let html = "";
    couriers.forEach((c) => {
      html += `
        <tr>
            <td><strong>${c._id}</strong></td>
            <td><strong>${c.name}</strong></td>
            <td>---</td>
            <td>---</td>
            <td class="text-end">
                <a href="/admin/user/${c._id}" class="btn btn-sm btn-light border shadow-sm me-1" title="Ver"><i class="bi bi-eye-fill text-primary"></i></a>
                <button class="btn btn-sm btn-light border shadow-sm me-1" onclick="openEditCourierModal('${c._id}')" title="Editar"><i class="bi bi-pencil text-primary"></i></button>
                <button class="btn btn-sm btn-light border shadow-sm" onclick="openRemoveCourierModal('${c._id}')" title="Eliminar"><i class="bi bi-trash text-danger"></i></button>
            </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  } catch (err) {
    console.error("Erro ao carregar estafetas:", err);
  }
}
