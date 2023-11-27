"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware to use jwt token to get user information from it. */
function authenticateJWT(req, res, next) {
    try {
        const tokenFromBody = req.body._token || req.query._token;
        const payload = jwt.verify(tokenFromBody, SECRET_KEY);
        req.user = payload; // set the user to the payload of the JWT
        return next();
    } catch (err) {
        return next(); // if there's an error, move on
    }
}

/** Middleware to use when they must be logged in. */
function ensureLoggedIn(req, res, next) {
    if (!req.user) {
        return next(new UnauthorizedError("Unauthorized"));
    }
    return next();
}

/** Middleware to use when they must be an admin. */
function adminRequired(req, res, next) {
    try {
        if (!req.user || !req.user.is_admin) {
            throw new UnauthorizedError("Admin access required.");
        }
        return next();
    } catch (err) {
        return next(err);
    }
}

/** Middleware to use when they must provide a correct username & be an admin or be that user. */
function ensureCorrectUserOrAdmin(req, res, next) {
    try {
        const user = res.locals.user;
        if (!(user && (user.is_admin || user.username === req.params.username))) {
            throw new UnauthorizedError();
        }
        return next();
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    adminRequired,
    ensureCorrectUserOrAdmin,
};
