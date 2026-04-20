const FormData = require("form-data");
const Mailgun = require("mailgun.js");
require("dotenv").config();

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

const statusLabels = {
  confirmed:        "Confirmada",
  preparing:        "Em Preparação",
  awaiting_courier: "A Aguardar Estafeta",
  delivering:       "A Caminho",
  delivered:        "Entregue",
  cancelled:        "Cancelada",
};

const sendOrderStatusEmail = async (order) => {
  try {
    const label = statusLabels[order.status];
    if (!label) return;

    const customerEmail = order.customer && order.customer.email;
    if (!customerEmail) return;

    const customerName = order.customer.name || "Cliente";
    const supermarketName = order.supermarket ? order.supermarket.name : "N/A";

    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: process.env.MAILGUN_FROM,
      to: [customerEmail],
      subject: `Encomenda atualizada — ${label}`,
      text: `Olá ${customerName},\n\nA tua encomenda do ${supermarketName} foi atualizada para: ${label}.\n\nObrigado por usares o Marketplace!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color: #2c3e50;">Atualização da Encomenda</h2>
          <p>Olá <strong>${customerName}</strong>,</p>
          <p>A tua encomenda do <strong>${supermarketName}</strong> foi atualizada para:</p>
          <p style="font-size: 20px; font-weight: bold; color: #3498db;">${label}</p>
          <hr>
          <p style="color: #888; font-size: 12px;">Marketplace — Notificação automática</p>
        </div>
      `,
    });

    console.log(`Email enviado para ${customerEmail} — estado: ${label}`);
  } catch (error) {
    console.error("Erro ao enviar email:", error.message);
  }
};

module.exports = { sendOrderStatusEmail };
