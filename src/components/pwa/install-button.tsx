'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

export function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [instalado, setInstalado] = useState(false)

  useEffect(() => {
    const onPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferred(e)
    }
    const onInstalled = () => {
      setInstalado(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const instalar = async () => {
    if (!deferred) return
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === 'accepted') {
      setDeferred(null)
    }
  }

  if (instalado || !deferred) return null

  return (
    <button
      type="button"
      onClick={instalar}
      aria-label="Instalar aplicativo"
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-black/5"
    >
      <Download className="h-4 w-4" />
      <span className="hidden md:inline">Instalar</span>
    </button>
  )
}
