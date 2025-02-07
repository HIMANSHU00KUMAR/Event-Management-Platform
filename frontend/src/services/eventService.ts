import api from '../axios';
import { Event } from '../types';
import { AxiosError } from 'axios';
export const eventService = {
  // Get all events
  getAllEvents: async (): Promise<Event[]> => {
    try {
      const response = await api.get('/events');
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Create new event
  createEvent: async (eventData: Omit<Event, 'id' | 'organizer' | 'attendees' | 'createdAt' | 'updatedAt'>) => {
    console.log("creating event", eventData);
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Join event
  joinEvent: async (eventId: string) => {
    try {
      const response = await api.post(`/events/${eventId}/join`);
      return response.data;
    } catch (error) {
      // Check if error is due to already being joined
      if (error instanceof AxiosError && error.response?.status === 400) {
        console.error('Already joined or event is full:', error.response.data.message);
      } else {
        console.error('Error joining event:', error);
      }
      throw error;
    }
  },

  // Get event by ID
  getEventById: async (eventId: string): Promise<Event> => {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    try {
      await api.delete(`/events/${eventId}`);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },
};