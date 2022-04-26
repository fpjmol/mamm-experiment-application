const PORT = process.env.PORT || 3000
const express = require('express')
const app = express();

app.use(express.static('client'))

app.get('/', (req, res) => {
    res.send('hello world');
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}...`)
});