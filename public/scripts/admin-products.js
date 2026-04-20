async function toggleAdminProduct(productId, isActive) {
    let actionText = "ativar";
    if (isActive) {
        actionText = "desativar";
    }

    const result = await Swal.fire({
        title: 'Confirmar ação',
        text: `Pretende ${actionText} este produto?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim!',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        Swal.fire({ title: 'A processar...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            const response = await fetch(`/api/product/toggle/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire('Sucesso!', 'Estado do produto atualizado.', 'success')
                    .then(() => window.location.reload());
            } else {
                Swal.fire('Erro!', data.message || 'Não foi possível atualizar o produto.', 'error');
            }
        } catch {
            Swal.fire('Erro de Ligação', 'Ocorreu um problema ao comunicar com o servidor.', 'error');
        }
    }
}
