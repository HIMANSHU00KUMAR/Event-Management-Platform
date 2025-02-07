export interface User {
    _id: string;
    email: string;
    name: string;
    isGuest?: boolean;
  }
  
  export interface Event {
    _id: string;
    title: string;
    description: string;
    date: Date;
    location: string;
    category: string;
    organizer: User;
    attendees: User[];
    maxAttendees?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    guestLogin: () => Promise<void>;
  }