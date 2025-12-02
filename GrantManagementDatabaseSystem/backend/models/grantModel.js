let grants = [
    { id: 1, name: "Food Allowance", duedate: "2025-12-01", zipcodes: "12345", submissionstatus: "Submitted/Under Review", category: "Distribution", website: "www.weheartgrants.com", documents: "lorem ipsum" },
    { id: 2, name: "New Refridgerated Truck", duedate: "2025-12-01", zipcodes: "67890", submissionstatus: "Not Started", category: "Equipment", website: "www.goodgrants.com", documents: "lorem ipsum" }
];

function getAllGrants() {
    return grants;
}

function addGrant(grant) {
    grant.id = grants.length + 1;
    grants.push(grant);
    return grant;
}

function updateGrant(id, updatedData) {
    const index = grants.findIndex((g) => g.id === id);
    if (index === -1) return null;
    grants[index] = { ...grants[index], ...updatedData };
    return grants[index];
}

function deleteGrant(id) {
    const index = grants.findIndex((g) => g.id === id);
    if (index === -1) return false;
    grants.splice(index, 1);
    return true;
}

module.exports = { getAllGrants, addGrant, updateGrant, deleteGrant };