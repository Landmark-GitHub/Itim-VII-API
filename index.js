const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const dreamitim = mysql.createPool(process.env.DATABASE_URL)

app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to DreamItim API')
})

app.get('/itim', (req, res) => {
    dreamitim.query(
        'SELECT * FROM `itim`',
        function (err, results, fields) {
            if (err) {
                console.error(err);
                res.status(500).send('Error retrieving data from the database table itim');
            } else {
                res.send(results);
            }
        }
      );
})

app.listen(process.env.PORT || 3000);
// dreamitim.end()