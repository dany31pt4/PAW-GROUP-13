async function openViewModal(id) {
  Swal.fire({
    title: "A carregar...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const response = await fetch(`/api/supermarkets/${id}`);

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Erro no servidor: A resposta não é JSON.");
    }

    const market = await response.json();

    if (!response.ok) {
      throw new Error(market.message || "Erro ao carregar detalhes.");
    }

    Swal.fire({
      title: `<i class="bi bi-shop text-primary me-2"></i> Detalhes do Registo`,
      html: `
        <div class="text-start border-top pt-3" style="font-size: 16px;">
            <p class="mb-2"><strong>ID:</strong> ${market._id}</p>
            <p class="mb-2"><strong>Nome:</strong> ${market.name || "Não definido"}</p>
            <p class="mb-2"><strong>Email:</strong> ${market.user?.email || "Sem email"}</p>
            <p class="mb-2"><strong>Telefone:</strong> ${market.user?.phone || "Sem telefone"}</p>
            <p class="mb-2"><strong>Localidade:</strong> ${market.location?.address || "Não definida"}</p>
            <p class="mb-2"><strong>Estado:</strong> <span class="badge bg-warning text-dark">Pendente</span></p>
        </div>
      `,
      confirmButtonText: "Fechar",
      confirmButtonColor: "#6c757d",
    });
  } catch (error) {
    console.error("Erro ao visualizar supermercado:", error);
    Swal.fire(
      "Erro!",
      "Não foi possível carregar os detalhes deste registo.",
      "error",
    );
  }
}

function openApproveModal(id) {
  Swal.fire({
    title: "Aprovar Registo?",
    text: "Este supermercado passará a estar ativo na plataforma.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#198754",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Sim, validar!",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "A aprovar...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const response = await fetch(`/api/supermarkets/approve/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: "Aprovado!",
            text: "O supermercado foi validado com sucesso.",
            icon: "success",
          }).then(() => {
            window.location.reload();
          });
        } else {
          Swal.fire(
            "Erro!",
            data.message || "Não foi possível aprovar.",
            "error",
          );
        }
      } catch (error) {
        console.error("Erro no pedido:", error);
        Swal.fire(
          "Erro de Ligação!",
          "Ocorreu um problema ao contactar o servidor.",
          "error",
        );
      }
    }
  });
}

function openRejectModal(id) {
  Swal.fire({
    title: "Rejeitar Registo?",
    text: "O supermercado não será aprovado.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Sim, rejeitar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "A rejeitar...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const response = await fetch(`/api/supermarkets/reject/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            title: "Rejeitado!",
            text: "O registo do supermercado foi rejeitado.",
            icon: "success",
          }).then(() => {
            window.location.reload();
          });
        } else {
          Swal.fire(
            "Erro!",
            data.message || "Não foi possível rejeitar.",
            "error",
          );
        }
      } catch (error) {
        console.error("Erro no pedido:", error);
        Swal.fire(
          "Erro de Ligação!",
          "Ocorreu um problema ao contactar o servidor.",
          "error",
        );
      }
    }
  });
}
