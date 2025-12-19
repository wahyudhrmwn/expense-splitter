'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Jika sudah login, redirect ke halaman utama
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  // Tampilkan loading saat cek session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  // Jika sudah login, jangan tampilkan halaman login
  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <Card className="border shadow-sm">
          <CardHeader className="text-center space-y-3 pb-6 px-4 sm:px-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/5 p-3 sm:p-3.5">
                <Users className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl font-semibold">Expense Splitter</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Bagi tagihan dengan teman secara adil dan otomatis
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 px-4 sm:px-6">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Masuk dengan akun Google Anda untuk mulai menggunakan aplikasi
            </p>
            <Button
              onClick={handleGoogleSignIn}
              className="w-full h-11 sm:h-12 text-sm font-medium gap-2.5 touch-manipulation"
              variant="outline"
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="truncate">Masuk dengan Google</span>
            </Button>
            
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground text-center leading-relaxed px-1">
                Dengan masuk, Anda menyetujui penggunaan aplikasi Expense Splitter
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-4 sm:mt-5 text-center px-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Aplikasi ini membantu Anda membagi pengeluaran bersama dengan mudah
          </p>
        </div>
      </div>
    </div>
  );
}

