const axios = require('axios');

const DAILY_API_KEY = process.env.DAILY_API_KEY || '';
const DAILY_API_URL = 'https://api.daily.co/v1';

// Create a Daily.co room
const createRoom = async (roomName, config = {}) => {
  try {
    const response = await axios.post(
      `${DAILY_API_URL}/rooms`,
      {
        name: roomName,
        privacy: 'private',
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          enable_knocking: false,
          enable_recording: config.enableRecording || false,
          ...config.properties
        },
        ...config
      },
      {
        headers: {
          'Authorization': `Bearer ${DAILY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Daily.co room creation error:', error.response?.data || error.message);
    throw error;
  }
};

// Get room token for a user
const getRoomToken = async (roomName, userId, userName, isOwner = false) => {
  try {
    const response = await axios.post(
      `${DAILY_API_URL}/meeting-tokens`,
      {
        properties: {
          room_name: roomName,
          user_id: userId,
          user_name: userName,
          is_owner: isOwner,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours expiry
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${DAILY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.token;
  } catch (error) {
    console.error('Daily.co token creation error:', error.response?.data || error.message);
    throw error;
  }
};

// Delete a room
const deleteRoom = async (roomName) => {
  try {
    const response = await axios.delete(
      `${DAILY_API_URL}/rooms/${roomName}`,
      {
        headers: {
          'Authorization': `Bearer ${DAILY_API_KEY}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Daily.co room deletion error:', error.response?.data || error.message);
    throw error;
  }
};

// Get room info
const getRoomInfo = async (roomName) => {
  try {
    const response = await axios.get(
      `${DAILY_API_URL}/rooms/${roomName}`,
      {
        headers: {
          'Authorization': `Bearer ${DAILY_API_KEY}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Daily.co room info error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  createRoom,
  getRoomToken,
  deleteRoom,
  getRoomInfo
};

