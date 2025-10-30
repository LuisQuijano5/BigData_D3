function drawMapChart(fullData, containerId, mapGeoData) {
    // --- Procesar los Datos de FIFA ---
    const overallByCountry = d3.rollup(
        fullData,
        v => ({
            avgOverall: d3.mean(v, d => d.overall),
            avgPotential: d3.mean(v, d => d.potential),
            avgAge: d3.mean(v, d => d.age),
            count: v.length 
        }),
        d => d.nationality 
    );

    // --- Configuración del Mapa y SVG ---
    const container = d3.select(containerId);
    container.select("svg").remove(); 

    const chartBox = container.node().getBoundingClientRect();
    const h3Height = container.select("h3").node().getBoundingClientRect().height + 10;
    
    const width = chartBox.width;
    const height = chartBox.height - h3Height;

    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", height);

    // --- Definir la Proyección del Mapa ---
    const padding = 10;
    const projection = d3.geoMercator()
        .scale(130) 
        .center([0, 40]) 
        .translate([width / 2, height / 2]) 
        .fitExtent(
            [ [padding, padding], [width - padding, height - padding] ], 
            mapGeoData
        );

    const pathGenerator = d3.geoPath().projection(projection);

    // --- Definir la Escala de Color ---
    const colorScale = d3.scaleQuantize()
        .domain([60, 85]) 
        .range([
            "#e0f2f1", 
            "#b2dfdb",
            "#80cbc4",
            "#4db6ac",
            "#26a69a", 
            "#00796b"  
        ]);

    // --- Unir Datos de FIFA con el GeoJSON ---
    mapGeoData.features.forEach(feature => {
        const countryName = feature.properties.name;
        const overall = overallByCountry.get(countryName);
        feature.properties.avgOverall = overall || 0; 
    });

    // --- Tooltip ---
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#fff")
        .style("color", "#333")
        .style("padding", "8px 12px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // --- Dibujar los Países ---
    svg.selectAll("path")
        .data(mapGeoData.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator) 
        .attr("fill", d => {
            const countryName = d.properties.name; 
            
            const stats = overallByCountry.get(countryName);
            
            return (stats && stats.avgOverall) ? colorScale(stats.avgOverall) : "var(--border-color)"; 
        })
        .style("stroke", "var(--bg-color)") 
        .style("stroke-width", 0.5)
        
        // --- Eventos del Tooltip  ---
        .on("mouseover", (event, d) => {
            const countryName = d.properties.name;
            const stats = overallByCountry.get(countryName); 
            
            tooltip.transition().duration(200).style("opacity", 0.9);
            
            let tooltipHtml = `<strong>${countryName}</strong><br>`;
            
            if (stats) {
                tooltipHtml +=
                    `Media: ${stats.avgOverall.toFixed(1)}<br>` +
                    `Potencial: ${stats.avgPotential.toFixed(1)}<br>` +
                    `Edad Prom.: ${stats.avgAge.toFixed(1)}<br>` +
                    `Jugadores: ${stats.count}`;
            } else {
                tooltipHtml += "Sin datos";
            }
            
            tooltip.html(tooltipHtml);
            
            tooltip.style("left", (event.pageX + 15) + "px")
                   .style("top", (event.pageY - 28) + "px");

            d3.select(event.currentTarget)
                .style("stroke-width", 1.5)
                .style("stroke", "var(--accent-color)");
        })
        .on("mouseout", (event, d) => {
            tooltip.transition().duration(500).style("opacity", 0);
            
            d3.select(event.currentTarget)
                .style("stroke-width", 0.5)
                .style("stroke", "var(--bg-color)");
        });
}