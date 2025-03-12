const { createEvent, getEvents, updateEvent, deleteEvent } = require('./events');

// Test createEvent
createEvent({
  id: 3,
  name: "Project Deadline",
  description: "Submit final project",
  date: "2024-10-25",
  time: "23:59",
  category: "Appointments",
  reminder: true,
  userId: 1
});

//testing getEvents
console.log(getEvents(1)); // Should log the new event

//testing updateEvents
updateEvent(3, { reminder: false });
console.log(getEvents(1)); // Should log the updated event

//testing deleteEvent
deleteEvent(3);
console.log(getEvents(1)); // Should log events without the deleted one