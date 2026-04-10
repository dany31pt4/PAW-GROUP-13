// --- Clientes (CUSTOMERS) ---

// 1. VISUALIZAR DETALHES
async function openViewCustomerModal(customerId) {
    Swal.fire({ title: "A carregar...", didOpen: () => Swal.showLoading() });
    try {
        const res = await fetch(`/api/customer/${customerId}`);
        const customer = await res.json();
        
        // Formatar data de registo
        const dataRegisto = customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('pt-PT') : 'Desconhecida';

        Swal.fire({
            title: `<i class="bi bi-person"></i> Detalhes do Cliente`,
            html: `
                <div class="text-start border-top pt-3">
                    <p><strong>Nome:</strong> ${customer.name}</p>
                    <p><strong>Email:</strong> ${customer.email}</p>
                    <p><strong>Telefone:</strong> ${customer.phone || '<span class="text-muted">Não definido</span>'}</p>
                    <p><strong>Morada:</strong> ${customer.address || '<span class="text-muted">Não definida</span>'}</p>
                    <p><strong>Data de Registo:</strong> ${dataRegisto}</p>
                </div>
            `,
            confirmButtonText: "Fechar",
            confirmButtonColor: "#6c757d"
        });
    } catch (error) {
        Swal.fire("Erro!", "Não foi possível carregar os dados do Cliente.", "error");
    }
}

// 2. EDITAR Cliente
async function openEditCustomerModal(customerId) {
    Swal.fire({ title: "A carregar...", didOpen: () => Swal.showLoading() });
    try {
        const res = await fetch(`/api/customer/${customerId}`);
        const customer = await res.json();

        Swal.fire({
            title: "Editar Cliente",
            html: `
                <div class="text-start">
                    <label class="form-label mt-2">Nome Completo</label>
                    <input type="text" id="edit-name" class="form-control" value="${customer.name || ''}">
                    
                    <label class="form-label mt-2">Email</label>
                    <input type="email" id="edit-email" class="form-control" value="${customer.email || ''}">
                    
                    <label class="form-label mt-2">Telefone</label>
                    <input type="text" id="edit-phone" class="form-control" value="${customer.phone || ''}">
                    
                    <label class="form-label mt-2">Morada</label>
                    <input type="text" id="edit-address" class="form-control" value="${customer.address || ''}">
                    
                    <label class="form-label mt-2">Nova Palavra-passe</label>
                    <input type="password" id="edit-password" class="form-control" placeholder="Deixa vazio para manter a atual">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Guardar Alterações",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#0d6efd",
            preConfirm: () => {
                const name = document.getElementById("edit-name").value;
                const email = document.getElementById("edit-email").value;
                if (!name || !email) {
                    Swal.showValidationMessage("O Nome e o Email são obrigatórios!");
                    return false;
                }
                return {
                    name: name,
                    email: email,
                    phone: document.getElementById("edit-phone").value,
                    address: document.getElementById("edit-address").value,
                    password: document.getElementById("edit-password").value
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: "A atualizar...", didOpen: () => Swal.showLoading() });
                
                const updateRes = await fetch(`/api/customer/update/${customerId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify(result.value)
                });
                
                const data = await updateRes.json();
                if (updateRes.ok && data.success) {
                    Swal.fire("Sucesso!", "Os dados do Cliente foram guardados.", "success").then(() => loadcustomerTable());
                } else {
                    Swal.fire("Erro!", data.message || "Erro ao atualizar.", "error");
                }
            }
        });
    } catch (error) {
        Swal.fire("Erro!", "Não foi possível carregar os dados para edição.", "error");
    }
}

// 3. ELIMINAR Cliente
function openRemoveCustomerModal(customerId) {
    Swal.fire({
        title: "Remover Cliente?",
        text: "Esta ação é irreversível e irá apagar a conta e os dados deste Cliente!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, eliminar!",
        cancelButtonText: "Cancelar"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const delRes = await fetch(`/api/customer/deleteCustomer/${customerId}`, { method: "DELETE" });
                const data = await delRes.json();
                
                if (delRes.ok && data.success) {
                    Swal.fire("Eliminado!", "O Cliente foi removido com sucesso.", "success").then(() => loadcustomerTable());
                } else {
                    Swal.fire("Erro!", data.message || "Não foi possível eliminar.", "error");
                }
            } catch (error) {
                Swal.fire("Erro!", "Erro de comunicação com o servidor.", "error");
            }
        }
    });
}

// 4. ATUALIZAR TABELA DE ClienteS (SEM REFRESH)
async function loadcustomerTable() {
    try {
        const response = await fetch("/api/customer/listCustomers");
        const customers = await response.json();
        
        const tbody = document.getElementById("customerTableBody");
        if (!tbody) return;

        let html = "";
        customers.forEach((c) => {
            const dataRegisto = c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-PT') : '---';
            html += `
                <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.email}</td>
                    <td>${dataRegisto}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary" onclick="openViewCustomerModal('${c._id}')">Ver</button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="openEditCustomerModal('${c._id}')">Editar</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="openRemoveCustomerModal('${c._id}')">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    } catch (err) {
        console.error("Erro ao carregar tabela de Clientes:", err);
    }
}