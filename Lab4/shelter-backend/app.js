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
      title: 'Shelter Management API (Public/Volunteer/Admin)',
      version: '1.0.0',
      description: 'Публічний, волонтерський та адміністративний API для системи притулку',
    },
    servers: [{ url: 'http://localhost:3000/api' }],
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
 *                 enum: [ADMIN, VOLUNTEER, USER]
 *                 example: "USER"
 *     responses:
 *       201:
 *         description: Користувач успішно зареєстрований.
 *       400:
 *         description: Помилка реєстрації.
 */
router.post('/register', async (req, res) => {
  try {
    const userData = { ...req.body, role: req.body.role.toUpperCase() };
    const newUser = await userModel.addUser(userData);
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
 *         description: Список тварин.
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
 * /animals:
 *   post:
 *     summary: Додати нову тварину (Адміністратор)
 *     tags: [Animals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Рекс" }
 *               species: { type: string, example: "Собака" }
 *               breed: { type: string, example: "Лабрадор" }
 *               gender: { type: string, example: "Male" }
 *               birth_date: { type: string, format: date, example: "2023-01-01" }
 *               description: { type: string, example: "Дружелюбний пес" }
 *     responses:
 *       201:
 *         description: Тварина успішно додана.
 *       400:
 *         description: Недійсні дані.
 */
router.post('/animals', async (req, res) => {
  try {
    const newAnimal = await animalModel.addAnimal(req.body);
    res.status(201).json(newAnimal);
  } catch (error) {
    res.status(400).json({ message: 'Could not add animal.' });
  }
});

/**
 * @openapi
 * /animals/{id}:
 *   put:
 *     summary: Оновити дані тварини (Адміністратор)
 *     tags: [Animals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID тварини
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, adopted, pending]
 *                 example: "adopted"
 *               description: { type: string, example: "Додаткові відомості" }
 *     responses:
 *       200:
 *         description: Дані оновлено.
 *       404:
 *         description: Тварину не знайдено.
 */
router.put('/animals/:id', async (req, res) => {
  try {
    const updatedAnimal = await animalModel.updateAnimal(req.params.id, req.body);
    if (!updatedAnimal) return res.status(404).json({ message: 'Animal not found.' });
    res.json(updatedAnimal);
  } catch (error) {
    res.status(500).json({ message: 'Could not update animal.' });
  }
});

/**
 * @openapi
 * /animals/{id}:
 *   delete:
 *     summary: Видалити тварину (Адміністратор)
 *     tags: [Animals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID тварини
 *     responses:
 *       204:
 *         description: Тварина успішно видалена.
 *       404:
 *         description: Тварину не знайдено.
 */
router.delete('/animals/:id', async (req, res) => {
  try {
    const deletedCount = await animalModel.removeAnimal(req.params.id);
    if (deletedCount === 0) return res.status(404).json({ message: 'Animal not found.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Could not delete animal.' });
  }
});

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Створити нове завдання та призначити волонтеру (Адміністратор)
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               volunteer_id: { type: integer, example: 1 }
 *               description: { type: string, example: "Прибрати клітку 4А" }
 *               due_date: { type: string, format: date, example: "2025-12-31" }
 *     responses:
 *       201:
 *         description: Завдання успішно створено.
 *       400:
 *         description: Недійсні дані.
 */
router.post('/tasks', async (req, res) => {
  try {
    const newTask = await taskModel.addTask(req.body);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: 'Could not create task.' });
  }
});

/**
 * @openapi
 * /tasks/{id}/status:
 *   put:
 *     summary: Оновити статус завдання (Волонтер)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
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
    const updated = await taskModel.updateTaskStatus(Number(req.params.id), req.body.status);
    if (!updated) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Could not update task status.' });
  }
});


/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Видалити завдання (Адміністратор)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Завдання успішно видалено.
 *       404:
 *         description: Завдання не знайдено.
 */
router.delete('/tasks/:id', async (req, res) => {
  try {
    const deletedCount = await taskModel.removeTask(req.params.id);
    if (deletedCount === 0) return res.status(404).json({ message: 'Task not found.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Could not delete task.' });
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               animal_id: { type: integer, example: 1 }
 *               sensor_type: { type: string, enum: [Temperature, Humidity], example: "Temperature" }
 *               value: { type: number, example: 25.5 }
 *     responses:
 *       201:
 *         description: Показник успішно прийнято та перевірено на аномалії.
 *       400:
 *         description: Недійсні дані.
 */
router.post('/sensors', async (req, res) => {
  try {
    const reading = await sensorModel.addReading(req.body);

    const anomaly = await sensorModel.checkAnomalyStatistical(
      req.body.animal_id,
      req.body.sensor_type
    );

    res.status(201).json({ reading, anomaly });
  } catch (error) {
    console.error(error);
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number, example: 100.0 }
 *               type: { type: string, enum: [money, material], example: "money" }
 *               user_id: { type: integer, nullable: true, example: 5 }
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
 * /medicals:
 *   post:
 *     summary: Додати медичний запис для тварини (Адміністратор)
 *     tags: [Medical Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               animal_id: { type: integer, example: 1 }
 *               date: { type: string, format: date, example: "2025-12-15" }
 *               description: { type: string, example: "Легка застуда" }
 *               treatment: { type: string, example: "Антибіотики 5 днів" }
 *     responses:
 *       201:
 *         description: Запис успішно додано.
 *       400:
 *         description: Недійсні дані.
 */
router.post('/medicals', async (req, res) => {
  try {
    const newRecord = await medicalModel.addRecord(req.body);
    res.status(201).json(newRecord);
  } catch {
    res.status(400).json({ message: 'Could not add medical record.' });
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
 *         schema: { type: integer }
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
 *     summary: Подати заявку на усиновлення (Користувач)
 *     tags: [Adoptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               animal_id: { type: integer, example: 1 }
 *               user_id: { type: integer, example: 5 }
 *               note: { type: string, example: "Хочу забрати швидко" }
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

/**
 * @openapi
 * /adoptions:
 *   get:
 *     summary: Отримати список усіх заявок на усиновлення (Адміністратор)
 *     tags: [Adoptions]
 *     responses:
 *       200:
 *         description: Список заявок.
 *       500:
 *         description: Помилка сервера.
 */
router.get('/adoptions', async (req, res) => {
  try {
    const requests = await adoptionModel.getAllRequests();
    res.json(requests);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @openapi
 * /adoptions/{id}/status:
 *   put:
 *     summary: Оновити статус заявки на усиновлення (Адміністратор/Волонтер)
 *     tags: [Adoptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 example: approved
 *     responses:
 *       200:
 *         description: Статус оновлено.
 *       404:
 *         description: Заявка не знайдена.
 *       500:
 *         description: Помилка сервера.
 */
router.put('/adoptions/:id/status', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const validStatuses = ['pending', 'approved', 'rejected'];

        if (!validStatuses.includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        const updated = await adoptionModel.updateStatus(id, req.body.status);

        if (!updated) {
            return res.status(404).json({ message: 'Adoption request not found.' });
        }

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not update status.' });
    }
});


/**
 * @openapi
 * /admin/animals/statistics:
 *   get:
 *     summary: Статистика по тваринам (адмін)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Повертає кількість доступних, усиновлених та очікуючих тварин.
 */
router.get('/admin/animals/statistics', async (req, res) => {
  try {
    const allAnimals = await animalModel.getAllAnimals();
    const stats = { available: 0, adopted: 0, pending: 0 };
    allAnimals.forEach(a => {
      stats[a.status] = (stats[a.status] || 0) + 1;
    });
    res.json(stats);
  } catch {
    res.status(500).json({ message: 'Could not fetch animal statistics.' });
  }
});

/**
 * @openapi
 * /admin/volunteers/ranking:
 *   get:
 *     summary: Рейтинг волонтерів за кількістю виконаних завдань
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Повертає рейтинг волонтерів.
 */
router.get('/admin/volunteers/ranking', async (req, res) => {
  try {
    const volunteers = await userModel.getAllVolunteers();
    const ranking = [];
    for (const v of volunteers) {
      const tasks = await taskModel.getTasksByVolunteer(v.id);
      const completed = tasks.filter(t => t.status === 'completed').length;
      ranking.push({ volunteer: v.name, completed_tasks: completed });
    }
    ranking.sort((a, b) => b.completed_tasks - a.completed_tasks);
    res.json(ranking);
  } catch {
    res.status(500).json({ message: 'Could not fetch volunteer ranking.' });
  }
});

/**
 * @openapi
 * /admin/donations/statistics:
 *   get:
 *     summary: Статистика донатів (адмін)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Повертає загальну суму грошових донатів та кількість матеріальних.
 */
router.get('/admin/donations/statistics', async (req, res) => {
  try {
    const donations = await donationModel.getAllDonations();
    const stats = { money_total: 0, material_count: 0 };
    donations.forEach(d => {
      if (d.type === 'money') stats.money_total += d.amount;
      else if (d.type === 'material') stats.material_count += 1;
    });
    res.json(stats);
  } catch {
    res.status(500).json({ message: 'Could not fetch donation statistics.' });
  }
});

/**
 * @openapi
 * /animals/{id}:
 *   get:
 *     summary: Отримати тварину за ID
 *     tags: [Animals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Дані тварини.
 *       404:
 *         description: Тварину не знайдено.
 */
router.get('/animals/:id', async (req, res) => {
  try {
    const animal = await animalModel.getAnimalById(req.params.id);
    if (!animal) return res.status(404).json({ message: 'Animal not found.' });
    res.json(animal);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @openapi
 * /users/email/{email}:
 *   get:
 *     summary: Отримати користувача за email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Дані користувача.
 *       404:
 *         description: Користувача не знайдено.
 */
router.get('/users/email/:email', async (req, res) => {
  try {
    const user = await userModel.getUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @openapi
 * /admin/users/{id}:
 *   put:
 *     summary: Оновити дані користувача (Адміністратор)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               role: { type: string, enum: [ADMIN, VOLUNTEER, USER] }
 *     responses:
 *       200:
 *         description: Дані користувача оновлено.
 *       404:
 *         description: Користувача не знайдено.
 */
router.put('/admin/users/:id', async (req, res) => {
  try {
    const updated = await userModel.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'User not found.' });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Could not update user.' });
  }
});

/**
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     summary: Видалити користувача (Адміністратор)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Користувача успішно видалено.
 *       404:
 *         description: Користувача не знайдено.
 */
router.delete('/admin/users/:id', async (req, res) => {
  try {
    const deletedCount = await userModel.removeUser(req.params.id);
    if (deletedCount === 0) return res.status(404).json({ message: 'User not found.' });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Could not delete user.' });
  }
});

/**
 * @openapi
 * /admin/volunteers:
 *   post:
 *     summary: Додати волонтера (Адміністратор)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:  
 *                type: integer 
 *                example: 1
 *               availability:
 *                type: string
 *                example: "full-time"
 *               
 *     responses:
 *       201:
 *         description: Волонтер доданий.
 */
router.post('/admin/volunteers', async (req, res) => {
  try {
    const volunteer = await userModel.addVolunteer({
      user_id: req.body.user_id,
      availability: req.body.availability || null
    });
    res.status(201).json(volunteer);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Could not add volunteer.' });
  }
});

/**
 * @openapi
 * /admin/volunteers/{id}:
 *   delete:
 *     summary: Видалити волонтера (Адміністратор)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Волонтер видалений.
 *       404:
 *         description: Волонтера не знайдено.
 */
router.delete('/admin/volunteers/:id', async (req, res) => {
  try {
    const deletedCount = await userModel.removeVolunteer(req.params.id);
    if (deletedCount === 0) return res.status(404).json({ message: 'Volunteer not found.' });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Could not remove volunteer.' });
  }
});

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     summary: Оновити завдання (Адміністратор)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string }
 *               due_date: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Завдання оновлено.
 *       404:
 *         description: Завдання не знайдено.
 */
router.put('/tasks/:id', async (req, res) => {
  try {
    const updated = await taskModel.updateTask(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Task not found.' });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Could not update task.' });
  }
});

/**
 * @openapi
 * /sensors/animal/{id}:
 *   get:
 *     summary: Отримати показники датчиків тварини
 *     tags: [IoT]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Список показників.
 */
router.get('/sensors/animal/:id', async (req, res) => {
  try {
    const readings = await sensorModel.getReadingsByAnimal(req.params.id);
    res.json(readings);
  } catch {
    res.status(500).json({ message: 'Could not fetch sensor readings.' });
  }
});

/**
 * @openapi
 * /medicals/{id}:
 *   delete:
 *     summary: Видалити медичний запис (Адміністратор)
 *     tags: [Medical Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Запис видалено.
 *       404:
 *         description: Запис не знайдено.
 */
router.delete('/medicals/:id', async (req, res) => {
  try {
    const deletedCount = await medicalModel.removeRecord(req.params.id);
    if (deletedCount === 0) return res.status(404).json({ message: 'Medical record not found.' });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Could not delete medical record.' });
  }
});

/**
 * @openapi
 * /admin/donations/statistics/advanced:
 *   get:
 *     summary: Розширена статистика донатів (адмін)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Повертає загальну суму, середню суму та кількість донатів.
 */
router.get('/admin/donations/statistics/advanced', async (req, res) => {
  try {
    const total = await donationModel.getTotalAmount();
    const average = await donationModel.getAverageAmount();
    const count = await donationModel.getCount();
    
    console.log("DEBUG: total=", total, "average=", average, "count=", count);
    
    res.json({ total, average, count });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ message: 'Could not fetch advanced donation statistics.' });
  }
});

/**
 * @openapi
 * /admin/volunteers/activity-index:
 *   get:
 *     summary: Розрахунок індексу активності волонтерів (бізнес-логіка)
 *     tags: [Admin]
 *     description: |
 *       Обчислює інтегральний індекс активності волонтерів на основі
 *       кількості виконаних та прострочених завдань.
 *       Індекс нормалізується та розраховується без модифікації структури БД.
 *     responses:
 *       200:
 *         description: Список волонтерів з показниками активності.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   volunteer_id:
 *                     type: integer
 *                     example: 1
 *                   completed_tasks:
 *                     type: integer
 *                     example: 5
 *                   overdue_tasks:
 *                     type: integer
 *                     example: 1
 *                   activity_index:
 *                     type: string
 *                     example: "0.82"
 *       500:
 *         description: Помилка сервера.
 */
router.get('/admin/volunteers/activity-index', async (req, res) => {
  try {
    const stats = await taskModel.calculateVolunteerActivityIndex();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not calculate volunteer activity index.' });
  }
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});
