const express = require('express');
const { Client } = require('pg');

const client = new Client();

client.connect();

const app = express();
app.use(express.json());

const port = 8080;

async function getHighscores() {
    res = await client.query(
        'select username, score from scores order by score desc limit 100'
    );
    return res.rows;
}

async function updateScore(username, newScore) {
    if (await doesUserExist(username)) {
        res = await client.query(
            'update scores set score=GREATEST(score, $2) where username=$1',
            [username, newScore]
        );
    } else {
        res = await client.query(
            'insert into scores (username, score) values ($1, $2)',
            [username, newScore]
        );
    }
}

async function doesUserExist(username) {
    res = await client.query(
        'select count(id) from scores where username=$1',
        [username]
    );
    let count = res.rows[0].count;
    return count >= 1;
}

// This is our route for retrieving a high score list
async function handleGetHighscores(req, res) {
    console.log("Handling GET @ /api/v1/highscores");
    res.send(await getHighscores());
}
app.get('/api/v1/highscores', handleGetHighscores);

// This is a route for update the high score of a user
async function handlePostHighscores(req, res) {
    console.log("Handling POST @ /api/v1/highscores");
    let data = req.body;
    let newScore = data.score;
    let username = data.username;
    console.log(`\tUpdating new score: ${JSON.stringify(data)}`);
    await updateScore(username, newScore)
    res.send('OK');
}
app.post('/api/v1/highscores', handlePostHighscores);

app.listen(
    port,
    () => console.log(`Example app listening at http://localhost:${port}`)
);