function fetchStateData() {
  const selectedState = document.getElementById("stateSelect").value;

  fetch("http://127.0.0.1:5000/state_data", {

    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: selectedState })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("selectedState").innerText = selectedState;
    document.getElementById("dataTableBody").innerHTML = `
      <tr><th>Utilities Cost</th><td>₹ ${data["Utilities Cost (INR)"]}</td></tr>
      <tr><th>Healthcare Cost</th><td>₹ ${data["Healthcare Cost (INR)"]}</td></tr>
      <tr><th>Transport Cost</th><td>₹ ${data["Transport Cost (INR)"]}</td></tr>
      <tr><th>Education Cost</th><td>₹ ${data["Education Cost (INR)"]}</td></tr>
      <tr><th>Accommodation Cost</th><td>₹ ${data["Accommodation Cost (INR)"]}</td></tr>
      <tr><th>Job Index</th><td>${data["Job Index (1-10)"]} / 10</td></tr>
      <tr><th>AI Suggestion</th><td>${data["AI Suggestion"]}</td></tr>
    `;
    document.getElementById("stateData").style.display = "block";
  })
  .catch(err => {
    alert("Error fetching data from server.");
    console.error(err);
  });
}
