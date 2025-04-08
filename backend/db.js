const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool(); // usa automaticamente as variáveis do .env
module.exports = pool;
