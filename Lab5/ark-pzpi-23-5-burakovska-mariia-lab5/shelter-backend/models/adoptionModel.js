const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig.development);

try {
async function addRequest(requestData) {
        const [result] = await knex('adoption_requests').insert(requestData).returning('id');
        const id = typeof result === 'object' ? result.id : result;
        return knex('adoption_requests').where({ id }).first();
    }

    async function getAllRequests() {
        return knex('adoption_requests')
            .select('adoption_requests.*', 'users.name as user_name', 'animals.name as animal_name')
            .join('users', 'adoption_requests.user_id', 'users.id')
            .join('animals', 'adoption_requests.animal_id', 'animals.id')
            .orderBy('request_date', 'asc');
    }

    async function updateStatus(id, status) {
    await knex('adoption_requests').where({ id }).update({ status });
    return knex('adoption_requests').where({ id }).first();
    }

    console.log("DEBUG: adoptionModel initialized.");

    module.exports = {
        addRequest,
        getAllRequests,
        updateStatus,
    };

} catch (error) {
    console.error("FATAL ERROR IN ADOPTION MODEL INITIALIZATION:", error.message);
    process.exit(1);
}