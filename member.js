const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const dreamitim = mysql.createPool(process.env.DATABASE_URL)

app.use(cors());

app.get('/', (req, res) => {
    dreamitim.query(
        'SELECT * FROM `member`',
        function (err, results, fields) {
          if (err) {
            console.error(err);
            res.status(500).send('Error retrieving data from the database table members'); 
          } else {
            res.status(200).json(results);
            // res.status(200).send(results);
          }
        }
      );
})

app.listen(process.env.PORT || 3001);