const express = require("express");
const router = express.Router();
const passport = require("passport");
const session = require("express-session");
const bcrypt = require("bcrypt");
const {User, Role} = require("../models/User");
const Adresse = require("../models/adresse");
const { Op } = require("sequelize");
const createError = require('http-errors');

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

//CREATION D'UN NOUVEL UTILISATEUR: GET
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
            telephone: req.body.telephone,
            adresseId: req.body.adresseId,
            roleName: req.body.roleName,
        }
    ]);

    let clientRole;
    let proprietaireRole;
    try {
        clientRole = await Role.findOne({ 
          where: { name: "client" } });
        proprietaireRole = await Role.findOne({ 
          where: { name: "proprietaire"}});
    } catch (error) {
        req.session.compteCree = false;
        return res.redirect("/login");
    }
    
    console.log('clientRole', JSON.stringify(clientRole));
    console.log('proprietaireRole', JSON.stringify(proprietaireRole));

    if ( req.body.roleName === "client") {
      await Promise.all([
        newUser.setRoles([clientRole])
     ]);
    } else if ( req.body.roleName === "proprietaire") {
      await Promise.all([
        newUser.setRoles([proprietaireRole])
      ]);
    }
    
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

//get users page
router.get("/users", async (req, res) => {
  const user = req.user;
  const users = await User.findAll(
    {include: Adresse, Role}
  );
  res.render('users', { 
    title: "Liste des users", 
    user, 
    users, 
    currentUrl: req.originalUrl,});
  
});

//AFFICHAGE DU PROFIL DE L'UTILISATEUR
// router.get('/account', function(req, res, next) {

//   //here it is
//   var user = req.user;
//   // const roles = Role.findAll();

//   //you probably also want to pass this to your view
//   res.render('account', { title: 'account', user: user });
// });

//details user 
// router.get("/:username/details", async (req, res, next) => {
//   try {
//     //récupération du user
//     const user = req.user;
//     //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
//     // if (!user) {
//     //   return res.redirect("/login");
//     // }
//     //vérification si l'utilisateur a le droit de voir le détail des locations, 
//     //si ne n'est pas le cas alors affichage de l'erreur 403
//     if (!user.can("viewUserDetails")) {
//       return next(createError(403));
//     }
//     //récupération de l'id de la location
//     const userId = req.params.username;
//     //recherche de la location en fonction de la clé primaire
//     const useer = await User.findByPk(userId, {include: [Adresse, Role]});
//     // const useer = await User.findAll({
//     //   where: {  
//     //      username: username ,
//     //   },
//     //   include: Adresse
//     // });
//     const adresses = await Promise.all([ Adresse.findAll()]);  
//     const roles = await Promise.all([roles.findAll()]);
//     //Affichage des détails de la location en tenant compte de la table adresse
//     res.render("user-details", { title:'details du user', user, useer, adresses, roles});
//   } catch (error) {
//     next(error);
//   }
// });

// //MISE A JOUR DU USER: GET
// router.get("/:username", async (req, res, next) => {
//   try {
//     //recupération du user
//     const user = req.user;
//     //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
//     if (!user) {
//       return res.redirect("/login");
//     }
//     //vérification si l'utilisateur a le droit de modifier des communes, 
//     //si ne n'est pas le cas alors affichage de l'erreur 403
//     if (!user.can("editUser")) {
//       return next(createError(403));
//     }
//     //recupération de l'id de la commuune
//     const userId = req.params.username;
//     //recherche d'une commune en fonction de la clé primaire
//     const useer = await User.findByPk(userId);
//     //affichage de la page de modification
//     res.render("user-edit", { title: "Edit user", user, useer });
//   } catch (error) {
//     next(error);
//   }
// });

// //MISE A JOUR DU USER: Post
// router.post("/:username", async (req, res, next) => {
//   try {
//     //récupération du user
//     const user = req.user;
//      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
//     if (!user) {
//       return res.redirect("/login");
//     }
//     //vérification si l'utilisateur a le droit de modifier les communes, 
//     //si ne n'est pas le cas alors affichage de l'erreur 403
//     if (!user.can("editUser")) {
//       return next(createError(403));
//     }
//     //recupération de l'id de la commune
//     const userId = req.params.username;
//     console.log(userId);
//     //mise à jour de la commune en fonction de son USERNAME
//     await User.update(req.body, { where: { username: userId } });
//     //redirection ou renvoie vers la page de la liste des communes
//     res.redirect("/users");
//   } catch (error) {
//     next(error);
//   }
// });

//DETAILS DU USER / ACCOUNT DETAILS
router.get("/:username/details", async (req, res, next) => {
  try {
    const user = await User.findByPk(username, {
      include: [Role, Adresse]});
    // if(user) {
    //   res.json({
    //     id: user.id,
    //     username: user.username,
    //     username: user.usermail,
    //     nom: user.nom,
    //     prenom: user.prenom,
    //     telephone: user.telephone,
    //     adresseId: user.adresseId,
    //   })
    // } 
    const adresses = await Promise.all([ Adresse.findAll()]);  
    const roles = await Promise.all([roles.findAll()]);
    res.render("account", {
      title: 'account', 
      user: user,
      adresses,
      roles,
      currentUrl: req.originalUrl,
  });
  }catch (error) {
    next(error)}
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
