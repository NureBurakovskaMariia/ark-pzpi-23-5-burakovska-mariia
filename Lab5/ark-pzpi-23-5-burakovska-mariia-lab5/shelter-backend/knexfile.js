module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '1',
      database: process.env.DB_NAME || 'pet_shelter'
    },
    useNullAsDefault: true
  }
};