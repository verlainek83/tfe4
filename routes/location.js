//intégration de la librairie express 
var express = require('express');
var router = express.Router();
const createError = require("http-errors");
const session = require("express-session");
// importation des differentes modèles à utiliser
const Location = require('../models/location');
const {User} = require('../models/User');
const Place = require('../models/place');
const Vehicule = require('../models/vehicule');
//FONCTION QUI DONNE LA LISTE DE TOUTES LES LOCATIONS: GET
router.get("/", async (req, res, next) => {
  try {
    //récupération du user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir la liste des locations, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("listLocations")) {
      return next(createError(403));
    }
    //recherche de toutes les Locations en fonction du nom et du code postal
    const locations = await Location.findAll(
        { order: ["date_Debut", "date_Fin", "heure_Debut", "heure_Fin"],});
     //Affichage de toutes les locations
    res.render("locations", {
      title: "Liste des Locations",
      locations,
      user,
      currentUrl: req.originalUrl,
    });
  } catch (error) {
    next(error);
  }
});
//Fonction qui donne les details de la location
router.get("/:id/details", async (req, res, next) => {
  try {
    //récupération du user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir le détail des locations, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("viewLocationDetails")) {
      return next(createError(403));
    }
    //récupération de l'id de la location
    const locationId = req.params.id;
    //recherche de la location en fonction de la clé primaire
    const location = await Location.findByPk(locationId);
    const [users] = await Promise.all([ User.findAll()]);
    const [places] = await Promise.all([ Place.findAll()]);
    const [vehicules] = await Promise.all([ Vehicule.findAll()]);
    //Affichage des détails de la location en tenant compte de la table adresse
    res.render("location-details", { title: location.id, user, location, users, places, vehicules});
  } catch (error) {
    next(error);
  }
});
//CREATION D'UNe nouvelle Location: GET
router.get("/create", async(req, res, next) => {
  try {
      //récuperation du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
          return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de créer des locations, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("createLocation")) {
          return next(createError(403));
      }
      //Affichage du formulaire de création d'une nouvelle location
      res.render("location-form", { title: "Create Location", user });
  } catch (error) {
      next(error);
  }
});
//CREATION D'UNE NOUVELLE Location: POST
router.post("/create", async(req, res, next) =>
{
  console.log('body', JSON.stringify(req.body))
  try {
    //retrouver une location par la date_Debut, la date_Fin, 
      const [location, created] = await Location.findOrCreate({
          where: { 
            date_Debut: req.body.date_Debut,
            date_Fin: req.body.date_Fin,
            heure_Debut: req.body.heure_Debut,
            heure_Fin: req.body.heure_Fin,
            validationLocation: req.body.validationLocation,
          },
      });
      //affichage de la liste des locations
      res.redirect("/locations");
  } catch (error) {
      next(error);
  }
});
  //MISE A JOUR DE LA Location: GET
  router.get("/:id", async (req, res, next) => {
    try {
      //recupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de modifier des locations, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editLocation")) {
        return next(createError(403));
      }
      //recupération de l'id de la location
      const locationId = req.params.id;
      //recherche d'une location en fonction de la clé primaire
      const location = await Location.findByPk(locationId);
      //affichage de la page de modification
      res.render("location-edit", { title: "Edit location", user, location });
    } catch (error) {
      next(error);
    }
  });
  //MISE A JOUR De la Location: Post
  router.post("/:id", async (req, res, next) => {
    try {
      //récupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de modifier les locations, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editLocation")) {
        return next(createError(403));
      }
      //recupération de l'id de la location
      const locationId = req.params.id;
      //mise à jour de la location en fonction de son id
      await Location.update(req.body, { where: { id: locationId } });
      //redirection ou renvoie vers la page de la liste des locations
      res.redirect("/locations");
    } catch (error) {
      next(error);
    }
  });
//SUPPRESSION DE LA location
router.get("/:id/delete", async (req, res, next) => {
  try {
    //recuperation du user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de supprimer des locations, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("deleteLocation")) {
      return next(createError(403));
    }
    //recupération de l'id de la location
    const locationId = req.params.id;
    //suppression de la location en fonction de son id
    const location = await Location.destroy({ where: { id: locationId } });
    //renvoie vers la page de la liste des locations
    res.redirect("/locations");
  } catch (error) {
    next(error);
  }
});
//exportation du router 
module.exports = router;
