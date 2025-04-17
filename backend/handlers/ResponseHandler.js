const responses = {
  en: {
    greeting: "Hi there! How can I assist you today? 😊",
    informalGreet: "Yo boss! i'm cuul What's up from your end? Need help? 😐",
    balloon: "We specialize in creating stunning balloon decor for events! Which one do you need, Boss? 🙂",
    flower: "Our floral designs are handcrafted to add elegance to your day! Which one do you need, Boss? 🙂",
    thanks: "You're welcome! Is there anything else I can help you with? 😀",
    mindSet: "Sure! Do you have something specific in mind? 🤔 I'm here for you.",
    negativeMindSet: "Alright, do you have any concerns? I'm here to help you. ",
    feelFree: "Alright, go on... Do you have something else to say? 🤔",
    inCompleteQuest: "Could you please clarify what you mean? 🤔",
    positive: "That's fantastic! How can I make your experience even better? 😊",
    negative: "I'm sorry to hear that. Let me know how I can help make it better. 😔",
    smallTalk: "I'm here to assist! Let me know how I can help you. 😊",
    fallback: "Sorry, I didn't understand that. Could you please clarify that? 😒",
    productDetails: "Here are the details for the product you mentioned:",
  },
};

// Function to generate the appropriate response
const getResponse = async (message, language = 'en') => {
  const langResponses = responses[language] || responses.en;

  try {
    // Step 7: Regex-based fallback logic
    if (/hello|hi|hey/i.test(message)) return langResponses.greeting;
    if (/whatsupp|whatsapp|my gee|guy/i.test(message)) return langResponses.informalGreet;
    if (/balloon/i.test(message)) return langResponses.balloon;
    if (/flower|bouquet/i.test(message)) return langResponses.flower;
    if (/alright|sure|see|wow|great|fantastic|nice/i.test(message)) return langResponses.thanks;
    if (/really|look|okay/i.test(message)) return langResponses.mindSet;
    if (/yes|yeah/i.test(message)) return langResponses.feelFree;
    if (/what|why/i.test(message)) return langResponses.inCompleteQuest;
    if (/not/i.test(message)) return langResponses.negativeMindSet;
    if(/good|great|fantastic|awesome/i.test(message)) return langResponses.positive;
    if(/bad|terrible|horrible|worst/i.test(message)) return langResponses.negative;
    if (/how are you|what's up/i.test(message)) return langResponses.smallTalk;
    if (/chat/i.test(message)) return langResponses.smallTalk;
    if (/bye|goodbye/i.test(message)) return "Goodbye! 👋";

    // Step 8: Default fallback
    return langResponses.fallback;
  } catch (error) {
    console.error("Error in response generation:", error);
    return langResponses.fallback;
  }
};

export { getResponse };
