const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
// const dreamitim = mysql.createPool(process.env.DATABASE_URL)
const dreamitim = mysql.createPool('mysql://vo4ur6kktqz7fkmkf2lv:pscale_pw_4yd3goQ0rpJZyysm1Ht6Xwykn9Z7uu4ZPYYKIcXeFy@aws.connect.psdb.cloud/dreamitim?ssl={"rejectUnauthorized":true}'
)

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
                res.status(200).json(results);
            }
        }
      );
})

app.listen(process.env.PORT || 3000);
// dreamitim.end()