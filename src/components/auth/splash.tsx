import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'

export function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-primary">
      <Image
        src="/logo-branca.png"
        alt="César IA"
        width={406}
        height={467}
        priority
        className="w-36 max-w-[55vw]"
      />
      <Spinner
        size={36}
        className="border-primary-foreground/30 border-t-primary-foreground"
      />
    </div>
  )
}
