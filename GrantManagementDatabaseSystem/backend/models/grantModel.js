let grants = [
    { id: 1, name: "Food Allowance", duedate: new Date("2025-12-01").toISOString().split("T")[0], zipcodes:"12345", submissionstatus: "Submitted/Under Review", category: "Distribution", website:"www.weheartgrants.com", documents: "lorem ipsum"},
    { id: 2, name: "New Refridgerated Truck", duedate: new Date("2025-12-01").toISOString().split("T")[0], zipcodes: "67890", submissionstatus: "Not Started", category: "Equipment", website:"www.goodgrants.com", documents: "lorem ipsum"}
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
