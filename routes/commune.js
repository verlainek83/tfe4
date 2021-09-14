//intégration de la librairie express 
var express = require('express');
var router = express.Router();
const createError = require("http-errors");
const session = require("express-session");
// importation des differentes modèles à utiliser
const Adresse = require('../models/adresse');
const Commune = require('../models/commune');
const Region = require('../models/region');
//FONCTION QUI DONNE LA LISTE DE TOUTES LES communes: GET
router.get("/", async (req, res, next) => {
  try {
    //récupération du user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir la liste des communes, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("listCommunes")) {
      return next(createError(403));
    }
    //recherche de toutes les Communes en fonction du nom et du code postal
    const communes = await Commune.findAll({ 
        order: ["nom", "codePostal"], 
        include:[Region]
              });
     //Affichage de toutes les adresses
    res.render("communes", {
      title: "Commune list",
      communes,
      user,
      currentUrl: req.originalUrl,
    });
  } catch (error) {
    next(error);
  }
});
//Fonction qui donne les details de la Commune
router.get("/:id/details", async (req, res, next) => {
  try {
    //récupération du user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir le détail des communes, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("viewCommuneDetails")) {
      return next(createError(403));
    }
    //récupération de l'id de la commune
    const communeId = req.params.id;
    //recherche de la commune en fonction de la clé primaire et en tenant compte de l'adresse
    const commune = await Commune.findByPk(communeId);
    const [regions] = await Promise.all([ Region.findAll()]);
    //Affichage des détails de la commune en tenant compte de la table adresse
    res.render("commune-details", { title: commune.nom, user, commune, regions });
  } catch (error) {
    next(error);
  }
});
//CREATION D'UNe nouvelle Commune: GET
router.get("/create", async(req, res, next) => {
  try {
      //récuperation du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
          return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de créer des communes, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("createCommune")) {
          return next(createError(403));
      }
      const regions = await Region.findAll();
      //Affichage du formulaire de création d'une nouvelle commune
      res.render("commune-form", { title: "Create Commune", user, regions });
  } catch (error) {
      next(error);
  }
});
//CREATION D'UNE NOUVELLE Commune: POST
router.post("/create", async(req, res, next) =>
{
  console.log('body', JSON.stringify(req.body))
  try {
    //retrouver une commune par le nom et le code postal 
      const [commune, created] = await Commune.findOrCreate({
          where: { 
            nom: req.body.nom,
            codePostal: req.body.codePostal,
            regionNom: req.body.nom,
          },
      });
      //affichage de la liste des communes
      res.redirect("/communes");
  } catch (error) {
      next(error);
  }
});
  //MISE A JOUR DE LA Commune: GET
  router.get("/:id", async (req, res, next) => {
    try {
      //recupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de modifier des communes, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editCommune")) {
        return next(createError(403));
      }
      //recupération de l'id de la commuune
      const communeId = req.params.id;
      //recherche d'une commune en fonction de la clé primaire
      const commune = await Commune.findByPk(communeId);
      //affichage de la page de modification
      res.render("commune-edit", { title: "Edit commune", user, commune });
    } catch (error) {
      next(error);
    }
  });
  //MISE A JOUR De la Commune: Post
  router.post("/:id", async (req, res, next) => {
    try {
      //récupération du user
      const user = req.user;
       //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de modifier les communes, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editCommune")) {
        return next(createError(403));
      }
      //recupération de l'id de la commune
      const communeId = req.params.id;
      //mise à jour de la commune en fonction de son id
      await Commune.update(req.body, { where: { id: communeId } });
      //redirection ou renvoie vers la page de la liste des communes
      res.redirect("/communes");
    } catch (error) {
      next(error);
    }
  });
//SUPPRESSION DE LA Commune
router.get("/:id/delete", async (req, res, next) => {
  try {
    //recuperation du user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de supprimer des communes, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("deleteCommune")) {
      return next(createError(403));
    }
    //recupération de l'id de la commune
    const communeId = req.params.id;
    //suppression de la commune en fonction de son id
    const commune = await Commune.destroy({ where: { id: communeId } });
    //renvoie vers la page de la liste des communes
    res.redirect("/communes");
  } catch (error) {
    next(error);
  }
});
//exportation du router 
module.exports = router;
