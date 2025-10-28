/**
Este archivo es como el controlador, llama las graficas, limpia datos, gestiona la vista
Según yo no deberian de necesitar modificarlo, yo me encargaria de explicarlo
 */

function updateDashboard(year) {
    const filename = `data/fifa_20${year}.csv`;

    // Cargar los datos del CSV
    d3.csv(filename).then(data => {
        
        // Limpieza de datos 
        // d3.csv a num (los que ocupen, las que son texto asi se quedan)
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

        console.log(`Datos cargados para FIFA ${year}:`, data);

        // Actualizar los KPIs
        updateKPIs(data);
        
        // Aquuí pongan las llamadas a las demas gráficas
        drawBarChart(data, "#bar-chart-container");
        // drawScatterPlot(data, "#scatter-plot-container");
        // drawRadarChart(data, "#radar-chart-container");
        // drawMapChart(data, "#map-container");

    }).catch(error => {
        console.error("Error al cargar o procesar los datos:", error);
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

const selector = d3.select("#year-select");

selector.on("change", (event) => {
    const selectedYear = event.target.value;
    updateDashboard(selectedYear);
});

const initialYear = selector.property("value");
updateDashboard(initialYear);