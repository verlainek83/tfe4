var express = require('express');
var router = express.Router();
const createError = require("http-errors");
const Region = require('../models/region');
const Commune = require('../models/commune');

//FONCTION QUI DONNE LA LISTE DE TOUTES LES REGIONS: GET
router.get("/", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect("/login");
    }
    if (!user.can("listRegions")) {
      return next(createError(403));
    }
    //recherche de toutes les regions 
    const regions = await Region.findAll({
      order: ["nom"],
    });
    res.render("regions", {
      title: "Region list",
      regions,
      user,
      currentUrl: req.originalUrl,
    });
  } catch (error) {
    next(error);
  }
});
//Fonction qui donne les details de la region
router.get("/:id/details", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect("/login");
    }
    if (!user.can("viewRegionDetails")) {
      return next(createError(403));
    }
    const regionId = req.params.id;
    const region = await Region.findByPk(regionId);
    res.render("region-details", { title: region.nom, user, region });
  } catch (error) {
    next(error);
  }
});

  //CREATION D'UNe nouvelle region: GET
router.get("/create", async(req, res, next) => {
  try {
      const user = req.user;
      if (!user) {
          return res.redirect("/login");
      }
      if (!user.can("createRegion")) {
          return next(createError(403));
      }
      res.render("region-form", { title: "Create Region", user });
  } catch (error) {
      next(error);
  }
});
//CREATION D'UNE NOUVELLE REGION: POST
router.post("/create", async(req, res, next) =>
{
  console.log('body', JSON.stringify(req.body))
  try {
      const [region, created] = await Region.findOrCreate({
          where: { 
            nom: req.body.nom,
          },
      });
      res.redirect("/regions");
  } catch (error) {
      next(error);
  }
});
  //MISE A JOUR DE LA REGION: GET
  router.get("/:id", async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.can("editRegion")) {
        return next(createError(403));
      }
      const regionId = req.params.id;
      const region = await Region.findOne({where:{regionId: regionId}});
      res.render("region-edit", { title: "Edit region", user, region });
    } catch (error) {
      next(error);
    }
  });
  //MISE A JOUR DU Region: Post
  router.post("/:id", async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.can("editRegion")) {
        return next(createError(403));
      }
      const regionId = req.params.id;
      await Region.update(req.body, { where: { id: regionId } });
      res.redirect("/regions");
    } catch (error) {
      next(error);
    }
  });
//SUPPRESSION DE LA REGION
router.get("/:id/delete", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect("/login");
    }
    if (!user.can("deleteRegion")) {
      return next(createError(403));
    }
    const regionId = req.params.id;
    const region = await Region.destroy({ where: { id: regionId } });
    res.redirect("/regions");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
