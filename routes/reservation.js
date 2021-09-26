var express = require('express');
var router = express.Router();
const createError = require("http-errors");
var passport = require('passport');
const session = require("express-session");
const bcrypt = require("bcrypt");
const Reservation = require('../models/reservation');
const Place = require('../models/place');
const Vehicule = require("../models/vehicule");
const {User} = require("../models/User");

//LISTE DE TOUTES LES RESERVATIONS: GET
router.get("/", async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.can("listReservations")) {
        return next(createError(403));
      }
      //recherche de toutes les réservations
      const reservations = await Reservation.findAll({
        order: ["codeReservation", "dateReservation"],
        include:['user', 'place', 'vehicule']
      });
      res.render("reservations", {
        title: "Reservation list",
        reservations,
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
      if (!user.can("viewReservationDetails")) {
        return next(createError(403));
      }
      const reservationId = req.params.id;
      const reservation = await Reservation.findByPk(reservationId);
      res.render("reservation-details", { title: reservation.codeReservation, user, reservation });
    } catch (error) {
      next(error);
    }
  });

  //CREATION D'UNE NOUVELLE RESERVATION: GET
router.get("/create", async(req, res, next) => {
  try {
      const user = req.user;
      if (!user) {
          return res.redirect("/login");
      }
      if (!user.can("createReservation")) {
          return next(createError(403));
      }
      const vehicules = await Vehicule.findAll();
      res.render("reservation-form", { title: "Create reservation", user, vehicules });
  } catch (error) {
      next(error);
  }
});
//CREATION D'UNE NOUVELLE RESERVATION: POST
router.post("/create", async(req, res, next) =>
{
  console.log('body', JSON.stringify(req.body))
  try {
      const [reservation, created] = await Reservation.findOrCreate({
          where: { 
            codeReservation: req.body.codeReservation, 
            dateReservation: req.body.dateReservation,
            dateOccupation: req.body.dateOccupation,
            dateDepart: req.body.dateDepart,
            heureArrivee: req.body.heureArrivee,
            heureDepart: req.body.heureDepart,
            validationReservation: req.body.validationReservation,
            // coutTotalReservation: req.body.coutTotalReservation,
            numeroImmatriculation: req.body. numeroImmatriculation
          },
      });
      res.redirect("/reservations");
  } catch (error) {
      next(error);
  }
});
 //SUPPRESSION D'UNE RESERVATION: POST 
  router.get("/:id/delete", async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.can("deleteReservation")) {
        return next(createError(403));
      }
      const reservationId = req.params.id;
      const reservation = await Reservation.destroy({ where: { id: reservationId } });
      res.redirect("/reservations");
    } catch (error) {
      next(error);
    }
  });
 //MISE A JOUR D'UNE RESERVATION: GET
  router.get("/:id", async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.can("editReservation")) {
        return next(createError(403));
      }
      const reservationId = req.params.id;
      const reservation = await Reservation.findByPk(reservationId);
      res.render("reservation-form", { title: "Edit reservation", user, reservation });
    } catch (error) {
      next(error);
    }
  });
  //MISE A JOUR D'UNE RESERVATION: POST
  router.post("/:id", async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.can("editReservation")) {
        return next(createError(403));
      }
      const reservationId = req.params.id;
      await Reservation.update(req.body, { where: { id: reservationId } });
      res.redirect("/reservations");
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
