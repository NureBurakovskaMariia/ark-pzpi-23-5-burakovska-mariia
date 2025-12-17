const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig.development);

try {
    async function addRecord(recordData) {
        const [id] = await knex('medical_records').insert(recordData);
        return knex('medical_records').where({ id }).first();
    }

    async function getRecordsByAnimal(animal_id) {
        return knex('medical_records').where({ animal_id }).orderBy('date', 'desc');
    }
    
    async function removeRecord(id) {
        return knex('medical_records').where({ id }).del();
    }

    console.log("DEBUG: medicalModel initialized.");

    module.exports = {
        addRecord,
        getRecordsByAnimal,
        removeRecord, 
    };

} catch (error) {
    console.error("FATAL ERROR IN MEDICAL MODEL INITIALIZATION:", error.message);
    process.exit(1);
}