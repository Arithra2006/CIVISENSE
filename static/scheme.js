// static/script.js
document.addEventListener('DOMContentLoaded', () => {
  const ageSelect = document.getElementById('age');

  // Populate age options from 1 to 100
  for (let i = 1; i <= 100; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    ageSelect.appendChild(option);
  }

  // Handle form submission
  document.getElementById('schemeForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const state = document.getElementById('state').value;
    const age = parseInt(document.getElementById('age').value);
    const sector = document.getElementById('sector').value;

    const response = await fetch('/get_schemes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, age, sector })
    });

    const data = await response.json();
    const resultDiv = document.getElementById('results');
    resultDiv.innerHTML = ''; // Clear previous results

    if (!data.length) {
      resultDiv.innerHTML = '<p>No schemes found for your selection.</p>';
      return;
    }

    // Build HTML table
    let html = `
      <table border="1" cellspacing="0" cellpadding="8">
        <thead>
          <tr>
            <th>Scheme Name</th>
            <th>Conditions</th>
            <th>Documents Needed</th>
            <th>Skills Offered</th>
            <th>Offered By</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.forEach(row => {
      html += `
        <tr>
          <td>${row.scheme_name}</td>
          <td>${row.conditions}</td>
          <td>${row.documents_needed}</td>
          <td>${row.skills_offered}</td>
          <td>${row.offered_by}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    resultDiv.innerHTML = html;
  });
});
