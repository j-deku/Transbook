import africastalking from 'africastalking';

const africasTalkingClient = africastalking({
  apiKey: process.env.AT_API_KEY, // Your Africa's Talking API key
  username: process.env.AT_USERNAME, // Your Africa's Talking username
});

export const sendSMSNotification = async (to, message) => {
  const sms = africasTalkingClient.SMS;
  const options = {
    to: [to], // Recipient's phone number in E.164 format (e.g., "+233244556677")
    message: message,
    // from: process.env.AT_SENDER_ID, // Optional: Your Africa's Talking sender ID
  };

  try {
    const response = await sms.send(options);
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};
