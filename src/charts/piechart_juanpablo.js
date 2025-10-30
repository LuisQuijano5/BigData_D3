// src/charts/piechart_juanpablo.js
// Autor: Juan Pablo Ramírez Ruiz

/**
 * Función principal para dibujar la gráfica de pastel de nacionalidades.
 */
function dibujarPieChart(data, container_id) {
    const container = d3.select(container_id); 
    container.select("svg").remove();

    // 2. Preprocesamiento de datos: Contar jugadores por nacionalidad.
    // Se crea un objeto 'nacionalidades' para usarlo como un mapa de conteo.
    let nacionalidades = {};
    data.forEach(d => {
        // Se usa 'd.nationality' (minúscula) porque así se llama la columna en el CSV.
        // .trim() limpia espacios en blanco. Si no existe, se asigna "Desconocida".
        const nacionalidad = (d.nationality || "Desconocida").trim();
        // Incrementa el contador para esa nacionalidad.
        nacionalidades[nacionalidad] = (nacionalidades[nacionalidad] || 0) + 1;
    });

    // 3. Convertir el objeto de conteo a un array.
    // D3 necesita un array de objetos (ej. [{nombre: "Argentina", valor: 100}]).
    let datosPie = Object.keys(nacionalidades).map(key => ({
        nombre: key,
        valor: nacionalidades[key]
    }));
    
    // Ordenar el array de mayor a menor para saber cuáles son el Top 5.
    datosPie.sort((a, b) => b.valor - a.valor);

    // 4. Agrupar datos: Tomar el Top 5 y sumar el resto en "Otros".
    const topN = 5;
    // .slice(0, topN) toma los primeros 5 elementos.
    let datosFinales = datosPie.slice(0, topN);
    // .slice(topN) toma del 6to en adelante. d3.sum suma sus valores.
    let otrosValor = d3.sum(datosPie.slice(topN), d => d.valor);
    // Si hay "Otros", se añaden como una categoría más al array final.
    if (otrosValor > 0) {
        datosFinales.push({ nombre: "Otros", valor: otrosValor });
    }
    
    // Calcular el total de jugadores para sacar porcentajes después.
    const totalJugadores = d3.sum(datosFinales, d => d.valor);

    // 5. Configuración del lienzo (SVG).
    // Se definen dimensiones base para el 'viewBox'.
    const ancho = 450;
    const alto = 400; 
    const radio = Math.min(ancho, alto) / 2 - 40; // El radio del pastel.

    // 6. Seleccionar el div contenedor (#piechart-container) y crear el SVG.
    const svg = container
        .append("svg")
        // Atributos para hacer el SVG responsivo y que llene el contenedor.
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${ancho} ${alto}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        // Se añade un grupo <g> que centrará toda la gráfica de pastel.
        .append("g")
        .attr("transform", `translate(${ancho / 2}, ${alto / 2})`);

    // 7. Definir la paleta de colores.
    // Se usa una paleta de verdes (schemeGreens) que combina con el dashboard.
    const top5Colores = d3.schemeGreens[6].slice(0, 5).reverse();
    const otrosColor = "#006d2c"; // Un verde oscuro específico para "Otros".

    // Se crea la escala de colores.
    const color = d3.scaleOrdinal()
        .domain(datosFinales.map(d => d.nombre)) // Mapea nombres (ej. "Argentina") a colores.
        .range([...top5Colores, otrosColor]); // Asigna la paleta definida.

    // 8. Generador de la gráfica de pastel.
    // Esta función de D3 toma los 'datosFinales' y calcula los ángulos
    // de inicio y fin para cada rebanada, basado en 'd.valor'.
    const pie = d3.pie()
        .value(d => d.valor)
        .sort(null); // No ordenar, ya lo hicimos manualmente.

    // 9. Generador de los "arcos" (las rebanadas).
    // Esta función dibuja la forma de la rebanada.
    const arc = d3.arc()
        .innerRadius(0) // 0 = Gráfica de pastel. > 0 = Gráfica de dona.
        .outerRadius(radio); // El radio exterior definido arriba.

    // 10. Dibujar las rebanadas en el SVG.
    svg.selectAll('path') // Selecciona todos los 'path' (que aún no existen).
        .data(pie(datosFinales)) // Vincula los datos calculados por pie().
        .enter() // Crea un placeholder por cada dato.
        .append('path') // Añade un 'path' por cada placeholder.
        .attr('d', arc) // Dibuja la forma usando el generador de arcos.
        .attr('fill', d => color(d.data.nombre)) // Asigna el color según el nombre.
        .attr("stroke", "#2c2c2c") // Color del borde (del tema del dashboard).
        .style("stroke-width", "2px")
        .style("opacity", 0.9)
        // Efectos hover para interactividad.
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 1);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).style("opacity", 0.9);
        });
        
    // 11. Definir la posición de las etiquetas (dónde irá el texto).
    const labelArc = d3.arc()
        .outerRadius(radio * 0.7) // A 70% del radio (dentro de la rebanada).
        .innerRadius(radio * 0.7);

    // 12. Dibujar las etiquetas de texto.
    svg.selectAll('text')
        .data(pie(datosFinales)) // Vincula los mismos datos del pastel.
        .enter()
        .append('text')
        // Mueve el texto al centroide (centro) de su arco correspondiente.
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("dy", "0.35em") // Ajuste vertical fino.
        .attr("text-anchor", "middle") // Centra el texto horizontalmente.
        .style("fill", "white")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        // Lógica para mostrar el texto:
        .text(function(d) {
            const porcentaje = (d.data.valor / totalJugadores) * 100;
            // Solo muestra la etiqueta si es "Otros" o si la rebanada es > 3% del total.
            return (d.data.nombre === "Otros" || porcentaje > 3) ? `${d.data.nombre} (${d.data.valor})` : "";
        });
}

// Llamar a la función principal para que se dibuje la gráfica.
//dibujarPieChart();