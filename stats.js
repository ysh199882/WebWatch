/**解析csv数据 */
function parseCSV(data) {
  let parsedData = [];
  let rows = data.trim().split('\n');
  let headers = rows[0].split(',');

  for (let i = 1; i < rows.length; i++) {
    let obj = {};
    let currentRow = rows[i].split(',');
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j].trim()] = currentRow[j].trim();
    }
    parsedData.push(obj);
  }
  return parsedData;
}

// 将数据存储到chrome.storage
function saveToStorage(data) {
  chrome.storage.local.set({ importedData: data });
}

// 从chrome.storage获取数据
function getFromStorage(callback) {
  chrome.storage.local.get('importedData', function (result) {
    callback(result.importedData);
  });
}

//导出为csv文件
function exportToCSV(data, filename = '网页浏览时间统计.csv') {
  // 转换为CSV格式
  let csvContent =
    'data:text/csv;charset=utf-8,' +
    data.map((e) => Object.values(e).join(',')).join('\n');

  // 创建下载链接
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  // 清除创建的链接
  document.body.removeChild(link);
}

// 渲染数据到UI
function renderData(data) {
  const container = document.getElementById('siteStatsContainer');
  if (!container) {
    console.error('siteStatsContainer not found!');
    return;
  }

  // 清空之前的数据
  container.innerHTML = '';

  data.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'site-card';

    const domain = document.createElement('h2');
    domain.textContent = item.url;

    const timeSpent = document.createElement('p');
    timeSpent.textContent = `Time Spent: ${(
      item['time in seconds'] / 60
    ).toFixed(2)} minutes`;

    /**网址打开次数 */
    // const openCount = document.createElement('p');
    // openCount.textContent = `Opened: ${item.openCount || 0} times`;

    card.appendChild(domain);
    card.appendChild(timeSpent);
    // card.appendChild(openCount);
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // 处理CSV文件导入
  document
    .getElementById('csvFileInputImport')
    .addEventListener('change', function (e) {
      let file = e.target.files[0];
      let reader = new FileReader();

      reader.onload = function (event) {
        const parsedData = parseCSV(event.target.result);
        saveToStorage(parsedData);
        renderData(parsedData);
      };

      reader.readAsText(file);
    });

  // 初始化：从storage获取数据并渲染
  getFromStorage(function (data) {
    if (data) {
      renderData(data);
    }
  });
});

// **只保留这一个监听器**
document
  .getElementById('csvFileInputExport')
  .addEventListener('click', function () {
    // 获取数据
    getFromStorage(function (data) {
      exportToCSV(data);
    });
  });
