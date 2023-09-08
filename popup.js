document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    const currentUrl = new URL(currentTab.url).hostname; // 获取域名

    // 获取数据并更新UI
    chrome.storage.local.get(currentUrl, function (data) {
      const usageData = data[currentUrl];
      if (usageData) {
        document.getElementById(
          'todayUsage'
        ).textContent = `${usageData.today} 分钟`;

        // 这里你可以使用Chart.js或其他库来显示这周的使用时长趋势
        // 例如:
        // updateChart(usageData.weekly);
      }
    });
  });

  document.getElementById('detailsLink').addEventListener('click', function () {
    chrome.tabs.create({ url: 'stats.html' });
  });
});
