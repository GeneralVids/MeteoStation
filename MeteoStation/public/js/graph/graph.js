var chartData = generateChartData();

var chart = AmCharts.makeChart("chartdiv", {
    "type": "serial",
    "theme": "dark",
    "language": "fr",
    "legend": {
        "useGraphSettings": true
    },
    "dataProvider": chartData,
    "synchronizeGrid": true,
    "valueAxes": [{
        "id": "temperature",
        "axisColor": "#fdd400",
        "axisTextColor": "#fdd400",
        "axisThickness": 2,
        "axisAlpha": 1,
        "position": "left",
        "unit": "°C"
    }, {
        "id": "humidity",
        "axisColor": "#67b7dc",
        "axisThickness": 2,
        "axisAlpha": 1,
        "position": "right",
        "unit": "%"
    }],
    "graphs": [{
        "id": "temperature",
        "valueAxis": "temperature",
        "lineColor": "#fdd400",
        "bullet": "round",
        "bulletBorderThickness": 1,
        "hideBulletsCount": 30,
        "title": "Température",
        "valueField": "temperature",
        //"type": "smoothedLine",
        "type": "line",
        "fillAlphas": 0
    }, {
        "id": "humidity",
        "valueAxis": "humidity",
        "lineColor": "#67b7dc",
        "bullet": "square",
        "bulletBorderThickness": 1,
        "hideBulletsCount": 30,
        "title": "Humidité",
        "valueField": "humidity",
        //"type": "smoothedLine",
        "type": "line",
        "fillAlphas": 0
    }],
    "chartScrollbar": {
        "graph": "temperature",
        "gridAlpha": 0,
        "color": "#888888",
        "scrollbarHeight": 55,
        "backgroundAlpha": 0,
        "selectedBackgroundAlpha": 0.1,
        "selectedBackgroundColor": "#888888",
        "graphFillAlpha": 0,
        "autoGridCount": true,
        "selectedGraphFillAlpha": 0,
        "graphLineAlpha": 0.2,
        "graphLineColor": "#c2c2c2",
        "selectedGraphLineColor": "#888888",
        "selectedGraphLineAlpha": 1
    },
    "chartCursor": {
        "cursorPosition": "mouse",
        "categoryBalloonDateFormat": "DD-MM-YYYY, HH:NN",
        "cursorAlpha": 0,
        "valueLineEnabled": true,
        "valueLineBalloonEnabled": true,
        "valueLineAlpha": 0.5,
        "fullWidth": true
    },
    "dataDateFormat": "YYYY-MM-DD-HH-NN",
    "categoryField": "date",
    "categoryAxis": {
        "parseDates": true,
        "minPeriod": "hh",
        "axisColor": "#DADADA",
        "minorGridEnabled": true
    },
    "export": {
        "enabled": false
    },
    "listeners": [{
        "event": "rendered",
        "method": function (e) {
            var curtain = document.getElementById("curtain");
            curtain.parentElement.removeChild(curtain);
        }
    }]
});

chart.addListener("dataUpdated", zoomChart);
zoomChart();

// generate some random data, quite different range
function generateChartData() {
    var chartData = [];
    for (var i in allData) {
        var item = allData[i];

        //1977-04-22T06:00:00Z to "YYYY-MM-DD-HH-NN"
        //dateV = item.dateAndTime.slice(0, 4); dateV += "-";
        //dateV += item.dateAndTime.slice(5, 7); dateV += "-";
        //dateV += item.dateAndTime.slice(8, 10); dateV += "-";
        //dateV += item.dateAndTime.slice(11, 13); dateV += "-";
        //dateV += item.dateAndTime.slice(14, 16);
        //console.log(dateV);

        dateD = AmCharts.stringToDate(item.dateAndTime, "YYYY-MM-DD-HH:NN:SS");
        console.log(dateD);
        chartData.push({
            date: dateD,
            temperature: item.temperature,
            humidity: item.humidity
        });
    }
    return chartData;
}

function zoomChart() {
    chart.zoomToIndexes(chart.dataProvider.length - 20, chart.dataProvider.length - 1);
}