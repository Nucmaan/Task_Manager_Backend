CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'User' CHECK (role IN ('Admin', 'Translator', 'Supervisor', 'Voice-over Artist', 'Sound Engineer', 'Editor')),
    reset_token TEXT DEFAULT NULL,
    reset_token_expires TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO users (name, email, password) VALUES
('Nasri Abdihakin', 'nasri@gmail.com', '$2a$10$hashedpassword1'),
('John Doe', 'john.doe@example.com', '$2a$10$hashedpassword2'),
('Jane Smith', 'jane.smith@example.com', '$2a$10$hashedpassword3');



CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE,
    created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Review', 'Completed')),
    deadline DATE,
    file_url TEXT DEFAULT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE task_assignments (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE task_status_updates (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    updated_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('To Do', 'In Progress', 'Review', 'Completed')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


