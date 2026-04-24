const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const statusLabels = {
  confirmed: "Confirmada",
  preparing: "Em Preparação",
  awaiting_courier: "A Aguardar Estafeta",
  delivering: "A Caminho",
  delivered: "Entregue",
  cancelled: "Cancelada",
};

const sendOrderStatusEmail = async (order) => {
  try {
    const label = statusLabels[order.status];
    if (!label) return;

    const customerEmail = order.customer && order.customer.email;
    if (!customerEmail) return;

    const customerName = order.customer.name || "Cliente";

    let supermarketName;
    if (order.supermarket) {
      supermarketName = order.supermarket.name;
    } else {
      supermarketName = "N/A";
    }

    await transporter.sendMail({
      from: `"Marketplace" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Encomenda atualizada — ${label}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color: #2c3e50;">Atualização da Encomenda</h2>
          <p>Olá <strong>${customerName}</strong>,</p>
          <p>A sua encomenda do <strong>${supermarketName}</strong> foi atualizada para:</p>
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

const sendSupermarketStatusEmail = async (email, name, status) => {
  try {
    const isApproved = status === "approved";

    let subject;
    if (isApproved) {
      subject = `Registo aprovado — ${name}`;
    } else {
      subject = `Registo rejeitado — ${name}`;
    }

    let color;
    if (isApproved) {
      color = "#198754";
    } else {
      color = "#dc3545";
    }

    let message;
    if (isApproved) {
      message = "O seu registo foi <strong>aprovado</strong>. Já pode aceder à plataforma.";
    } else {
      message = "O seu registo foi <strong>rejeitado</strong>. Contacte o suporte para mais informações.";
    }

    await transporter.sendMail({
      from: `"Marketplace" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color: ${color};">${subject}</h2>
          <p>Olá <strong>${name}</strong>,</p>
          <p>${message}</p>
          <hr>
          <p style="color: #888; font-size: 12px;">Marketplace — Notificação automática</p>
        </div>
      `,
    });

    console.log(`Email de estado (${status}) enviado para ${email}`);
  } catch (error) {
    console.error("Erro ao enviar email ao supermercado:", error.message);
  }
};

const sendCourierAvailableEmail = async (couriers, order) => {
  try {
    if (!couriers || couriers.length === 0) return;

    let supermarketName;
    if (order.supermarket) {
      supermarketName = order.supermarket.name;
    } else {
      supermarketName = "N/A";
    }

    const to = couriers.map((c) => c.email);

    await transporter.sendMail({
      from: `"Marketplace" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Nova entrega disponível — Marketplace",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color: #2c3e50;">Nova Entrega Disponível</h2>
          <p>Há uma nova encomenda do <strong>${supermarketName}</strong> à espera de estafeta.</p>
          <p>Acede à plataforma para aceitar a entrega.</p>
          <hr>
          <p style="color: #888; font-size: 12px;">Marketplace — Notificação automática</p>
        </div>
      `,
    });

    console.log(`Email de entrega disponível enviado para ${to.length} estafeta(s)`);
  } catch (error) {
    console.error("Erro ao enviar email aos estafetas:", error.message);
  }
};

module.exports = {
  sendOrderStatusEmail,
  sendSupermarketStatusEmail,
  sendCourierAvailableEmail,
};
