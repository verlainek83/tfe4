//intégration de la librairie express 
var express = require('express');
var router = express.Router();
const createError = require("http-errors");
const session = require("express-session");
// importation des differentes modèles à utiliser
const Parking = require('../models/parking');
const Adresse = require('../models/adresse');
const {User} = require('../models/User');

//FONCTION QUI DONNE LA LISTE DE TOUS LES PARKING: GET
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
    if (!user.can("listParkings")) {
      return next(createError(403));
    }
    //recherche de toutes les Locations en fonction du nombre de places
    const parkings = await Parking.findAll({
      order: ["nombrePlaces"],
      include: [Adresse, User ]
    });
    //Affichage de toutes les locations
    res.render("parkings", {
      title: "Liste des parkings",
      parkings,
      user,
      currentUrl: req.originalUrl,
    });
  } catch (error) {
    next(error);
  }
});

//CREATION D'UN NOUVEL PARKING: GET
router.get("/create", async(req, res, next) => {
  try {
      const user = req.user;
      if (!user) {
          return res.redirect("/login");
      }
      if (!user.can("createParking")) {
          return next(createError(403));
      }
      const adresses = await Adresse.findAll();
      const users = await User.findAll();
      res.render("parking-form", { title: "Create parking", user, adresses, users });
  } catch (error) {
      next(error);
  }
});
//CREATION D'UNE NOUVEL PARKING: POST
router.post("/create", async(req, res, next) =>
{
  console.log('body', JSON.stringify(req.body))
  try {
      const [parking, created] = await Parking.findOrCreate({
          where: { 
            nombrePlaces: req.body.nombrePlaces, 
            adresseId: req.body.adresseId,
            userId: req.body.userId,
          },
      });
      res.redirect("/places/create");
  } catch (error) {
      next(error);
  }
});

//Fonction qui donne les details du parking
router.get("/:id/details", async (req, res, next) => {
  try {
    //récupération du user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir le détail des parkings, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("viewParkingDetails")) {
      return next(createError(403));
    }
    //récupération de l'id de la location
    const parkingId = req.params.id;
    //recherche du parking en fonction de la clé primaire
    const parking = await Parking.findByPk(parkingId, {
                                          include: [Adresse, User ]});

    const [adresses] = await Promise.all([ Adresse.findAll()]);
    const [users] = await Promise.all([ User.findAll()]);
    //Affichage des détails du parking en tenant compte des adresse et des utilisateurs
    res.render("parking-details", { title: parking.nom, user, parking, adresses, users});
  } catch (error) {
    next(error);
  }
});

//MISE A JOUR DU PARKING: GET
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
      if (!user.can("editParking")) {
        return next(createError(403));
      }
      //recupération de l'id de la location
      const parkingId = req.params.id;
      //recherche d'un parking en fonction de la clé primaire
      const parking = await Parking.findByPk(parkingId);
      //affichage de la page de modification
      res.render("parking-edit", { title: "Edit parking", user, parking});
    } catch (error) {
      next(error);
    }
});

  //MISE A JOUR DU PARKING: GET
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
    if (!user.can("editParking")) {
      return next(createError(403));
    }
    //recupération de l'id du parking
    const parkingId = req.params.id;
      //mise à jour du parking en fonction de son id
    await Parking.update(req.body, { where: { id: parkingId } });
    //redirection ou renvoie vers la page de la liste des parkings
    res.redirect("/parkings");
  } catch (error) {
    next(error);
  }
});
 
  //liste des parkings par users 
router.get("/:userId", async (req, res) => {
  try {
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir le détail des places, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("viewParkingDetails")) {
      return next(createError(403));
    }
    //récupraion de l'id de la place
    const userId = req.params.userId;
    console.log(userId);
    //recherche du parking en fonction de la clé étrangère
    const parkings = await Parking.findAll({
      where: { 
        userId: userId },
        order: ["nombrePlaces"],
      order: ["nombrePlaces"],
      include: [Adresse, User ]
    });
    console.log([parkings]);
    const [adresses] = await Promise.all([ Adresse.findAll()]);
    const [users] = await Promise.all([ User.findAll()]);
    //Affichage des détails de la place en tenant compte des parkings
    res.render("mesParkings", { title:'mes p', user, parkings, adresses, users });
  } catch (error) {
    next(error);
  }
}); 

//liste des parkings reservés
router.get("/:id/:userId", async (req, res, next) => {
  try {
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir le détail des places, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("viewParkingDetails")) {
      return next(createError(403));
    }
    //récupraion de l'id de la place
    const parkingId = req.params.id;
    const userId = req.params.userId;
    console.log(userId);
    console.log(id);
    //recherche de la place en fonction de la clé primaire
    const [parkings]= await Parking.findByPk(parkingId,{
      where: { 
        userId: userId},
        order: ["nombrePlaces"],
        include: [Adresse, User ]});
    console.log([parkings]);
    const [adresses] = await Promise.all([ Adresse.findAll()]);
    const [users] = await Promise.all([ User.findAll()]);
    //Affichage des détails de la place en tenant compte des parkings
    res.render("mesParkingsDetails", { title:'mes p', user, parkings, adresses, users });
  } catch (error) {
    next(error);
  }    
});

  
  //SUPPRESSION DU PARKING
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
    if (!user.can("deleteParking")) {
      return next(createError(403));
    }
    //recupération de l'id du parking
    const parkingId = req.params.id;
    //suppression du parking en fonction de son id
    const parking = await Parking.destroy({ where: { id: parkingId } });
    //renvoie vers la page de la liste des parkings
    res.redirect("/parkings");
  } catch (error) {
    next(error);
  }
});
//exportation du router
module.exports = router;
