function initRadarChart(fullData, containerId) {
    // --- Configuración Inicial  ---
    const container = d3.select(containerId);
    container.select("svg").remove(); // Limpiar

    // Medimos el <h3> para restarlo de la altura total
    const h3Height = container.select("h3").node().getBoundingClientRect().height + 10; 
    const chartBox = container.node().getBoundingClientRect();
    
    const margin = { top: 50, right: 70, bottom: 50, left: 70 };

    // Ancho y alto para el SVG 
    const svgWidth = chartBox.width;
    const svgHeight = chartBox.height - h3Height;

    // Centro del SVG
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;

    const radius = Math.min(
        svgWidth - margin.left - margin.right, 
        svgHeight - margin.top - margin.bottom
    ) / 2;

    const stats = ["pace", "shooting", "passing", "dribbling", "defending", "physic"];
    const levels = 4; 
    const angleSlice = (Math.PI * 2) / stats.length; 

    // Escala Radial 
    const rScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, radius]);

    // --- Crear el SVG y el Grupo Central  ---
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", svgHeight) 
        .append("g")
        .attr("transform", `translate(${centerX}, ${centerY})`);

    // --- Dibujar la Telaraña  ---
    // Dibujar los ejes 
    const axes = svg.selectAll(".axis")
        .data(stats)
        .enter().append("g")
        .attr("class", "axis");

    axes.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => rScale(100) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => rScale(100) * Math.sin(angleSlice * i - Math.PI / 2))
        .style("stroke", "var(--border-color)")
        .style("stroke-width", "1px");

    // Dibujar las etiquetas de los ejes 
    axes.append("text")
        .attr("class", "axis-label")
        .attr("x", (d, i) => rScale(110) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y", (d, i) => rScale(110) * Math.sin(angleSlice * i - Math.PI / 2))
        .text(d => d.toUpperCase())
        .attr("fill", "var(--text-muted)")
        .style("font-size", "11px")
        .attr("text-anchor", "middle");

    // Dibujar los polígonos de niveles (25, 50, 75, 100)
    for (let i = 0; i < levels; i++) {
        const level = (i + 1) * (100 / levels); 
        const levelData = stats.map((d, j) => {
            const x = rScale(level) * Math.cos(angleSlice * j - Math.PI / 2);
            const y = rScale(level) * Math.sin(angleSlice * j - Math.PI / 2);
            return [x, y];
        });
        
        svg.append("polygon")
            .datum(levelData)
            .attr("points", d => d.join(" "))
            .style("fill", "none")
            .style("stroke", "var(--border-color)")
            .style("stroke-width", "0.5px");
    }

    // --- Crear el Polígono del Jugador  ---
    // dibujar el polígono
    const radarLine = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveLinearClosed); 

    const playerPath = svg.append("path")
        .attr("class", "radar-path")
        .style("fill", "var(--accent-color)")
        .style("fill-opacity", 0.3)
        .style("stroke", "var(--accent-color)")
        .style("stroke-width", "2px");

    // --- Lógica de Actualización  ---
    function updateRadar(player) {
        if (!player) return;

        let axisLabels;
        let statsToShow = ["pace", "shooting", "passing", "dribbling", "defending", "physic"]; 

        if (player && player.Posicion_General === 'Por') {
            axisLabels = ["SPEED", "DIVING", "HANDLING", "KICKING", "POSITIONING", "REFLEXES"]; 
            // (REF=Reflexes, DIV=Diving, HAN=Handling, KIC=Kicking, POS=Positioning, PHY=Physic)
        } else {
            axisLabels = ["PACE", "SHOOTING", "PASSING", "DRIBBLING", "DEFENDING", "PHYSIC"];
        }

        svg.selectAll(".axis-label")
            .data(axisLabels)
            .text(d => d);

        // Calcular los 6 puntos (x, y) 
        const pathData = stats.map((stat, i) => {
            const value = player[stat];
            const x = rScale(value) * Math.cos(angleSlice * i - Math.PI / 2);
            const y = rScale(value) * Math.sin(angleSlice * i - Math.PI / 2);
            return { x, y };
        });

        // Vincular los datos al <path> y animar la transición
        playerPath
            .datum(pathData)
            .transition()
            .duration(500)
            .attr("d", radarLine);
        
        d3.select("#player-overall").text(player.overall);
        d3.select("#player-position").text(player.Posicion_General);
    }

    // Poblar el <datalist> y Configurar el Evento 
    const datalist = d3.select("#player-list");
    datalist.selectAll("option")
        .data(fullData)
        .enter()
        .append("option")
        .attr("value", d => d.short_name);

    // Escuchar cambios en el input
    d3.select("#player-search").on("input", (event) => {
        const playerName = event.target.value;
        const player = fullData.find(d => d.short_name === playerName);
        
        if (player) {
            updateRadar(player);
            currentPlayerName = player.short_name; 
            drawPercentileChart(player, fullData, "#percentile-container");
        } else {
            drawPercentileChart(null, fullData, "#percentile-container");
            d3.select("#player-overall").text('--');
            d3.select("#player-position").text('--');
            playerPath
                .datum([]) 
                .transition()
                .duration(500)
                .attr("d", radarLine);
        }
    });

    // Carga Inicial
    let playerToDisplay = null;

    if (fullData && fullData.length > 0) {
        if (currentPlayerName) {
            playerToDisplay = fullData.find(d => d.short_name === currentPlayerName);
        }

        currentPlayerName = playerToDisplay ? playerToDisplay.short_name : null;
        d3.select("#player-search").property("value", currentPlayerName);
        updateRadar(playerToDisplay);
        drawPercentileChart(playerToDisplay, fullData, "#percentile-container");

    } else {
        currentPlayerName = null;
        d3.select("#player-search").property("value", "");
        updateRadar(null);
        drawPercentileChart(null, fullData, "#percentile-container");
    }
}