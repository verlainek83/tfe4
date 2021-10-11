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
      res.render("reservation-edit", { title: "Edit reservation", user, reservation });
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

  function getValidation(req, res, next) {
    req.validationReservation = true;
    if (req.validationReservation) {
      res.send("réservation validée.")
    } else {
      next()
    }
  };

  function validationRes(reservation){
    const reservation = await Reservation.findByPk(id);
    const result = Joi.validate(req.body, reservation);
  }

  //affichage des resevations valideés
  router.get("/:id/:validationReservation", async(req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      // if (!user.can("editReservation")) {
      //   return next(createError(403));
      // }
      const reservationId = req.params.id;
      
      if (req.user.roles[0].name === 'manager' || req.user.roles[0] === 'proprietaire') {
        const validationRes = req.params.validationReservation;
        const reservations = await Reservation.findAll({
          where: { validationReservation: validationRes},
          include: User,
        });
      }      
      res.render("reservation-form", { title: "Edit reservation", user, reservations });
    } catch (error) {
      next(error);
    }
  });

//LISTE DES RESERVATIONS APPARTENANT AU PARKING AYANT CET ID
router.get("/:placeId", async(req, res, next) => {
  try {
    const user = req.user;
    //vérification s'il y a un utilisateur connecté, sinon renvoie a la page de connection
    if (!user) {
      return res.redirect("/login");
    }
    //vérification si l'utilisateur a le droit de voir le détail des places, 
    //si ne n'est pas le cas alors affichage de l'erreur 403
    if (!user.can("viewReservationDetails")) {
      return next(createError(403));
    }
    //récupraion de l'id de la place
    const placeId = req.params.placeId;
    console.log(placeId);
    //recherche du parking en fonction de la clé étrangère
    const parkings = await Parking.findAll({
      where: { 
        placeId: placeId },
      include: [ User, Place, Vehicule ]
    });
    console.log([parkings]);
    const [users] = await Promise.all([ User.findAll()]);
    const [places] = await Promise.all([Place.findAll()]);
    const [vehicules] = await Promise.all([Vehicule.findAll()]);
    //Affichage des détails de la place en tenant compte des parkings
    res.render("mesParkings", { title:'mes p', user, parkings, users, places, vehicules});
  } catch (error) {
    next(error);
  }
});

//DETAIL DE LA RESERVATION APPARTENANT AU PARKING AYANT CET ID
  router.get("/:id/:placeId", async(req, res, next) => {

  });

// reservations par utilisateurs
router.get("/:userId", async (req, res) => {
  const user = req.user;
  const userId = req.params.userId;
  const reservations = await reservations.findAll({
    where: { userId: userId},
    include: User,
  });
  const users = await User.findAll();

  res.render("mesReservations", {
    title: "Role list",
    user,
    reservations,
    users,
    currentUrl: req.originalUrl,
  });
});

//reservation of client requests
router.get("/:id/:userId", async (req, res) => {
  // Access userId via: req.params.userId
  // Access bookId via: req.params.bookId
  const user = req.user;
  const userId = req.params.userId;
  const reservationId = req.params.id;
  const reservations = await reservations.findByPk(reservationId, {
    where: { userId: userId},
    include: User,
  });
  const users = await User.findAll();
  // res.send(req.params);
  res.render("mesReservationsde", {
    title: "Role list",
    user,
    reservations,
    users,
    currentUrl: req.originalUrl,
});
});
  //POST /parkings/:id/reservations
  //PUT /parking/:id/reservations/:idReservation
  //DELETE /parking/:id/reservations/:idReservation

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

module.exports = router;
