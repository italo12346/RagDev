CREATE DATABASE if not exists ragbank;
USE ragbank;
CREATE TABLE if not exists users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    nick VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)Engine=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE followers (
    user_id BIGINT NOT NULL,
    follows_id BIGINT NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,

    FOREIGN KEY (follows_id)
        REFERENCES users(id) ON DELETE CASCADE,

    PRIMARY KEY (user_id, follows_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;