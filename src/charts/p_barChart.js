function drawBarChart(fullData, containerId, topN = 10){

    topN = Number.isFinite(+topN) ? Math.max(1, Math.min(50, +topN)) : 10;

    const data = fullData.map(d => ({
        name : d.short_name,
        overall: +d.overall
    }))

    data.sort((a, b) => d3.descending(a.overall, b.overall))
    const top = data.slice(0, topN)

    //console.log(top)

    //preparando el svg - margenes

    const container = d3.select(containerId)
    container.select("svg").remove()

    const margin = {top: 20, right: 40, bottom: 40, left: 120}
    const chartBox = container.node().getBoundingClientRect()
    const width = chartBox.width - margin.left - margin.right
    const height = chartBox.height - margin.top - margin.bottom -40

    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //Escalas
    const x = d3.scaleLinear()
        .domain([0, d3.max(top, d => d.overall)])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(top.map(d => d.name))
        .range([0, height])
        .padding(0.2);

    //Ejes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));
    
    svg.append("g")
        .call(d3.axisLeft(y));
    
    //Dibujar las barras
    svg.selectAll("rect")
        .data(top)
        .enter()
        .append("rect")
        .attr("y", d => y(d.name))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", 0)
        .attr("fill", "#1db954")
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr("width", d => x(d.overall));

    //Etiquetas en valores
    svg.selectAll("text.label")
        .data(top)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("y", d => y(d.name) + y.bandwidth() / 2)
        .attr("x", d => x(d.overall) + 5)
        .attr("dy", ".25em")
        .text(d => d.overall);

};