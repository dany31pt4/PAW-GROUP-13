async function updateOrderStatus(orderId, newStatus) {
    let actionText = "";
    let actionColor = "";

    if (newStatus === 'confirmed') {
        actionText = "confirmar esta encomenda";
        actionColor = "#198754";
    } else if (newStatus === 'preparing') {
        actionText = "iniciar a preparação desta encomenda";
        actionColor = "#0d6efd";
    } else if (newStatus === 'delivering') {
        actionText = "marcar esta encomenda como pronta (aguarda cliente/estafeta)";
        actionColor = "#0dcaf0";
    }

    const result = await Swal.fire({
        title: 'Confirmar ação',
        text: `Pretende ${actionText}? O cliente será notificado da alteração.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: actionColor,
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, atualizar!',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        Swal.fire({ title: 'A processar...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            const response = await fetch(`/api/orders/status/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire('Sucesso!', 'O estado da encomenda foi atualizado.', 'success')
                    .then(() => window.location.reload());
            } else {
                Swal.fire('Erro!', data.message || 'Não foi possível atualizar o estado.', 'error');
            }
        } catch {
            Swal.fire('Erro de Ligação', 'Ocorreu um problema ao comunicar com o servidor.', 'error');
        }
    }
}
