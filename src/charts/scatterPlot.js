function drawScatterPlot(fullData, containerId) {
    const ageFilterEnabled = d3.select("#age-filter-checkbox").property("checked");

    let localFilteredData;
    if (ageFilterEnabled) {
        localFilteredData = fullData.filter(d => d.age < 25);
    } else {
        localFilteredData = fullData; 
    }

    fullData.forEach(d => {
        d.growth = d.potential - d.overall;
    });

    const filterType = d3.select("#scatter-filter-select").property("value");
    if (filterType === 'growth') {
        localFilteredData = localFilteredData
            .sort((a, b) => d3.descending(a.growth, b.growth))
            .slice(0, 100);
    } else {
        localFilteredData = localFilteredData
            .sort((a, b) => d3.descending(a.potential, b.potential))
            .slice(0, 100);
    }

    // Seleccionar el contenedor y definir márgenes
    const container = d3.select(containerId);
    container.select("svg").remove(); // Limpiar

    const h3Height = container.select("h3").node().getBoundingClientRect().height;
    const filterHeight = container.select(".chart-filter").node().getBoundingClientRect().height;
    
    const margin = { top: 10, right: 30, bottom: 40, left: 70 };
    const chartBox = container.node().getBoundingClientRect();
    const width = chartBox.width - margin.left - margin.right;
    const height = chartBox.height - margin.top - margin.bottom - h3Height - filterHeight - 60; 

    // Añadir el SVG
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Definir Escala X 
    const x = d3.scaleLinear()
        .domain(d3.extent(localFilteredData, d => d.potential))
        .range([0, width])
        .nice();

    // Definir Escala Y 
    const y = d3.scaleLog()
        .domain(d3.extent(localFilteredData, d => d.value_eur > 0 ? d.value_eur : 10000)) 
        .range([height, 0])
        .nice();
        
    // Definir Escala de Color
    const color = d3.scaleOrdinal()
        .domain(["At", "M", "Df", "Por"])
        .range(["#1db954", "#3498db", "#e74c3c", "#f1c40f"]);

    //  Dibujar Eje X
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(7))
      .append("text")
        .attr("fill", "var(--text-muted)")
        .attr("x", width / 2)
        .attr("y", 35)
        .text("Potencial");

    // Dibujar Eje Y
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(5, d3.format("~s")))
      .append("text")
        .attr("fill", "var(--text-muted)")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -55)
        .attr("text-anchor", "middle")
        .text("Valor de Mercado (€)");

    // --- Tooltip ( ---
    const tooltip = d3.select("body").select(".tooltip");
    
    const formatValue = formatCustomMoney; 

    // Dibujar los Círculos 
    svg.selectAll(".dot")
        .data(localFilteredData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.potential))
        .attr("cy", d => y(d.value_eur > 0 ? d.value_eur : 10000)) 
        .attr("r", 4)
        .style("fill", d => color(d.Posicion_General))
        .style("opacity", 0.7)
        .style("stroke", "var(--bg-color)")
        .style("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(
                `<strong>${d.short_name}</strong> (${d.age} años)<br>` +
                `Club: ${d.club_name}<br>` +
                `Potencial: ${d.potential}<br>` +
                `Media Actual: ${d.overall}<br>` +
                `Valor: €${formatValue(d.value_eur)}` 
            )
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", (event, d) => {
            tooltip.transition().duration(500).style("opacity", 0);
        });
}