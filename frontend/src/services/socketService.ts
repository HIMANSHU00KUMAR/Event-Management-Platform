import { io, Socket } from 'socket.io-client';
import { Event, User } from '../types';


class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io('https://event-management-platformbbb.onrender.com');

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinEventRoom(eventId: string) {
    console.log("socketService joining event room", eventId);
    if (this.socket) {
      this.socket.emit('joinEvent', eventId);
    }
  }

  leaveEventRoom(eventId: string) {
    console.log("socketService leaving event room", eventId);
    if (this.socket) {
      this.socket.emit('leaveEvent', eventId);
    }
  }

  onNewEvent(callback: (event: Event) => void) {
    console.log("socketService on new event", callback);
    if (this.socket) {
      this.socket.on('newEvent', callback);
    }
  }

  onAttendeeJoined(callback: (data: { eventId: string; attendee: User }) => void) {
    console.log("socketService on attendee joined", callback);
    if (this.socket) {
      this.socket.on('attendeeJoined', callback);
    }
  }

  removeAllListeners() {
    console.log("socketService removing all listeners");
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = new SocketService();
