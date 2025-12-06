const Grant = require("../models/grantModel");

async function getGrants(req, res) {
    const grants = await Grant.getAllGrants();
    res.json(grants);
}

async function createGrant(req, res) {
    const newGrant = await Grant.addGrant(req.body);
    res.status(201).json(newGrant);
}

async function updateGrant(req, res) {
    const { id } = req.params;
    const updated = await Grant.updateGrant(parseInt(id), req.body);
    if (!updated) return res.status(404).json({ message: "Grant not found" });
    res.json(updated);
}

async function deleteGrant(req, res) {
    const { id } = req.params;
    const deleted = await Grant.deleteGrant(parseInt(id));
    if (!deleted) return res.status(404).json({ message: "Grant not found" });
    res.json({ message: "Grant deleted" });
}

module.exports = { getGrants, createGrant, updateGrant, deleteGrant };