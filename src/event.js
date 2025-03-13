const fs = require('fs');
const path = require('path');
const express = require('express');

const eventsPath = path.join(__dirname, '../data/events.json');
let events = require(eventsPath);

//save events to events.json
function saveEvents() {
  fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
}

//event management functions
function createEvent(event) {
  events.push(event);
  saveEvents();
  setReminder(event); // Set reminder for the event
}

function getEvents(userId, sortBy = 'date') {
  let userEvents = events.filter(event => event.userId === userId);

  switch (sortBy) {
    case 'date':
      userEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'category':
      userEvents.sort((a, b) => a.category.localeCompare(b.category));
      break;
    case 'reminder':
      userEvents.sort((a, b) => b.reminder - a.reminder);
      break;
  }

  return userEvents;
}

function updateEvent(id, updatedEvent) {
  const index = events.findIndex(event => event.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updatedEvent };
    saveEvents();
  }
}

function deleteEvent(id) {
  events = events.filter(event => event.id !== id);
  saveEvents();
}

module.exports = { createEvent, getEvents, updateEvent, deleteEvent };

//Reminder system
function setReminder(event) {
  const eventTime = new Date(`${event.date}T${event.time}`);
  const now = new Date();
  const timeUntilEvent = eventTime - now;

  if (timeUntilEvent > 0) {
    setTimeout(() => {
      console.log(`Reminder: ${event.name} is scheduled for ${event.date} at ${event.time}`);
      
    }, timeUntilEvent);
  }
}


//Simple user authentication
const users = [
  { id: 1, username: 'user1', password: '123' },
  { id: 2, username: 'user2', password: '456' },
];

function authenticate(username, password) {
  return users.find(user => user.username === username && user.password === password);
}

//Express server setup
const app = express();
app.use(express.json());

//Middleware for authentication
app.use((req, res, next) => {
  const { username, password } = req.headers;
  const user = authenticate(username, password);

  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
});


app.post('/events', (req, res) => {
  const event = { ...req.body, userId: req.user.id };
  createEvent(event);
  res.status(201).send('Event created');
});

app.get('/events', (req, res) => {
  const { sortBy } = req.query;
  const userEvents = getEvents(req.user.id, sortBy);
  res.send(userEvents);
});

app.put('/events/:id', (req, res) => {
  const id = parseInt(req.params.id);
  updateEvent(id, req.body);
  res.send('Event updated');
});

app.delete('/events/:id', (req, res) => {
  const id = parseInt(req.params.id);
  deleteEvent(id);
  res.send('Event deleted');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});