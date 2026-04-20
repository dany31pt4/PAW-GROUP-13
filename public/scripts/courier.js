async function acceptDelivery(orderId) {
    const result = await Swal.fire({
        title: 'Confirmar ação',
        text: 'Pretende aceitar esta entrega?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, aceitar!',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        Swal.fire({ title: 'A processar...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            const response = await fetch(`/api/orders/courier/accept/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire('Sucesso!', 'Entrega aceite com sucesso.', 'success')
                    .then(() => window.location.reload());
            } else {
                Swal.fire('Erro!', data.message || 'Não foi possível aceitar a entrega.', 'error');
            }
        } catch {
            Swal.fire('Erro de Ligação', 'Ocorreu um problema ao comunicar com o servidor.', 'error');
        }
    }
}

async function completeDelivery(orderId) {
    const result = await Swal.fire({
        title: 'Confirmar ação',
        text: 'Pretende marcar esta entrega como entregue?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, entreguei!',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        Swal.fire({ title: 'A processar...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            const response = await fetch(`/api/orders/courier/complete/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire('Sucesso!', 'Entrega concluída com sucesso.', 'success')
                    .then(() => window.location.reload());
            } else {
                Swal.fire('Erro!', data.message || 'Não foi possível completar a entrega.', 'error');
            }
        } catch {
            Swal.fire('Erro de Ligação', 'Ocorreu um problema ao comunicar com o servidor.', 'error');
        }
    }
}
