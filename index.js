const express = require("express");
const app = express();
require('dotenv').config();
const Note = require('./models/note')


let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true,
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

// defining middleware
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};


// using post-route middleware
app.use(express.static('dist'))
const cors = require('cors')
app.use(cors())

app.use(express.json());
app.use(requestLogger);


// GET
app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

// app.get("/api/notes", (request, response) => {
//   response.json(notes);
// });

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})


app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})
//findById is a method of mongoose

// DELETE
app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// POST
const generateId = () => {
  const maxId =
    notes.length > 0 ? Math.max(...notes.map((n) => Number(n.id))) : 0;
  // The spread operator (...) takes an array and expands it into a list of arguments.
  // notes.map(n => n.id) creates a new array that contains all the ids of the notes in number form.
  // Math.max returns the maximum value of the numbers that are passed to it.
  // However, notes.map(n => Number(n.id)) is an array so it can't directly be given as a parameter to Math.max. The array can be transformed into individual numbers by using the "three dot" spread syntax ....

  return String(maxId + 1);
};


app.post('/api/notes', (request, response, next) => {
  // Without the json-parser, the body property would be undefined.
  // The json-parser takes the JSON data of a request, transforms it into a JavaScript object and then attaches it to the body property of the request object before the route handler is called.

  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  }).catch(error => next(error))

})

// EDIT
app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

// using post-route middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } 

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
