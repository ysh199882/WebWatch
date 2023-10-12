// 统计每个tab的使用时长

function initTracker() {
  let startTime = null;

  //开始计时
  function startTimer() {
    startTime = new Date();
  }

  //停止计时
  function stopTimer() {
    if (startTime) {
      const elapsedTime = (new Date() - startTime) / 1000;
      const currentUrl = window.location.href;
      updateUsageTime(currentUrl, elapsedTime);
      startTime = null;
    }
  }

  //更新使用时长
  function updateUsageTime(url, elapsedTime) {
    chrome.storage.local.get(url, function (result) {
      let currentUsageTime = result[url] ? result[url] : 0;
      let newUsageTime = currentUsageTime + elapsedTime;

      let storageObject = {};
      storageObject[url] = newUsageTime;

      chrome.storage.local.set(storageObject);
    });
  }

  // 监听 visibilitychange 事件
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      startTimer();
    } else {
      stopTimer();
    }
  });

  // 页面加载时启动计时器
  startTimer();

  // 监听页面卸载事件
  window.addEventListener('beforeunload', function () {
    stopTimer();
  });

  //监听 tab 的变化
  chrome.tabs.onActivated.addListener(function (activeInfo) {
    // 使用 activeInfo.tabId 来获取当前活动的选项卡信息
    chrome.tabs.get(activeInfo.tabId, function (tab) {
      if (tab.url === yourPageUrl) {
        startTimer();
      } else {
        stopTimer();
      }
    });
  });
}

initTracker();
