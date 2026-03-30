const db = require("../db");

async function getAllCategories() {
    const result = await db.query(
        "SELECT * FROM faq_categories ORDER BY category_name"
    );
    return result.rows;
}

async function addCategory(name) {
    const result = await db.query(
        "INSERT INTO faq_categories (category_name) VALUES ($1) RETURNING *",
        [name]
    );
    return result.rows[0];
}

async function updateCategory(id, name) {
    const old = await db.query(
        "SELECT category_name FROM faq_categories WHERE category_id=$1",
        [id]
    );

    if (!old.rows[0]) return null;

    const oldName = old.rows[0].category_name;

    await db.query(
        "UPDATE faqs SET category=$1 WHERE category=$2",
        [name, oldName]
    );

    const result = await db.query(
        "UPDATE faq_categories SET category_name=$1 WHERE category_id=$2 RETURNING *",
        [name, id]
    );

    return result.rows[0];
}

async function deleteCategory(id) {
    const cat = await db.query(
        "SELECT category_name FROM faq_categories WHERE category_id=$1",
        [id]
    );

    if (!cat.rows[0]) return { error: "Category not found" };

    const name = cat.rows[0].category_name;

    const inUse = await db.query(
        "SELECT COUNT(*) FROM faqs WHERE category=$1",
        [name]
    );

    if (parseInt(inUse.rows[0].count) > 0) {
        return { error: "Category is in use by FAQs" };
    }

    await db.query("DELETE FROM faq_categories WHERE category_id=$1", [id]);

    return { success: true };
}

module.exports = {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory
};