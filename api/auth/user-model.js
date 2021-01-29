const db = require('../../data/dbConfig');

function isValid(user) {
    return Boolean(user.username && user.password && typeof user.password === "string");
}

function findById(id){
    return db('users').where({id}).first();
}

async function add(user){
    const [id] = await db('users').insert(user, "id")
    return findById(id);
}

function findBy(filter){
    return db('users').where(filter);
}

module.exports = {
    isValid,
    add,
    findById,
    findBy
}