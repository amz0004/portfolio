import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const titleElement = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

function renderProjectList(list) {
  renderProjects(list, projectsContainer, 'h2');
  titleElement.textContent = `${list.length} Projects`;
}
let selectedIndex = -1;

function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(
    projectsGiven,
    v => v.length,
    d => d.year
  );

  let data = rolledData.map(([year, count]) => ({ label: year, value: count }));
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let sliceGenerator = d3.pie().value(d => d.value);
  let arcData = sliceGenerator(data);
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();
  svg.selectAll('path')
  .data(arcData)
  .join('path')
  .attr('d', arcGenerator)
  .attr('fill', (d, i) => colors(i))
  .attr('class', 'pie-slice')
  .style('cursor', 'pointer')
  .each(function(d, i) {
    d3.select(this).on('click', () => {
      selectedIndex = selectedIndex === i ? -1 : i;
      svg.selectAll('path')
        .attr('class', (_, idx) =>
          idx === selectedIndex ? 'pie-slice selected' : 'pie-slice'
        );
      let legend = d3.select('.legend');
      legend.selectAll('li')
        .attr('class', (_, idx) =>
          idx === selectedIndex ? 'legend-item selected' : 'legend-item'
        );
      if (selectedIndex === -1) {
        renderProjectList(projects);
      } else {
        const year = data[selectedIndex].label;
        const filteredProjects = projects.filter(p => p.year === year);
        renderProjectList(filteredProjects);
      }
    });
  });
  let legend = d3.select('.legend');
  legend.selectAll('li').remove();
  data.forEach((d, idx) => {
    legend.append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}
renderProjectList(projects);
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(query)
  );

  renderProjectList(filteredProjects);
  renderPieChart(filteredProjects);
});
