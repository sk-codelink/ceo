// lib/security.js
// Security utilities for encryption and authentication
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

class SecurityManager {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16;  // 128 bits
  }

  // Generate a random encryption key
  generateKey() {
    return crypto.randomBytes(this.keyLength);
  }

  // Encrypt data using AES-256-GCM
  encrypt(plaintext, key = null) {
    try {
      const encryptionKey = key || this.generateKey();
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipher(this.algorithm, encryptionKey);
      cipher.setAAD(Buffer.from('evo-ai-security'));
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        key: encryptionKey.toString('hex'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  // Decrypt data using AES-256-GCM
  decrypt(encryptedData, keyHex, ivHex, tagHex) {
    try {
      const key = Buffer.from(keyHex, 'hex');
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      
      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAAD(Buffer.from('evo-ai-security'));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}

// RBAC Manager
class RBACManager {
  constructor() {
    this.roles = {
      'admin': ['read', 'write', 'delete', 'encrypt', 'decrypt'],
      'user': ['read', 'write'],
      'guest': ['read']
    };
  }

  // Check if user has permission
  hasPermission(userRole, permission) {
    const userPermissions = this.roles[userRole] || [];
    return userPermissions.includes(permission);
  }

  // Generate JWT token
  generateToken(userId, role = 'user') {
    return jwt.sign(
      { userId, role, iat: Date.now() },
      process.env.JWT_SECRET || 'evo-secret',
      { expiresIn: '24h' }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'evo-secret');
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

// Middleware function for Vercel API routes
export function requirePermission(permission) {
  return (handler) => {
    return async (req, res) => {
      try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }

        const rbac = new RBACManager();
        const decoded = rbac.verifyToken(token);
        const userRole = decoded.role || 'guest';

        if (!rbac.hasPermission(userRole, permission)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        req.user = decoded;
        return handler(req, res);
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    };
  };
}

// Singleton instances
let securityManager = null;
let rbacManager = null;

export function getSecurityManager() {
  if (!securityManager) {
    securityManager = new SecurityManager();
  }
  return securityManager;
}

export function getRBACManager() {
  if (!rbacManager) {
    rbacManager = new RBACManager();
  }
  return rbacManager;
}

export { SecurityManager, RBACManager }; 