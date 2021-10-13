//intégration de la librairie express
var express = require('express');
var router = express.Router();
const createError = require("http-errors");
// importation des differentes modèles à utiliser
const Reservation = require('../models/reservation');
// const Location = require('../models/location');
const TypeVehicule = require('../models/typeVehicule');
const Vehicule = require('../models/vehicule');
//LISTE DE TOUTES LES PLACES D'une place: GET
router.get("/", async (req, res, next) => {
    try {
      //recupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
    //vérification si l'utilisateur a le droit de voir la liste des vehicules, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("listVehicules")) {
        return next(createError(403));
      }
      //recherche de tous les vehicules de parking en fonction du
      const vehicules = await Vehicule.findAll({ order: ["numero_immatriculation"], 
                                      include:[TypeVehicule,]});
      //Affichage de toutes les vehicules
      res.render("vehicules", {
        title: "Liste des vehicules",
        vehicules,
        user,
        currentUrl: req.originalUrl,
      });
    } catch (error) {
      next(error);
    }
  });
  //Fonction qui donne les details de la vehiculce
  router.get("/:id/details", async (req, res, next) => {
    try {
      //récupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de voir le détail des vehicules, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("viewVehiculeDetails")) {
        return next(createError(403));
      }
      //récupraion de l'id de la vehicule
      const vehiculeId = req.params.id;
      //recherche du vehicule en fonction de la clé primaire et en tenant compte du
      const vehicule = await Vehicule.findByPk(vehiculeId);
      const [typeVehicules] = await Promise.all([TypeVehicule.findAll()]);
      //Affichage des détails de la vehicule en tenant compte des parkings
      res.render("vehicule-details", { title: vehicule.numero_immatriculation, user, vehicule, typeVehicules });
    } catch (error) {
      next(error);
    }
  });
  //CREATION D'UN NOUVEAU VEHICULE: GET
router.get("/create", async(req, res, next) => {
    try {
      //récuperation du user
        const user = req.user;
        //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
        if (!user) {
            return res.redirect("/login");
        }
        //vérification si l'utilisateur a le droit de créer des vehicules, 
        //si ne n'est pas le cas alors affichage de l'erreur 403
        if (!user.can("createVehicule")) {
            return next(createError(403));
        }
        const typeVehicules = await TypeVehicule.findAll();
        //Affichage du formulaire de création d'une nouvelle vehicule
        res.render("vehicule-form", { title: "Create vehicule", user, typeVehicules });
    } catch (error) {
        next(error);
    }
});
//CREATION D'UN NOUVEAU VEHICULE: POST
router.post("/create", async(req, res, next) =>
{
  console.log('body', JSON.stringify(req.body))
  try {
    //retrouver une vehicule par le numero d'immatriculation
      const [vehicule, created] = await Vehicule.findOrCreate({
          where: { 
            numero_immatriculation: req.body.numero_immatriculation,
            typeVehiculeId: req.body.typeVehiculeId,
            // locationId: req.body.locationId,
          },
      });
      //affichage de la liste des vehicules
      res.redirect("/reservations/create");
  } catch (error) {
      next(error);
  }
});

//CREATION D'UN NOUVEAU VEHICULE: GET
router.get("/createLocation", async(req, res, next) => {
  try {
    //récuperation du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
          return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de créer des vehicules, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("createVehicule")) {
          return next(createError(403));
      }
      const typeVehicules = await TypeVehicule.findAll();
      //Affichage du formulaire de création d'une nouvelle vehicule
      res.render("vehicule-form", { title: "Create vehicule", user, typeVehicules });
  } catch (error) {
      next(error);
  }
});
//CREATION D'UN NOUVEAU VEHICULE: POST
router.post("/createlocation", async(req, res, next) =>
{
console.log('body', JSON.stringify(req.body))
try {
  //retrouver une vehicule par le numero d'immatriculation
    const [vehicule, created] = await Vehicule.findOrCreate({
        where: { 
          numero_immatriculation: req.body.numero_immatriculation,
          typeVehiculeId: req.body.typeVehiculeId,
          // locationId: req.body.locationId,
        },
    });
    //affichage de la liste des vehicules
    res.redirect("/locations/create");
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
       //vérification si l'utilisateur a le droit de modifier des vehicules, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editVehicule")) {
          return next(createError(403));
      }
      //recupération de l'id de la vehicule
      const vehiculeId = req.params.id;
       //recherche d'un vehicule en fonction de la clé primaire
      const vehicule = await Vehicule.findByPk(vehiculeId);
      //affichage de la page de modification
      res.render("vehicule-edit", { title: "Edit vehicule", user, vehicule });
  } catch (error) {
      next(error);
  }
});
//MISE A JOUR DU VEHICULE: POST
router.post("/:id", async(req, res, next) => {
  try {
    //récupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
          return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de modifier les vehicules, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editVehicule")) {
          return next(createError(403));
      }
      //recupération de l'id de la vehicule
      const vehiculeId = req.params.id;
       //mise à jour de la vehicule en fonction de son id
      await Vehicule.update(req.body, { where: { id: vehiculeId } });
      res.redirect("/vehicules");
      //redirection ou renvoie vers la page de la liste des vehicules
  } catch (error) {
      next(error);
  }
});
//SUPPRESSION D'UN VEHICULE  
router.get("/:id/delete", async (req, res, next) => {
    try {
       //recuperation du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de supprimer des vehicules, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("deleteVehicule")) {
        return next(createError(403));
      }
      //recupération de l'id de la vehicule
      const vehiculeId = req.params.id;
      //suppression de la vehicule en fonction de son id
      const vehicule = await Vehicule.destroy({ where: { id: vehiculeId } });
      //renvoie vers la page de la liste des vehicules
      res.redirect("/vehicules");
    } catch (error) {
      next(error);
    }
  });
//exportation du router 
module.exports = router;
