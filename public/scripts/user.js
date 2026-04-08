// Opens modal to add new admin
function openAddAdminModal() {
  Swal.fire({
    title: "Novo Administrador",
    html: `
            <div class="text-start">
                <label class="form-label mt-2">Nome Completo</label>
                <input type="text" id="swal-name" class="form-control" placeholder="Ex: João Silva">
                
                <label class="form-label mt-2">Email</label>
                <input type="email" id="swal-email" class="form-control" placeholder="exemplo@mail.com">
                
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
      const address = document.getElementById("swal-address").value;
      const phone = document.getElementById("swal-phone").value;

      if (!name || !email || !password) {
        Swal.showValidationMessage("Nome, Email e Password são obrigatórios");
        return false;
      }

      return {
        name: name,
        email: email,
        password: password,
        address: address,
        phone: phone,
        role: "admin",
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "A guardar...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Pedido AJAX (POST) para o servidor
      fetch("/api/users/createAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.value), // req body
      })
        .then(async (response) => {
          const data = await response.json();

          if (response.ok) {
            Swal.fire(
              "Sucesso!",
              "Administrador criado com sucesso.",
              "success",
            );
            loadAdminTable(); // Atualiza a lista sem refresh
          } else {
            // Se o servidor deu erro (ex: 400), mostra a mensagem que veio do back-end
            Swal.fire(
              "Erro!",
              data.message || "Não foi possível criar o utilizador.",
              "error",
            );
          }
        })
        .catch((err) => {
          console.error("Erro no fetch:", err);
          Swal.fire("Erro!", "Erro de conexão com o servidor.", "error");
        });
    }
  });
}

function openRemoveAdminModal(adminId) {
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
        const response = await fetch(`/api/users/deleteAdmin/${adminId}`, {
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
            text: "O administrador foi eliminado com sucesso.",
            icon: "success",
          }).then(() => {
            loadAdminTable();
            // window.location.reload();
          });
        } else {
          Swal.fire({
            title: "Erro!",
            text: data.message || "Não foi possível eliminar o administrador.",
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

// (Re)Loads the admin table
async function loadAdminTable() {
  try {
    const response = await fetch("/api/users/listAdmins");

    if (!response.ok) {
      throw new Error("Erro ao procurar a lista de administradores");
    }

    const admins = await response.json();
    const tbody = document.getElementById("adminTableBody");

    if (!tbody) {
      console.error("Elemento 'adminTableBody' não encontrado no HTML.");
      return;
    }

    let html = "";

    admins.forEach((admin) => {
      let dataFormatada = "---";

      if (admin.createdAt) {
        dataFormatada = new Date(admin.createdAt).toLocaleDateString("pt-PT");
      }

      html += `
        <tr>
            <td><strong>${admin.name}</strong></td>
            <td>${admin.email}</td>
            <td>${dataFormatada}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary" onclick="openEditAdminModal('${admin._id}')">Editar</button>
                <button class="btn btn-sm btn-outline-danger" onclick="openRemoveAdminModal('${admin._id}')">Eliminar</button>
            </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  } catch (err) {
    console.error("Erro ao atualizar a tabela:", err);
  }
}

async function openEditAdminModal(adminId) {
  Swal.fire({
    title: "A carregar dados...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await fetch(`/api/users/admin/${adminId}`);
    const admin = await response.json();

    if (!response.ok) {
      throw new Error(admin.message || "Erro ao carregar dados.");
    }

    Swal.fire({
      title: "Editar Administrador",
      html: `
        <div class="text-start">
            <label class="form-label mt-2">Nome Completo</label>
            <input type="text" id="edit-name" class="form-control" value="${admin.name || ""}">
            
            <label class="form-label mt-2">Email</label>
            <input type="email" id="edit-email" class="form-control" value="${admin.email || ""}">
            
            <label class="form-label mt-2">Nova Palavra-passe</label>
            <input type="password" id="edit-password" class="form-control" placeholder="Deixa em branco para não alterar">
            
            <label class="form-label mt-2">Morada (Opcional)</label>
            <input type="text" id="edit-address" class="form-control" value="${admin.address || ""}">
            
            <label class="form-label mt-2">Telefone (Opcional)</label>
            <input type="text" id="edit-phone" class="form-control" value="${admin.phone || ""}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Guardar Alterações",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const name = document.getElementById("edit-name").value;
        const email = document.getElementById("edit-email").value;

        if (!name || !email) {
          Swal.showValidationMessage("O Nome e Email não podem estar vazios!");
          return false;
        }

        return {
          name: name,
          email: email,
          password: document.getElementById("edit-password").value,
          address: document.getElementById("edit-address").value,
          phone: document.getElementById("edit-phone").value,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: "A guardar...", didOpen: () => Swal.showLoading() });

        const updateResponse = await fetch(
          `/api/users/updateAdmin/${adminId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify(result.value),
          },
        );

        const updateData = await updateResponse.json();

        if (updateResponse.ok && updateData.success) {
          Swal.fire("Sucesso!", "Os dados foram atualizados.", "success");
          loadAdminTable();
        } else {
          Swal.fire("Erro!", updateData.message || "Erro ao guardar.", "error");
        }
      }
    });
  } catch (error) {
    console.error("Erro no processo de edição:", error);
    Swal.fire(
      "Erro de Ligação",
      "Não foi possível contactar o servidor.",
      "error",
    );
  }
}
