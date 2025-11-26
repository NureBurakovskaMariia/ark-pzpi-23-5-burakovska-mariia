const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig.development);

try {
    async function addDonation(donationData) {
        const [id] = await knex('donations').insert(donationData);
        return knex('donations').where({ id }).first();
    }

    async function getAllDonations() {
        return knex('donations')
            .select('donations.*', 'users.name as donor_name')
            .leftJoin('users', 'donations.user_id', 'users.id')
            .orderBy('date', 'desc');
    }

    console.log("DEBUG: donationModel initialized.");

    module.exports = {
        addDonation,
        getAllDonations,
    };

} catch (error) {
    console.error("FATAL ERROR IN DONATION MODEL INITIALIZATION:", error.message);
    process.exit(1);
}