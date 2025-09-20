import { create } from 'zustand';
import { persist, type StorageValue } from 'zustand/middleware';
import { secureStorage } from '@/lib/encryption';
import { type WalletInfo, type MasterKeyData, type TokenBalance, getMasterSeed, getSessionKey, generateMultipleWallets, findLastWalletWithBalance } from '@/lib/hdWallet';
import { walletStorage } from '@/lib/walletStorage';

export interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  
  // Master key data
  masterKeyData: MasterKeyData | null;
  
  // Managed wallets
  wallets: WalletInfo[];
  lastWalletIndex: number;
  
  // User information
  createdAt: Date | null;
  lastLoginAt: Date | null;
}

export interface AuthActions {
  // Login with email and wallet password
  login: (email: string, walletPassword: string) => Promise<void>;
  
  // Logout
  logout: () => Promise<void>;
  
  // Add wallets to managed list
  addWallets: (wallets: WalletInfo[]) => void;
  
  // Update wallet balance
  updateWalletBalance: (address: string, balance: string, tokens?: TokenBalance[]) => void;
  
  // Check authentication status
  checkAuth: () => boolean;
  
  // Get current user email
  getCurrentEmail: () => string | null;
  
  // Get master key for wallet operations
  getMasterKey: () => string | null;
}

export type AuthStore = AuthState & AuthActions;


const initialState: AuthState = {
  isAuthenticated: false,
  masterKeyData: null,
  wallets: [],
  lastWalletIndex: -1,
  createdAt: null,
  lastLoginAt: null,
};

// Auto logout timer variables
let logoutTimer: NodeJS.Timeout | null = null;
const AUTO_LOGOUT_MS = 10 * 60 * 1000; // 10 minutes

function startLogoutTimer(logoutFn: () => void) {
  if (logoutTimer) clearTimeout(logoutTimer);
  logoutTimer = setTimeout(() => {
    logoutFn();
  }, AUTO_LOGOUT_MS);
}

function resetLogoutTimer(logoutFn: () => void) {
  startLogoutTimer(logoutFn);
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      // Login function: stores only sessionKey in sessionStorage, does not persist masterKey
      login: async (email: string, walletPassword: string) => {
        try {
          const now = new Date();
          const masterKey = await getMasterSeed(email, walletPassword);
          const sessionKey = await getSessionKey(email, walletPassword);

          // Store only sessionKey in sessionStorage
          sessionStorage.setItem('sessionKey', sessionKey);

          let lastIndex = walletStorage.getLastWalletIndex(sessionKey);
          let wallets: WalletInfo[] = [];

          if (lastIndex !== null) {
            wallets = generateMultipleWallets(masterKey, 0, lastIndex + 1);
          } else {
            const lastActiveIndex = await findLastWalletWithBalance(masterKey, 20);
            if (lastActiveIndex >= 0) {
              wallets = generateMultipleWallets(masterKey, 0, lastActiveIndex + 1);
              lastIndex = lastActiveIndex;
            } else {
              wallets = generateMultipleWallets(masterKey, 0, 1);
              lastIndex = 0;
            }
            walletStorage.setLastWalletIndex(sessionKey, lastIndex);
          }

          // Only store email and sessionKey in masterKeyData, do not persist masterKey
          const masterKeyData = { email, masterKey, keyHash: sessionKey } as MasterKeyData;

          set({
            isAuthenticated: true,
            masterKeyData,
            wallets,
            lastWalletIndex: lastIndex,
            createdAt: get().createdAt || now,
            lastLoginAt: now,
          });

          // Start auto logout timer
          startLogoutTimer(() => get().logout());
        } catch (error) {
          console.error('Login failed:', error);
          throw new Error('Invalid email or wallet password');
        }
      },

      // Logout function: clears session, storage, and resets state
      logout: async () => {
        if (logoutTimer) clearTimeout(logoutTimer);
        logoutTimer = null;
        const state = get();
        if (state.masterKeyData) {
          walletStorage.clearWalletData(state.masterKeyData.keyHash);
        }
        secureStorage.clear();
        sessionStorage.removeItem('sessionKey');
        set(initialState);
      },

      // Add wallets and reset auto logout timer
      addWallets: (newWallets: WalletInfo[]) => {
        resetLogoutTimer(() => get().logout());
        set((state) => ({
          ...state,
          wallets: [...state.wallets, ...newWallets],
          lastWalletIndex: Math.max(state.lastWalletIndex, ...newWallets.map(w => w.index))
        }));
      },

      // Update wallet balance and reset auto logout timer
      updateWalletBalance: (address: string, balance: string, tokens: TokenBalance[] = []) => {
        resetLogoutTimer(() => get().logout());
        set((state) => ({
          ...state,
          wallets: state.wallets.map(wallet =>
            wallet.address === address
              ? { ...wallet, balance, tokens }
              : wallet
          )
        }));
      },

      // Check authentication status
      checkAuth: () => {
        const state = get();
        return !!(
          state.isAuthenticated &&
          state.masterKeyData &&
          state.masterKeyData.keyHash &&
          state.masterKeyData.email
        );
      },

      // Get current user email
      getCurrentEmail: () => {
        const state = get();
        return state.masterKeyData?.email || null;
      },

      // Get master key (not persisted, only available in memory after login)
      getMasterKey: () => {
        const state = get();
        return state.masterKeyData?.masterKey || null;
      },
    }),
    {
      name: 'hd-wallet-auth',
      storage: {
        // Only restore sessionKey from sessionStorage
        getItem: (name: string) => {
          // Only restore sessionKey from sessionStorage. Do not restore authenticated state.
          const sessionKey = sessionStorage.getItem(name);
          if (!sessionKey) return null;
          // Always start as unauthenticated, require login on new tab/page
          return {
            state: {
              ...initialState,
              isAuthenticated: false,
              masterKeyData: { email: '', masterKey: '', keyHash: sessionKey }
            },
            version: 0
          } as StorageValue<AuthStore>;
        },
        // Only store sessionKey
        setItem: (_name, value) => {
          if (value?.state?.masterKeyData?.keyHash) {
            sessionStorage.setItem('sessionKey', value.state.masterKeyData.keyHash);
          }
        },
        removeItem: (_name) => {
          sessionStorage.removeItem('sessionKey');
        },
      },
    }
  )
);

// Helper to check authentication status
export const isAuthenticated = () => {
  return useAuthStore.getState().checkAuth();
};

// Helper function to get current user information
export const getCurrentUser = () => {
  const state = useAuthStore.getState();
  return {
    email: state.masterKeyData?.email || null,
    wallets: state.wallets,
    lastWalletIndex: state.lastWalletIndex,
    createdAt: state.createdAt,
    lastLoginAt: state.lastLoginAt,
  };
};
