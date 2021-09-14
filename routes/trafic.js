var express = require('express');
var router = express.Router();
const createError = require("http-errors");
const session = require("express-session");
const Trafic = require("../models/trafic");
// const Tarif = require('../models/tarif');
// const PlageHoraire = require('../models/plageHoraire');

//FONCTION QUI DONNE LA LISTE DE TOUS LES TARIFS: GET
router.get("/", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect("/login");
    }
    if (!user.can("listTrafics")) {
      return next(createError(403));
    }
    //recherche de tous les tarifs 
    const trafics = await Trafic.findAll({
      order: ["nom"],
    });
    res.render("trafics", {
      title: "Trafic list",
      trafics,
      user,
      currentUrl: req.originalUrl,
    });
  } catch (error) {
    next(error);
  }
});
//Fonction qui donne les details de la Trafic
router.get("/:id/details", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect("/login");
    }
    if (!user.can("viewTraficDetails")) {
      return next(createError(403));
    }
    const traficId = req.params.id;
    const trafic = await Trafic.findByPk(traficId);
    const [plageHoraires] = await Promise.all([ PlageHoraire.findAll()]);
    res.render("trafic-details", { title: trafic.nom, user , trafic, plageHoraires});
  } catch (error) {
    next(error);
  }
});

  //CREATION D'UN NOUVEAU TRAFIC: GET
router.get("/create", async(req, res, next) => {
  try {
      const user = req.user;
      if (!user) {
          return res.redirect("/login");
      }
      if (!user.can("createTrafic")) {
          return next(createError(403));
      }
      res.render("trafic-form", { title: "Create Trafic", user });
  } catch (error) {
      next(error);
  }
});
//CREATION D'UNE NOUVELLE TRAFIC: POST
router.post("/create", async(req, res, next) =>
{
  console.log('body', JSON.stringify(req.body))
  try {
      const [trafic, created] = await Trafic.findOrCreate({
          where: { 
            nom: req.body.nom,
            moment: req.body.moment
          },
      });
      res.redirect("/tarifs");
  } catch (error) {
      next(error);
  }
});
  //MISE A JOUR DU TARIF GET
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
  //MISE A JOUR Du Tarif: Post
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
