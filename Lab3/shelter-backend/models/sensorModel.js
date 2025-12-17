const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig.development);

try {
    async function addReading(data) {
      const [id] = await knex('sensor_readings').insert(data);
      return knex('sensor_readings').where({ id }).first();
    }

    async function checkAnomalyStatistical(animal_id, sensor_type) {
    const readings = await knex('sensor_readings')
        .where({ animal_id, sensor_type })
        .orderBy('timestamp', 'desc')
        .limit(20);

    if (readings.length < 5) {
        return { isAnomaly: false, reason: 'Not enough data' };
    }

    const values = readings.map(r => r.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    const variance =
        values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    const stdDev = Math.sqrt(variance);
    const current = values[0];

    const isAnomaly = Math.abs(current - mean) > 2 * stdDev;

    return {
        isAnomaly,
        current,
        mean,
        stdDev
    };
}

    async function getReadingsByAnimal(animal_id) {
    return knex('sensor_readings').where({ animal_id }).orderBy('timestamp', 'desc');
    }


    console.log("DEBUG: sensorModel initialized.");

    module.exports = {
      addReading,
      checkAnomalyStatistical,
      getReadingsByAnimal,
    };

} catch (error) {
    console.error("FATAL ERROR IN SENSOR MODEL INITIALIZATION:", error.message);
    process.exit(1);
}