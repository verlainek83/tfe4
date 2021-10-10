//intégration de la librairie express
var express = require('express');
var router = express.Router();
const createError = require("http-errors");
// importation des differentes modèles à utiliser
// const Vehicule = require('../models/vehicule');
// const Tarif = require('../models/tarif');
const TypeVehicule = require('../models/typeVehicule');
const Place = require('../models/place');
//LISTE DE TOUTES LES PLACES D'une place: GET
router.get("/", async (req, res, next) => {
    try {
      //recupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
    //vérification si l'utilisateur a le droit de voir la liste des typeVehicules, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("listTypeVehicules")) {
        return next(createError(403));
      }
      //recherche de toutes les typeVehicule de parking en fonction de la description et de la dimension
      const typeVehicules = await TypeVehicule.findAll({ order: ["nom"],});
      //Affichage de toutes les places
      res.render("typeVehicules", {
        title: "Liste des typeVehicules",
        typeVehicules,
        user,
        currentUrl: req.originalUrl,
      });
    } catch (error) {
      next(error);
    }
  });
  //Fonction qui donne les details de la typeVehiculee
  router.get("/:id/details", async (req, res, next) => {
    try {
      //récupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de voir le détail des TypeVehicules, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("viewTypeVehiculeDetails")) {
        return next(createError(403));
      }
      //récupraion de l'id de la TypeVehicule
      const typeVehiculeId = req.params.id;
      //recherche de la typeVehicule en fonction de la clé primaire
      const typeVehicule = await TypeVehicule.findByPk(typeVehiculeId);
      // const typeVehicule = await TypeVehicule.findByPk(typeVehiculeId, { include: [ Tarif, Vehicule, Place ]});
      //Affichage des détails de laTypeVehicule TypeVehicule en tenant compte des parkings
      res.render("typeVehicule-details", { title: typeVehicule.adresse, user, typeVehicule});
    } catch (error) {
      next(error);
    }
  });
  //CREATION D'UNE NOUVELLE TypeVehicule DE PARKING: GET
router.get("/create", async(req, res, next) => {
    try {
      //récuperation du user
        const user = req.user;
        //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
        if (!user) {
            return res.redirect("/login");
        }
        //vérification si l'utilisateur a le droit de créer des typeVehicules, 
        //si ne n'est pas le cas alors affichage de l'erreur 403
        if (!user.can("createTypeVehicule")) {
            return next(createError(403));
        }
        //Affichage du formulaire de création d'une nouvelle TypeVehicule
        res.render("typeVehicule-form", { title: "Create typeVehicule", user });
    } catch (error) {
        next(error);
    }
});
//CREATION D'UNE NOUVELLE TypeVehicule DE PARKING: POST
router.post("/create", async(req, res, next) =>
{
  console.log('body', JSON.stringify(req.body))
  try {
    //retrouver une typeVehicule par la description et la dimension
      const [typeVehicule, created] = await TypeVehicule.findOrCreate({
          where: { 
            nom: req.body.nom,
          },
      });
      //affichage de la liste des typeVehicules
      res.redirect("/typeVehicules");
  } catch (error) {
      next(error);
  }
});
//MISE A JOUR Du typeVehicule: GET
router.get("/:id", async(req, res, next) => {
  console.log('details')
  try {
    //recupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
          return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de modifier des typeVehicules, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editTypeVehicule")) {
          return next(createError(403));
      }
      //recupération de l'id de la typeVehicule
      const typeVehiculeId = req.params.id;
       //recherche d'une commune en fonction de la clé primaire
      const typeVehicule = await TypeVehicule.findByPk(typeVehiculeId);
      //affichage de la page de modification
      res.render("typeVehicule-edit", { title: "Edit typeVehicule", user, typeVehicule });
  } catch (error) {
      next(error);
  }
});
//MISE A JOUR Du TypeVehicule : POST
router.post("/:id", async(req, res, next) => {
  try {
    //récupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
          return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de modifier les typeVehicules, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editTypeVehicule")) {
          return next(createError(403));
      }
      //recupération de l'id de la typeVehicule
      const typeVehiculeId = req.params.id;
       //mise à jour de la typeVehicule en fonction de son id
      await TypeVehicule.update(req.body, { where: { id: typeVehiculeId } });
      res.redirect("/typeVehicules");
      //redirection ou renvoie vers la page de la liste des typeVehicules
  } catch (error) {
      next(error);
  }
});

//SUPPRESSION D'UN TypeVehicule  
router.get("/:id/delete", async (req, res, next) => {
    try {
       //recuperation du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de supprimer des typeVehicules, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("deleteTypeVehicule")) {
        return next(createError(403));
      }
      //recupération de l'id de la typeVehicule
      const typeVehiculeId = req.params.id;
      //suppression de la typeVehicule en fonction de son id
      const typeVehicule = await TypeVehicule.destroy({ where: { id: typeVehiculeId } });
      //renvoie vers la page de la liste des typeVehicules
      res.redirect("/typeVehicules");
    } catch (error) {
      next(error);
    }
});

//exportation du router 
module.exports = router;
