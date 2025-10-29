const Grant = require("../models/grantModel");

function getGrants(req, res) {
    res.json(Grant.getAllGrants());
}

function createGrant(req, res) {
    const newGrant = Grant.addGrant(req.body);
    res.status(201).json(newGrant);
}

function updateGrant(req, res) {
    const { id } = req.params;
    const updated = Grant.updateGrant(parseInt(id), req.body);
    if (!updated) return res.status(404).json({ message: "Grant not found" });
    res.json(updated);
}

module.exports = { getGrants, createGrant, updateGrant };