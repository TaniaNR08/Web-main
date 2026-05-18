const mysql = require('mysql2');
const base = require('../../shared/mysql-options');

const pool = mysql.createPool({ ...base, database: 'auth_db' });

module.exports = pool;
