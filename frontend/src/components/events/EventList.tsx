import React, { useEffect, useState } from 'react';
import { eventService } from '../../services/eventService';
import { socketService } from '../../services/socketService';
import { Event } from '../../types';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Connect to WebSocket
    socketService.connect();

    // Load initial events
    loadEvents();

    // Listen for new events
    socketService.onNewEvent((newEvent) => {
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    });

    // Listen for attendee updates
    socketService.onAttendeeJoined(({ eventId, attendee }) => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId
            ? { ...event, attendees: [...event.attendees, attendee] }
            : event
        )
      );
    });

    // Subscribe to all existing event rooms on initial load
    events.forEach(event => {
      socketService.joinEventRoom(event._id);
    });

    // Cleanup
    return () => {
      // Leave all event rooms before disconnecting
      events.forEach(event => {
        socketService.leaveEventRoom(event._id);
      });
      socketService.disconnect();
      socketService.removeAllListeners();
    };
  }, [events.length]); // Add events.length as dependency to re-run when new events are loaded

  const loadEvents = async () => {
    try {
      const eventList = await eventService.getAllEvents();
      setEvents(eventList);
      // Join all event rooms after loading
      eventList.forEach(event => {
        socketService.joinEventRoom(event._id);
      });
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      const updatedEvent = await eventService.joinEvent(eventId);
      socketService.joinEventRoom(eventId);
      
      // Update the events state immediately with the returned event data
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === eventId ? updatedEvent : event
        )
      );
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const getEventButton = (event: Event) => {
    if (!user) return null;

    const isAttending = event.attendees.some(attendee => attendee._id === user._id);
    console.log("isAttending", isAttending, event.attendees);
    console.log("user", user._id);
    const isFull = event.maxAttendees && event.attendees.length >= event.maxAttendees;

    if (isAttending) {
      return (
        <Button
          variant="contained"
          color="success"
          size="small"
          disabled
        >
          Already Joined
        </Button>
      );
    }

    if (isFull) {
      return (
        <Button
          variant="contained"
          color="error"
          size="small"
          disabled
        >
          Event Full
        </Button>
      );
    }

    return (
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => handleJoinEvent(event._id)}
      >
        Join Event
      </Button>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Events
      </Typography>
      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} md={4} key={event._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{event.title}</Typography>
                <Typography color="textSecondary" gutterBottom>
                  {new Date(event.date).toLocaleDateString()}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {event.location}
                </Typography>
                <Typography variant="body2" paragraph>
                  {event.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label={`${event.attendees.length} attendees`}
                    size="small"
                  />
                  {getEventButton(event)}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};