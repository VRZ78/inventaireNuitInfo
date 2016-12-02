var http = require('http');
var express = require('express');
var app = express();
var mysql = require('mysql');
var cors = require('express-cors');
var bodyParser = require('body-parser');
var userId;
var randtoken = require('rand-token');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'inventaire',
});

//________________________________________________________connexion à la base de données
connection.connect(function (err) {
    if (!err) {
        console.log("connexion à la bdd reussi");
    } else {
        console.log("Erreur lors de la tentative de connexion....");
    }
});

//________________________________________________________config cors
app.use(cors({
    allowedOrigins: ['localhost:8750', 'g-only.com'],
    headers: ['Content-Type', 'Authorization', 'Ocp-Apim-Subscription-Key']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//_________________________________________________________recuperer les fiches (en fonction des formations)
app.get('/fiches', function (req, res) {
    var userID = getUserId(req.headers.authorization, 'admin');
    if (userID != null) {
        connection.query(" select fiches.* from utilisateur right join fiches on fiches.id_administrateur=utilisateur.id where utilisateur.id =" + userID + ";", function (err, rows, fileds) {
            if (!err)
                res.status(200).json(rows);
            else{
                console.log(err);
                res.status(404).json("error");
            }

        });
    }
});


app.get('/objet/:id', function (req, res) {
    res.status(200).json("test");
});

app.param('id', function (req, res, next, id) {

    var userID = getUserId(req.headers.authorization, 'admin');
    if (userID != null) {
        connection.query("select * from objet where id_fiche=" + id +  " ;", function (err, rows, fileds) {
            if (!err) {
                res.status(200).json(rows);
                next();
            } else {
                res.status(404).send("error");
            }
        });
    }
});


//__________________________________________________Inscription__________________________________________________________

app.post('/inscription', function (req, res) {
    //changer type par 2...;
    connection.query("INSERT INTO `utilisateur`(`nom`, `prenom`, `mot_de_passe`, `mail`) VALUES (" + mysql.escape(req.body.nom) + "," + mysql.escape(req.body.prenom) + "," + mysql.escape(req.body.password) + "," + mysql.escape(req.body.mail) + ")", function (err, rows, fields) {
        if (!err)
            res.status(200).send();
        else {
            console.log(err);
            res.status(404).json("erreur inscription");
        }
    });
});

app.post('/AjoutFiche', function (req, res) {
    var userID = getUserId(req.headers.authorization, 'admin');
    if (userID != null) {
        connection.query("INSERT INTO `fiches`(`nom`, `description`,`id_administrateur`) VALUES (" + mysql.escape(req.body.nom) + "," + mysql.escape(req.body.description) + "," + userID + ")", function (err, rows, fields) {
            if (!err)
                res.status(200).send();
            else {
                console.log(err);
                res.status(404).json("erreur ajout");
            }
        });
    }
});

app.post('/AjoutObjet', function (req, res) {

    var userID = getUserId(req.headers.authorization, 'admin');
    if (userID != null) {
        connection.query("INSERT INTO `objet`(`nom`, `description`,`categorie`,`id_fiche`, `lien_image`) VALUES (" + mysql.escape(req.body.nom) + "," + mysql.escape(req.body.description) + "," + mysql.escape(req.body.categorie) + "," + mysql.escape(req.body.fiche) + "," + mysql.escape(req.body.lien_image) + ")", function (err, rows, fields) {
            if (!err) {
                res.status(200).send();
            }
            else {
                console.log(err);
                res.status(404).json("erreur ajout");
            }
        });
    }
});


//----------------------------------------------Connexion -------------------------------------


// ------------- LOGIN -------------

/**
 * Connexion
 } à l'application
 * params : username et password dans request.body
 */
app.post('/login', function (req, res, next) {
    connection.query("select * from utilisateur where mail = " + mysql.escape(req.body.mail) + " and mot_de_passe= " + mysql.escape(req.body.password) + ";", function (err, rows, fileds) {
        if (!err) {
            // Génération d'un token
            var token = randtoken.generate(16);
            // Ajout du token à la liste
            if (rows.length > 0) {
                if (insertToken(token, rows[0].id, 'admin')) {
                    var resData = {};
                    resData.token = token;
                    res.status(200).json(resData);
                }
                else {
                    res.status(404).json("error");
                }
            }
            else if (rows.length === 0) {
                res.status(404).json("error");
            }
        }
        else {
            console.log(err);
            res.status(404).json("error");
        }
    });
});

/**
 * Vérifie que l'utilisateur est bien connecté.
 * param : Le token de l'utilisateur dans headers/authorization
 */
app.get('/isConnected', function (req, res, next) {
    var userID = getUserId(req.headers.authorization, 'admin');
    if (userID != null) {
        res.send(200);
    } else {
        res.send(401);
    }
});

/**
 * Déconnecte un utilisateur
 * param : token dans headers.authorization
 */
app.get('/deleteToken', function (req, res, next) {
    var userID = getUserId(req.headers.authorization, 'admin');
    for (var i = 0; i < tokenList.length; i++) {
        if (tokenList[i].user === userID) {
            tokenList.splice(i, 1);
            res.send(200);
        }
    }
});

var tokenList = [];


/**
 * Insère un nouveau token
 * @param token
 * @param userID
 * @param type
 * @returns {boolean}
 */
var insertToken = function (token, userID, type) {

    // Vérifie si un token existe déjà
    if (type === 'admin') {
        for (var i = 0; i < tokenList.length; i++) {
            if (tokenList[i].tokenId === token) {
                return false;
            }
        }
    }

    // Supprime l'utilisateur déjà enregistré dans la liste des token
    if (type === 'admin') {
        for (var j = 0; j < tokenList.length; j++) {
            if (tokenList[j].user === userID) {
                tokenList.splice(j, 1);
            }
        }
    }

    // Ajout le token et l'utilisateur associe à la liste
    var newToken = {};
    newToken.tokenId = token;
    newToken.user = userID;
    if (type === 'admin') {
        tokenList.push(newToken);
        return true;
    }
};

/**
 * Retourne le Token associé à un userId
 * @param userID
 * @returns {*}
 */
var getToken = function (userID) {
    for (var i = 0; i < tokenList.length; i++) {
        if (tokenList[i].user === userID) {
            return tokenList[i].tokenId;
        }
    }
};

/**
 * Retourne le userID associé à un token
 * @param token
 * @param type
 * @returns {*}
 */
var getUserId = function (token, type) {
    if (type === 'admin') {
        for (var i = 0; i < tokenList.length; i++) {
            if (tokenList[i].tokenId === token) {
                return tokenList[i].user;
            }
        }
    }
};

app.listen(40115);
