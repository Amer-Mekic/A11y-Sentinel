import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  // Get jwt from cookies 
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Access token required, log into the app' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {id: decoded.id}; // Add user data to request object
    next(); // Authentication passed, move to the actual route handler
  } catch (error) {
    // Clear invalid cookie
    res.clearCookie('token');
    return res.status(403).json({ error: 'Invalid token' });
  }
};