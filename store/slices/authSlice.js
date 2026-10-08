import { createSlice } from '@reduxjs/toolkit';

const getInitialUser = () => {
  if (typeof window !== 'undefined') {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

const initialUser = getInitialUser();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    isAuthenticated: !!initialUser,
    token: null
  },
  reducers: {
    setUser: (state, action) => {
      const userData = action.payload?.user ? action.payload.user : action.payload;
      state.user = userData;
      state.isAuthenticated = !!userData;
      if (typeof window !== 'undefined') {
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          localStorage.removeItem('user');
        }
      }
    },
    setCredentials: (state, action) => {
      const userData = action.payload?.user ? action.payload.user : action.payload;
      const token = action.payload?.token || 'jwt-session-token';
      state.user = userData;
      state.isAuthenticated = !!userData;
      state.token = token;
      if (typeof window !== 'undefined') {
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    },
  },
});

export const { setUser, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;