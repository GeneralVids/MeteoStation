//Requirements
var http = require('http');
var url = require('url');
var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var mysql = require('mysql');

//Framework express
var app = express(); //Cr�ation de l'objet express
app.set('views', path.join(__dirname, 'views')); //Configuration du dossier contenant les pages
app.engine('handlebars', exphbs({ defaultLayout: 'main' })); //Configuration du template par d�faut
app.set('view engine', 'handlebars'); //Configuration du framework handlebars
app.set('port', process.env.PORT || 8080); //Configuration du port
app.use(express.static(path.join(__dirname, 'public'))); //Configuration du dossier public

//Connexion � la base de donn�es
var con = mysql.createConnection({
    host: "localhost",
    user: "nodejs",
    password: "",
    database: "stationmeteo",
    port: 3306
});

//D�finition des fonctions de r�cup�ration des donn�es de la base
//Requ�te pour r�cup�rer toute la table
function getAllData(callback) {
    con.query("SELECT * FROM mesures ORDER BY dateAndTime",
        function (err, result) {
            callback(err, result);
        }
    );
}
//Requ�te pour r�cup�rer la derni�re mesure
function getLastData(callback) {
    con.query("SELECT * FROM lastmesure ORDER BY dateAndTime",
        function (err, result) {
            callback(err, result);
        }
    );
}
//Fonction qui met � jour la mesure "en temps r�el" toutes les 5mins
function updateAllData(callback) {
    console.log('Mise � jour horaire...');
    var spawn = require("child_process").spawn; //Permet l'usage de fonction externe
    var scriptProcess = spawn('python', ["/home/pi/MeteoStation/MeteoStation/python/capteur.py"]); //Importe le script python
    scriptProcess.stdout.on('data', function (data) {         //R�cup�re les donn�es sortantes du script python
        var newHum = parseFloat(data.slice(0, data.indexOf("S"))); //S�pare l'humidit� de la temp�rature
        var newTemp = parseFloat(data.slice(data.indexOf("S") + 1)); //S�pare la temp�rature de l'humidit�
        console.log("Derni�re mesure horaire :" + newTemp + "�C " + newHum + "%");
        var sql = "INSERT INTO mesures (temperature, humidity) VALUES ?";            //Pr�paration de la requ�te MySQL
        var values = [newTemp, newHum];                             //Pr�paration des valeurs de la requ�te MySQL
        con.query(sql, [values], function (err, result) {           //Envoi de la requ�te
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });
    });
}

//Fonction qui met � jour � jour la base de donn�es principale toutes les heures
function updateLastData(callback) {
    console.log('Mise � jour "temps r�el"...');
    var spawn = require("child_process").spawn; //Permet l'usage de fonction externe
    var scriptProcess = spawn('python', ["/home/pi/MeteoStation/MeteoStation/python/capteur.py"]); //Importe le script python
    scriptProcess.stdout.on('data', function (data) {         //R�cup�re les donn�es sortantes du script python
        var newHum = parseFloat(data.slice(0, data.indexOf("S"))); //S�pare l'humidit� de la temp�rature
        var newTemp = parseFloat(data.slice(data.indexOf("S") + 1)); //S�pare la temp�rature de l'humidit�
        console.log("Derni�re mesure temps r�el :" + newTemp + "�C " + newHum + "%");
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

setInterval(updateAllData, 18000000); //La base de donn�es principale est mise � jour toute les heures (18x10^6 ms soit 1h)
setInterval(updateLastData, 300000); //La base de donn�es "en temps r�el" est mise � jour toutes les 5 minutes (300000 ms soit 5min)

//Configuration de la structure du site
app.get('/', function (req, res) {
    res.redirect('/dashboard');
});
app.get('/dashboard', function (req, res) {
    getLastData(function (err, lastData) { //L'appel de cette page fera appel � la fonction de r�cup�ration de toute la table
        res.render('dashboard', { //Cette page utilise le template dashboard
            'title': 'lastData',  //Nom de la page
            'result': JSON.stringify(lastData) //Envoi le r�sultat de la requ�te � la page
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