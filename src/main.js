/**
Este archivo es como el controlador, llama las graficas, limpia datos, gestiona la vista
Según yo no deberian de necesitar modificarlo, yo me encargaria de explicarlo
 */

let currentPlayerName = null;
let currentYearData = [];

function updateDashboard(year) {
    const dataFilename = `data/fifa_20${year}.csv`;
    const mapFilename = "data/countries-110m.json"; 

    const mapContainer = d3.select("#map-container");
    mapContainer.classed("is-loading", true);

    Promise.all([
        d3.csv(dataFilename),
        d3.json(mapFilename) 
    ]).then(([data, topoData]) => {
        
        // Limpieza de datos 
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

            d.attacking_crossing = +d.attacking_crossing;
            d.attacking_finishing = +d.attacking_finishing;
            d.attacking_heading_accuracy = +d.attacking_heading_accuracy;
            d.attacking_short_passing = +d.attacking_short_passing;
            d.attacking_volleys = +d.attacking_volleys;

            d.skill_dribbling = +d.skill_dribbling;
            d.skill_curve = +d.skill_curve;
            d.skill_fk_accuracy = +d.skill_fk_accuracy;
            d.skill_long_passing = +d.skill_long_passing;
            d.skill_ball_control = +d.skill_ball_control;

            d.movement_acceleration = +d.movement_acceleration;
            d.movement_sprint_speed = +d.movement_sprint_speed;
            d.movement_agility = +d.movement_agility;
            d.movement_reactions = +d.movement_reactions;
            d.movement_balance = +d.movement_balance;

            d.power_shot_power = +d.power_shot_power;
            d.power_jumping = +d.power_jumping;
            d.power_stamina = +d.power_stamina;
            d.power_strength = +d.power_strength;
            d.power_long_shots = +d.power_long_shots;

            d.mentality_aggression = +d.mentality_aggression;
            d.mentality_interceptions = +d.mentality_interceptions;
            d.mentality_positioning = +d.mentality_positioning;
            d.mentality_vision = +d.mentality_vision;
            d.mentality_penalties = +d.mentality_penalties;

            d.defending_marking = +d.defending_marking; 
            d.defending_standing_tackle = +d.defending_standing_tackle;
            d.defending_sliding_tackle = +d.defending_sliding_tackle;

            d.goalkeeping_diving = +d.goalkeeping_diving;
            d.goalkeeping_handling = +d.goalkeeping_handling;
            d.goalkeeping_kicking = +d.goalkeeping_kicking;
            d.goalkeeping_positioning = +d.goalkeeping_positioning;
            d.goalkeeping_reflexes = +d.goalkeeping_reflexes;
        });

        currentYearData = data;
        const geoData = topojson.feature(topoData, topoData.objects.countries);
        const ukFeature = geoData.features.find(f => f.properties.name === "United Kingdom");
        if (ukFeature) {
            ukFeature.properties.name = "England";
        }
        const usFeature = geoData.features.find(f => f.properties.name === "United States of America");
        if (usFeature) {
            usFeature.properties.name = "United States";
        }

        updateKPIs(data);

        // Aqui llamen a sus graficas
        drawMapChart(data, "#map-container", geoData);
        mapContainer.classed("is-loading", false);
        drawBarChart(data, "#bar-chart-container");
        drawScatterPlot(data, "#scatter-plot-container");

        const topN = parseInt(document.getElementById("bar-topn-input")?.value || "10", 10);
        // Dibujar gráfica 1 con N
        drawBarChartP(currentYearData, "#bar-chart-container_p", topN);

        // ESTOS PORQUE CREO QUE TIENEN ERRORES AL FINAL si no hay jugadores entonces todo lo demas truena jaja
        drawPercentileChart(null, data, "#percentile-container");
        initRadarChart(data, "#radar-chart-container"); 
        
    }).catch(error => {
        console.error("Error al cargar los datos o el mapa:", error);
        mapContainer.classed("is-loading", false);
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
    const topNInput = document.getElementById("bar-topn-input");
    

    d3.select("#age-filter-checkbox").on("change", () => {
        drawScatterPlot(currentYearData, "#scatter-plot-container"); 
    });
    d3.select("#scatter-filter-select").on("change", () => {
        drawScatterPlot(currentYearData, "#scatter-plot-container"); 
    });
    
    // 2. Configurar el "listener" para el selector de año
    const selector = d3.select("#year-select");

    selector.on("change", (event) => {
        //currentPlayerName = d3.select("#player-search").property("value");
        const selectedYear = event.target.value;
        updateDashboard(selectedYear);
    });

    topNInput?.addEventListener("input", () => {
        const topN = parseInt(topNInput.value || "10", 10);
        if (currentYearData.length) {
        drawBarChartP(currentYearData, "#bar-chart-container_p", topN);
        }
    });

    // 3. Carga inicial del dashboard (AHORA SÍ, DENTRO DEL LISTENER)
    const initialYear = selector.property("value");
    updateDashboard(initialYear);

});