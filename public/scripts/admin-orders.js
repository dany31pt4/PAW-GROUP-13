const main = document.querySelector('main');

const marketLabels  = JSON.parse(main.dataset.marketLabels  || '[]');
const marketData    = JSON.parse(main.dataset.marketData    || '[]');
const courierLabels = JSON.parse(main.dataset.courierLabels || '[]');
const courierData   = JSON.parse(main.dataset.courierData   || '[]');

const palette = ['#3498db','#2ecc71','#f1c40f','#e74c3c','#9b59b6','#1abc9c','#e67e22','#34495e'];

// Gráfico: Vendas por Loja (Doughnut)
let chartLojaLabels = marketLabels;
if (marketLabels.length === 0) {
    chartLojaLabels = ['Sem dados'];
}
let chartLojaData = marketData;
if (marketData.length === 0) {
    chartLojaData = [1];
}

new Chart(document.getElementById('chartLojas'), {
    type: 'doughnut',
    data: {
        labels: chartLojaLabels,
        datasets: [{
            data: chartLojaData,
            backgroundColor: palette,
            hoverOffset: 4
        }]
    },
    options: {
        plugins: { legend: { position: 'bottom' } }
    }
});

let chartCourierLabels = courierLabels;
if (courierLabels.length === 0) {
    chartCourierLabels = ['Sem dados'];
}
let chartCourierData = courierData;
if (courierData.length === 0) {
    chartCourierData = [0];
}

// Gráfico: Entregas por Estafeta (Barra Horizontal)
new Chart(document.getElementById('chartEstafetas'), {
    type: 'bar',
    data: {
        labels: chartCourierLabels,
        datasets: [{
            label: 'Entregas',
            data: chartCourierData,
            backgroundColor: '#3498db',
            borderRadius: 5
        }]
    },
    options: {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
});
