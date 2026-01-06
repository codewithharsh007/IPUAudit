import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// NEW: Generate college code with format IPU-{PREFIX}-{5CHARS}
export const generateCollegeCode = (collegeName) => {
  // Extract prefix from college name
  const namePrefix = getCollegePrefix(collegeName);
  
  // Generate random 5-character alphanumeric string with at least one number
  const randomPart = generateRandomCode(5);
  
  return `IPU-${namePrefix}-${randomPart}`;
};

// Helper function to extract college prefix
function getCollegePrefix(collegeName) {
  if (!collegeName) return 'COLL';
  
  // Remove common words and clean the name
  const cleanName = collegeName
    .replace(/\b(college|university|institute|of|the|and)\b/gi, '')
    .trim();
  
  // Split into words
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) return 'COLL';
  
  // If single word, take first 4-6 characters
  if (words.length === 1) {
    return words[0].substring(0, Math.min(6, words[0].length)).toUpperCase();
  }
  
  // If multiple words, create acronym from first letters (max 4 letters)
  const acronym = words
    .slice(0, 4)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
  
  return acronym;
}

// Helper function to generate random code with at least one number
function generateRandomCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const numbers = '0123456789';
  let result = '';
  let hasNumber = false;
  
  // Generate random characters
  for (let i = 0; i < length; i++) {
    const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
    result += randomChar;
    
    if (numbers.includes(randomChar)) {
      hasNumber = true;
    }
  }
  
  // If no number was generated, replace a random position with a number
  if (!hasNumber) {
    const randomPos = Math.floor(Math.random() * length);
    const randomNumber = numbers.charAt(Math.floor(Math.random() * numbers.length));
    result = result.substring(0, randomPos) + randomNumber + result.substring(randomPos + 1);
  }
  
  return result;
}
