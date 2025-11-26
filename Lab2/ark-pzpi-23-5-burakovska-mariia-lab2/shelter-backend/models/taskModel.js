const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig.development);

try {
    async function addTask(taskData) {
      const [id] = await knex('tasks').insert(taskData);
      return knex('tasks').where({ id }).first();
    }

    async function getTasksByVolunteer(volunteer_id) {
      return knex('tasks').where({ volunteer_id }).select('*'); 
    }

    async function updateTaskStatus(id, status) {
      await knex('tasks').where({ id }).update({ status, updated_at: knex.fn.now() });
      return knex('tasks').where({ id }).first();
    }
    
    async function updateTask(id, changes) {
        await knex('tasks').where({ id }).update({ ...changes, updated_at: knex.fn.now() });
        return knex('tasks').where({ id }).first();
    }

    async function removeTask(id) {
        return knex('tasks').where({ id }).del();
    }

    console.log("DEBUG: taskModel initialized.");

    module.exports = {
      addTask,
      getTasksByVolunteer,
      updateTaskStatus,
      updateTask,
      removeTask,
    };

} catch (error) {
    console.error("FATAL ERROR IN TASK MODEL INITIALIZATION:", error.message);
    process.exit(1);
}