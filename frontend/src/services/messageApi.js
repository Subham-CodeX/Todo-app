import api from "./api";

// ============================================
// GET CHAT HISTORY
// ============================================

export const getChatMessages =
  async (
    userId,
    options = {}
  ) => {
    const {
      limit = 100,
      before = null,
      after = null,
    } = options;

    const params = {
      limit,
    };

    if (before) {
      params.before = before;
    }

    if (after) {
      params.after = after;
    }

    const response =
      await api.get(
        `/messages/${userId}`,
        {
          params,
        }
      );

    return (
      response.data?.messages ||
      []
    );
  };

// ============================================
// SEND MESSAGE THROUGH REST
// ============================================

export const sendMessageApi =
  async (
    userId,
    {
      text,
      clientMessageId,
    }
  ) => {
    const response =
      await api.post(
        `/messages/${userId}`,
        {
          text,

          clientMessageId,
        }
      );

    return response.data?.message;
  };