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

async function getTotalAmount() {
  const total = await knex('donations').sum('amount as total');
  return total[0]?.total ?? 0;
}

async function getAverageAmount() {
  const avg = await knex('donations').avg('amount as avg');
  return avg[0]?.avg ?? 0;
}

async function getCount() {
  const count = await knex('donations').count('id as count');
  return count[0]?.count ?? 0;
}

    console.log("DEBUG: donationModel initialized.");

    module.exports = {
        addDonation,
        getAllDonations,
        getTotalAmount,
        getAverageAmount,
        getCount
    };

} catch (error) {
    console.error("FATAL ERROR IN DONATION MODEL INITIALIZATION:", error.message);
    process.exit(1);
}