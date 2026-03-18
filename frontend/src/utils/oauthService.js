import { loginWithGoogle } from '../api/endpoints';
import { setToken, setUser } from '../store/authSlice';
import { saveCredentials } from './credentialManager';
import { isAdminUser } from './roleUtils';
import toast from 'react-hot-toast';

// Google OAuth Flow Implementation
export const handleGoogleLogin = async (formData, dispatch, navigate) => {
  try {
    // Check if Google SDK is loaded
    if (!window.google || !window.google.accounts) {
      throw new Error('Google Sign-In SDK not loaded. Please refresh the page and try again.');
    }

    // Return a promise that resolves when authentication is complete
    return new Promise((resolve, reject) => {
      // Initialize Google Sign-In with callback
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        callback: async (response) => {
          try {
            if (!response.credential) {
              throw new Error('No credential received from Google');
            }

            console.log('✅ Google credential received, sending to backend...');
            
            // Send credential to backend for verification
            const result = await loginWithGoogle(response.credential);
            
            if (result.data && result.data.token && result.data.user) {
              const { token, user } = result.data;
              
              console.log('✅ Backend verified token, user:', user.email);
              
              // Dispatch Redux actions to update app state
              dispatch(setToken(token));
              dispatch(setUser(user));
              
              // Store authentication data in localStorage
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(user));
              
              // Save credentials for future logins
              saveCredentials(user.email, 'google-oauth', true);
              
              // Show success message
              toast.success(`Welcome ${user.firstName}! 🎉`);
              
              // Determine redirect path based on user role
              const redirectPath = isAdminUser(user) ? '/admin/dashboard' : '/';
              
              console.log('🚀 Redirecting to:', redirectPath);
              
              // Navigate immediately
              navigate(redirectPath);
              
              // Resolve the promise
              resolve(result.data);
            } else {
              throw new Error('Invalid response from server - missing token or user data');
            }
          } catch (error) {
            console.error('❌ Google callback error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Google authentication failed';
            toast.error(errorMsg);
            reject(new Error(errorMsg));
          }
        },
        error_callback: () => {
          const errorMsg = 'Google Sign-In was interrupted or user cancelled';
          console.error('❌', errorMsg);
          reject(new Error(errorMsg));
        }
      });

      // Trigger Google Account Chooser (shows all user's Google accounts)
      console.log('📱 Showing Google Account Chooser...');
      window.google.accounts.id.prompt(
        (notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('ℹ️ One Tap UI not displayed, using account chooser instead');
          }
        }
      );
    });
  } catch (error) {
    console.error('❌ Google login initialization error:', error);
    toast.error(error.message || 'Failed to initialize Google Sign-In');
    throw error;
  }
};

export const handleGitHubLogin = async () => {
  throw new Error('GitHub login has been disabled.');
};

export const setupGoogleOAuth = () => {
  // Initialize Google OAuth
  // Add this to your .env file:
  // REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
  
  // Add this script to index.html <head>:
  // <script src="https://accounts.google.com/gsi/client" async defer></script>
};

export const setupGitHubOAuth = () => {
  // GitHub OAuth has been disabled
};

export const oauthCallbacks = {
  onGoogleSuccess: (credentialResponse) => {
    console.log('Google OAuth Success:', credentialResponse);
    // Handle successful Google login
  },
  onGoogleError: () => {
    console.error('Google OAuth Failed');
  },
};
