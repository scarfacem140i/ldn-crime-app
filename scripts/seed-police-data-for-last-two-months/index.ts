const sendRequest = (yearMonth: string) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Insomnia/2023.5.3",
      Authorization: "Bearer POLICEAPIKEY",
    },
    body: JSON.stringify({ yearMonth }),
  };

  return fetch("http://localhost:3000/api/police-sync", options)
    .then((response) => response.json())
    .then((response) => {
      console.log(`Response for ${yearMonth}:`, response);
    })
    .catch((err) => {
      console.error(`Error for ${yearMonth}:`, err);
    });
};

// Calculate last two months dynamically
const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

// Get the previous two months
const month1 = currentMonth <= 2 ? 12 + currentMonth - 3 : currentMonth - 3; // 3 months ago
const month2 = currentMonth <= 3 ? 12 + currentMonth - 4 : currentMonth - 4; // 4 months ago

// Format months to "YYYY-MM" format
const yearMonth1 = `${currentYear}-${String(month1 + 1).padStart(2, "0")}`;
const yearMonth2 = `${currentYear}-${String(month2 + 1).padStart(2, "0")}`;

console.log(`Sending requests for months: ${yearMonth1}, ${yearMonth2}`);

// Fire two requests for the two months
sendRequest(yearMonth1);
sendRequest(yearMonth2);
