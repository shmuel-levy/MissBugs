import express from 'express' 

const app = express() 
app.get('/', (req, res) => res.send('Hello Shmuel Levy What Are ')) 
app.get('/api/samuel', (req, res) => res.send('Hello Carmel')) 
app.listen(3030, () => console.log('Server ready at port http://127.0.0.1:3030/'))
console.log('hey:');