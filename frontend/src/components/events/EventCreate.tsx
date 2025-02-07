import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { eventService } from '../../services/eventService';
import dayjs from 'dayjs';

const categories = [
  'Conference',
  'Workshop', 
  'Meetup',
  'Social',
  'Other',
];

export const EventCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    location: '',
    category: '',
    maxAttendees: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Event data before submission:", formData);
  
    try {
      await eventService.createEvent({
        ...formData,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
      });
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };
  


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box maxWidth="md" mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create New Event
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
            
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Date and Time"
                    value={dayjs(formData.date)}
                    onChange={(newValue) => {
                      setFormData({ ...formData, date: newValue?.toDate() || new Date() });
                    }}
                  />
                </LocalizationProvider>
              </Box>
              
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Attendees"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Box>
            </Box>
            
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              size="large"
            >
              Create Event
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};