DROP TABLE IF EXISTS user_role_junction;
DROP TABLE IF EXISTS crypto_balances;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    authority VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE user_role_junction (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

CREATE TABLE wallets (
    wallet_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    usd_balance NUMERIC(20, 2) DEFAULT 10000
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    timestamp TIMESTAMP NOT NULL,
    type VARCHAR(20) NOT NULL,
    asset VARCHAR(50),
    amount NUMERIC(20, 8)
);

CREATE TABLE crypto_balances (
    balance_id SERIAL PRIMARY KEY,
    wallet_id INT REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    crypto_symbol VARCHAR(10) NOT NULL,
    amount NUMERIC(20, 8) NOT NULL DEFAULT 0,
    UNIQUE(wallet_id, crypto_symbol)
);