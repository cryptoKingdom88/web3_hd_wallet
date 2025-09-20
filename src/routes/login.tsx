import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    const isAuth = useAuthStore.getState().checkAuth();
    if (isAuth) {
      throw redirect({
        to: '/',
      });
    }
  },
  component: LoginForm,
});