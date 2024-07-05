function fetchData(url, options) {
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .catch(error => {
      throw new Error('Fetch request failed', error);
    });
}
function fetchData_SVG(url, options) {
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .catch(error => {
      throw new Error('Fetch request failed', error);
    });
}

  
  function showJson() {
    fetchData('../../Items')
      .then(data => {
        document.getElementById('MAINSHOW').innerText = JSON.stringify(data, null, 2);
      document.getElementById('MAINSHOW').innerHTML = "";
      })
      .catch(error => console.error('Error fetching data:', error));
    
  }
  
  function showAddForm() {
    fetch('../../add?title=blob&value=42&color=85')
    .catch(error => console.error('Error fetching data:', error));
  }
  function doAdd(title, value, color) {
    fetch('../../add?title=' + title + '&value=' + value + '&color=' + color)
    .catch(error => console.error('Error fetching data:', error));
  }

  function showRemoveForm() {
    fetch('../../remove?index=0')
    .catch(error => console.error('Error clearing data:', error));
  }
  
  function clearJson() {
    fetch('../../clear')
    .catch(error => console.error('Error clearing data:', error));
    
    document.getElementById('MAINSHOW').innerText = "";
    document.getElementById('MAINSHOW').innerHTML = "";
  
  }
  
  function restoreJson() {
    fetch('../../restore')
    .catch(error => console.error('Restoringjson:', error));
  }
  
  function show_piechart(){
    fetchData_SVG('../../PIEChart')
    .then(data => {
   document.getElementById('MAINSHOW').innerHTML = data;
  })
  .catch(error => console.error('Error fetching data for svg creation', error));
}



function showLocalPieChart() {
    fetchData('../../Items')
      .then(data => {
      document.getElementById('MAINSHOW').innerHTML = generatePieChartSVG(data);
      })
      .catch(error => console.error('Error fetching data for svg creation', error));
  }

function generatePieChartSVG(data) {
    const total = data.reduce((acc, entree) => acc + entree.value, 0);
    let startAngle = 0;
    let svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">`;
    
    data.forEach(entry => {
        const percentage = (entry.value / total) * 100;
        const endAngle = startAngle + (percentage * 3.6);
        const path = describeArc(150, 150, 100, startAngle, endAngle);
        svg += `<path d="${path}" fill="${entry.color}" />`;
        startAngle = endAngle;
    });
    
    svg += `</svg>`;
    console.log("svg");
    console.log(svg);
    return svg;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = [
        `M ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
        `L ${x} ${y}`,
    ].join(' ');
    return d;
}