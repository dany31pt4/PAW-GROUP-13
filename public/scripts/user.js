function openAddAdminModal() {
  Swal.fire({
    title: "Adicionar Novo Administrador",
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
    showCancelButton: true,
    confirmButtonText: "Criar Admin",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#0d6efd",
    focusConfirm: false,
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
        name,
        email,
        password,
        address,
        phone,
        role: "admin",
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
    }
  });
}

function createAdmin(data) {
    // Feedback visual de carregamento
    Swal.fire({
        title: 'A processar...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    fetch('/api/users', { // DEFENIR ROTA CORRETA PARA CRIAR ADMIN
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(async response => {
        const data = await response.json();
        if (response.ok) {
            Swal.fire('Sucesso!', 'O administrador foi criado.', 'success')
            .then(() => location.reload());
        } else {
            throw new Error(data.message || 'Erro ao criar conta');
        }
    })
    .catch(err => {
        Swal.fire('Erro!', err.message, 'error');
    });
}

async function refreshAdminTable() {
  
};

