require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {ObjectID}  = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', (req,res) => {
  Todo.find().then((todos) => {
     res.send({todos})
  }, (e)=> {
     res.status(400).send(e);
  })
});

app.get('/todos/:id', (req,res) => {
  const id = req.params.id;
  
  //Valid using isValid
  if (!ObjectID.isValid(id)) {
     return res.status(404).send();
  }
  //FindById
  Todo.findById(id).then((todo) => {
    //Success
    // If no todo - send back 404 with empty body
    if (!todo) {
      res.status(404).send();
    }
    //If todo - send it back
    res.send({todo})
    //Error
     //404 - and send empty body back
  }).catch((e) => {
    res.status(404).send();
  });
});

app.delete('/todos/:id', (req,res) => {
  const id = req.params.id;
  console.log(id);
  if (!ObjectID.isValid(id)) {
     return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((result) => {
    if (!result)  {
      return res.status(404).send();
    }
    res.send(`Item ${id} removed`);
  }).catch((e) => res.status(400).send());

});

app.patch('/todos/:id', (req,res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['text','completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new:true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});

//post /USERS
app.post('/users', (req,res) => {
  var body = _.pick(req.body,['email','password']);
  var user = new User(body);

  user.save().then(() => {
   return  user.generateAuthToken();
  }).then((token) => {
     res.header('x-auth', token).send(user);
  }).catch((e) => {
     res.status(400).send(e);
  })
});

app.listen(port, () => {
  console.log(`started at port ${port}`);
});

module.exports = {app};
