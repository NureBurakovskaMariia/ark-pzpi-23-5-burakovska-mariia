const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig.development);

try {
    async function addUser(userData) {
      const [id] = await knex('users').insert(userData);
      return knex('users').where({ id }).first();
    }

    async function getUserByEmail(email) {
      return knex('users').where({ email }).first();
    }

    async function updateUser(id, changes) {
        await knex('users').where({ id }).update(changes);
        return knex('users').where({ id }).select('id', 'name', 'email', 'role').first();
    }
    
    async function removeUser(id) {
        return knex('users').where({ id }).del();
    }

    async function addVolunteer(volunteerData) {
        const [id] = await knex('volunteers').insert(volunteerData);
        return knex('volunteers').where({ id }).first();
    }

    async function getAllVolunteers() {
        return knex('volunteers')
            .join('users', 'volunteers.user_id', 'users.id')
            .select('volunteers.id', 'users.name', 'users.email', 'volunteers.availability');
    }

    async function removeVolunteer(id) {
        return knex('volunteers').where({ id }).del();
    }

    console.log("DEBUG: userModel initialized.");

    module.exports = {
      addUser,
      getUserByEmail,
      updateUser,
      removeUser,
      addVolunteer,
      getAllVolunteers,
      removeVolunteer,
    };

} catch (error) {
    console.error("FATAL ERROR IN USER MODEL INITIALIZATION:", error.message);
    process.exit(1);
}