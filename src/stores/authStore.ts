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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      login: async (email: string, walletPassword: string) => {
        try {
          const now = new Date();
          
          // generate master key
          const masterKey = await getMasterSeed(email, walletPassword);

          // get session key
          const sessionKey = await getSessionKey(email, walletPassword);
          
          // Check if we have stored wallet index
          let lastIndex = walletStorage.getLastWalletIndex(sessionKey);
          let wallets: WalletInfo[] = [];
          
          if (lastIndex !== null) {
            // Generate wallets from 0 to stored index
            wallets = generateMultipleWallets(masterKey, 0, lastIndex + 1);
          } else {
            // Find last wallet with balance (scan first 20)
            const lastActiveIndex = await findLastWalletWithBalance(masterKey, 20);
            
            if (lastActiveIndex >= 0) {
              wallets = generateMultipleWallets(masterKey, 0, lastActiveIndex + 1);
              lastIndex = lastActiveIndex;
            } else {
              // No wallets with balance found, create first wallet
              wallets = generateMultipleWallets(masterKey, 0, 1);
              lastIndex = 0;
            }
            
            // Save the last wallet index
            walletStorage.setLastWalletIndex(sessionKey, lastIndex);
          }

          const masterKeyData = { email, masterKey, keyHash: sessionKey } as MasterKeyData
          
          set({
            isAuthenticated: true,
            masterKeyData,
            wallets,
            lastWalletIndex: lastIndex,
            createdAt: get().createdAt || now,
            lastLoginAt: now,
          });
          
        } catch (error) {
          console.error('Login failed:', error);
          throw new Error('Invalid email or wallet password');
        }
      },
      
      logout: async () => {
        const state = get();
        if (state.masterKeyData) {
          walletStorage.clearWalletData(state.masterKeyData.keyHash);
        }
        
        secureStorage.clear();
        set(initialState);
      },
      
      addWallets: (newWallets: WalletInfo[]) => {
        set((state) => ({
          ...state,
          wallets: [...state.wallets, ...newWallets],
          lastWalletIndex: Math.max(state.lastWalletIndex, ...newWallets.map(w => w.index))
        }));
      },
      
      updateWalletBalance: (address: string, balance: string, tokens: TokenBalance[] = []) => {
        set((state) => ({
          ...state,
          wallets: state.wallets.map(wallet =>
            wallet.address === address
              ? { ...wallet, balance, tokens }
              : wallet
          )
        }));
      },
      
      checkAuth: () => {
        const state = get();
        return !!(
          state.isAuthenticated &&
          state.masterKeyData &&
          state.masterKeyData.masterKey &&
          state.masterKeyData.email
        );
      },
      
      getCurrentEmail: () => {
        const state = get();
        return state.masterKeyData?.email || null;
      },
      
      getMasterKey: () => {
        const state = get();
        return state.masterKeyData?.masterKey || null;
      },
    }),
    {
      name: 'hd-wallet-auth',
      storage: {
        getItem: (name: string) => {
          const value = secureStorage.getItem(name);
          return typeof value === 'string' ? JSON.parse(value) as StorageValue<AuthStore> : null;
        },
        setItem: (name, value) => {
          secureStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          secureStorage.removeItem(name);
        },
      },
    }
  )
);

// Helper function to check authentication status
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
