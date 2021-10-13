//intégration de la librairie express 
var express = require('express');
var router = express.Router();
const createError = require("http-errors");
// importation des differentes modèles à utiliser
const Adresse= require('../models/adresse');
// const Parking = require('../models/parking');
const Commune = require('../models/commune');
const {User} = require('../models/User');
//FONCTION QUI DONNE LA LISTE DE TOUTES LES Adresses: GET
router.get("/", async (req, res, next) => {
  try { 
    //recupération du user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir la liste des adresses, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("listAdresses")) {
      return next(createError(403));
    }
    //recherche de toutes les Adresses en fonction du nom et du munero 
    const adresses = await Adresse.findAll({
                  order: ["nom", "numero"], 
                  include:[Commune]});
    //Affichage de toutes les adresses
    res.render("adresses", {
      title: "Liste des Adresses",
      adresses,
      user,
      currentUrl: req.originalUrl,
    });
  } catch (error) {
    next(error);
  }
});
//Fonction qui donne les details de l'Adresse
router.get("/:id/details", async (req, res, next) => {
  try {
    //récupération du user
    const user = req.user;
     //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir le détail des adresses, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("viewAdresseDetails")) {
      return next(createError(403));
    }
    //récupraion de l'id de l'adresse
    const adresseId = req.params.id;
    //recherche de l'adresse en fonction de la clé primaire et en tenant compte de la comune
    const adresse = await Adresse.findByPk(adresseId, {include: [Commune]});
    const [communes] = await Promise.all([Commune.findAll()]);
    //Affichage des détails de l'adresse en tenant compte de la table adresse
    res.render("adresse-details", { title: adresse.nom, user, adresse, communes });
  } catch (error) {
    next(error);
  }
});
//CREATION D'UNE NOUVELLE ADRESSE: GET
router.get("/create", async(req, res, next) => {
  try {
    //récupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
          return res.redirect("/login");
      }
    //vérification si l'utilisateur a le droit de créer des adresses, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("createAdresse")) {
          return next(createError(403));
      }
      const communes = await Commune.findAll();
      //Affichage du formulaire de création d'une nouvelle adresse
      res.render("adresse-form", { title: "Create Adresse", user, communes });
  } catch (error) {
      next(error);
  }
});
//CREATION D'UNE NOUVELLE Adresse: POST
router.post("/create", async(req, res, next) =>
{
  console.log('body', JSON.stringify(req.body))
  try {
      //retrouver une adresse par le nom et le numero 
      const [adresse, created] = await Adresse.findOrCreate({
          where: { 
            nom: req.body.nom,
            numero: req.body.numero,
            communeId: req.body.communeId,
          },
      });
      //affichage de la liste des adresses
      res.redirect("/parkings/create");
  } catch (error) {
      next(error);
  }
});
  //MISE A JOUR DE L'ADRESSE': GET
router.get("/:id", async (req, res, next) => {
    try {
      //recupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de modifier des adresses, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editAdresse")) {
        return next(createError(403));
      }
      //recupération de l'id de l'adresse
      const adresseId = req.params.id;
      //recherche d'une adresse en fonction de la clé primaire
      const adresse = await Adresse.findByPk(adresseId);
      //affichage de la page de modification
      res.render("adresse-edit", { title: "Edit adresse", user, adresse });
    } catch (error) {
      next(error);
    }
});
  //MISE A JOUR De la Adresse: Post
router.post("/:id", async (req, res, next) => {
    try {
      //recupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de modifier des adresses, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editAdresse")) {
        return next(createError(403));
      }
      //récupération de l'id de l'adresse
      const adresseId = req.params.id;
      //mise à jour de l'adresse en fonction de son id
      await Adresse.update(req.body, { where: { id: adresseId } });
      //redirection ou renvoie vers la page de la liste des adresses
      res.redirect("/adresses");
    } catch (error) {
      next(error);
    }
});
//SUPPRESSION DE L'ADRESSE
router.get("/:id/delete", async (req, res, next) => {
  try {
    //récupération de l'user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
     //vérification si l'utilisateur a le droit de supprimer des adresses, 
     //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("deleteAdresse")) {
      return next(createError(403));
    }
    //recupération de l'id de l'adresse
    const adresseId = req.params.id;
    //suppression de l'adresse en fonction de son id
    const adresse = await Adresse.destroy({ where: { id: adresseId } });
    //renvoie vers la page de la liste des adresses
    res.redirect("/adresses");
  } catch (error) {
    next(error);
  }
});
//exportation du router 
module.exports = router;
