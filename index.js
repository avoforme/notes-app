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

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
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

app.get("/api/notes/:id", (request, response) => {
  const id = request.params.id;
  const note = notes.find((note) => note.id === id);
  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});
// for backend, Now app.get('/api/notes/:id', ...) will handle all HTTP GET requests that are of the form /api/notes/SOMETHING, where SOMETHING is an arbitrary string.

// DELETE
app.delete("/api/notes/:id", (request, response) => {
  const id = request.params.id;
  notes = notes.filter((note) => note.id !== id);

  response.status(204).end();
});

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

app.post("/api/notes", (request, response) => {
  // Without the json-parser, the body property would be undefined.
  // The json-parser takes the JSON data of a request, transforms it into a JavaScript object and then attaches it to the body property of the request object before the route handler is called.

  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const note = {
    content: body.content,
    // Boolean turns a value into a boolean.
    important: Boolean(body.important) || false,
    id: generateId(),
  };

  notes = notes.concat(note);

  response.json(note);
});

// using post-route middleware
app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
