// Credential Manager - Handles saving and retrieving login credentials

import CryptoJS from 'crypto-js';

const CREDENTIALS_LIST_KEY = 'mve_saved_credentials_list';
const SECRET_KEY = 'mvecommerce_secret_key_2024'; // In production, use environment variables

// Save credentials to localStorage (with encryption) - supports multiple users
export function saveCredentials(email, password, rememberMe) {
  if (!rememberMe) {
    return;
  }

  try {
    // Get existing credentials
    let credentialsList = getAllSavedCredentials();
    
    // Check if email already exists and update it
    const existingIndex = credentialsList.findIndex(c => c.email === email);
    
    const newCredential = {
      email,
      password: encryptValue(password),
      savedAt: new Date().toISOString()
    };
    
    if (existingIndex > -1) {
      credentialsList[existingIndex] = newCredential;
    } else {
      credentialsList.push(newCredential);
    }
    
    localStorage.setItem(CREDENTIALS_LIST_KEY, JSON.stringify(credentialsList));
  } catch (error) {
    console.error('Error saving credentials:', error);
  }
}

// Get all saved credentials from localStorage
export function getAllSavedCredentials() {
  try {
    const stored = localStorage.getItem(CREDENTIALS_LIST_KEY);
    if (!stored) return [];

    return JSON.parse(stored);
  } catch (error) {
    console.error('Error retrieving all credentials:', error);
    return [];
  }
}

// Get saved credentials by email
export function getSavedCredentials(email) {
  try {
    const credentialsList = getAllSavedCredentials();
    if (!credentialsList.length) return null;

    // If email provided, get specific credentials
    if (email) {
      const credentials = credentialsList.find(c => c.email === email);
      if (!credentials) return null;

      return {
        email: credentials.email,
        password: decryptValue(credentials.password)
      };
    }

    // If no email, return the first (most recent)
    const credentials = credentialsList[credentialsList.length - 1];
    return {
      email: credentials.email,
      password: decryptValue(credentials.password)
    };
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    return null;
  }
}

// Search for credentials by email (autocomplete)
export function searchCredentials(searchTerm) {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    const credentialsList = getAllSavedCredentials();
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Return all emails that match the search term
    return credentialsList
      .filter(c => c.email.toLowerCase().includes(lowerSearchTerm))
      .map(c => ({
        email: c.email,
        password: decryptValue(c.password)
      }));
  } catch (error) {
    console.error('Error searching credentials:', error);
    return [];
  }
}

// Check if credentials are saved
export function hasCredentialsSaved() {
  try {
    const credentialsList = getAllSavedCredentials();
    return credentialsList.length > 0;
  } catch (error) {
    return false;
  }
}

// Clear all saved credentials
export function clearCredentials() {
  localStorage.removeItem(CREDENTIALS_LIST_KEY);
}

// Clear specific credential by email
export function clearCredentialsByEmail(email) {
  try {
    let credentialsList = getAllSavedCredentials();
    credentialsList = credentialsList.filter(c => c.email !== email);
    
    if (credentialsList.length === 0) {
      clearCredentials();
    } else {
      localStorage.setItem(CREDENTIALS_LIST_KEY, JSON.stringify(credentialsList));
    }
  } catch (error) {
    console.error('Error clearing specific credentials:', error);
  }
}

// Encrypt value
function encryptValue(value) {
  try {
    return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return value; // Fallback to unencrypted if encryption fails
  }
}

// Decrypt value
function decryptValue(encryptedValue) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return ''; // Return empty string if decryption fails
  }
}
