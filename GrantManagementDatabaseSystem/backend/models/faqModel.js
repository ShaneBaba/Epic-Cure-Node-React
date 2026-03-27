const db = require("../db");

function mapRow(row) {
    return {
        id: row.faq_id,
        question: row.question,
        answer: row.answer,
        category: row.category,
        createdById: row.created_by_id,
        lastEditedById: row.last_edited_by_id,
        createdByName: row.created_by_name || null,
        lastEditedByName: row.last_edited_by_name || null,
    };
}

async function getFAQs(filters = {}) {
    let query = `
        SELECT f.*,
               u1.username AS created_by_name,
               u2.username AS last_edited_by_name
        FROM faqs f
        LEFT JOIN users u1 ON f.created_by_id = u1.user_id
        LEFT JOIN users u2 ON f.last_edited_by_id = u2.user_id
        WHERE 1=1
    `;

    const values = [];
    let idx = 1;

    if (filters.search) {
        query += ` AND (
            LOWER(f.question) LIKE LOWER($${idx})
            OR LOWER(f.answer) LIKE LOWER($${idx})
        )`;
        values.push(`%${filters.search}%`);
        idx++;
    }

    if (filters.category) {
        query += ` AND f.category = $${idx++}`;
        values.push(filters.category);
    }

    query += ` ORDER BY f.faq_id DESC`;

    const result = await db.query(query, values);
    return result.rows.map(mapRow);
}

async function addFAQ(data, userId) {
    const result = await db.query(
        `INSERT INTO faqs (question, answer, category, created_by_id, last_edited_by_id)
         VALUES ($1,$2,$3,$4,$4)
         RETURNING *`,
        [data.question, data.answer, data.category, userId]
    );

    return getFAQById(result.rows[0].faq_id);
}

async function updateFAQ(id, data, userId) {
    const result = await db.query(
        `UPDATE faqs
         SET question=$1,
             answer=$2,
             category=$3,
             last_edited_by_id=$4,
             updated_at = CURRENT_TIMESTAMP
         WHERE faq_id=$5
         RETURNING *`,
        [data.question, data.answer, data.category, userId, id]
    );

    if (!result.rows.length) return null;
    return getFAQById(id);
}

async function deleteFAQ(id) {
    const result = await db.query(
        `DELETE FROM faqs WHERE faq_id=$1`,
        [id]
    );
    return result.rowCount > 0;
}

async function getFAQById(id) {
    const result = await db.query(`
        SELECT f.*,
               u1.username AS created_by_name,
               u2.username AS last_edited_by_name
        FROM faqs f
        LEFT JOIN users u1 ON f.created_by_id = u1.user_id
        LEFT JOIN users u2 ON f.last_edited_by_id = u2.user_id
        WHERE f.faq_id = $1
    `, [id]);

    return result.rows[0] ? mapRow(result.rows[0]) : null;
}

async function getUsedCategories() {
    const result = await db.query(`
        SELECT DISTINCT category
        FROM faqs
        WHERE category IS NOT NULL AND category <> ''
        ORDER BY category ASC
    `);

    return result.rows.map(r => r.category);
}

module.exports = {
    getFAQs,
    addFAQ,
    updateFAQ,
    deleteFAQ,
    getUsedCategories
};