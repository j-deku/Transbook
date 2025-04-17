export const updateConversationContext = (message, currentContext) => {
    if (/event|plan|organize/i.test(message)) {
      currentContext = {
        ...currentContext,
        eventInquiry: true, 
      };
    } else if (/balloon|flower/i.test(message)) {
      currentContext = {
        ...currentContext,
        productInquiry: true,
      };
    } else {
      currentContext = {
        ...currentContext,
        generalInquiry: true, 
      };
    }
  
    return currentContext;
  };
  