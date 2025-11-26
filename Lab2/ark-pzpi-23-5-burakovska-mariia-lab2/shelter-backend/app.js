const express = require('express');
const animalModel = require('./models/animalModel');
const userModel = require('./models/userModel');
const taskModel = require('./models/taskModel');
const sensorModel = require('./models/sensorModel');
const adoptionModel = require('./models/adoptionModel');
const donationModel = require('./models/donationModel');
const medicalModel = require('./models/medicalModel');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shelter Management API (Public/Volunteer)',
      version: '1.0.0',
      description: 'Публічний та волонтерський API для системи притулку',
    },
    servers: [{
      url: 'http://localhost:3000/api',
    }],
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('<h1>Shelter API Server is Running!</h1><p>Data endpoints start at: /api/</p>');
});

const router = express.Router();

/**
 * @openapi
 * /register:
 *   post:
 *     summary: Реєстрація нового користувача
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       description: Дані для реєстрації нового користувача.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Марія"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "maria@example.com"
 *               password_hash:
 *                 type: string
 *                 example: "securepassword123"
 *               role:
 *                 type: string
 *                 enum: [user, volunteer]
 *                 example: "USER"
 *     responses:
 *       201:
 *         description: Користувач успішно зареєстрований.
 *       400:
 *         description: Помилка реєстрації.
 */
router.post('/register', async (req, res) => {
  try {
    const newUser = await userModel.addUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Registration failed (Email or User already exists)' });
  }
});

/**
 * @openapi
 * /animals:
 *   get:
 *     summary: Отримати список усіх тварин для усиновлення
 *     tags: [Animals]
 *     responses:
 *       200:
 *         description: Успішний запит. Повертає список тварин.
 *       500:
 *         description: Помилка сервера.
 */
router.get('/animals', async (req, res) => {
  try {
    const animals = await animalModel.getAllAnimals();
    res.json(animals);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @openapi
 * /tasks/{id}/status:
 *   put:
 *     summary: Оновити статус конкретного завдання (Волонтер)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID завдання
 *     requestBody:
 *       required: true
 *       description: Новий статус завдання
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *                 example: in_progress
 *     responses:
 *       200:
 *         description: Статус оновлено.
 *       500:
 *         description: Помилка сервера.
 */
router.put('/tasks/:id/status', async (req, res) => {
  try {
    const updated = await taskModel.updateTaskStatus(req.params.id, req.body.status);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Could not update task status.' });
  }
});

/**
 * @openapi
 * /sensors:
 *   post:
 *     summary: Прийом даних від IoT-емулятора
 *     tags: [IoT]
 *     requestBody:
 *       required: true
 *       description: Дані сенсора
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               animal_id:
 *                 type: integer
 *               sensor_type:
 *                 type: string
 *                 enum: [Temperature, Humidity]
 *               value:
 *                 type: number
 *                 example: 25.5
 *     responses:
 *       201:
 *         description: Показник успішно прийнято.
 *       400:
 *         description: Недійсні дані.
 */
router.post('/sensors', async (req, res) => {
  try {
    const reading = await sensorModel.addReading(req.body);
    const anomaly = await sensorModel.checkAnomaly(req.body);
    res.status(201).json({ reading, anomaly });
  } catch (error) {
    res.status(400).json({ message: 'Invalid sensor data.' });
  }
});

/**
 * @openapi
 * /donations:
 *   post:
 *     summary: Здійснити донат
 *     tags: [Donations]
 *     requestBody:
 *       required: true
 *       description: Дані донату
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100.00
 *               type:
 *                 type: string
 *                 enum: [money, material]
 *               user_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Донат успішно оброблено.
 *       400:
 *         description: Помилка донату.
 */
router.post('/donations', async (req, res) => {
  try {
    const donation = await donationModel.addDonation(req.body);
    res.status(201).json(donation);
  } catch {
    res.status(400).json({ message: 'Donation processing failed.' });
  }
});

/**
 * @openapi
 * /donations:
 *   get:
 *     summary: Отримати список усіх донатів
 *     tags: [Donations]
 *     responses:
 *       200:
 *         description: Список донатів.
 *       500:
 *         description: Помилка сервера.
 */
router.get('/donations', async (req, res) => {
  try {
    const donations = await donationModel.getAllDonations();
    res.json(donations);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @openapi
 * /medicals/animal/{id}:
 *   get:
 *     summary: Отримати медичну історію тварини
 *     tags: [Medical Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список медичних записів.
 *       500:
 *         description: Помилка сервера.
 */
router.get('/medicals/animal/:id', async (req, res) => {
  try {
    const records = await medicalModel.getRecordsByAnimal(req.params.id);
    res.json(records);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @openapi
 * /adoptions:
 *   post:
 *     summary: Подати заявку на усиновлення
 *     tags: [Adoptions]
 *     requestBody:
 *       required: true
 *       description: Дані заявки
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               animal_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Заявка прийнята.
 *       400:
 *         description: Помилка подачі заявки.
 */
router.post('/adoptions', async (req, res) => {
  try {
    const request = await adoptionModel.addRequest(req.body);
    res.status(201).json(request);
  } catch {
    res.status(400).json({ message: 'Failed to submit adoption request.' });
  }
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});
