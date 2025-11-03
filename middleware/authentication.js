import jwt from 'jsonwebtoken'

//change 'changeme' to a strong secret in production
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.authToken
    if (!token) {
      return res.status(401).json({ error: 'Not Authorized' })
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
