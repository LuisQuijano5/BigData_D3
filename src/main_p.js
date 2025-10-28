/**
Este archivo es como el controlador, llama las graficas, limpia datos, gestiona la vista
 */

let currentYearData = [];

function updateDashboard(year) {
    const dataFilename = `data/fifa_20${year}.csv`;

    d3.csv(dataFilename).then(data => {
        // Limpieza de datos numéricos
        data.forEach(d => {
            d.age = +d.age;
            d.height_cm = +d.height_cm;
            d.weight_kg = +d.weight_kg;
            d.league_rank = +d.league_rank;
            d.overall = +d.overall;
            d.potential = +d.potential;
            d.value_eur = +d.value_eur;
            d.wage_eur = +d.wage_eur;
            d.weak_foot = +d.weak_foot;
            d.skill_moves = +d.skill_moves;

            d.pace = +d.pace;
            d.shooting = +d.shooting;
            d.passing = +d.passing;
            d.dribbling = +d.dribbling;
            d.defending = +d.defending;
            d.physic = +d.physic;
        });

        currentYearData = data;

        updateKPIs(data);

        // 👉 Aquí solo llamas a las gráficas que sí tienes
        drawBarChart(data, "#bar-chart-container");
        

    }).catch(error => {
        console.error("Error al cargar los datos:", error);
    });
}

/**
Funcion para actualizar las tarjetas de KPIs
 */
function updateKPIs(data) {
    d3.select("#kpi-total-players").text(data.length);
    d3.select("#kpi-avg-overall").text(d3.mean(data, d => d.overall).toFixed(1));
    d3.select("#kpi-total-value").text(`€${formatCustomMoney(d3.sum(data, d => d.value_eur))}`);
    d3.select("#kpi-avg-age").text(d3.mean(data, d => d.age).toFixed(1));
}

/**
Carga inicial
 */
document.addEventListener("DOMContentLoaded", function() {

    d3.select("#age-filter-checkbox").on("change", () => {
        drawScatterPlot(currentYearData, "#scatter-plot-container"); 
    });
    
    const selector = d3.select("#year-select");
    selector.on("change", (event) => {
        const selectedYear = event.target.value;
        updateDashboard(selectedYear);
    });

    const initialYear = selector.property("value");
    updateDashboard(initialYear);
});
