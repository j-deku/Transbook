// sentimentAnalyzer.js
const sentimentAnalyzer = (message) => {
    if (/amazing|great|love|awesome/i.test(message)) return "positive";
    if (/angry|bad|slow|annoyed/i.test(message)) return "negative";
    return "neutral";
  };
  
  export { sentimentAnalyzer };
  