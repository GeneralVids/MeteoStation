var chart = AmCharts.makeChart("chartdiv", {
    "theme": "dark",
    "type": "gauge",
    "language": "fr",
    "axes": [{
        "id": "humidity",
        "axisColor": "#67b7dc",
        "axisThickness": 3,
        "startValue": 0,
        "endValue": 100,
        "gridInside": false,
        "inside": false,
        "radius": "100%",
        "valueInterval": 20,
        "tickColor": "#67b7dc",
        "unit": "%",
        "bottomTextYOffset": -70,
        "bottomTextColor": '#67b7dc'
    }, {
        "id": "temperature",
        "axisColor": "#fdd400",
        "axisThickness": 3,
        "startValue": 10,
        "endValue": 40,
        "radius": "80%",
        "valueInterval": 5,
        "tickColor": "#fdd400",
        "unit": "°C",
        "bottomTextYOffset": -65,
        "bottomTextColor": '#fdd400'
    }, {
        "id": "datetime",
        "axisColor": "#00000000",
        "startValue": 0,
        "endValue": 0,
        "axisThickness": 0,
        "radius": "60%",
        "tickColor": "#00000000",
        "bottomTextYOffset": 0,
        "bottomTextColor": '#ffffff'
    }],
    "arrows": [{
        "axis": "humidity",
        "color": "#67b7dc",
        "innerRadius": "10%",
        "nailRadius": 0,
        "radius": "92%"
    }, {
        "axis": "temperature",
        "color": "#fdd400",
        "innerRadius": "13%",
        "nailRadius": 0,
        "radius": "100% "
    }
    ],
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

//Mise à jour des valeurs
setInterval(updateValues, 2000);
function updateValues() {
    var humidity = parseFloat(lastData[0].humidity);
    //console.log(humidity);
    chart.arrows[0].setValue(humidity);
    chart.axes[0].setBottomText(humidity + "%");
    var temperature = parseFloat(lastData[0].temperature);
    //console.log(temperature);
    chart.arrows[1].setValue(temperature);
    chart.axes[1].setBottomText(temperature + "°C");
    var dateAndTime = AmCharts.stringToDate(lastData[0].dateAndTime, "YYYY-MM-DD-HH:NN:SS");
    dateAndTime = AmCharts.formatDate(dateAndTime, "EEE DD MMM HH:NN");
    console.log(dateAndTime);
    chart.axes[2].setBottomText(dateAndTime);
}