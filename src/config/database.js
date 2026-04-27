const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '170522iris.', 
    database: 'schoolwebpro_db'
});

connection.connect((err) => {
  if (err) {
    console.error(' la base de datos:', err.message);
    return;
  }
  console.log('✅ Conectado a la base de datos');
});