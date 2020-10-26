var products = [];
var barChartData;

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource")
  {
    resp = request.source;
    resp.sort((a, b) => {
      return b.views - a.views;
    });
    [...resp].forEach((product,i) => {
      product.comments = i;
      products.push(product)
    });
    Chart.defaults.global.pointHitDetectionRadius = 1;
    barChartData = {
      labels: [],
      datasets: [{
        label: 'Views',
        backgroundColor: window.chartColors.red,
        stack: 'Stack 0',
        data: []
      }, {
        label: 'Calls',
        backgroundColor: window.chartColors.blue,
        stack: 'Stack 1',
        data: []
      }, {
        label: 'Comments',
        backgroundColor: window.chartColors.green,
        stack: 'Stack 1',
        data: []
      }],
      imgs : []
    };
    fill_chart();
    draw_chart();
  }
});

function onWindowLoad() {
  chrome.tabs.executeScript(null, {
    file: "getSource.js"
  }, function() {
    if (chrome.runtime.lastError)
      console.log('There was an error injecting script : \n' + chrome.runtime.lastError.message);
  });
}

var customTooltips = function(tooltip) {
  // Tooltip Element
  var tooltipEl = document.getElementById('chartjs-tooltip');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'chartjs-tooltip';
    this._chart.canvas.parentNode.appendChild(tooltipEl);
  }

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    //tooltipEl.style.opacity = 0;
    return;
  }

  // Set caret Position
  tooltipEl.classList.remove('above', 'below', 'no-transform');
  if (tooltip.yAlign) {
    tooltipEl.classList.add(tooltip.yAlign);
  } else {
    tooltipEl.classList.add('no-transform');
  }

  function getBody(bodyItem) {
    return bodyItem.lines;
  }
  // currentProduct = getProductByName(tooltip.title[0])
  // console.log(currentProduct)
  // Set Text
  var currentProduct = getProductByName(tooltip.title[0]);
  if (tooltip.body) {
    var titleLines = tooltip.title || [];
    var bodyLines = tooltip.body.map(getBody);

    // var innerHtml = '<thead>';

    // titleLines.forEach(function(title) {
    //   innerHtml += '<tr><th>' + title + '</th></tr>';
    //   currentProduct = getProductByName(title)
    // });
    // innerHtml += '</thead><tbody>';

    // bodyLines.forEach(function(body, i) {
    //   var colors = tooltip.labelColors[i];
    //   var style = 'background:' + colors.backgroundColor;
    //   style += '; border-color:' + colors.borderColor;
    //   style += '; border-width: 2px';
    //   var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
    //   innerHtml += '<tr><td>' + span + body + '</td></tr>';
    //   innerHtml += "<td><img width='50px' height='50px' src=" + currentProduct.img + ">";
    // });
    // innerHtml += '</tbody>';
    innerHtml = `
      <div class="container">
      <div class="table-responsive">
          <table class="table table-bordered table-striped" style="margin-top:10px">
          <thead class="table__head">
              <tr class="winner__table">
              <th>States</th>
              <th>Values</th>
              </tr>
          </thead>
          <tbody>
              <tr class="winner__table">
              <td>Name</td>
              <td>Tom</td>
              </tr>
              <tr class="winner__table">
                  <td ><i class="fa fa-eye" aria-hidden="true"></i>Views</td>
                  <td>${currentProduct.views}</td>
              </tr>
              <tr class="winner__table">
                  <td>Calls</td>
                  <td>${currentProduct.calls}</td>
              </tr>
              <tr class="winner__table">
                  <td>Messages</td>
                  <td>${currentProduct.messages}</td>
              </tr>
              <tr class="winner__table">
                  <td>Img</td>
                  <td><img width='200px' height='200px' src='${currentProduct.img}'></td>
              </tr>
          </tbody>
          </table>
        </div>
      </div>
    `;
    //var tableRoot = tooltipEl.querySelector('table');
    tooltipEl.innerHTML = innerHtml;
  }

  var positionY = this._chart.canvas.offsetTop;
  var positionX = this._chart.canvas.offsetLeft;

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  // tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  // tooltipEl.style.top = positionY + tooltip.caretY + 'px';
  // tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
  // tooltipEl.style.fontSize = tooltip.bodyFontSize + 'px';
  // tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
  // tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
}

function draw_chart()
{
  var ctx = document.getElementById('canvas').getContext('2d');
  window.myBar = new Chart(ctx, {
    type: 'bar',
    data: barChartData,
    options: {
      title: {
        display: true,
        text: 'Products States',
        mode: 'index',
				position: 'nearest',
      },
      tooltips: {
        enabled:false,
        custom:customTooltips
      },
      responsive: true,
      scales: {
        xAxes: [{
          stacked: true,
          ticks: {
            display:false
          }
        }],
        yAxes: [{
          stacked: true
        }]
      },
      title: {
        display: true
      }
    }
  });
}

function getProductByName(name)
{
  let wanted = products.filter(product => product.name == name)
  return wanted[0];
}

window.onload = onWindowLoad;

var selectMenu;

document.addEventListener('DOMContentLoaded', function() {
  selectMenu = document.getElementById("mySelect");
  selectMenu.addEventListener("change", sort);
});

function fill_chart()
{
  products.forEach((product,i) => {
    barChartData.labels[i] = product.name;
    barChartData.datasets[0].data[i] = product.views;
    barChartData.datasets[1].data[i] = product.calls;
    barChartData.datasets[2].data[i] = product.comments;
    barChartData.imgs[i] = product.img;
  });
}

function sort()
{
  factor = selectMenu.value;
  products.sort((a, b) => {
    return b[factor] - a[factor];
  });
  fill_chart();
  window.myBar.update();
}