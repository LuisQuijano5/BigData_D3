// src/charts/pieChart.js
// Autor: Juan Pablo Ramírez Ruiz
// Archivo para la demostración en la rama 'practice'.
// Este archivo SÓLO define la función. El "cerebro" (main_p.js) la llamará.

/**
 * ===================================================================================
 * BLOQUE 1: DEFINICIÓN DE LA FUNCIÓN Y PREPARACIÓN DE DATOS
 * ===================================================================================
 */
// Se define la función que recibe los 'data' y el 'container_id' donde dibujar
function dibujarPieChart(data, container_id) {

    // --- 1. PREPARACIÓN DE DATOS ---

    // Se crea un objeto vacío para usarlo como un mapa de conteo.
    let nacionalidades = {};

    // Se recorre cada fila (jugador) de los datos cargados.
    data.forEach(d => {
        // Se extrae la nacionalidad. Se usa 'd.nationality' (minúscula) porque así se llama la columna en el CSV.
        // .trim() limpia espacios en blanco. Si el campo está vacío (||), se asigna "Desconocida".
        const nacionalidad = (d.nationality || "Desconocida").trim();
        
        // Se incrementa el contador para esa nacionalidad.
        nacionalidades[nacionalidad] = (nacionalidades[nacionalidad] || 0) + 1;
    });

    // Se convierte el objeto de conteo a un array de objetos.
    let datosPie = Object.keys(nacionalidades).map(key => ({
        nombre: key,
        valor: nacionalidades[key]
    }));
    
    // Se ordena el array de mayor a menor número de jugadores.
    datosPie.sort((a, b) => b.valor - a.valor);

// -------------------------------------------------------------------
// BLOQUE 2: AGRUPACIÓN DE DATOS
// -------------------------------------------------------------------

    // --- 2. AGRUPACIÓN DE DATOS (TOP 5 + "OTROS") ---

    // Se define cuántos países "Top" queremos mostrar.
    const topN = 5;
    
    // .slice(0, topN) toma los primeros 5 elementos (los más grandes).
    let datosFinales = datosPie.slice(0, topN);
    
    // .slice(topN) toma del 6to en adelante.
    // d3.sum suma todos sus valores para crear la rebanada "Otros".
    let otrosValor = d3.sum(datosPie.slice(topN), d => d.valor);
    
    // Si hay "Otros" (su valor es > 0), se añaden como una categoría más al array final.
    if (otrosValor > 0) {
        datosFinales.push({ nombre: "Otros", valor: otrosValor });
    }
    
    // Se calcula el total de jugadores para poder sacar porcentajes para las etiquetas.
    const totalJugadores = d3.sum(datosFinales, d => d.valor);

// -------------------------------------------------------------------
// BLOQUE 3: CONFIGURACIÓN DEL LIENZO
// -------------------------------------------------------------------

    // --- 3. CONFIGURACIÓN DEL LIENZO (SVG) ---

    // Se definen las dimensiones base para el 'viewBox' (el lienzo de dibujo).
    const ancho = 450;
    const alto = 400; 
    // El radio del pastel se calcula como la mitad de la dimensión más pequeña, con un margen.
    const radio = Math.min(ancho, alto) / 2 - 40; 

    // Se selecciona el contenedor HTML (ej. "#demo-pastel-jp") que recibimos como parámetro.
    const container = d3.select(container_id);

    // Se limpia el contenedor por si ya tenía un SVG (para evitar duplicados al recargar).
    container.select("svg").remove();

    // Se añade el elemento SVG principal al contenedor.
    const svg = container
        .append("svg")
        // Atributos para hacer el SVG responsivo: que ocupe el 100% del div.
        .attr("width", "100%")
        .attr("height", "100%")
        // 'viewBox' define el sistema de coordenadas interno (ancho y alto).
        .attr("viewBox", `0 0 ${ancho} ${alto}`)
        // 'preserveAspectRatio' asegura que la gráfica se centre si el div no es cuadrado.
        .attr("preserveAspectRatio", "xMidYMid meet")
        
        // Se añade un grupo <g> que centrará toda la gráfica (0,0) en el medio del SVG.
        .append("g")
        .attr("transform", `translate(${ancho / 2}, ${alto / 2})`);

// -------------------------------------------------------------------
// BLOQUE 4: COLORES Y GENERADORES D3
// -------------------------------------------------------------------

    // --- 4. DEFINICIÓN DE COLORES Y GENERADORES ---

    // Se define la paleta de colores (verdes que combinan con el dashboard).
    const top5Colores = d3.schemeGreens[6].slice(0, 5).reverse();
    const otrosColor = "#006d2c"; // Un verde oscuro específico para "Otros".

    // Se crea la escala de colores.
    const color = d3.scaleOrdinal()
        // Se le dice al 'domain' (dominio) qué nombres de países corresponden a los colores.
        .domain(datosFinales.map(d => d.nombre))
        // Se le dice al 'range' (rango) qué paleta de colores usar.
        .range([...top5Colores, otrosColor]); 

    // Se crea el "generador de pastel".
    // Esta función de D3 toma los 'datosFinales' y calcula los ángulos
    // de inicio y fin para cada rebanada, basado en 'd.valor'.
    const pie = d3.pie()
        .value(d => d.valor) // Le dice qué propiedad usar para el tamaño (valor).
        .sort(null); // No reordenar, ya lo hicimos manualmente.

    // Se crea el "generador de arcos" (las rebanadas).
    // Esta función dibuja la forma de cada rebanada.
    const arc = d3.arc()
        .innerRadius(0) // 0 = Gráfica de pastel. Si fuera > 0, sería una dona.
        .outerRadius(radio); // El radio exterior definido arriba.

// -------------------------------------------------------------------
// BLOQUE 5: DIBUJADO DE REBANADAS (PATHS)
// -------------------------------------------------------------------

    // --- 5. DIBUJADO DE REBANADAS (PATHS) ---

    // Se seleccionan todos los 'path' (que aún no existen) dentro del SVG.
    svg.selectAll('path')
        .data(pie(datosFinales)) // Se vinculan los datos calculados por pie().
        .enter() // Crea un placeholder por cada dato (cada país).
        .append('path') // Se añade un 'path' (la rebanada) por cada país.
        .attr('d', arc) // Se dibuja la forma de la rebanada usando el generador de arcos.
        .attr('fill', d => color(d.data.nombre)) // Se asigna el color según el nombre.
        .attr("stroke", "#2c2c2c") // Se pone un borde oscuro (del tema del dashboard).
        .style("stroke-width", "2px") // Ancho del borde.
        .style("opacity", 0.9) // Ligera transparencia.
        
        // Se añaden efectos hover para interactividad.
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 1); // Al pasar el mouse, opacidad 100%.
        })
        .on("mouseout", function(event, d) {
            d3.select(this).style("opacity", 0.9); // Al quitar el mouse, vuelve al 90%.
        });
        
// -------------------------------------------------------------------
// BLOQUE 6: DIBUJADO DE ETIQUETAS (TEXT)
// -------------------------------------------------------------------

    // --- 6. DIBUJADO DE ETIQUETAS (TEXT) ---

    // Se define la posición de las etiquetas (dónde irá el texto).
    const labelArc = d3.arc()
        .outerRadius(radio * 0.7) // A 70% del radio (quedan dentro de la rebanada).
        .innerRadius(radio * 0.7);

    // Se seleccionan todos los 'text' (que aún no existen).
    svg.selectAll('text')
        .data(pie(datosFinales)) // Se vinculan los mismos datos del pastel.
        .enter() // Crea un placeholder por cada país.
        .append('text') // Añade un elemento 'text' por cada país.
        
        // Se mueve el texto al "centroide" (centro geométrico) de su arco correspondiente.
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("dy", "0.35em") // Ajuste vertical fino para centrarlo.
        .attr("text-anchor", "middle") // Centra el texto horizontalmente.
        .style("fill", "white") // Color del texto.
        .style("font-size", "10px") // Tamaño del texto.
        .style("font-weight", "bold") // Grosor del texto.
        
        // Se define la lógica para mostrar el texto.
        .text(function(d) {
            // Se calcula el porcentaje para decidir si se muestra o no.
            const porcentaje = (d.data.valor / totalJugadores) * 100;
            
            // Solo muestra la etiqueta si es "Otros" o si la rebanada es > 3% del total
            // (para evitar que las rebanadas pequeñas se vean amontonadas).
            return (d.data.nombre === "Otros" || porcentaje > 3) ? `${d.data.nombre} (${d.data.valor})` : "";
        });

} // <-- Fin de la función dibujarPieChart