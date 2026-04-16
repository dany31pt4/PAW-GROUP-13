const main = document.querySelector('main');

const marketLabels  = JSON.parse(main.dataset.marketLabels  || '[]');
const marketData    = JSON.parse(main.dataset.marketData    || '[]');
const courierLabels = JSON.parse(main.dataset.courierLabels || '[]');
const courierData   = JSON.parse(main.dataset.courierData   || '[]');

const palette = ['#3498db','#2ecc71','#f1c40f','#e74c3c','#9b59b6','#1abc9c','#e67e22','#34495e'];

// Gráfico: Vendas por Loja (Doughnut)
new Chart(document.getElementById('chartLojas'), {
    type: 'doughnut',
    data: {
        labels: marketLabels.length ? marketLabels : ['Sem dados'],
        datasets: [{
            data: marketData.length ? marketData : [1],
            backgroundColor: palette,
            hoverOffset: 4
        }]
    },
    options: {
        plugins: { legend: { position: 'bottom' } }
    }
});

// Gráfico: Entregas por Estafeta (Barra Horizontal)
new Chart(document.getElementById('chartEstafetas'), {
    type: 'bar',
    data: {
        labels: courierLabels.length ? courierLabels : ['Sem dados'],
        datasets: [{
            label: 'Entregas',
            data: courierData.length ? courierData : [0],
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
