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
    id = Number(id);
    await knex('tasks').where({ id }).update({ status });  
    return knex('tasks').where({ id }).first();
    }

    async function updateTask(id, changes) {
        await knex('tasks').where({ id }).update({ ...changes, updated_at: knex.fn.now() });
        return knex('tasks').where({ id }).first();
    }

    async function removeTask(id) {
        return knex('tasks').where({ id }).del();
    }

    async function getCompletedCountByVolunteer(volunteer_id) {
      const completed = await knex('tasks').where({ volunteer_id, status: 'completed' }).count('id as count');
        return completed[0].count;
    }

    async function calculateVolunteerActivityIndex() {
    const volunteers = await knex('volunteers').select('id');

    const stats = [];

    for (const v of volunteers) {
        const tasks = await knex('tasks').where({ volunteer_id: v.id });

        const completed = tasks.filter(t => t.status === 'completed').length;

        const overdue = tasks.filter(t =>
            t.status !== 'completed' &&
            t.due_date &&
            new Date(t.due_date) < new Date()
        ).length;

        stats.push({
            volunteer_id: v.id,
            completed,
            overdue
        });
    }

    const maxCompleted = Math.max(...stats.map(s => s.completed), 1);
    const maxOverdue = Math.max(...stats.map(s => s.overdue), 1);

    return stats.map(s => {
        const C_norm = s.completed / maxCompleted;
        const O_norm = s.overdue / maxOverdue;

        const VAI = 0.7 * C_norm + 0.3 * (1 - O_norm);

        return {
            volunteer_id: s.volunteer_id,
            completed_tasks: s.completed,
            overdue_tasks: s.overdue,
            activity_index: VAI.toFixed(2)
        };
    });
}


    console.log("DEBUG: taskModel initialized.");

    module.exports = {
      addTask,
      getTasksByVolunteer,
      updateTaskStatus,
      updateTask,
      removeTask,
      getCompletedCountByVolunteer,
      calculateVolunteerActivityIndex,
    };

} catch (error) {
    console.error("FATAL ERROR IN TASK MODEL INITIALIZATION:", error.message);
    process.exit(1);
}