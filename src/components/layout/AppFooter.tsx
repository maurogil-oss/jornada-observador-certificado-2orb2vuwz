import logoParceiros from '@/assets/image-bf198.png'

export function AppFooter() {
  return (
    <footer className="w-full shrink-0 bg-background/90 backdrop-blur-md border-t border-border/60 py-3 md:py-4 px-4 flex justify-center items-center z-20 mt-auto overflow-hidden">
      <img
        src={logoParceiros}
        alt="Parceiros"
        className="h-7 sm:h-10 md:h-12 lg:h-14 object-contain max-w-[95%]"
      />
    </footer>
  )
}
