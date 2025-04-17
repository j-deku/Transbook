// BotController.js
import { getSessionContext, setSessionContext } from '../manager/sessionManager.js';
import { getResponse } from '../handlers/ResponseHandler.js';
import { updateConversationContext } from '../context/conversationContext.js';

const BotChat = async (req, res) => {
  const { message, language = 'en' } = req.body;

  try {
    // Retrieve user session context
    let userContext = getSessionContext(req);

    // Update the conversation context based on the user's message
    userContext = updateConversationContext(message, userContext);

    // Save the updated context
    setSessionContext(req, userContext);

    // Asynchronously get the bot's response
    const reply = await getResponse(message, language);

    console.log(`[User]: ${message} | [Bot]: ${reply}`);

    // Respond with the bot's reply
    res.json({ reply });
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export default BotChat;
