const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

// const url = `mongodb+srv://fullstack:${password}@fullstackopen.e8r4b.mongodb.net/?retryWrites=true&w=majority&appName=fullstackopen`
const url = `mongodb+srv://fullstack:${password}@fullstackopen.e8r4b.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)

mongoose.connect(url)

// define schema for note
const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

// create model for note
const Note = mongoose.model('Note', noteSchema)

// const note = new Note({
//   content: 'HTML is easy',
//   important: true,
// })

// note.save().then(result => {
//   console.log('note saved!')
//   mongoose.connection.close()
// })

Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})