const genres = [
  "Alternative", "Blues", "Country", "Dance", "Disco",
  "Electronic", "Folk", "Indie", "Jazz", "Latin",
  "Metal", "Pop", "Rap", "Reggae", "Rock"
];

const decades = [1950, 1960, 1970, 1980, 1990, 2000];

d3.json("data/popularity.json").then(function(data) {
  // Transform data
  // Iterates over genre array to create an array that represents a genre and popularity data
  const transformedData = genres.map((genre, index) => {
    // For each genre, iterates over decade array
    const values = decades.map((decade, decadeIndex) => {
      return {
        // Create object with decade and popularity properties
        decade: decade,
        popularity: data[decadeIndex][index] / 10 // Scaling for better overview
      };
    });

    return {
      genre: genre,
      values: values
    };
  });

  console.log(transformedData); // Check

  // Calculation for second chart 
  // Percentage change in popularity relative to the first decade
  const percentageChangeData = transformedData.map(d => {
    const initialPopularity = d.values[0].popularity;
    const values = d.values.map(v => ({
      decade: v.decade,
      popularity: ((v.popularity - initialPopularity) / initialPopularity) // (Current pop - first pop) / first pop
    }));

    return {
      genre: d.genre,
      values: values
    };
  });

  console.log(percentageChangeData);

  
  function createLineChart(data, containerId) {
  
    // Dimensions and margins of the graphs

    const margin = { top: 40, right: 50, bottom: 30, left: 40 },
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    // Append svg to page
      const svg = d3.select(`#${containerId}`).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

      // X axis is built from the decades, mapping to wdith 
      const x = d3.scaleLinear()
      .domain(d3.extent(data[0].values, d => d.decade))
      .range([0, width]);
    

      // Y axis goes from 0 to mx popularity, mapping to height
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, c => d3.max(c.values, d => d.popularity))])
      .range([height, 0]);

    const line = d3.line()
      .x(d => x(d.decade))
      .y(d => y(d.popularity));

      // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(genres);

    
    // Reference: https://d3-graph-gallery.com/graph/area_brushZoom.html
      // Brush to allow zooming
    const brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on("end", brushed);

    function brushed(event) {
      const extent = event.selection;
    
      // Adjust x domain to the brush extent
      x.domain([x.invert(extent[0]), x.invert(extent[1])]);
    
      // Update the x axis and redraw lines
      svg.select(".x.axis").transition().duration(1000).call(d3.axisBottom(x));
      genre.select(".line").transition().duration(1000).attr("d", d => line(d.values));
  
      // Remove the brush selection after zooming in
      svg.select(".brush").call(brush.move, null);
    }
    
    // Draw x and y axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .attr("class", "x axis")
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
      .call(d3.axisLeft(y));

    const genre = svg.selectAll(".genre")
      .data(data)
      .enter().append("g")
      .attr("class", "genre");

    // Draw line for each genre
    genre.append("path")
      .attr("class", "line")
      .attr("d", d => line(d.values))
      .style("stroke", () => "steelblue")
      .style("stroke", d => color(d.genre))
      .style("fill", "none");

    // Apply a clip path not draw outside of the charts
    genre.select(".line")
      .attr("clip-path", "url(#clip)");

    // Define the clip path area
    svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);
    

    // Append labels to each line
    genre.append("text")
      .datum(d => ({ name: d.genre, value: d.values[d.values.length - 1] })) // label
      .attr("transform", d => `translate(${x(d.value.decade)},${y(d.value.popularity)})`) // position
      .attr("x", 3) // distance between line and label
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .style("fill", d => color(d.name))
      .text(d => d.name);

    svg.selectAll(".line")
      .style("stroke-width", 2.5);

    // Append brush last so it sits on top
    svg.append("g")
      .attr("class", "brush")
      .call(brush); 
  }

  // Create empty charts, so x any axes will still be displayed when no checkbox is selected
  function createEmptyChart(containerId) {
    const margin = { top: 80, right: 50, bottom: 30, left: 40 },
      width = 600 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const svg = d3.select(`#${containerId}`).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(decades)
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));
  }

  function updateCharts() {
    // Iterates through genres array and checks checkbox state
    const checkedGenres = genres.filter(genre => document.getElementById(genre + "Checkbox").checked);

    // Arrays for genres that are checked, depends if genre is included in checkedGenres
    const filteredData1 = transformedData.filter(d => checkedGenres.includes(d.genre));
    const filteredData2 = percentageChangeData.filter(d => checkedGenres.includes(d.genre));

    d3.select("#chart1").selectAll("*").remove(); 
    d3.select("#chart2").selectAll("*").remove(); 

    if (filteredData1.length === 0) {
      createEmptyChart("chart1");
    } else {
      createLineChart(filteredData1, "chart1");
    }

    if (filteredData2.length === 0) {
      createEmptyChart("chart2");
    } else {
      createLineChart(filteredData2, "chart2");
    }
  }
  

// Checkboxes to filter line chart content by genre
function createCheckboxes(genres, containerId) {
  const container = document.getElementById(containerId);

  // Checkbox color based on genre
  const color = d3.scaleOrdinal(d3.schemeCategory10).domain(genres);

  // "Select All" Checkbox to control all the checkboxes
  const selectAllCheckbox = document.createElement("input");
  selectAllCheckbox.type = "checkbox";
  selectAllCheckbox.id = "selectAllCheckbox";
  selectAllCheckbox.checked = true;
  // Hide Checkbox to custom design it
  selectAllCheckbox.style.display = "none"; 

  // Reference custom checkbox logic: https://www.sarasoueidan.com/blog/inclusively-hiding-and-styling-checkboxes-and-radio-buttons/

  selectAllCheckbox.addEventListener("change", function () {
    // Select all checkboxes except "Select All" checkbox
    const checkboxes = document.querySelectorAll(`#${containerId} input[type="checkbox"]:not(#selectAllCheckbox)`);
    checkboxes.forEach(checkbox => {
      checkbox.checked = selectAllCheckbox.checked; // Checked state should match "Select All"
      const customCheckbox = checkbox.nextElementSibling.querySelector('.custom-checkbox');
      if (selectAllCheckbox.checked) {
        customCheckbox.classList.add("checked"); // Apply visual check
      } else {
        customCheckbox.classList.remove("checked"); // Remove visual check
      }
    });
    updateCharts();
  });

  // Create label for "Select All" checkbox
  const selectAllLabel = document.createElement("label");
  selectAllLabel.setAttribute("for", "selectAllCheckbox");

  const selectAllCustomCheckbox = document.createElement("span");
  selectAllCustomCheckbox.className = "custom-checkbox";
  selectAllCustomCheckbox.style.backgroundColor = "#000";
  selectAllLabel.appendChild(selectAllCustomCheckbox); // Append the custom checkbox first
  selectAllLabel.appendChild(document.createTextNode("Select All")); // Then set the text

  // Append select all checkbox to container
  container.appendChild(selectAllCheckbox);
  container.appendChild(selectAllLabel);
  container.appendChild(document.createElement("br"));
  container.appendChild(document.createElement("br"));

  // Create checkbox for each genre
  genres.forEach(genre => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = genre + "Checkbox";
    checkbox.checked = true; // Default checked state
    checkbox.style.display = "none"; // Hide checkbox

    const label = document.createElement("label");
    label.setAttribute("for", genre + "Checkbox");
    label.style.color = color(genre); // Color of text according to genre

    // Custom checkbox for visual styling
    const customCheckbox = document.createElement("span");
    customCheckbox.className = "custom-checkbox";
    customCheckbox.style.backgroundColor = color(genre); // Color
    if (checkbox.checked) {
      customCheckbox.classList.add("checked"); // Makes sure checkbox appears checked for default checked state
    }
  
    checkbox.addEventListener("change", function() {
      // Add and remove checked style
      if (this.checked) {
        customCheckbox.classList.add("checked"); 
      } else {
        customCheckbox.classList.remove("checked");
      }
      updateCharts(); // Update charts based on selection
    });
  
    label.appendChild(customCheckbox); // Append the custom checkbox first
    label.appendChild(document.createTextNode(genre)); // Then set the text
  
    // Adding complete setup to container
    container.appendChild(checkbox);
    container.appendChild(label);
    container.appendChild(document.createElement("br")); // Display in a column
  });
}
  // Call createCheckboxes before creating the charts
  createCheckboxes(genres, "checkboxContainer");
  updateCharts();

});
