/**
EJEMPLO QUE LE PEDI A GEMINI
 */

function drawBarChart(fullData, containerId) {

    // 1. Procesar los datos para ESTA gráfica
    // Usamos d3.rollup para agrupar y promediar el 'pace'
    const paceDataMap = d3.rollup(
        fullData,
        v => d3.mean(v, d => d.pace), // Calcular el pace promedio
        d => d.Posicion_General      // Agrupado por Posicion_General
    );
    
    // Convertir el Map de d3 a un Array de objetos que D3 puede usar
    const paceData = Array.from(paceDataMap, ([position, avgPace]) => ({ position, avgPace }));
    // Ordenar los datos para que se vean bien
    paceData.sort((a, b) => d3.descending(a.avgPace, b.avgPace));

    // --- A partir de aquí, es el mismo código de antes ---

    // 2. Seleccionar el contenedor y definir márgenes
    const container = d3.select(containerId); 
    // Limpiar el contenedor por si se redibuja
    container.select("svg").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    
    // 3. Obtener el tamaño del contenedor
    const chartBox = container.node().getBoundingClientRect();
    const width = chartBox.width - margin.left - margin.right;
    const height = chartBox.height - margin.top - margin.bottom - 40; // -40 por el <h3>

    // 4. Añadir el SVG
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 5. Definir Escala X (Categórica)
    const x = d3.scaleBand()
        .range([0, width])
        .domain(paceData.map(d => d.position)) // Usar los datos procesados
        .padding(0.2);

    // 6. Definir Escala Y (Numérica)
    const y = d3.scaleLinear()
        .domain([0, 100]) // Dominio de 0 a 100
        .range([height, 0]);

    // 7. Dibujar Eje X
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // 8. Dibujar Eje Y
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(5));

    // 9. Dibujar las Barras
    svg.selectAll("rect")
        .data(paceData) // Usar los datos procesados
        .enter()
        .append("rect")
        .attr("fill", "#1db954")
        .attr("x", d => x(d.position))
        .attr("width", x.bandwidth())
        .attr("y", d => y(0)) 
        .attr("height", d => height - y(0))
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr("y", d => y(d.avgPace))
        .attr("height", d => height - y(d.avgPace));
}