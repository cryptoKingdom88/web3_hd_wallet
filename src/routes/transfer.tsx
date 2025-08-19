import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../stores/authStore';
import { TransferPage } from '../features/transfer/components/TransferPage';

export const Route = createFileRoute('/transfer')({
  beforeLoad: ({ context }) => {
    const isAuth = useAuthStore.getState().checkAuth();
    if (!isAuth) {
      throw redirect({
        to: '/login',
      });
    }
  },
  component: TransferPage,
});