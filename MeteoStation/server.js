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