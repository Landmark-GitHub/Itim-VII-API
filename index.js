const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const dreamitim = mysql.createPool(process.env.DATABASE_URL)

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to DreamItim API')
})

//itimDB
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

//memberDB
app.get('/members', (req, res) => {

    const {name} = req.query;

    if (!name) {
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
    } else {
        dreamitim.query(
            'SELECT * FROM `member` WHERE `member_name` = ?', [name],
            function (err, results, fields) {
              if (err) {
                console.error(err);
                res.status(500).send('Error retrieving data from the database table members'); 
              } else {
                res.status(200).json(results);
              }
            }
        );
    }

})

app.post('/postMembers', (req, res) => {

    const { member_name, member_phone, member_idcard ,member_type } = req.body;

    if (!member_name || !member_phone || !member_idcard || !member_type ) {
        res.status(400).json({ message: 'Invalid request data' });
        return;
    }

    dreamitim.query(
        'INSERT INTO `member` (`member_name`, `member_phone`, `member_idcard`, `member_type`) VALUES (?, ?, ?, ?)',
        [member_name, member_phone, member_idcard, member_type],
        function (err, results, fields) {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Error' });
                return;
            } else {
                console.log(results);
                res.status(200).json({ message: 'Add Member Success' });
            }
            // console.log(results);
            // res.status(200).json({ message: 'Add Member Success' });
        }
    );
});

app.put('/putMembers', (req, res) => {
    const { member_id, member_name, member_phone, member_idcard } = req.body;

    if (!member_id || !member_name || !member_phone || !member_idcard) {
        res.status(400).json({ message: 'Invalid request data' });
        return;
    }

    dreamitim.query(
      'UPDATE `member` SET `member_name` = ?, `member_phone` = ?, `member_idcard` = ? WHERE `member_id` = ?',
      [member_name, member_phone, member_idcard, member_id],
      function (err, results, fields) {
        if (err) {
          console.error(err);
          res.status(500).json({ message: 'Error' });
          return;
        }
        console.log(results);
        res.status(200).json({ message: 'Update Member Success' });
      }
    );
})

app.delete('/deleteMember/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await new Promise((resolve, reject) => {
            dreamitim.query(
                'DELETE FROM `member` WHERE `member_id` = ?',
                [id],
                function (err, results, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log(results);
                        resolve();
                    }
                }
            );
        });
        res.status(200).json({ message: 'Delete Member Success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
});

//requisitionDB
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

app.post('/postRequisition', async (req,res) => {
    const { date, name, nameitim, typeitim, quantity } = req.body;

    if (!date || !name || !nameitim || !typeitim || !quantity) {
        res.status(400).json({ message: 'Invalid request data' });
        return;
    }

    try {
        await new Promise((resolve, reject) => {
            dreamitim.query(
            'INSERT INTO `requisition` (`date`,`name`,`nameitim`,`typeitim`,`quantity`) VALUES (?, ?, ?, ?, ?)',
            [date, name, nameitim, typeitim, quantity],
            function (err, results, fields) {
                if (err) {
                reject(err);
                } else {
                resolve(results);
                }
            }
            );
        });
        res.status(200).json({ message: 'Add Quantity Success' });
        } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
        }
})

app.put('/putRequisition', (req, res) => {
    const { date, name, nameitim, quantity } = req.body;

    if (!date || !name || !nameitim || !quantity) {
        res.status(400).json({ message: 'Invalid request data' });
        return;
    }

    dreamitim.query(
        'UPDATE `requisition` SET `quantity` = ? WHERE `date` = ? AND `name` = ? AND `nameItim` = ?',
        [quantity, date, name, nameitim],
        function (err, results, fields) {
            if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error' });
            return;
            }
            console.log(results);
            res.status(200).json({ message: 'Update Member Success' });
        }
    );
})

//get Requisition
app.get('/newItim', (req, res) => {

    const {date, name} = req.query;
    
    let query = 'SELECT ';
    
    if (date && name ) {
        query += 'name, typeItim, SUM(quantity) AS quantity FROM `requisition` WHERE `date` = ? AND `name` = ? GROUP BY `typeitim`';
    } else if (date) {
        query += 'name, typeItim, SUM(quantity) AS quantity FROM `requisition` WHERE `date` = ? GROUP BY `name`, `typeitim`';
    } else if (!date || !name) {
        query += 'date, name, typeItim, SUM(quantity) AS quantity FROM `requisition` GROUP BY `date`, `name`, `typeitim`';
    }
    
    dreamitim.query(query, [date, name], function (err, results, fields) {
        if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error', date, name});
        }
        // const formattedResults = JSON.stringify(results, null, 2); // Format the JSON response
        return res.status(200).json(results);
    });

})

//BalanceDB
//get Balance
app.get('/oldItim', (req, res) => {
    const { date, name } = req.query;
        
    dreamitim.query(
    `SELECT * FROM balance2 WHERE date < ? AND name = ? ORDER BY date DESC LIMIT 6`,
    [date, name],
    function (err, results, fields) {
        if (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
        return;
        }
        
        res.status(200).json(results);
    }
    );
})

app.get('/balanceItim', (req, res) => {
    const { date, name } = req.query;
    if (!date|| !name) {
        res.status(400).json({ message: 'Invalid request data' });
        return;   
    }
    dreamitim.query(
        'SELECT * FROM `balance2` WHERE `date` = ? AND `name` = ?',
    [date, name],
    function (err, results, fields) {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error' });
            return;
        } else {
            res.status(200).json(results)
        }
    })
})

app.post('/postBalance', (req, res) => {
    const {date, name, typeitim, quantity} = req.body;
    if (!date|| !name|| !typeitim|| !quantity) {
        res.status(400).json({ message: 'Invalid request data' });
        return;   
    }
    // insert a new member
    dreamitim.query(
      'INSERT INTO `balance2` (`date`, `name`, `typeitim`, `quantity`) VALUES (?, ?, ?, ?)',
      [date, name, typeitim, quantity ],
      function (err, results, fields) {
        if (err) {
          console.error(err);
          res.status(500).json({ message: 'Error' });
          return;
        } else {
          console.log(results);
          res.status(200).json({ message: 'Save Success' });
        }
      }
    );
})

app.put('/putBalance', (req,res) => {
    const { date, name, typeitim, quantity } = req.body;
    if (!date|| !name|| !typeitim|| !quantity) {
        res.status(400).json({ message: 'Invalid request data' });
        return;   
    }
      dreamitim.query(
        'UPDATE `balance2` SET `quantity` = ? WHERE `date` = ? AND `name` = ? AND `typeitim` = ?',
        [quantity, date, name, typeitim],
        function (err, results, fields) {
          if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error' });
            return;
          } else {
            console.log(results);
            res.status(200).json({ message: 'Update Success' });
          }
        }
    )
})

//Table DryIce
app.get('/getDryice', (req, res) => {

    const { date, name } = req.query

    let query = 'SELECT * FROM `dryice`'

    if (date && name) {
        query += ' WHERE date=? AND name=?';
    } else if (date) {
        query += ' WHERE date=?';
    } else if (name) {
        query += ' WHERE name=?';
    }

    dreamitim.query(query, [date, name], 
        function (err, results, fields) {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error' });
            return;
        } else {
            res.status(200).json(results)
        }
    })
})

app.post('/postDryice', (req, res) => {
    const { date, name, quantity} = req.body

    if (!date|| !name|| !quantity) {
        res.status(400).json({ message: 'Invalid request data' });
        return;   
    }

    dreamitim.query(
        'INSERT INTO `dryice` (`date`, `name`, `quantity`) VALUES (?, ?, ?)',
    [date, name, quantity],
    function (err, results, fields) {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error' });
            return;
        } else {
            res.status(200).json(results)
        }
    })
})

app.put('/putDryice', (req,res) => {
    const { date, name, quantity } = req.body;

    if (!date|| !name|| !quantity) {
        res.status(400).json({ message: 'Invalid request data' });
        return;   
    }
    dreamitim.query(
        'UPDATE `dryice` SET `quantity` = ? WHERE `date` = ? AND `name` = ?',
        [quantity, date, name],
        function (err, results, fields) {
            if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error' });
            return;
            } else {
            console.log(results);
            res.status(200).json({ message: 'Update Success' });
            }
        }
    )
})

app.listen(process.env.PORT || 3001);