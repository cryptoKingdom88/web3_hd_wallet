import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="container grid h-svh max-w-none items-center justify-center">
        <Outlet />
        <Toaster position="top-right" />
      </div>
      <TanStackRouterDevtools />
    </ThemeProvider>
  ),
});