const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig.development);

try {
    async function addReading(data) {
      const [id] = await knex('sensor_readings').insert(data);
      return knex('sensor_readings').where({ id }).first();
    }

    async function checkAnomaly(data) {
        let anomalyDetails = [];
        if (data.sensor_type === 'Temperature' && data.value > 30.0) {
            anomalyDetails.push(`High temperature (${data.value} C)`);
        }

        if (data.sensor_type === 'Humidity' && data.value < 30.0) {
            anomalyDetails.push(`Low humidity (${data.value} %)`);
        }

        if (anomalyDetails.length > 0) {
            const message = `!!! ALERT: Anomalies detected for animal ${data.animal_id}: ${anomalyDetails.join(' and ')} !!!`;
            console.warn(message);
            return { isAnomaly: true, message: message };
        }
        return { isAnomaly: false, message: "Normal conditions" };
    }

    console.log("DEBUG: sensorModel initialized.");

    module.exports = {
      addReading,
      checkAnomaly,
    };

} catch (error) {
    console.error("FATAL ERROR IN SENSOR MODEL INITIALIZATION:", error.message);
    process.exit(1);
}