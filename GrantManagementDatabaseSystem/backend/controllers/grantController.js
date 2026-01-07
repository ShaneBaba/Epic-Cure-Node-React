const Grant = require("../models/grantModel");

async function getGrants(req, res) {
    try {
        const { name, status, dueWindow } = req.query;

        const grants = await Grant.getGrantsWithFilters({
            name,
            status,
            dueWindow,
        });

        res.json(grants);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch grants" });
    }
}

async function createGrant(req, res) {
    try {
        const newGrant = await Grant.addGrant(req.body);
        res.status(201).json(newGrant);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create grant" });
    }
}

async function updateGrant(req, res) {
    try {
        const { id } = req.params;
        const updated = await Grant.updateGrant(Number(id), req.body);

        if (!updated) {
            return res.status(404).json({ message: "Grant not found" });
        }

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update grant" });
    }
}

async function deleteGrant(req, res) {
    try {
        const { id } = req.params;
        const deleted = await Grant.deleteGrant(Number(id));

        if (!deleted) {
            return res.status(404).json({ message: "Grant not found" });
        }

        res.json({ message: "Grant deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete grant" });
    }
}

module.exports = {
    getGrants,
    createGrant,
    updateGrant,
    deleteGrant,
};

