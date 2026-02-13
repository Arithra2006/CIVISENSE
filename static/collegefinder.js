// CollegeFinder.js

async function findColleges() {
  const state = document.getElementById("state").value;
  const stream = document.getElementById("stream").value;
  const budget = document.getElementById("budget").value;

  const response = await fetch(`/api/find_colleges?state=${state}&stream=${stream}&budget=${budget}`);
  const data = await response.json();

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = ''; // Clear previous output

  if (data.length === 0) {
    resultDiv.innerHTML = "<p>No colleges found for your criteria.</p>";
    return;
  }

  let html = `
    <h2>Matching Colleges:</h2>
    <table border="1" cellspacing="0" cellpadding="8">
      <thead>
        <tr>
          <th>Name</th>
          <th>State</th>
          <th>Stream</th>
          <th>Fees (₹)</th>
          <th>Rating</th>
          <th>Placement Rate (%)</th>
          <th>Industry Tie-ups</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((college) => {
    html += `
      <tr>
        <td>${college.name}</td>
        <td>${college.state}</td>
        <td>${college.stream}</td>
        <td>${college.fees}</td>
        <td>${college.student_rating}</td>
        <td>${college.placement_rate}</td>
        <td>${college.industry_tieups}</td>
        <td>${college.location}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  resultDiv.innerHTML = html;
}

// ✅ Function moved to global scope to fix "Show Insights" button
async function loadInsights() {
  const response = await fetch("/api/average_fees_by_stream");
  const data = await response.json();

  const labels = data.map(item => item.stream);
  const fees = data.map(item => item.fees);

  const ctx = document.getElementById("feesChart").getContext("2d");

  // Destroy previous chart if it exists (to avoid overlap)
  if (window.feesChartInstance) {
    window.feesChartInstance.destroy();
  }

  // Create new bar chart
  window.feesChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Average Fees (₹)',
        data: fees,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value.toLocaleString();
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return '₹' + context.parsed.y.toLocaleString();
            }
          }
        }
      }
    }
  });
}
