
import api from "./api";

// ============================================
// GET CHAT HISTORY
// ============================================

export const getChatMessages = async (
  userId,
  options = {}
) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const {
    limit = 100,
    before = null,
    afterCreatedAt = null,
    afterId = null,
  } = options;

  const params = { limit };

  if (before) {
    params.before = before;
  }

  if (afterCreatedAt && afterId) {
    params.afterCreatedAt = afterCreatedAt;
    params.afterId = afterId;
  }

  const response = await api.get(
    `/messages/${userId}`,
    { params }
  );

  const messages = response.data?.messages;

  if (!Array.isArray(messages)) {
    throw new Error(
      "Invalid chat history response from server"
    );
  }

  return messages;
};


// ============================================
// SEND MESSAGE THROUGH REST
// ============================================

export const sendMessageApi = async (
  userId,
  {
    text,
    clientMessageId,
  }
) => {
  if (!userId || !text?.trim() || !clientMessageId) {
    throw new Error("Invalid message payload");
  }

  const response = await api.post(
    `/messages/${userId}`,
    {
      text: text.trim(),
      clientMessageId,
    }
  );

  const message = response.data?.message;

  if (!message) {
    throw new Error(
      "Server returned no saved message"
    );
  }

  return message;
};
