const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()


app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
 
 

app.get('/', (req, res) => res.send('Hello World!'))


var workouts = [{"title": "Jogging", "note": "easy", "cbpm": 8},
{"title": "Swimming", "note": "easy", "cbpm": 12},
{"title": "Running", "note": "easy", "cbpm": 10},
{"title": "Boxing", "note": "easy", "cbpm": 5}]
app.get('/workouts', (req, res) => {
        // res.send('Hello World!')
        res.json(workouts);
    }
)

app.post('/workouts', function(req, res) {
    var workout = req.body
    console.log(workout)
    workouts.push(workout)
    res.json(workouts);
}
)

app.listen(3000, () => console.log('Example app listening on port 3000!'))