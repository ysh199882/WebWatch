chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    const url = new URL(tab.url).hostname;
    const currentDate = new Date().toISOString().split('T')[0]; // 获取当前日期，例如 "2023-09-08"

    chrome.storage.local.get([currentDate], (result) => {
      let dataForToday = result[currentDate] || {};
      let siteData = dataForToday[url] || { totalTime: 0, openCount: 0 };

      siteData.totalTime += 10000;
      siteData.openCount += 1;

      dataForToday[url] = siteData;

      let dataToStore = {};
      dataToStore[currentDate] = dataForToday;
      chrome.storage.local.set(dataToStore);
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'stats.html' });
});
