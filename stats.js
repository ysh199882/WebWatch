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

//获取主域名，为了让Char图标的横坐标更短
function getMainDomain(url) {
  try {
    let hostname = new URL(url).hostname;
    // 获取二级域名
    let parts = hostname.split('.');
    if (parts.length > 2) {
      return parts.slice(-2).join('.');
    }
    return hostname;
  } catch (e) {
    console.error('Error parsing URL:', e);
    return url;
  }
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

//渲染Chart canvas
function renderChart(data) {
  let ctx = document.getElementById('usageChart').getContext('2d');

  // 添加渐变色
  let gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(75, 192, 192, 0.6)');
  gradient.addColorStop(1, 'rgba(75, 192, 192, 0.2)');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map((item) => getMainDomain(item.url)),
      datasets: [
        {
          label: '使用时长 (分钟)',
          data: data.map((item) => parseFloat(item['time in seconds']) / 60),
          backgroundColor: gradient,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 0.5,
          hoverBackgroundColor: 'rgba(75, 192, 192, 0.7)',
          hoverBorderColor: 'rgba(75, 192, 192, 1)',
          barPercentage: 0.8,
          categoryPercentage: 0.7,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            fontColor: '#666',
            fontSize: 14,
          },
        },
        x: {
          ticks: {
            fontColor: '#666',
            fontSize: 12,
            autoSkip: true,
            maxTicksLimit: 10,
          },
        },
      },
      legend: {
        labels: {
          fontColor: '#666',
          fontSize: 14,
          fontSize: 16,
          fontStyle: 'bold',
        },
      },
      title: {
        display: true,
        text: '使用时长分析',
        fontSize: 20,
        fontColor: '#333',
      },
      tooltips: {
        backgroundColor: 'rgba(75, 192, 192, 0.9)',
        titleFontColor: '#fff',
        bodyFontColor: '#fff',
        cornerRadius: 4,
        xPadding: 10,
        yPadding: 10,
      },
    },
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // 初始化：从storage获取数据并渲染
  getFromStorage(function (data) {
    // 按使用时长从长到短排序全部数据
    data.sort(
      (a, b) =>
        parseFloat(b['time in seconds']) - parseFloat(a['time in seconds'])
    );

    // 渲染全部数据到siteStatsContainer
    renderData(data);

    // 从排序后的数据中选取前十位渲染到canvas
    let topTen = data.slice(0, 10);
    renderChart(topTen);
  });

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
