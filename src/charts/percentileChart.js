function drawPercentileChart(selectedPlayer, fullData, containerId) {
    //console.log(currentPlayerName)
    const container = d3.select(containerId);
    container.select("svg").remove(); 

    if (!selectedPlayer) {
        d3.select("#percentile-league-name").text("(vs. Liga: --)");
        return;
    }

    // ---  PREPARAR LOS DATOS ---

    //  Obtener la liga del jugador y filtrar
    const leagueName = selectedPlayer.league_name;
    d3.select("#percentile-league-name").text(`(vs. ${leagueName})`);
    const leagueData = fullData.filter(d => d.league_name === leagueName);
    const totalPlayersInLeague = leagueData.length;
    
    // Definir las 6 stats
    const stats = ["pace", "shooting", "passing", "dribbling", "defending", "physic"];

    // Calcular los percentiles
    const percentileData = stats.map(stat => {
        const value = selectedPlayer[stat]; 
        
        // Obtener la lista de las stats de esa liga
        const allStatValues = leagueData.map(d => d[stat]);

        // Contar cuántos jugadores en la liga son PEORES que el jugador
        let betterThanCount = 0;
        allStatValues.forEach(v => {
            if (value > v) {
                betterThanCount++;
            }
        });
        
        const percentile = (betterThanCount / totalPlayersInLeague) * 100;

        return { 
            stat: stat.toUpperCase(), 
            value: percentile 
        };
    });

    // --- CONFIGURACIÓN DEL SVG ---
    const h3Height = container.select("h3").node().getBoundingClientRect().height;
    const margin = { top: 10, right: 60, bottom: 50, left: 80 };    
    const chartBox = container.node().getBoundingClientRect();
    const width = chartBox.width - margin.left - margin.right;
    const height = chartBox.height - margin.top - margin.bottom - h3Height;

    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
    // --- DEFINIR ESCALAS ---
    
    // Escala X
    const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);

    // Escala Y 
    const y = d3.scaleBand()
        .domain(stats.map(s => s.toUpperCase()))
        .range([0, height])
        .padding(1); 

    // --- DIBUJAR EJES ---
    
    // Eje X 
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"));

    // Eje Y 
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).tickSize(0)) 
        .select(".domain").remove(); 

    // --- DIBUJAR LA BARRA CON PUNTO ---
    
    // La Línea 
    svg.selectAll(".percentile-line")
        .data(percentileData)
        .enter()
        .append("line")
        .attr("class", "percentile-line")
        .attr("x1", x(0))
        .attr("x2", d => x(d.value))
        .attr("y1", d => y(d.stat))
        .attr("y2", d => y(d.stat))
        .transition().duration(800)
        .attr("x2", d => x(d.value));

    // El PUNTO
    svg.selectAll(".percentile-dot")
        .data(percentileData)
        .enter()
        .append("circle")
        .attr("class", "percentile-dot")
        .attr("cx", x(0)) 
        .attr("cy", d => y(d.stat))
        .attr("r", 5)
        .transition().duration(800)
        .delay(100)
        .attr("cx", d => x(d.value));

    // TAG
    svg.selectAll(".percentile-label")
        .data(percentileData)
        .enter()
        .append("text")
        .attr("class", "percentile-label")
        .attr("x", x(0)) 
        .attr("y", d => y(d.stat) + 4) 
        .attr("dx", 10) 
        .text(d => d.value.toFixed(0) + "%")
        .transition().duration(800)
        .delay(100)
        .attr("x", d => x(d.value) + 10);
}