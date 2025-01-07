const express = require('express');
const crypto = require('node:crypto');

const movies = require('./movies.json');
const { validateMovie,validatePartialMovie } = require('./schemas/movies');

const app = express();

app.use(express.json());

const ACCEPTED_ORIGINS =[
    'http://127.0.0.1:5500',
    'http://localhost:8080',
    'http://localhost:1234',
    'http://movies.com'
]

app.get('/movies', (req, res) => {
    const origin = req.header('origin')
    if(ACCEPTED_ORIGINS.includes(origin)){     
        res.header('Access-Control-Allow-Origin', origin);
    }
    const {genre} = req.query
    if(genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase()));
        console.log(genre)
        return res.json(filteredMovies)
    }
    res.json(movies)
}) 

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id);
    if(movie) return res.json(movie)

    res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)

    if(result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }

    movies.push(newMovie);
    res.status(201).json(newMovie);
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)
    
    if(result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id);
    if(movieIndex < 0) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    const updatedMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updatedMovie;

    res.json(updatedMovie)

})

app.delete('/movies/:id', (req, res) => {
    const origin = req.header('origin')
    if(ACCEPTED_ORIGINS.includes(origin)){     
        res.header('Access-Control-Allow-Origin', origin);
    }
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id);
    if(movieIndex < 0) {
        return res.status(404).json({ message: 'Movie not found' })
    }
    movies.splice(movieIndex, 1);
    return res.json({ message: 'Movie deleted successfully' })
})

app.options('/movies/:id', (req, res) => {
    const origin = req.header('origin')
    if(ACCEPTED_ORIGINS.includes(origin)){     
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    }
    res.sendStatus(200)
})


const port = process.env.PORT || 1234;

app.listen(port,()=>{
    console.log(`Server running on port http://localhost:${port}`);
})