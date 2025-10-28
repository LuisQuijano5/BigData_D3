/**
 ignorar este archivo era solo para comprobar que d3 funcionase
 */

const paceData = [
    { position: 'Atacante', avgPace: 80.5 },
    { position: 'Medio', avgPace: 74.2 },
    { position: 'Defensa', avgPace: 69.1 },
    { position: 'Portero', avgPace: 48.3 }
];

const container = d3.select("#bar-chart-container");
const margin = { top: 20, right: 20, bottom: 40, left: 60 };

const chartBox = container.node().getBoundingClientRect();

const width = chartBox.width - margin.left - margin.right;
const height = chartBox.height - margin.top - margin.bottom - 40;

const svg = container.append("svg")
    .attr("width", "100%") 
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleBand()
    .range([0, width])
    .domain(paceData.map(d => d.position))
    .padding(0.2);


const y = d3.scaleLinear()
    .domain([0, 100]) 
    .range([height, 0]);

svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(5)); 


svg.selectAll("rect")
    .data(paceData)
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