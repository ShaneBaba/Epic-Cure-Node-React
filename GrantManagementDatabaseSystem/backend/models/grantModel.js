let grants = [
    { id: 1, name: "Food Allowance" },
    { id: 2, name: "New Refridgerated Truck" }
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
