import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  // Expect token in Authorization header in the format "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized. Please log in again." });
  }

  const token = authHeader.split(" ")[1];

  // Check if token is empty or literally "null"
  if (!token || token.trim() === "" || token === "null") {
    return res.status(401).json({ success: false, message: "Not authorized. Please log in again." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach decoded user data to the request; adjust property names as needed
    req.user = decoded;
    req.body.userId = decoded.id; // if your token has an 'id' property
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    console.error("Authentication error:", error);
    return res.status(401).json({ success: false, message: "Not authorized. Please log in again." });
  }
};

export default authMiddleware;
