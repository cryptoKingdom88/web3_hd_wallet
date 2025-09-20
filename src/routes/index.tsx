import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../stores/authStore';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    const isAuth = useAuthStore.getState().checkAuth();
    if (!isAuth) {
      throw redirect({
        to: '/login',
      });
    } else {
      throw redirect({
        to: '/wallets',
      });
    }
  },
});