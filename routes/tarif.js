//intégration de la librairie express
var express = require('express');
var router = express.Router();
const createError = require("http-errors");
const session = require("express-session");
// importation des differentes modèles à utiliser
const Trafic = require('../models/trafic');
const TypeVehicule = require('../models/typeVehicule');
const Tarif = require("../models/tarif");
const Parking = require('../models/parking');
//FONCTION QUI DONNE LA LISTE DE TOUS LES TARIFS: GET
router.get("/", async (req, res, next) => {
  try {
    //recupération du user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir la liste des tarifs, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("listTarifs")) {
      return next(createError(403));
    }
    //RECHERCHE DE TOUS LES TARIFS en fonction du montant
    const tarifs = await Tarif.findAll({
      order: ["montant"],
      include:[Parking, Trafic, TypeVehicule]});
    //Affichage de toutes les tarifs
    res.render("tarifs", {
      title: "Tarif list",
      tarifs,
      user,
      currentUrl: req.originalUrl,
    });
  } catch (error) {
    next(error);
  }
});
//FONCTION QUI AFFICHE LES DETAILS DU TARIF
router.get("/:id/details", async (req, res, next) => {
  try {
    //récupération du user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir le détail des tarifs, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("viewTarifDetails")) {
      return next(createError(403));
    }
    //récupraion de l'id du tarif
    const tarifId = req.params.id;
    //recherche du tarif en fonction de la clé primaire
    const tarif = await Tarif.findByPk(tarifId, {
        include: [ Trafic, Parking, TypeVehicule]
    });
    const [trafics] = await Promise.all([ Trafic.findAll()]);
    const [parkings] = await Promise.all([ Parking.findAll()]);
    const [typeVehicules] = await Promise.all([ TypeVehicule.findAll()]);
    //Affichage des détails du tarif
    res.render("tarif-details", { title: tarif.nom, user, tarif, trafics, parkings, typeVehicules });
  } catch (error) {
    next(error);
  }
});
//CREATION D'UN NOUVEAU TARIF: GET
router.get("/create", async(req, res, next) => {
  try {
    //récuperation du user
      const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
          return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de créer des tarifs, 
        //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("createTarif")) {
          return next(createError(403));
      }
      //Affichage du formulaire de création d'un nouveau tarif
      const typeVehicules = await TypeVehicule.findAll();
      const parkings = await Parking.findAll();
      const trafics = await Trafic.findAll();
      res.render("tarif-form", { title: "Create Tarif", user, typeVehicules, parkings, trafics});
  } catch (error) {
      next(error);
  }
});
//CREATION D'UNE NOUVEAU TARIF: POST
router.post("/create", async(req, res, next) =>
{
  console.log('body', JSON.stringify(req.body))
  try {
      //retrouver un tarif par le montant
      const [tarif, created] = await Tarif.findOrCreate({
          where: { 
            montant: req.body.montant,
            typeVehiculeId: req.body.typeVehiculeId,
            parkingId: req.body.parkingId,
            traficId: req.body.traficId,            
          },
      });
       //affichage de la liste des tarifs
      res.redirect("/publications/create");
  } catch (error) {
      next(error);
  }
});
  //MISE A JOUR DU Tarif: GET
  router.get("/:id", async (req, res, next) => {
    try {
      
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.can("editTarif")) {
        return next(createError(403));
      }
      const tarifId = req.params.id;
      const tarif = await Tarif.findByPk(tarifId);
      res.render("tarif-edit", { title: "Edit tarif", user, tarif });
    } catch (error) {
      next(error);
    }
  });
  //MISE A JOUR DU TARIF: Post
  router.post("/:id", async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.can("editTarif")) {
        return next(createError(403));
      }
      const tarifId = req.params.id;
      await Tarif.update(req.body, { where: { id: tarifId } });
      res.redirect("/tarifs");
    } catch (error) {
      next(error);
    }
  });
//SUPPRESSION DU TARIF
router.get("/:id/delete", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect("/login");
    }
    if (!user.can("deleteTarif")) {
      return next(createError(403));
    }
    const tarifId = req.params.id;
    const tarif = await Tarif.destroy({ where: { id: tarifId } });
    res.redirect("/tarifs");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
