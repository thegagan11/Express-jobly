"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { adminRequired, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const User = require("../models/user");

const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = new express.Router();

/** POST / { user } => { user }
 *
 * Creates a new user. Data required: { username, password, firstName, lastName, email, isAdmin }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin
 */
router.post("/", adminRequired, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
});

/** GET / => { users: [ {username, firstName, lastName, email, isAdmin}, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 */
router.get("/", adminRequired, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username => { user: {username, firstName, lastName, email, isAdmin, jobs} }
 *
 * Returns detailed info on a specific user, including job applications.
 *
 * Authorization required: correct user or admin
 */
router.get("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /:username { userUpdateData } => { user }
 *
 * Updates user data.
 *
 * Data can include: { firstName, lastName, password, email, isAdmin }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: correct user or admin
 */
router.patch("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /:username => { deleted: username }
 *
 * Deletes a user.
 *
 * Authorization required: correct user or admin
 */
router.delete("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});

/** POST /:username/jobs/:id => { applied: jobId }
 *
 * Allows a user to apply for a job (or an admin to do it for them).
 * Returns { applied: jobId }
 *
 * Authorization required: correct user or admin
 */
router.post("/:username/jobs/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const username = req.params.username;
    const jobId = req.params.id;

    await User.applyForJob(username, jobId);
    return res.status(201).json({ applied: jobId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
