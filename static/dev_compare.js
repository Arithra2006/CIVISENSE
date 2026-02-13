function compareDevelopment() {
  const state1 = document.getElementById("state1").value;
  const state2 = document.getElementById("state2").value;
  const fromYear = parseInt(document.getElementById("fromYear").value);
  const toYear = parseInt(document.getElementById("toYear").value);

  if (!state1 || !state2 || isNaN(fromYear) || isNaN(toYear) || toYear < fromYear) {
    alert("Please select valid states and year range.");
    return;
  }

  fetch(`/api/compare_development?state1=${state1}&state2=${state2}&from=${fromYear}&to=${toYear}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) return alert(data.error);

      document.getElementById("comparisonResult").style.display = "block";

      const diffArrow = (diff) => diff > 0 ? `↑ ${diff}` : diff < 0 ? `↓ ${Math.abs(diff)}` : `→ 0`;

      function formatTable(title, fromData, toData) {
        return `
          <h4>${title}</h4>
          <table border="1" cellpadding="8" cellspacing="0" style="width:100%; text-align:center;">
            <tr><th>Metric</th><th>${fromYear}</th><th>${toYear}</th><th>Change(%)</th></tr>
            <tr><td>Population</td><td>${fromData["Population"]}</td><td>${toData["Population"]}</td><td>${diffArrow(toData["Population"] - fromData["Population"])}</td></tr>
            <tr><td>Poverty Rate (%)</td><td>${fromData["Poverty Rate (%)"]}</td><td>${toData["Poverty Rate (%)"]}</td><td>${diffArrow(toData["Poverty Rate (%)"] - fromData["Poverty Rate (%)"])}</td></tr>
            <tr><td>Literacy Rate (%)</td><td>${fromData["Literacy Rate (%)"]}</td><td>${toData["Literacy Rate (%)"]}</td><td>${diffArrow(toData["Literacy Rate (%)"] - fromData["Literacy Rate (%)"])}</td></tr>
            <tr><td>Average Income (INR)</td><td>${fromData["Average Income (INR)"]}</td><td>${toData["Average Income (INR)"]}</td><td>${diffArrow(toData["Average Income (INR)"] - fromData["Average Income (INR)"])}</td></tr>
          </table>
        `;
      }

      const state1Data = data[state1];
      const state2Data = data[state2];

      document.getElementById("state1Data").innerHTML = formatTable(state1, state1Data.from, state1Data.to);
      document.getElementById("state2Data").innerHTML = formatTable(state2, state2Data.from, state2Data.to);

      document.getElementById("suggestionsText").innerText = data.suggestion || "No major insights detected.";
    })
    .catch(err => {
      console.error(err);
      alert("Error fetching comparison data");
    });
}
