//intégration de la librairie express
var express = require('express');
var router = express.Router();
const createError = require("http-errors");
// importation des differentes modèles à utiliser
const Place = require('../models/place');
const Reservation = require('../models/reservation');
// const Location = require('../models/location');
// const TypeVehicule = require('../models/typeVehicule');
const Parking = require('../models/parking');
const TypeVehicule = require('../models/typeVehicule');
//LISTE DE TOUTES LES PLACES D'une place: GET
router.get("/", async (req, res, next) => {
    try {
      //recupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
    //vérification si l'utilisateur a le droit de voir la liste des places, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("listPlaces")) {
        return next(createError(403));
      }
      //recherche de toutes les place de parking en fonction de la description et de la dimension
      const places = await Place.findAll({ order: ["description", "dimension"],
                                           include: ['parking']});
      //Affichage de toutes les places
      res.render("places", {
        title: "Liste des places",
        places,
        user,
        currentUrl: req.originalUrl,
      });
    } catch (error) {
      next(error);
    }
  });
  //Fonction qui donne les details de la place
  router.get("/:id/details", async (req, res, next) => {
    try {
      //récupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de voir le détail des places, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("viewPlaceDetails")) {
        return next(createError(403));
      }
      //récupraion de l'id de la place
      const placeId = req.params.id;
      //recherche de la place en fonction de la clé primaire
      const place = await Place.findByPk(placeId);
      const [parkings] = await Promise.all([Parking.findAll()]);
      //Affichage des détails de la place en tenant compte des parkings
      res.render("place-details", { title: place.adresse, user, place, parkings });
    } catch (error) {
      next(error);
    }
  });
  //CREATION D'UNE NOUVELLE PLACE DE PARKING: GET
router.get("/create", async(req, res, next) => {
    try {
      //récuperation du user
        const user = req.user;
        //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
        if (!user) {
            return res.redirect("/login");
        }
        //vérification si l'utilisateur a le droit de créer des places, 
        //si ne n'est pas le cas alors affichage de l'erreur 403
        if (!user.can("createPlace")) {
            return next(createError(403));
        }
        const parkings = await Parking.findAll();
        const typeVehicules = await TypeVehicule.findAll();
        //Affichage du formulaire de création d'une nouvelle place
        res.render("place-form", { title: "Create place", user, parkings, typeVehicules });
    } catch (error) {
        next(error);
    }
});
//CREATION D'UNE NOUVELLE PLACE DE PARKING: POST
router.post("/create", async(req, res, next) =>
{
  console.log('body', JSON.stringify(req.body))
  try {
    //retrouver une place par la description et la dimension
      const [place, created] = await Place.findOrCreate({
          where: { 
            description: req.body.description,
             dimension: req.body. dimension,
             parkingId: req.body.parkingId,
             
          },
      });
      //affichage de la liste des places
      res.redirect("/tarifs/create");
  } catch (error) {
      next(error);
  }
});
//MISE A JOUR DE LA Place: GET
router.get("/:id", async(req, res, next) => {
  console.log('details')
  try {
    //recupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
          return res.redirect("/login");
      }
       //vérification si l'utilisateur a le droit de modifier des places, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editPlace")) {
          return next(createError(403));
      }
      //recupération de l'id de la place
      const placeId = req.params.id;
       //recherche d'une commune en fonction de la clé primaire
      const place = await Place.findByPk(placeId);
      //affichage de la page de modification
      res.render("place-edit", { title: "Edit place", user, place });
  } catch (error) {
      next(error);
  }
});
//MISE A JOUR DE LA PLACE DE PARKING: POST
router.post("/:id", async(req, res, next) => {
  try {
    //récupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
          return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de modifier les places, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editPlace")) {
          return next(createError(403));
      }
      //recupération de l'id de la place
      const placeId = req.params.id;
       //mise à jour de la place en fonction de son id
      await Place.update(req.body, { where: { id: placeId } });
      res.redirect("/places");
      //redirection ou renvoie vers la page de la liste des places
  } catch (error) {
      next(error);
  }
});
//SUPPRESSION D'UNE PLACE DE PARKING  
router.get("/:id/delete", async (req, res, next) => {
    try {
       //recuperation du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de supprimer des places, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("deletePlace")) {
        return next(createError(403));
      }
      //recupération de l'id de la place
      const placeId = req.params.id;
      //suppression de la place en fonction de son id
      const place = await Place.destroy({ where: { id: placeId } });
      //renvoie vers la page de la liste des places
      res.redirect("/places");
    } catch (error) {
      next(error);
    }
  });
//exportation du router 
module.exports = router;
