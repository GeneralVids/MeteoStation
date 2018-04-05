//Requirements
var http = require('http');
var url = require('url');
var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var mysql = require('mysql');

//Framework express
var app = express(); //Création de l'objet express
app.set('views', path.join(__dirname, 'views')); //Configuration du dossier contenant les pages
app.engine('handlebars', exphbs({ defaultLayout: 'main' })); //Configuration du template par défaut
app.set('view engine', 'handlebars'); //Configuration du framework handlebars
app.set('port', process.env.PORT || 8080); //Configuration du port
app.use(express.static(path.join(__dirname, 'public'))); //Configuration du dossier public

//Connexion à la base de données
var con = mysql.createConnection({
    host: "localhost",
    user: "nodejs",
    password: "",
    database: "stationmeteo",
    port: 3306
});

//Définition des fonctions de récupération des données de la base
//Requête pour récupérer toute la table
function getAllData(callback) {
    con.query("SELECT * FROM mesures ORDER BY dateAndTime",
        function (err, result) {
            callback(err, result);
        }
    );
}
//Requête pour récupérer la dernière mesure
function getLastData(callback) {
    con.query("SELECT * FROM lastmesure ORDER BY dateAndTime",
        function (err, result) {
            callback(err, result);
        }
    );
}
//Fonction qui met à jour la mesure "en temps réel" toutes les 5mins
function updateAllData(callback) {
    console.log('Mise à jour horaire...');
    var spawn = require("child_process").spawn; //Permet l'usage de fonction externe
    var scriptProcess = spawn('python', ["/home/pi/MeteoStation/MeteoStation/python/capteur.py"]); //Importe le script python
    scriptProcess.stdout.on('data', function (data) {         //Récupère les données sortantes du script python
        var newHum = parseFloat(data.slice(0, data.indexOf("S"))); //Sépare l'humidité de la température
        var newTemp = parseFloat(data.slice(data.indexOf("S") + 1)); //Sépare la température de l'humidité
        console.log("Dernière mesure horaire :" + newTemp + "°C " + newHum + "%");
        var sql = "INSERT INTO mesures (temperature, humidity) VALUES ?";            //Préparation de la requête MySQL
        var values = [newTemp, newHum];                             //Préparation des valeurs de la requête MySQL
        con.query(sql, [values], function (err, result) {           //Envoi de la requête
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });
    });
}

//Fonction qui met à jour à jour la base de données principale toutes les heures
function updateLastData(callback) {
    console.log('Mise à jour "temps réel"...');
    var spawn = require("child_process").spawn; //Permet l'usage de fonction externe
    var scriptProcess = spawn('python', ["/home/pi/MeteoStation/MeteoStation/python/capteur.py"]); //Importe le script python
    scriptProcess.stdout.on('data', function (data) {         //Récupère les données sortantes du script python
        var newHum = parseFloat(data.slice(0, data.indexOf("S"))); //Sépare l'humidité de la température
        var newTemp = parseFloat(data.slice(data.indexOf("S") + 1)); //Sépare la température de l'humidité
        console.log("Dernière mesure temps réel :" + newTemp + "°C " + newHum + "%");
        var sql = "DELETE FROM lastmesure";
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Number of records deleted: " + result.affectedRows);
        });
        var sql = "INSERT INTO lastmesure (temperature, humidity) VALUES (?)";
        var values = [newTemp, newHum];
        con.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });
    });
}

setInterval(updateAllData, 18000000); //La base de données principale est mise à jour toute les heures (18x10^6 ms soit 1h)
setInterval(updateLastData, 300000); //La base de données "en temps réel" est mise à jour toutes les 5 minutes (300000 ms soit 5min)

//Configuration de la structure du site
app.get('/', function (req, res) {
    res.redirect('/dashboard');
});
app.get('/dashboard', function (req, res) {
    getLastData(function (err, lastData) { //L'appel de cette page fera appel à la fonction de récupération de toute la table
        res.render('dashboard', { //Cette page utilise le template dashboard
            'title': 'lastData',  //Nom de la page
            'result': JSON.stringify(lastData) //Envoi le résultat de la requête à la page
        });
    });
});
app.get('/graph', function (req, res) {
    getAllData(function (err, allData) {
        res.render('graph', {
            'result': JSON.stringify(allData)
        });
    });
});
app.get('/raw', function (req, res) {
    getAllData(function (err, allData) {
        res.render('raw', {
            'result': JSON.stringify(allData)
        });
    });
});
app.get('/jsonall', function (req, res) {
    getAllData(function (err, allData) {
        res.json(allData);
    });
});
app.get('/jsonlast', function (req, res) {
    getLastData(function (err, lastData) {
        res.json(lastData);
    });
});
app.use(function (req, res, next) {
    res.setHeader('Content-Type', 'text/http');
    res.status(404).send('Page Introuvable');
});

//Lancement du serveur d'un nouveau client
app.listen(app.get('port'), function () {
    console.log('Website started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
}); 