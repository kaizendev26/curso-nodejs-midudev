const z = require('zod')

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'movie tittle must be a string',
        required_error: 'movie title is required. Please check url'
    }),
    year: z.number().int().positive().min(1990).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(5),
    poster: z.string().url({
        message: 'poster must be a valid url'
    }),
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Crime', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi'],
            {
                required_error: 'Movie genre is required.',
                invalid_type_error: 'Movie genre must be an array of enum Genre'
            }
        )
    )
})

function validateMovie (object) {
    return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
    return movieSchema.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    validatePartialMovie
}