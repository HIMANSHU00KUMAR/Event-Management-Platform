import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Avatar,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  Person,
  Edit,
  Delete,
  Category,
  Group,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { eventService } from '../../services/eventService';
import { socketService } from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';
import { Event} from '../../types';

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    loadEventDetails();
    
    if (id) {
      // Connect to socket room for this event
      socketService.connect();
      socketService.joinEventRoom(id);

      // Listen for real-time updates
      socketService.onAttendeeJoined((data) => {
        if (data.eventId === id) {
          setEvent(prev => prev ? {
            ...prev,
            attendees: [...prev.attendees, data.attendee]
          } : null);
        }
      });
    }

    return () => {
      if (id) {
        socketService.leaveEventRoom(id);
        socketService.disconnect();
      }
    };
  }, [id]);

  const loadEventDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const eventData = await eventService.getEventById(id);
      setEvent(eventData);
    } catch (err) {
      setError('Failed to load event details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!id || !event) return;

    try {
      setJoinLoading(true);
      await eventService.joinEvent(id);
      // Update will come through socket
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join event');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!id) return;

    try {
      await eventService.deleteEvent(id);
      navigate('/events');
    } catch (err) {
      setError('Failed to delete event');
    }
    setDeleteDialogOpen(false);
  };

  const isOrganizer = event?.organizer._id === user?._id;
  const hasJoined = event?.attendees.some(attendee => attendee._id === user?._id);
  const isEventFull = event?.maxAttendees 
    ? event.attendees.length >= event.maxAttendees 
    : false;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!event) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Event not found
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {event.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<Category />}
                label={event.category}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<Group />}
                label={`${event.attendees.length}${event.maxAttendees ? `/${event.maxAttendees}` : ''} attendees`}
                color={isEventFull ? "error" : "default"}
                variant="outlined"
              />
            </Box>
          </Box>
          
          {isOrganizer && (
            <Box>
              <IconButton
                color="primary"
                onClick={() => navigate(`/events/edit/${id}`)}
              >
                <Edit />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Delete />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Event Details Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography paragraph>
              {event.description}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ mr: 1 }} />
                <Typography>
                  {format(new Date(event.date), 'PPP p')}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn sx={{ mr: 1 }} />
                <Typography>
                  {event.location}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                <Typography>
                  Organized by {event.organizer.name}
                </Typography>
              </Box>
            </Paper>

            {!isOrganizer && !hasJoined && (
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleJoinEvent}
                disabled={isEventFull || joinLoading}
                sx={{ mt: 2 }}
              >
                {joinLoading ? 'Joining...' : isEventFull ? 'Event Full' : 'Join Event'}
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Attendees Section */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          Attendees
        </Typography>
        <List>
          <Grid container spacing={2}>
            {event.attendees.map((attendee) => (
              <Grid item xs={12} sm={6} md={4} key={attendee._id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>{attendee.name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={attendee.name}
                    secondary={attendee._id === event.organizer._id ? 'Organizer' : 'Attendee'}
                  />
                </ListItem>
              </Grid>
            ))}
          </Grid>
        </List>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this event? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteEvent} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};