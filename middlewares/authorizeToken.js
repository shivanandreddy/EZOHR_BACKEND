import jwt from "jsonwebtoken";

const authorizeToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verifies token and decodes { id, email, role, iat, exp }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded properties directly to req.user
    req.user = decoded; 
    
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

export default authorizeToken;