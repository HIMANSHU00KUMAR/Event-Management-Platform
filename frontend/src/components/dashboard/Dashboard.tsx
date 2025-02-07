import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Select,
  MenuItem,
  FormControl,
  
} from '@mui/material';
import { Event } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { eventService } from '../../services/eventService';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [eventStatus, setEventStatus] = useState<string>('upcoming');
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    eventsJoined: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [eventStatus, events]);

  const loadDashboardData = async () => {
    try {
      const eventsData = await eventService.getAllEvents();
      setEvents(eventsData);
      filterEvents(eventsData);

      const upcoming = eventsData.filter((event) => new Date(event.date) > new Date());
      setStats({
        totalEvents: eventsData.length,
        upcomingEvents: upcoming.length,
        eventsJoined: eventsData.filter((event) =>
          event.attendees.some((attendee) => attendee._id === user?._id)
        ).length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const filterEvents = (allEvents = events) => {
    const now = new Date();
    let filtered: Event[] = [];

    if (eventStatus === 'upcoming') {
      filtered = allEvents.filter((event) => new Date(event.date) > now);
    } else if (eventStatus === 'completed') {
      filtered = allEvents.filter((event) => new Date(event.date) <= now);
    } else {
      filtered = allEvents;
    }

    setFilteredEvents(filtered);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Events
              </Typography>
              <Typography variant="h3">{stats.totalEvents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Upcoming Events
              </Typography>
              <Typography variant="h3">{stats.upcomingEvents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Events Joined
              </Typography>
              <Typography variant="h3">{stats.eventsJoined}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Event Status Dropdown */}
      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        
        <Select
          value={eventStatus}
          onChange={(e) => setEventStatus(e.target.value)}
        >
          <MenuItem value="upcoming">Upcoming Events</MenuItem>
          <MenuItem value="completed">Completed Events</MenuItem>
          <MenuItem value="all">All Events</MenuItem>
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        {filteredEvents.map((event) => (
          <Grid item xs={12} md={4} key={event._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{event.title}</Typography>
                <Typography color="textSecondary">
                  {new Date(event.date).toLocaleDateString()}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`${event.attendees.length} attendees`}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
