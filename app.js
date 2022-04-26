const PORT = process.env.PORT || 3000
const express = require('express')
const app = express();

const mysql = require('mysql2')
const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '31804495598',
    database: 'experimentdatadb'
})

app.use(express.static('client'))

app.get("/select", (req, res) => {
    
    console.log("select req received")
    console.log(req.body)

    db.query(
        'SELECT * FROM participants',
        (err, result) => {
        if (err) {
            console.log(err)
        }
    
        res.send(result)
    });

});

app.post("/insert", (req, res) => {
    const participant_name = req.body

    console.log("insert req received")
    console.log(req.body)
    
    db.query(
        'INSERT INTO participants (first_name) VALUES (?)',
        [participant_name], 
        (err, result) => {
        if (err) {
            console.log(err)
        }
    
        res.send(result)
    });

});


app.get('/', (req, res) => {
    res.send('hello world');
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}...`)
});


