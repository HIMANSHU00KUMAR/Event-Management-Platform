const express = require("express");
const Event = require("../models/eventModel");
const auth = require("../middleware/authmiddleware");
const router = express.Router();

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name email")
      .populate("attendees", "name email")
      .sort({ date: 1 });
    res.json(events);
    console.log("get all events",events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events" });
  }
});

// Create new event
router.post("/", auth, async (req, res) => {
  console.log("create event backend", req.body);
  console.log("create event backend user", req.user);
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user._id,
    });
    await event.save();
    
    // Populate organizer and attendees before emitting
    const populatedEvent = await Event.findById(event._id)
      .populate("organizer", "name email")
      .populate("attendees", "name email");
    
    // Emit socket event for real-time updates
    const io = req.app.get("io");
    if (io) {
      console.log("emitting new event from backend", populatedEvent);
      io.emit("newEvent", populatedEvent);
    }
    
    res.status(201).json(populatedEvent);
    console.log("new event created", populatedEvent);
  } catch (error) {
    console.log("error creating event",error);
    res.status(500).json({ message: "Error creating event" });
  }
});

// Join event
router.post("/:id/join", auth, async (req, res) => {
  console.log("join event", req.params.id, req.user);
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.attendees.includes(req.user._id)) {
      return res.status(400).json({ message: "Already joined this event" });
    }

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: "Event is full" });
    }

    event.attendees.push(req.user._id);
    await event.save();

    // Get populated user data for real-time update
    const populatedUser = await req.user.populate("name email");
    console.log("populated user", populatedUser);

    // Emit socket event for real-time updates
    const io = req.app.get("io");
    if (io) {
      console.log("emitting attendee joined from backend", event);
      io.to(req.params.id).emit("attendeeJoined", {
        eventId: req.params.id,
        attendee: populatedUser
      });
    }

    // Return populated event
    const populatedEvent = await Event.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("attendees", "name email");

    res.json(populatedEvent);
    console.log("user joined event", populatedEvent);
  } catch (error) {
    console.log("error joining event", error);
    res.status(500).json({ message: "Error joining event" });
  }
});

module.exports = router;