let grants = [
    { id: 1, name: "Food Allowance", duedate: new Date("2025-12-01").toISOString().split("T")[0], category: "Distribution" },
    { id: 2, name: "New Refridgerated Truck", duedate: new Date("2025-12-01").toISOString().split("T")[0], category: "Equipment"}
];

function getAllGrants() {
    return grants;
}

function addGrant(grant) {
    grant.id = grants.length + 1;
    grants.push(grant);
    return grant;
}

module.exports = { getAllGrants, addGrant };
