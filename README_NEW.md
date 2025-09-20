# dynamic-app

This project is a prototype for a headless wallet integration and message signing app using Dynamic Labs SDK. It demonstrates basic login, message signing, and signature verification, but does **not** support MPC headless flows or multi-wallet connections yet.

## Project Overview

This app provides:
- Basic authentication and wallet connection using Dynamic Labs
- Message signing and local signature history (stored in localStorage)
- Signature verification (with backend API)

> **Note:** MPC (Multi-Party Computation) headless wallet integration and multi-wallet connection are **not implemented** in this version.

## Features

- [x] Login/logout with Dynamic Labs
- [x] Message signing and signature history (localStorage)
- [x] Signature verification (backend integration)
- [ ] MPC headless wallet support (**not implemented**)
- [ ] Multi-wallet connection (**not implemented**)

## Limitations

- MPC headless wallet integration is **not implemented**
- Multi-wallet connection and switching is **not implemented**
- Only basic EOA (Externally Owned Account) wallet flows are supported

## Tech Stack

- React
- Vite
- ShadCN UI
- Dynamic Labs SDK
- TypeScript

## Getting Started

### Set up your environment variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Update the `VITE_DYNAMIC_ENVIRONMENT_ID` in the `.env` file with your own environment ID from [Dynamic Dashboard](https://app.dynamic.xyz).

### Install dependencies

```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) to view your application in the browser.

## Available Scripts

- `dev`: Starts the development server
- `build`: Builds the app for production
- `preview`: Previews the production build locally
- `lint`: Lints the codebase

## Folder Structure

- `src/components/` — React UI components (Login, Wallet, Message Signer, etc.)
- `src/utils/` — Utility functions (signature verification, etc.)
- `public/` — Static assets

## Future Plans

- Add MPC headless wallet support
- Add multi-wallet connection and switching
- Improve UI/UX and error handling

## Learn More

- [Dynamic Documentation](https://docs.dynamic.xyz)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
