document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/college_names")
    .then(res => res.json())
    .then(data => {
      const datalist = document.getElementById("collegeNames");
      data.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        datalist.appendChild(option);
      });
    });
});

function compareColleges() {
  const c1 = document.getElementById("college1").value;
  const c2 = document.getElementById("college2").value;

  if (!c1 || !c2) {
    alert("Please enter both college names.");
    return;
  }

  fetch(`/api/compare_colleges?college1=${encodeURIComponent(c1)}&college2=${encodeURIComponent(c2)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length < 2) {
        document.getElementById("comparisonResult").innerHTML = "<p>One or both colleges not found.</p>";
        return;
      }

      const fields = ["name", "state", "stream", "fees", "student_rating", "placement_rate", "industry_tieups", "location"];

      let html = "<table border='1' style='width:100%; text-align:left; border-collapse:collapse;'>";
      html += "<thead><tr><th>Parameter</th><th>College 1</th><th>College 2</th></tr></thead><tbody>";

      fields.forEach(field => {
        html += `<tr><td><strong>${field.replace(/_/g, " ")}</strong></td><td>${data[0][field]}</td><td>${data[1][field]}</td></tr>`;
      });

      html += "</tbody></table>";

      document.getElementById("comparisonResult").innerHTML = html;
    });
}