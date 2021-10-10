const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const express = require("express");
const logger = require("morgan");
const passport = require("passport");
const path = require("path");
const session = require("express-session");

const LocalStrategy = require("passport-local").Strategy;

const { User, Role, Permission} = require("./models/User");
const Publication = require("./models/publication");
const Region = require("./models/region");
const Commune = require("./models/commune");
const Adresse = require("./models/adresse");
const Parking = require("./models/parking");
const Place = require("./models/place");
const TypeVehicule = require("./models/typeVehicule");
const Tarif = require("./models/tarif");
const Vehicule = require("./models/vehicule");
const Reservation = require("./models/reservation");
const Location = require("./models/location");
const Trafic = require("./models/trafic");
const PlageHoraire = require("./models/plageHoraire");

// require("./models/populateDb");

const indexRouter = require("./routes/index");
const publicationRouter = require("./routes/publication");
const regionRouter = require("./routes/region");
const communeRouter = require("./routes/commune");
const adresseRouter = require("./routes/adresse");
const parkingRouter = require("./routes/parking");
const placeRouter = require("./routes/place");
const typeVehiculeRouter = require("./routes/typeVehicule");
const tarifRouter = require("./routes/tarif");
const vehiculeRouter = require("./routes/vehicule");
const reservationRouter = require("./routes/reservation");
const locationRouter = require("./routes/location");
const traficRouter = require("./routes/trafic");
const plageHoraireRouter = require("./routes/plageHoraire");
const dashboardRouter = require("./routes/dashboard"); 
const roleRouter = require("./routes/index");
const userRouter = require("./routes/index");

const app = express();

const cookieSigningKey = "My secured signing key";

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(cookieSigningKey));
app.use(
  session({ secret: cookieSigningKey, saveUninitialized: false, resave: false })
);
app.use(express.static(path.join(__dirname, "public")));

// authentication setup
app.use(passport.initialize());
// pauseStream is needed because passport.deserializeUser uses async.
app.use(passport.session({ pauseStream: true }));
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findByPk(username);
      // const user = await User.findOne({where:{username:username}});
      if (user && (await user.validPassword(password))) {
        done(null, user);
      } else {
        return done(null, false, { message: "Incorrect username or password" });
      }
    } catch (error) {
      done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.username);
});
passport.deserializeUser(async (username, done) => {
  try {
    // const user = await User.findOne({where:{username: username}}, {
    const user = await User.findByPk(username, 
      {
      include: {
        model: Role,
        as: 'roles', 
        include: {
          model: Permission,
          required: false,
        }
      }
      }
    );
    done(null, user);
  } catch (error) {
    done(error);
  }
});
app.use("/", indexRouter);
app.use("/publications", publicationRouter);
app.use("/regions", regionRouter);
app.use("/communes", communeRouter);
app.use("/adresses", adresseRouter);
app.use("/parkings", parkingRouter);
app.use("/places", placeRouter);
app.use("/typeVehicules", typeVehiculeRouter);
app.use("/tarifs", tarifRouter);
app.use("/vehicules", vehiculeRouter);
app.use("/reservations", reservationRouter);
app.use("/locations", locationRouter);
app.use("/trafics", traficRouter);
app.use("/plageHoraires", plageHoraireRouter);
app.use("/dashboard", dashboardRouter);
app.use("/mesparkings", indexRouter);
app.use(function(req, res, next){
  res.locals.user = req.user;
  next();
});
app.use("/roles", roleRouter);
app.use("/users", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;