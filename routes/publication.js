//intégration de la librairie express 
var express = require('express');
var router = express.Router();
const createError = require("http-errors");
// importation des differentes modèles à utiliser
const Publication = require('../models/publication');
const {User} = require('../models/User');

//FONCTION QUI DONNE LA LISTE DE TOUTES LES PUBLICATIONS: GET
router.get("/", async (req, res, next) => {
  try {
    //récupération du user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir la liste des publications, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("listPublications")) {
      return next(createError(403));
    }
    //recherche de toutes les publications 
    const publications = await Publication.findAll({
      order: ["description"],
      include:['user'],
    });
    //Affichage de toutes les publications
    res.render("publications", {
      title: "Publication list",
      publications,
      user,
      currentUrl: req.originalUrl,
    });
  } catch (error) {
    next(error);
  }
});
//Fonction qui donne les details de la publication
router.get("/:id/details", async (req, res, next) => {
  try {
    //récupération du user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir le détail des publications, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("viewPublicationDetails")) {
      return next(createError(403));
    }
    //récupraion de l'id de la publication
    const publicationId = req.params.id;
    //recherche de la publiction en fonction de la clé primaire 
    const publication = await Publication.findByPk(publicationId);
    const [users] = await Promise.all([User.findAll()]);
    //Affichage des détails de la publication
    res.render("publication-details", { title: publication.description, user, publication, users });
  } catch (error) {
    next(error);
  }
});
//CREATION D'UNe nouvelle publication: GET
router.get("/create", async(req, res, next) => {
  try {
    //récupération du user
      const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
          return res.redirect("/login");
      }
     //vérification si l'utilisateur a le droit de créer des publications, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("createPublication")) {
          return next(createError(403));
      }
      const users = await User.findAll();
      //Affichage du formulaire de création d'une nouvelle publication
      res.render("publication-form", { title: "Créer une Publication", user, users });
  } catch (error) {
      next(error);
  }
});
//CREATION D'UNE NOUVELLE PUBLICATION: POST
router.post("/create", async(req, res, next) =>
{
  console.log('body', JSON.stringify(req.body))
  try {
      //retrouver une publication par la description
      const [publication, created] = await Publication.findOrCreate({
          where: { 
            description: req.body.description,
            userId: req.body.userId,
          },
      });
      //affichage de la liste des publications
      res.redirect("/places");
  } catch (error) {
      next(error);
  }
});
  //MISE A JOUR DE LA PUBLICATION: GET
  router.get("/:id", async (req, res, next) => {
    try {
     //recupération du user
      const user = req.user;
      //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de modifier des publications, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editPublication")) {
        return next(createError(403));
      }
      //recupération de l'id de l'adresse
      const publicationId = req.params.id;
      //recherche d'une adresse en fonction de la clé primaire
      const publication = await Publication.findByPk(publicationId);
      //affichage de la page de modification
      res.render("publication-edit", { title: "Editer la publication", user, publication });
    } catch (error) {
      next(error);
    }
  });
  //MISE A JOUR DU publication: Post
  router.post("/:id", async (req, res, next) => {
    try {
    //recupération du user
      const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
      if (!user) {
        return res.redirect("/login");
      }
      //vérification si l'utilisateur a le droit de modifier des publications, 
      //si ne n'est pas le cas alors affichage de l'erreur 403
      if (!user.can("editPublication")) {
        return next(createError(403));
      }
      //récupération de l'id de la publication
      const publicationId = req.params.id;
      //mise à jour de la publication en fonction de son id
      await Publication.update(req.body, { where: { id: publicationId } });
      //redirection ou renvoie vers la page de la liste des publications
      res.redirect("/publications");
    } catch (error) {
      next(error);
    }
  });
//SUPPRESSION DE LA publicatION
router.get("/:id/delete", async (req, res, next) => {
  try {
    //récupération de l'user
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de supprimer des publications, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("deletePublication")) {
      return next(createError(403));
    }
    //recupération de l'id de la publication
    const publicationId = req.params.id;
    //suppression de la publication en fonction de son id
    const publication = await Publication.destroy({ where: { id: publicationId } });
    //renvoie vers la page de la liste des publications
    res.redirect("/publications");
  } catch (error) {
    next(error);
  }
});
//exportation du router 
module.exports = router;
