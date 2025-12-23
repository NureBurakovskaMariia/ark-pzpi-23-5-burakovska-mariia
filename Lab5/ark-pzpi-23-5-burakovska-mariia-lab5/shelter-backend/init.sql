CREATE TABLE users ( 
    id SERIAL PRIMARY KEY, 
    name TEXT NOT NULL, 
    email TEXT UNIQUE NOT NULL, 
    password_hash TEXT NOT NULL, 
    role TEXT NOT NULL CHECK(role IN ('ADMIN','VOLUNTEER','USER')) 
); 

CREATE TABLE animals ( 
    id SERIAL PRIMARY KEY, 
    name TEXT NOT NULL, 
    species TEXT, 
    breed TEXT, 
    gender TEXT, 
    birth_date DATE, 
    status TEXT DEFAULT 'available', 
    description TEXT 
); 

CREATE TABLE medical_records ( 
    id SERIAL PRIMARY KEY, 
    animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE, 
    date DATE NOT NULL, 
    description TEXT, 
    treatment TEXT
); 

CREATE TABLE adoption_requests ( 
    id SERIAL PRIMARY KEY, 
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
    animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE, 
    status TEXT DEFAULT 'pending', 
    request_date DATE DEFAULT CURRENT_DATE, 
    note TEXT
); 

CREATE TABLE donations ( 
    id SERIAL PRIMARY KEY, 
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, 
    amount REAL, 
    type TEXT, 
    note TEXT, 
    date DATE DEFAULT CURRENT_DATE
); 

CREATE TABLE volunteers ( 
    id SERIAL PRIMARY KEY, 
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
    availability TEXT
); 

CREATE TABLE tasks ( 
    id SERIAL PRIMARY KEY, 
    volunteer_id INTEGER REFERENCES volunteers(id) ON DELETE SET NULL, 
    description TEXT, 
    status TEXT DEFAULT 'open', 
    due_date DATE
); 

CREATE TABLE sensor_readings ( 
    id SERIAL PRIMARY KEY, 
    animal_id INTEGER REFERENCES animals(id) ON DELETE SET NULL, 
    sensor_type TEXT, 
    value REAL, 
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO animals (name, species, breed, status) VALUES ('Рекс', 'Собака', 'Лабрадор', 'available');