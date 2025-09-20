import { scrypt } from "scrypt-js";
import { ethers } from 'ethers';

// BIP-44 derivation path for Ethereum: m/44'/60'/0'/0/{index}
const ETH_DERIVATION_PATH = "m/44'/60'/0'/0";

export interface WalletInfo {
  index: number;
  address: string;
  privateKey: string;
  publicKey: string;
  path: string;
  balance: string;
  tokens: TokenBalance[];
}

export interface TokenBalance {
  symbol: string;
  balance: string;
  contractAddress: string;
}

export interface MasterKeyData {
  email: string;
  masterKey: string;
  keyHash: string;
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.startsWith("0x")) hex = hex.slice(2);
  if (hex.length % 2) throw new Error("Invalid hex length");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function strToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

const norm = (s: string) => s.trim().toLowerCase().normalize("NFKC");

export async function getSessionKey(email: string, password: string): Promise<string> {
  const emailN = norm(email);
  const passN  = password.normalize("NFKC");
  const sessionKey = await sha256Hex(`${emailN}:${passN}`);
  return sessionKey;
}

const APP_PEPPER = "HDWALLET_APP_V1";
type ScryptParams = { N: number; r: number; p: number; dkLen: number };
const DEFAULT_SCRYPT: ScryptParams = { N: 16384, r: 8, p: 1, dkLen: 32 };

export async function getMasterSeed(
  email: string,
  password: string,
  params: ScryptParams = DEFAULT_SCRYPT
): Promise<string> {
  const emailN = norm(email);
  const passN = password.normalize("NFKC");

  const preHex = await sha256Hex(`${emailN}:${passN}`);
  const passBytes = hexToBytes(preHex);

  const emailHashHex = await sha256Hex(emailN);
  const saltBytes = strToBytes(`${APP_PEPPER}:${emailHashHex}`);

  const { N, r, p, dkLen } = params;
  // scrypt(password, salt, N, r, p, dkLen) -> Promise<Uint8Array>
  const res = await scrypt(passBytes, saltBytes, N, r, p, dkLen);
  return [...new Uint8Array(res)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export const pathStandard = (account = 0, change = 0, index = 0) =>
  `m/44'/60'/${account}'/${change}/${index}`;

/**
 * Generate HD wallet from master key using BIP-44 standard
 */
export const generateHDWallet = (masterKey: string, index: number): WalletInfo => {
  try {
    // Create HD wallet from master key
    const hdNode = ethers.HDNodeWallet.fromSeed(hexToBytes(masterKey));
    
    // Derive child wallet using BIP-44 path
    const derivationPath = `${ETH_DERIVATION_PATH}/${index}`;
    const childWallet = hdNode.derivePath(derivationPath);
    
    return {
      index,
      address: childWallet.address,
      privateKey: childWallet.privateKey,
      publicKey: childWallet.publicKey,
      path: derivationPath,
      balance: '0',
      tokens: []
    };
  } catch (error) {
    console.error('Failed to generate HD wallet:', error);
    throw new Error('Failed to generate wallet');
  }
};

/**
 * Generate multiple wallets from master key
 */
export const generateMultipleWallets = (masterKey: string, startIndex: number = 0, count: number = 20): WalletInfo[] => {
  const wallets: WalletInfo[] = [];
  
  for (let i = startIndex; i < startIndex + count; i++) {
    try {
      const wallet = generateHDWallet(masterKey, i);
      wallets.push(wallet);
    } catch (error) {
      console.error(`Failed to generate wallet at index ${i}:`, error);
    }
  }
  
  return wallets;
};

/**
 * Check wallet balance using Ethereum provider
 */
export const checkWalletBalance = async (address: string, provider?: ethers.Provider): Promise<string> => {
  try {
    if (!provider) {
      // Use default provider (you might want to configure this)
      provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');
    }
    
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Failed to check balance:', error);
    return '0';
  }
};

/**
 * Find last wallet with balance
 */
export const findLastWalletWithBalance = async (
  masterKey: string, 
  maxIndex: number = 20,
  provider?: ethers.Provider
): Promise<number> => {
  let lastActiveIndex = -1;
  
  for (let i = 0; i < maxIndex; i++) {
    const wallet = generateHDWallet(masterKey, i);
    const balance = await checkWalletBalance(wallet.address, provider);
    
    if (parseFloat(balance) > 0) {
      lastActiveIndex = i;
    }
  }
  
  return lastActiveIndex;
};
