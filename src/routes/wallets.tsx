import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "../stores/authStore";
import { WalletsList } from "../features/wallets/components/WalletsList";

export const Route = createFileRoute("/wallets")({
  beforeLoad: ({ context }) => {
    const isAuth = useAuthStore.getState().checkAuth();
    if (!isAuth) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: WalletsList,
});
