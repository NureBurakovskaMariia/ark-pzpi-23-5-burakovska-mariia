try {
    const knexConfig = require('../knexfile');
    const knex = require('knex')(knexConfig.development);
    async function getAllAnimals() {
      return knex('animals').select('*');
    }

    async function getAnimalById(id) {
      return knex('animals').where({ id }).first();
    }

async function addAnimal(animalData) {
  const [result] = await knex('animals').insert(animalData).returning('id');
  const id = result.id || result; 
  return getAnimalById(id); 
}

    async function updateAnimal(id, changes) {
      await knex('animals').where({ id }).update(changes);
      return getAnimalById(id);
    }

    async function removeAnimal(id) {
      return knex('animals').where({ id }).del(); 
    }

    console.log("DEBUG: Knex and animalModel initialized."); 

    module.exports = {
      getAllAnimals,
      getAnimalById,
      addAnimal,
      updateAnimal,
      removeAnimal,
    };

} catch (error) {
    console.error("FATAL ERROR IN ANIMAL MODEL INITIALIZATION:", error.message);
    process.exit(1); 
}