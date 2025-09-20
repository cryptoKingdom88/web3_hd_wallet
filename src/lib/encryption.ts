import CryptoJS from 'crypto-js';

// Generate browser unique key (fingerprinting)
const generateBrowserKey = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || 'unknown',
    (navigator as unknown).deviceMemory || 'unknown'
  ].join('|');

  return CryptoJS.SHA256(fingerprint).toString();
};

// Generate master key (browser key + fixed salt)
const getMasterKey = (): string => {
  const browserKey = generateBrowserKey();
  const salt = 'hd-wallet-secure-salt-2024';
  return CryptoJS.PBKDF2(browserKey + salt, salt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString();
};

// Data encryption
export const encryptData = (data: unknown): string => {
  try {
    const masterKey = getMasterKey();
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, masterKey).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Data decryption
export const decryptData = (encryptedData: string): unknown => {
  try {
    const masterKey = getMasterKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, masterKey);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);

    if (!jsonString) {
      throw new Error('Failed to decrypt data - invalid key or corrupted data');
    }

    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Secure storage interface
export const secureStorage = {
  setItem: (key: string, value: unknown): void => {
    try {
      const encryptedValue = encryptData(value);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Secure storage setItem failed:', error);
      // Fallback to session storage
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  },

  getItem: (key: string): unknown => {
    try {
      // Try localStorage first
      const encryptedValue = localStorage.getItem(key);
      if (encryptedValue) {
        return decryptData(encryptedValue);
      }

      // Fallback to session storage check
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue) {
        return JSON.parse(sessionValue);
      }

      return null;
    } catch (error) {
      console.error('Secure storage getItem failed:', error);
      // Delete data on decryption failure (security safe)
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },

  clear: (): void => {
    // Delete only HD Wallet related data
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('hd-wallet-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clean up session storage as well
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('hd-wallet-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }
};

// Additional security features
export const securityUtils = {
  // Mask sensitive data
  maskSensitiveData: (data: string, visibleChars: number = 6): string => {
    if (!data || data.length <= visibleChars * 2) return data;
    const start = data.slice(0, visibleChars);
    const end = data.slice(-visibleChars);
    const middle = '•'.repeat(Math.min(data.length - visibleChars * 2, 20));
    return `${start}${middle}${end}`;
  },

  // Verify data integrity
  verifyDataIntegrity: (data: unknown): boolean => {
    try {
      return !!(
        data &&
        typeof data === 'object' &&
        data !== null &&
        'isAuthenticated' in data &&
        'privateKey' in data &&
        'walletAddress' in data &&
        'emailAddress' in data
      );
    } catch {
      return false;
    }
  },

  // Auto logout timer (automatic logout after certain time for security)
  setupAutoLogout: (callback: () => void, timeoutMinutes: number = 60): number => {
    return window.setTimeout(callback, timeoutMinutes * 60 * 1000);
  },

  // Detect browser environment changes (security risk detection)
  detectEnvironmentChange: (): boolean => {
    const currentFingerprint = generateBrowserKey();
    const storedFingerprint = localStorage.getItem('hd-wallet-fingerprint');

    if (!storedFingerprint) {
      localStorage.setItem('hd-wallet-fingerprint', currentFingerprint);
      return false;
    }

    return currentFingerprint !== storedFingerprint;
  }
};