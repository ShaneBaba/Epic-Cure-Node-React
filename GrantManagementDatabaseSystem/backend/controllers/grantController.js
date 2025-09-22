const Grant = require("../models/grantModel");

function getGrants(req, res) {
  res.json(Grant.getAllGrants());
}

function createGrant(req, res) {
  const newGrant = Grant.addGrant(req.body);
  res.status(201).json(newGrant);
}

module.exports = { getGrants, createGrant };
