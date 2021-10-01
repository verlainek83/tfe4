var express = require('express');
var router = express.Router();
var passport = require('passport');
const session = require("express-session");
const bcrypt = require("bcrypt");
const { User, Role } = require("../models/User");


router.get("/roles", async(req, res, next) => {
    try {
        // const user = req.user;
        // if (!user) {
        //     return res.redirect("/login");
        // }
        // if (!user.can("listRoles")) {
        //     return next(createError(403));
        // }
        const roles = await Role.findAll({
            order: ["name"],
        });
        res.render("roles", {
            title: "Role list",
            roles,
            user,
            currentUrl: req.originalUrl,
        });
    } catch (error) {
        next(error);
    }
});


router.post("/roles", async(req, res, next)=>{
    res.render("roles");
});

router.get("/:id/details", async(req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.redirect("/login");
        }
        if (!user.can("viewRoleDetails")) {
            return next(createError(403));
        }
        const roleId = req.params.id;
        const role = await Role.findByPk(roleId);
        res.render("role-details", { title: role.name, user, role });
    } catch (error) {
        next(error);
    }
});

router.get("/:id/delete", async(req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.redirect("/login");
        }
        if (!user.can("deleteRole")) {
            return next(createError(403));
        }
        const roleId = req.params.id;
        const role = await Role.destroy({ where: { id: roleId } });
        res.redirect("/roles");
    } catch (error) {
        next(error);
    }
});

router.get("/create", async(req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.redirect("/login");
        }
        if (!user.can("createRole")) {
            return next(createError(403));
        }
        // const machine = await Machine.bulkCreate({name: req.body.name, tarif: req.body.price });
        // res.render("machine-form", { title: "Create machine", user, machine });
        res.render("role-form", { title: "Create role", user });
    } catch (error) {
        next(error);
    }
});

router.post("/create", async(req, res, next) =>
{
    console.log('body', JSON.stringify(req.body))
    try {
        const [role, created] = await Role.findOrCreate({
            where: { name: req.body.name},
        });
        res.redirect("/roles");
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async(req, res, next) => {
    console.log('details');
    try {
        const user = req.user;
        if (!user) {
            return res.redirect("/login");
        }
        if (!user.can("editRole")) {
            return next(createError(403));
        }
        const roleId = req.params.id;
        const role = await Role.findByPk(roleId);
        res.render("role-edit", { title: "Edit role", user, role });
    } catch (error) {
        next(error);
    }
});

router.post("/:id", async(req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.redirect("/login");
        }
        if (!user.can("editRole")) {
            return next(createError(403));
        }
        const roleId = req.params.id;
        await Role.update(req.body, { where: { id: roleId } });
        res.redirect("/roles");
    } catch (error) {
        next(error);
    }
});

module.exports = router;
