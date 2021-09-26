const express = require("express");
const router = express.Router();
const passport = require("passport");
const session = require("express-session");
const bcrypt = require("bcrypt");
const {User} = require("../models/User");

const saltRounds = 10;

/* GET home page. */
router.get("/", (req, res) => {
  const newlyAuthenticated = req.session.newlyAuthenticated;
    delete req.session.newlyAuthenticated;
    res.render("index", {
        title: "BIENVENUE SUR PLACETOPARK!",
        user: req.user,
        currentUrl: req.originalUrl,
        newlyAuthenticated,
  });
});
//connexion
router.get("/login", (req, res) => {
  const authenticationFailed = req.session.authenticationFailed;
  delete req.session.authenticationFailed;
  res.render("login", { 
    title: "Login", 
    currentUrl: req.originalUrl, 
    authenticationFailed 
  });
});
//connexion
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err1, user, info) => {
    if (err1) {
      return next(err1);
    }
    if (!user) {
      req.session.authenticationFailed = true;
      return res.redirect("/login");
    }
    delete req.session.nextUrl;
    req.session.regenerate((err2) => {
      if (err2) {
        return next(err2);
      }
      req.login(user, (err3) => {
        if (err3) {
          return next(err3);
        }
        req.session.newlyAuthenticated = true;
        res.redirect("/");
      });
    });
  })(req, res, next);
});
//AFFICHAGE DU PROFIL DE L'UTILISATEUR
router.get('/account', function(req, res, next) {

  //here it is
  var user = req.user;

  //you probably also want to pass this to your view
  res.render('account', { title: 'account', user: user });
});
//AFFICHAGE Des parkings du propriétaire
router.get('/mesParkings', function(req, res, next) {

  //here it is
  var user = req.user;

  //you probably also want to pass this to your view
  res.render('mesParkings', { title: 'Mes Parkings', user: user });
});

//CREATION D'UN NOUVEL UTILISATEUR: GET
//router.get("/signup", async (req, res) => {
router.get("/signup", async (req, res) => {
  const passwordMismatch = req.session.passwordMismatch;
  const compteCree = req.session.compteCree;
  delete req.session.passwordMismatch;
  delete req.session.compteCree;
  res.render("signup", {
      title: "Creation compte",
      currentUrl: req.originalUrl,
      passwordMismatch,
      compteCree
  });
});
//CREATION D'UN NOUVEAU UTILISATEUR: POST
router.post("/signup", (req, res, next) => {
  // vérifier si les deux mots de passe sont identiques
  passport.authenticate("local", async (err1, user, info) => {
    if (err1) {
        return next(err1);
    }
    
    if (req.body.password !== req.body.password2) {
        req.session.passwordMismatch = true;
        return res.redirect("/login");
    }

    // procéder à l'insertion dans la base de données
    const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
    const [ newUser ] = await User.bulkCreate([{
            username: req.body.username,
            passwordHash: hashPassword,
            usermail: req.body.usermail,
            nom: req.body.nom,
            prenom: req.body.prenom,
            // adresse: req.body.adresse,
            telephone: req.body.telephone,
        }
    ]);

    let clientRole;
    try {
        clientRole = await Role.findOne({ where: { name: "client" } });
    } catch (error) {
        req.session.compteCree = false;
        return res.redirect("/login");
    }

    console.log('clientRole', JSON.stringify(clientRole));

    await Promise.all([
        newUser.setRoles([clientRole])
    ]);

    req.session.compteCree = true;
    return res.redirect("/login");
  })(req, res, next);
});
//RESET PASSWORD
router.get("/reset", async (req, res) => {
  const passwordMismatch = req.session.passwordMismatch;
  const compteCree = req.session.compteCree;
  delete req.session.passwordMismatch;
  delete req.session.compteCree;
  res.render("signup", {
      title: "Creation compte",
      currentUrl: req.originalUrl,
      passwordMismatch,
      compteCree
      }
    )
});
//Deconnexion
router.get("/logout", (req, res, next) => {
  req.logout();
  req.session.regenerate((err) => {
    if (!err) {
      res.redirect("/");
    } else {
      next(err);
    }
  });
});

module.exports = router;
