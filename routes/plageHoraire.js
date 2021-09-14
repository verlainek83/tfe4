var express = require('express');
var router = express.Router();
const createError = require("http-errors");
const PlageHoraire = require("../models/plageHoraire");
const Trafic = require("../models/trafic");

//LISTE DE TOUTES LES PLAGES D'HORAIRE: GET
router.get("/", async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.can("listPlageHoraires")) {
        return next(createError(403));
      }
      //recherche de toutes les plages d'horaire
      const plageHoraires = await PlageHoraire.findAll({
        order: ["heureDebut", "heureFin"],
      });
      res.render("plageHoraires", {
        title: "PlageHoraire list",
        plageHoraires,
        user,
        currentUrl: req.originalUrl,
      });
    } catch (error) {
      next(error);
    }
  });
  
  router.get("/:id/details", async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.can("viewPlageHoraireDetails")) {
        return next(createError(403));
      }
      const plageHoraireId = req.params.id;
      const plageHoraire = await PlageHoraire.findByPk(plageHoraireId, {include:Trafic});
      res.render("plageHoraire-details", { title: plageHoraire.adresse, user, plageHoraire });
    } catch (error) {
      next(error);
    }
  });

  //CREATION D'UNe nouvelle plage d'horaire: GET
router.get("/create", async(req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.redirect("/login");
        }
        if (!user.can("createPlageHoraire")) {
            return next(createError(403));
        }
        res.render("plageHoraire-form", { title: "Create plageHoraire", plageHoraire });
    } catch (error) {
        next(error);
    }
});
//CREATION D'UN NOUVEAU TYPE D'USER: POST
router.post("/create", async(req, res, next) =>
{
  console.log('body', JSON.stringify(req.body))
  try {
      const [plageHoraire, created] = await PlageHoraire.findOrCreate({
          where: { 
            heureDebut: req.body.heureDebut,
            heureFin: req.body.heureFin,
          },
      });
      res.redirect("/plageHoraires");
  } catch (error) {
      next(error);
  }
});
//MISE A JOUR DE LA PlageHoraire: GET
router.get("/:id", async(req, res, next) => {
  console.log('details')
  try {
      const user = req.user;
      if (!user) {
          return res.redirect("/login");
      }
      if (!user.can("editPlageHoraire")) {
          return next(createError(403));
      }
      const plageHoraireId = req.params.id;
      const plageHoraire = await PlageHoraire.findByPk(plageHoraireId);
      res.render("plageHoraire-edit", { title: "Edit plageHoraire", user, plageHoraire });
  } catch (error) {
      next(error);
  }
});
//MISE A JOUR Du plageHoraire: POST
router.post("/:id", async(req, res, next) => {
  try {
      const user = req.user;
      if (!user) {
          return res.redirect("/login");
      }
      if (!user.can("editPlageHoraire")) {
          return next(createError(403));
      }
      const plageHoraireId = req.params.id;
      await PlageHoraire.update(req.body, { where: { id: plageHoraireId } });
      res.redirect("/plageHoraires");
  } catch (error) {
      next(error);
  }
});
//SUPPRESSION D'UNE typeUser  
router.get("/:id/delete", async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.can("deletePlageHoraire")) {
        return next(createError(403));
      }
      const plageHoraireId = req.params.id;
      const plageHoraire = await PlageHoraire.destroy({ where: { id: plageHoraireId } });
      res.redirect("/plageHoraires");
    } catch (error) {
      next(error);
    }
  });
 
module.exports = router;
