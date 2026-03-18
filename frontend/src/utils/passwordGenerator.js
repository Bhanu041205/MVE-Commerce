// Password Generator Service
// Generates secure random passwords, tracks them, and suggests them to users

const PASSWORD_LENGTH = 12;
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

// Store for tracking assigned passwords (in production, this should be in backend)
let assignedPasswords = new Set();
let currentPassword = generateSecurePassword();
let passwordUpdateInterval = null;

function generateSecurePassword() {
  let password = '';
  const array = new Uint32Array(PASSWORD_LENGTH);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < PASSWORD_LENGTH; i++) {
    password += CHARSET[array[i] % CHARSET.length];
  }
  
  return password;
}

// Encrypt password using simple Base64 + salt (for storage, not cryptographic security)
function encryptPassword(password) {
  const salt = Math.random().toString(36).substring(2, 15);
  const encrypted = btoa(password + salt);
  return `${encrypted}:${salt}`;
}

// Decrypt password
function decryptPassword(encryptedPassword) {
  const [encrypted, salt] = encryptedPassword.split(':');
  try {
    const decrypted = atob(encrypted);
    return decrypted.substring(0, decrypted.length - salt.length);
  } catch (error) {
    console.error('Error decrypting password:', error);
    return null;
  }
}

// Get current suggested password (updates every second)
export function getCurrentSuggestedPassword() {
  return currentPassword;
}

// Start automatic password rotation (every second)
export function startPasswordRotation() {
  if (passwordUpdateInterval) return;
  
  passwordUpdateInterval = setInterval(() => {
    currentPassword = generateSecurePassword();
  }, 1000);
}

// Stop password rotation
export function stopPasswordRotation() {
  if (passwordUpdateInterval) {
    clearInterval(passwordUpdateInterval);
    passwordUpdateInterval = null;
  }
}

// Assign password to a user and track it
export function assignPasswordToUser(userId) {
  // Check if this password is already assigned
  while (assignedPasswords.has(currentPassword)) {
    currentPassword = generateSecurePassword();
  }
  
  // Mark as assigned
  assignedPasswords.add(currentPassword);
  const assignedPassword = currentPassword;
  
  // Store in localStorage for tracking
  const assignments = JSON.parse(localStorage.getItem('passwordAssignments') || '{}');
  assignments[userId] = assignedPassword;
  localStorage.setItem('passwordAssignments', JSON.stringify(assignments));
  
  return assignedPassword;
}

// Encrypt password for storage
export function encryptPasswordForStorage(password) {
  return encryptPassword(password);
}

// Decrypt password from storage
export function decryptPasswordFromStorage(encryptedPassword) {
  return decryptPassword(encryptedPassword);
}

// Check if password is available (not assigned to another user)
export function isPasswordAvailable(password, currentUserId) {
  const assignments = JSON.parse(localStorage.getItem('passwordAssignments') || '{}');
  
  for (const [userId, assignedPwd] of Object.entries(assignments)) {
    if (userId !== currentUserId && assignedPwd === password) {
      return false;
    }
  }
  
  return true;
}

// Get password change frequency in milliseconds
export function getPasswordChangeFrequency() {
  return 1000; // 1 second
}
