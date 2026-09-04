import API from "./api";


// ==========================================
// SEARCH USERS
// ==========================================

export const searchUsers =
  async (query) => {

    const response =
      await API.get(
        "/users/search",
        {
          params: {
            q: query,
          },
        }
      );

    return response.data;
  };


// ==========================================
// SEND CONNECTION REQUEST
// ==========================================

export const sendConnectionRequest =
  async (userId) => {

    const response =
      await API.post(
        `/connections/request/${userId}`
      );

    return response.data;
  };


// ==========================================
// GET INCOMING REQUESTS
// ==========================================

export const getIncomingRequests =
  async () => {

    const response =
      await API.get(
        "/connections/requests/incoming"
      );

    return response.data;
  };


// ==========================================
// GET SENT REQUESTS
// ==========================================

export const getSentRequests =
  async () => {

    const response =
      await API.get(
        "/connections/requests/sent"
      );

    return response.data;
  };


// ==========================================
// ACCEPT REQUEST
// ==========================================

export const acceptConnectionRequest =
  async (connectionId) => {

    const response =
      await API.put(
        `/connections/${connectionId}/accept`
      );

    return response.data;
  };


// ==========================================
// REJECT REQUEST
// ==========================================

export const rejectConnectionRequest =
  async (connectionId) => {

    const response =
      await API.put(
        `/connections/${connectionId}/reject`
      );

    return response.data;
  };


// ==========================================
// GET CONNECTED USERS
// ==========================================

export const getConnectedUsers =
  async () => {

    const response =
      await API.get(
        "/connections"
      );

    return response.data;
  };


// ==========================================
// BLOCK USER
// ==========================================

export const blockUser =
  async (userId) => {

    const response =
      await API.put(
        `/connections/block/${userId}`
      );

    return response.data;
  };


// ==========================================
// UNBLOCK USER
// ==========================================

export const unblockUser =
  async (userId) => {

    const response =
      await API.delete(
        `/connections/block/${userId}`
      );

    return response.data;
  };


// ==========================================
// GET BLOCKED USERS
// ==========================================

export const getBlockedUsers =
  async () => {

    const response =
      await API.get(
        "/connections/blocked"
      );

    return response.data;
  };