// --- SUPERMERCADOS (MARKETS) ---

function openAddMarketModal() {
    Swal.fire({
        title: "Novo Supermercado",
        html: `
            <div class="text-start">
                <h6 class="text-primary border-bottom pb-1 mt-2">1. Dados de Acesso</h6>
                <label class="form-label mt-2">Email de Login</label>
                <input type="email" id="swal-email" class="form-control" placeholder="geral@supermercado.pt">
                
                <label class="form-label mt-2">Palavra-passe inicial</label>
                <input type="password" id="swal-password" class="form-control" placeholder="Mínimo 6 caracteres">
                
                <h6 class="text-primary border-bottom pb-1 mt-4">2. Detalhes do Estabelecimento</h6>
                <label class="form-label mt-2">Nome do Supermercado</label>
                <input type="text" id="swal-name" class="form-control" placeholder="Ex: Pingo Doce Central">
                
                <label class="form-label mt-2">Telefone</label>
                <input type="text" id="swal-phone" class="form-control" placeholder="9xxxxxxxx">
                
                <label class="form-label mt-2">Localidade / Morada</label>
                <input type="text" id="swal-address" class="form-control" placeholder="Ex: Bragança">
            </div>
        `,
        confirmButtonText: "Registar Supermercado",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#0d6efd",
        preConfirm: () => {
            const email = document.getElementById("swal-email").value;
            const password = document.getElementById("swal-password").value;
            const name = document.getElementById("swal-name").value;
            const phone = document.getElementById("swal-phone").value;
            const address = document.getElementById("swal-address").value;

            if (!email || !password || !name || !address) {
                Swal.showValidationMessage("Nome, Email, Password e Morada são obrigatórios!");
                return false;
            }

            return {
                name: name,
                email: email,
                password: password,
                phone: phone,
                address: address
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: "A registar...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            // Certifica-te que esta é a rota mapeada para a função registerSupermarket no teu backend
            fetch("/api/markets/create", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest" // Importante para o middleware de autenticação devolver JSON
                },
                body: JSON.stringify(result.value)
            })
            .then(async res => {
                const data = await res.json();
                if (res.ok && data.success) {
                    Swal.fire("Sucesso!", "Supermercado e conta criados com sucesso.", "success")
                        .then(() => loadMarketTable()); // Faz refresh à página para atualizar a tabela
                } else {
                    Swal.fire("Erro!", data.message || "Erro ao criar o supermercado.", "error");
                }
            })
            .catch(err => Swal.fire("Erro!", "Erro de comunicação com o servidor.", "error"));
        }
    });
}

// 2. VISUALIZAR DETALHES
async function openViewMarketModal(marketId) {
    Swal.fire({ title: "A carregar...", didOpen: () => Swal.showLoading() });
    try {
        const res = await fetch(`/api/markets/${marketId}`);
        const market = await res.json();

        // Como adicionamos o .populate("user") no backend, os dados de contacto estão dentro de market.user
        const email = market.user ? market.user.email : '<span class="text-muted">Desconhecido</span>';
        const phone = market.user ? market.user.phone : '<span class="text-muted">Sem contacto</span>';

        // Definir a cor da badge do estado
        let statusBadge = '';
        if (market.status === 'approved') statusBadge = '<span class="badge bg-success">Ativo</span>';
        else if (market.status === 'pending') statusBadge = '<span class="badge bg-warning text-dark">Pendente</span>';
        else statusBadge = '<span class="badge bg-danger">Rejeitado</span>';

        Swal.fire({
            title: `<i class="bi bi-shop"></i> Detalhes da Loja`,
            html: `
                <div class="text-start border-top pt-3">
                    <p><strong>Nome:</strong> ${market.name}</p>
                    <p><strong>Localidade:</strong> ${market.location}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Telefone:</strong> ${phone}</p>
                    <p><strong>Estado atual:</strong> ${statusBadge}</p>
                </div>
            `,
            confirmButtonText: "Fechar",
            confirmButtonColor: "#6c757d"
        });
    } catch (e) { 
        Swal.fire("Erro", "Não foi possível carregar os dados do supermercado.", "error"); 
    }
}

// 3. EDITAR LOJA
async function openEditMarketModal(marketId) {
    Swal.fire({ title: "A carregar...", didOpen: () => Swal.showLoading() });

    try {
        const res = await fetch(`/api/markets/${marketId}`);
        const market = await res.json();

        const userEmail = market.user ? market.user.email : '';
        const userPhone = market.user ? market.user.phone : '';

        Swal.fire({
            title: "Editar Supermercado",
            html: `
                <div class="text-start">
                    <h6 class="text-primary border-bottom pb-1 mt-2">Dados da Loja</h6>
                    <label class="form-label mt-2">Nome</label>
                    <input type="text" id="edit-name" class="form-control" value="${market.name}">
                    
                    <label class="form-label mt-2">Localidade</label>
                    <input type="text" id="edit-location" class="form-control" value="${market.location}">
                    
                    <label class="form-label mt-2">Estado</label>
                    <select id="edit-status" class="form-select">
                        <option value="approved" ${market.status === 'approved' ? 'selected' : ''}>Ativo</option>
                        <option value="pending" ${market.status === 'pending' ? 'selected' : ''}>Pendente</option>
                        <option value="rejected" ${market.status === 'rejected' ? 'selected' : ''}>Rejeitado</option>
                    </select>

                    <h6 class="text-primary border-bottom pb-1 mt-4">Dados de Contacto e Acesso</h6>
                    <label class="form-label mt-2">Email de Login</label>
                    <input type="email" id="edit-email" class="form-control" value="${userEmail}">
                    
                    <label class="form-label mt-2">Telefone</label>
                    <input type="text" id="edit-phone" class="form-control" value="${userPhone}">
                    
                    <label class="form-label mt-2">Nova Password</label>
                    <input type="password" id="edit-password" class="form-control" placeholder="Deixa vazio para manter">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Guardar Alterações",
            preConfirm: () => {
                return {
                    name: document.getElementById("edit-name").value,
                    location: document.getElementById("edit-location").value,
                    status: document.getElementById("edit-status").value,
                    email: document.getElementById("edit-email").value,
                    phone: document.getElementById("edit-phone").value,
                    password: document.getElementById("edit-password").value
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updateRes = await fetch(`/api/markets/update/${marketId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(result.value)
                });
                if (updateRes.ok) {
                    Swal.fire("Sucesso!", "Dados atualizados.", "success").then(() => loadMarketTable());
                } else {
                    Swal.fire("Erro", "Não foi possível guardar as alterações.", "error");
                }
            }
        });
    } catch (e) { Swal.fire("Erro", "Erro ao carregar dados.", "error"); }
}

// 4. ELIMINAR LOJA
function openRemoveMarketModal(marketId) {
    Swal.fire({
        title: "Remover Supermercado?",
        text: "Esta ação apagará também o utilizador associado a este supermercado. É irreversível!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, remover!",
        cancelButtonText: "Cancelar"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const delRes = await fetch(`/api/markets/delete/${marketId}`, { method: "DELETE" });
                const data = await delRes.json();
                
                if (delRes.ok && data.success) {
                    Swal.fire("Eliminado!", "O supermercado e a respetiva conta foram removidos.", "success")
                        .then(() => loadMarketTable());
                } else {
                    Swal.fire("Erro!", data.message || "Não foi possível eliminar.", "error");
                }
            } catch (error) {
                Swal.fire("Erro!", "Erro de comunicação com o servidor.", "error");
            }
        }
    });
}


// 5. ATUALIZAR TABELA DE SUPERMERCADOS (SEM REFRESH)
async function loadMarketTable() {
    try {
        const response = await fetch("/api/markets/list"); 
        
        if (!response.ok) {
            throw new Error("Erro ao buscar a lista de supermercados");
        }

        const markets = await response.json();
        const tbody = document.getElementById("marketTableBody"); // ID que está no teu users.ejs

        if (!tbody) {
            console.error("Aviso: Tabela de supermercados não encontrada nesta página.");
            return;
        }

        let html = "";

        markets.forEach((m) => {
            let statusBadge = '';
            if (m.status === 'approved') {
                statusBadge = '<span class="badge bg-success">Ativo</span>';
            } else if (m.status === 'pending') {
                statusBadge = '<span class="badge bg-warning text-dark">Pendente</span>';
            } else {
                statusBadge = '<span class="badge bg-danger">Rejeitado</span>';
            }

            html += `
                <tr>
                    <td><strong>${m.name}</strong></td>
                    <td>${m.location}</td>
                    <td>${statusBadge}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary" onclick="openViewMarketModal('${m._id}')">Ver</button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="openEditMarketModal('${m._id}')">Editar</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="openRemoveMarketModal('${m._id}')">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    } catch (err) {
        console.error("Erro ao carregar tabela de supermercados:", err);
    }
}