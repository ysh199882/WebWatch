document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get(null, (result) => {
    const container = document.getElementById('siteStatsContainer');

    const dataForDate = result['2023-09-08'] || {};

    if (!container) {
      console.error('siteStatsContainer not found!');
      return;
    }

    for (let url in dataForDate) {
      const card = document.createElement('div');
      card.className = 'site-card';

      const domain = document.createElement('h2');
      domain.textContent = url;

      const timeSpent = document.createElement('p');
      timeSpent.textContent = `Time Spent: ${(
        dataForDate[url].totalTime / 60000
      ).toFixed(2)} minutes`;

      const openCountValue =
        (dataForDate[url] && dataForDate[url].openCount) || 0;
      const openCount = document.createElement('p');
      openCount.textContent = `Opened: ${openCountValue} times`;

      card.appendChild(domain);
      card.appendChild(timeSpent);
      card.appendChild(openCount);

      container.appendChild(card);
    }
  });

  chrome.storage.local.get(null, (result) => {
    const labels = [];
    const data = [];
    const dataForDate = result['2023-09-08'];

    for (let url in dataForDate) {
      labels.push(url);
      data.push(dataForDate[url].totalTime / 60000); // Convert to minutes
    }

    const ctx = document.getElementById('usageChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      title: {
        display: true,
        text: '网页使用时长',
      },
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              // ... Add more colors if needed
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              // ... Add more colors if needed
            ],
            borderWidth: 1,
          },
        ],
      },
    });
  });
});
