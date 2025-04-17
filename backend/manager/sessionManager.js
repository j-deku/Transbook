const getSessionContext = (req) => {
    // Assuming session data is stored in `req.session` or similar
    return req.session?.context || {};
  };
  
  // Function to set the user session context
  const setSessionContext = (req, context) => {
    req.session.context = context;
  };
  
  export { getSessionContext, setSessionContext };
  