import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    // Or get token from cookie
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
};

/**
 * Middleware to verify two-factor authentication
 */
export const verifyTwoFactor = async (req, res, next) => {
  // Skip 2FA check if not enabled for user
  if (!req.user.twoFactorEnabled) {
    return next();
  }

  const { twoFactorToken } = req.body;

  if (!twoFactorToken) {
    return res.status(401).json({
      success: false,
      error: 'Two-factor authentication token is required'
    });
  }

  // Verify the token (implementation depends on your 2FA method)
  const isValid = await verifyTwoFactorToken(req.user, twoFactorToken);

  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid two-factor authentication token'
    });
  }

  next();
};

/**
 * Helper function to verify 2FA token
 */
const verifyTwoFactorToken = async (user, token) => {
  // This is a placeholder. Implement your 2FA verification logic here.
  // For example, using speakeasy for TOTP:
  // return speakeasy.totp.verify({
  //   secret: user.twoFactorSecret,
  //   encoding: 'base32',
  //   token: token
  // });
  
  // For demo purposes, we'll just return true
  return true;
};
