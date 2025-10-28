'use client'

import { motion } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OfflinePage() {
  const router = useRouter()

  const handleRetry = () => {
    if (navigator.onLine) {
      router.push('/')
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          {/* Icon Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="p-6 bg-white/20 rounded-full backdrop-blur-sm"
            >
              <WifiOff className="h-16 w-16 text-white" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-8 text-center space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900  mb-2">
                You're Offline
              </h1>
              <p className="text-muted-foreground">
                No internet connection detected. Please check your network and try again.
              </p>
            </div>

            {/* Retry Button */}
            <motion.button
              onClick={handleRetry}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Try Again</span>
            </motion.button>

            {/* Info */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                StudyVault requires an active internet connection to access your study materials.
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-full border border-border">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Offline Mode</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}