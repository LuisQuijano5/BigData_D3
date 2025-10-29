// src/charts/piechart_juanpablo.js

function dibujarPieChart() {
    
    // 1. Carga los datos (con la RUTA y ARCHIVO correctos)
    d3.csv("../data/fifa_2016.csv").then(function(data) {

        // 2. Preprocesamiento de datos (con la COLUMNA correcta 'nationality')
        let nacionalidades = {};
        data.forEach(d => {
            const nacionalidad = (d.nationality || "Desconocida").trim();
            nacionalidades[nacionalidad] = (nacionalidades[nacionalidad] || 0) + 1;
        });

        // 3. Convertir a array y ordenar
        let datosPie = Object.keys(nacionalidades).map(key => ({
            nombre: key,
            valor: nacionalidades[key]
        }));
        datosPie.sort((a, b) => b.valor - a.valor);

        // 4. Tomar Top 5 + "Otros"
        const topN = 5;
        let datosFinales = datosPie.slice(0, topN);
        let otrosValor = d3.sum(datosPie.slice(topN), d => d.valor);
        if (otrosValor > 0) {
            datosFinales.push({ nombre: "Otros", valor: otrosValor });
        }
        
        // Suma total para calcular porcentajes
        const totalJugadores = d3.sum(datosFinales, d => d.valor);

        // 5. Configuración del lienzo (para que se ajuste al div)
        const ancho = 450;
        const alto = 400; // Un poco menos alto para que quepa bien el título
        const radio = Math.min(ancho, alto) / 2 - 40; // Margen

        // 6. Selecciona el CONTENEDOR correcto
        const svg = d3.select("#piechart-container")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${ancho} ${alto}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${ancho / 2}, ${alto / 2})`); // Centra el 'grupo'

        // 7. ================== ¡COLORES ACTUALIZADOS! ==================
        // Usamos una paleta de 6 Verdes que combina con el dashboard
        const color = d3.scaleOrdinal()
            .domain(datosFinales.map(d => d.nombre))
            .range(d3.schemeGreens[6].reverse()); // .reverse() para que el más grande sea más oscuro
        // =============================================================

        // 8. Generador de pastel
        const pie = d3.pie()
            .value(d => d.valor)
            .sort(null); 

        // 9. Generador de arcos
        const arc = d3.arc()
            .innerRadius(0) // 0 para un pastel
            .outerRadius(radio);

        // 10. Dibujar las rebanadas
        svg.selectAll('path')
            .data(pie(datosFinales))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.nombre))
            .attr("stroke", "#2c2c2c") // Borde oscuro del dashboard
            .style("stroke-width", "2px")
            .style("opacity", 0.9)
            .on("mouseover", function(event, d) {
                d3.select(this).style("opacity", 1);
            })
            .on("mouseout", function(event, d) {
                d3.select(this).style("opacity", 0.9);
            });
            
        // 11. ================== ¡ETIQUETAS ACTUALIZADAS! ==================
        const labelArc = d3.arc()
            .outerRadius(radio * 0.7) // Ponerlas dentro de las rebanadas
            .innerRadius(radio * 0.7);

        svg.selectAll('text')
            .data(pie(datosFinales))
            .enter()
            .append('text')
            .attr("transform", d => `translate(${labelArc.centroid(d)})`)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", "10px") // Tamaño de fuente ajustado
            .style("font-weight", "bold")
            // Mostramos la etiqueta solo si la rebanada es > 3%
            .text(function(d) {
                const porcentaje = (d.data.valor / totalJugadores) * 100;
                return porcentaje > 3 ? `${d.data.nombre} (${d.data.valor})` : "";
            });
        // ===============================================================

    }).catch(function(error) {
        // Un manejador de errores bueno
        console.error("Error al cargar o procesar los datos para el Pie Chart:", error);
        d3.select("#piechart-container").append("p").text("Error al cargar la gráfica.").style("color", "red");
    });
}

// Llama a la función para que se dibuje
dibujarPieChart();