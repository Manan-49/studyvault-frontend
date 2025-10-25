import { MainNav } from '@/components/layout/main-nav'
import { AuthWrapper } from '@/components/layout/auth-wrapper'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper>
      <div className="min-h-screen overflow-x-hidden bg-gray-50 dark:bg-gray-950">
        <MainNav />
        {/* pb-24 on mobile for bottom nav, pb-8 on desktop */}
        <main className="mx-auto w-full max-w-7xl px-3 py-4 pb-24 sm:px-4 sm:py-6 md:px-6 md:pb-8 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </AuthWrapper>
  )
}