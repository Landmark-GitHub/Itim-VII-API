const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const dreamitim = mysql.createPool(process.env.DATABASE_URL)


// app.use(cors());
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

app.get('/members', (req, res) => {
    dreamitim.query(
        'SELECT * FROM `member`',
        function (err, results, fields) {
          if (err) {
            console.error(err);
            res.status(500).send('Error retrieving data from the database table members'); 
          } else {
            res.status(200).json(results);
          }
        }
    );
})

app.post('/postMembers', cors(), async (req, res) => {
    try {
        res.setHeader('Access-Control-Allow-Origin', 'https://itim-vii.vercel.app'); // เพิ่มหัวข้อ 'Access-Control-Allow-Origin' ในการตอบกลับ

        const { member_name, member_phone, member_idcard } = req.body;

        const result = await new Promise((resolve, reject) => {
            dreamitim.query(
                'INSERT INTO `member` (`member_name`, `member_phone`, `member_idcard`) VALUES (?, ?, ?)',
                [member_name, member_phone, member_idcard],
                function (err, results, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            );
        });
        console.log(result);
        res.status(200).json({ message: 'Add Member Success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
});

app.get('/requisition', async (req,res) => {
    const { date, name } = req.query;
    let query = 'SELECT * FROM `requisition`';

    if (date && name) {
        query += ' WHERE `date` = ? AND `name` = ?';
    } else if (date) {
        query += ' WHERE `date` = ?';
    } else if (name) {
        query += ' WHERE `name` = ?';
    }

    //http://localhost:3000/requisition?date=2023-05-16&name=Rohit

    try {
        await new Promise((resolve, reject) => {
            dreamitim.query(
                query,
                [date, name],
                function (err, results, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        const formattedResults = results.map((result) => ({
                            id: result.id,
                            date: result.date,
                            name: result.name,
                            nameitim: decodeURIComponent(result.nameitim),
                            typeitim: result.typeitim,
                            quantity: result.quantity,
                        }));

                        res.status(200).json(formattedResults);
                        resolve();
                    }
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }

})

app.listen(process.env.PORT || 3001);
// dreamitim.end()