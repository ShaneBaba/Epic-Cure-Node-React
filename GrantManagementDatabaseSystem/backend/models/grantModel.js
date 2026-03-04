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

        createdById: row.created_by_id,
        lastEditedById: row.last_edited_by_id,
        createdByName: row.created_by_name || null,
        lastEditedByName: row.last_edited_by_name || null,
    };
}

async function getGrantsWithFilters(filters = {}) {
    let query = `
    SELECT g.*,
           u1.username AS created_by_name,
           u2.username AS last_edited_by_name
    FROM grants g
    LEFT JOIN users u1 ON g.created_by_id = u1.user_id
    LEFT JOIN users u2 ON g.last_edited_by_id = u2.user_id
    WHERE 1=1
`;
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

    if (filters.category) {
        query += ` AND category = $${idx++}`;
        values.push(filters.category);
    }

    if (filters.zipcodes) {
        query += ` AND zip_codes ILIKE $${idx++}`;
        values.push(`%${filters.zipcodes}%`);
    }

    if (filters.dueWindow === "60") {
        query += `
        AND due_date BETWEEN
            CURRENT_DATE - INTERVAL '60 days'
            AND CURRENT_DATE + INTERVAL '60 days'
    `;
        query += ` ORDER BY due_date ASC NULLS LAST`;
    }

    const result = await db.query(query, values);
    return result.rows.map(mapRow);
}

async function addGrant(data, userId) {
    const insertQuery = `
        INSERT INTO grants
        (name, submission_status, due_date, category, zip_codes, link_to_website, link_to_docs, created_by_id, last_edited_by_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING grant_id;
    `;

    const values = [
        data.name,
        data.submissionstatus,
        data.duedate,
        data.category,
        data.zipcodes,
        data.website,
        data.documents,
        userId,
        userId,
    ];

    const insertResult = await db.query(insertQuery, values);
    const id = insertResult.rows[0].grant_id;

    const result = await db.query(`
        SELECT g.*,
               u1.username AS created_by_name,
               u2.username AS last_edited_by_name
        FROM grants g
        LEFT JOIN users u1 ON g.created_by_id = u1.user_id
        LEFT JOIN users u2 ON g.last_edited_by_id = u2.user_id
        WHERE g.grant_id = $1
    `, [id]);

    return mapRow(result.rows[0]);
}

async function updateGrant(id, data, userId) {
    const updateQuery = `
        UPDATE grants SET
            name=$1,
            submission_status=$2,
            due_date=$3,
            category=$4,
            zip_codes=$5,
            link_to_website=$6,
            link_to_docs=$7,
            last_edited_by_id=$8
        WHERE grant_id=$9
        RETURNING grant_id;
    `;

    const values = [
        data.name,
        data.submissionstatus,
        data.duedate,
        data.category,
        data.zipcodes,
        data.website,
        data.documents,
        userId,
        id,
    ];

    const updateResult = await db.query(updateQuery, values);
    if (!updateResult.rows.length) return null;

    const result = await db.query(`
        SELECT g.*,
               u1.username AS created_by_name,
               u2.username AS last_edited_by_name
        FROM grants g
        LEFT JOIN users u1 ON g.created_by_id = u1.user_id
        LEFT JOIN users u2 ON g.last_edited_by_id = u2.user_id
        WHERE g.grant_id = $1
    `, [id]);

    return mapRow(result.rows[0]);
}

async function deleteGrant(id) {
    const result = await db.query(
        `DELETE FROM grants WHERE grant_id=$1`,
        [id]
    );
    return result.rowCount > 0;
}

async function getAllCategories() {
    const result = await db.query(`
        SELECT DISTINCT category
        FROM grants
        WHERE category IS NOT NULL AND category <> ''
        ORDER BY category ASC
    `);

    return result.rows.map(r => r.category);
}

module.exports = {
    getGrantsWithFilters,
    addGrant,
    updateGrant,
    deleteGrant,
    getAllCategories,
};