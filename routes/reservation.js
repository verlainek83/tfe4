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
        include:[User, Place, Vehicule]
      });
      console.log(reservations);
      res.render("reservations", {
        title: "Reservation list",
        reservations,
        user,
        currentUrl: req.originalUrl,
      });
    } catch (error) {
      // next(error('unable to see'));
      throw new Error('Pas de reservations trouvées')
    }
  });
  
  // router.get("/users/:username", async(req,res) => {
  //   console.log(req.params);
  //   console.log(req.body);
  //   const user = await Reservation.findOne({
  //     where: { 
  //       userUsername: req.params.username
  //     },
  //     include: User,
  //   });
  //   console.log(user);
  //   res.status(200);
  //   res.send(req.params.username);
  // });

// router.get("/:username",async(req,res,next) => {
//   try {
//     console.log(req.params);
//     console.log(req.body);
//     const user = await Reservation.findOne({
//       where: { 
//         userUsername: req.params.username
//       },
//       // include: User,
//     });
//     console.log(user);
//       res.render("account", {
//         title: "Reservation list",
//         mesReservations,
//         user,
//         currentUrl: req.originalUrl,
//       });
//   } catch (error) {
//     next(error('unable to see'));
//   }
// });

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
      const places = await Place.findAll();
      const users = await User.findAll();
      res.render("reservation-form", { title: "Create reservation", user, vehicules, places, users});
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
            vehiculeId: req.body. vehiculeId,
            placeId: req.body.placeId,
            userId: req.body.userId,

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
