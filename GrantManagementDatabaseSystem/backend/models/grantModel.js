const db = require("../db");

function mapRow(row) {
    return {
        id: row.grant_id,
        name: row.name,
        submissionstatus: row.submission_status,
        duedate: row.due_date
            ? row.due_date.toISOString().split("T")[0]
            : "",
        category: row.category,
        zipcodes: row.zip_codes,
        website: row.link_to_website,
        documents: row.link_to_docs,
    };
}

async function getAllGrants() {
    const result = await db.query(`SELECT * FROM grants`);
    return result.rows.map(mapRow);
}

async function getGrantsWithFilters(filters = {}) {
    let query = `SELECT * FROM grants WHERE 1=1`;
    const values = [];
    let idx = 1;

    if (filters.name) {
        query += ` AND LOWER(name) LIKE LOWER($${idx++})`;
        values.push(`%${filters.name}%`);
    }

    if (filters.status) {
        query += ` AND submission_status = $${idx++}`;
        values.push(filters.status);
    }

    if (filters.dueWindow === "60") {
        query += `
            AND due_date BETWEEN
                CURRENT_DATE - INTERVAL '60 days'
                AND CURRENT_DATE + INTERVAL '60 days'
        `;
    }

    const result = await db.query(query, values);
    return result.rows.map(mapRow);
}

async function addGrant(data) {
    const query = `
        INSERT INTO grants
        (name, submission_status, due_date, category, zip_codes, link_to_website, link_to_docs)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *;
    `;

    const values = [
        data.name,
        data.submissionstatus,
        data.duedate,
        data.category,
        data.zipcodes,
        data.website,
        data.documents,
    ];

    const result = await db.query(query, values);
    return mapRow(result.rows[0]);
}

async function updateGrant(id, data) {
    const query = `
        UPDATE grants SET
            name=$1,
            submission_status=$2,
            due_date=$3,
            category=$4,
            zip_codes=$5,
            link_to_website=$6,
            link_to_docs=$7
        WHERE grant_id=$8
        RETURNING *;
    `;

    const values = [
        data.name,
        data.submissionstatus,
        data.duedate,
        data.category,
        data.zipcodes,
        data.website,
        data.documents,
        id,
    ];

    const result = await db.query(query, values);
    if (!result.rows.length) return null;
    return mapRow(result.rows[0]);
}

async function deleteGrant(id) {
    const result = await db.query(
        `DELETE FROM grants WHERE grant_id=$1`,
        [id]
    );
    return result.rowCount > 0;
}

module.exports = {
    getAllGrants,
    getGrantsWithFilters,
    addGrant,
    updateGrant,
    deleteGrant,
};

