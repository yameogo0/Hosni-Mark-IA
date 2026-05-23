import { useEffect, useRef, useCallback, useLayoutEffect } from "react"

interface UseScrollToBottomOptions {
  behavior?: "smooth" | "auto" | "instant"
  threshold?: number
  offset?: number
  enabled?: boolean
}

export const useScrollToBottom = <T extends any[]>(
  dependencies: T,
  options: UseScrollToBottomOptions = {}
) => {
  const {
    behavior = "smooth",
    threshold = 100,
    offset = 0,
    enabled = true
  } = options

  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLElement | null>(null)
  const isUserScrolledUpRef = useRef(false)
  const previousScrollHeightRef = useRef(0)
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = useCallback((scrollBehavior: ScrollBehavior = behavior as ScrollBehavior) => {
    if (!enabled) return
    
    const element = containerRef.current?.firstElementChild as HTMLElement
    if (element) {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: scrollBehavior
      })
    } else {
      bottomRef.current?.scrollIntoView({ behavior: scrollBehavior })
    }
  }, [enabled, behavior])

  // Détecter si l'utilisateur a remonté manuellement
  useEffect(() => {
    const container = containerRef.current?.firstElementChild as HTMLElement
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottom = scrollHeight - scrollTop - clientHeight < threshold
      
      // Si l'utilisateur remonte et n'est pas en bas, on désactive l'auto-scroll
      if (!isAtBottom) {
        isUserScrolledUpRef.current = true
        
        // Réactiver après un délai si l'utilisateur revient en bas
        if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current)
        autoScrollTimerRef.current = setTimeout(() => {
          isUserScrolledUpRef.current = false
        }, 5000)
      } else {
        isUserScrolledUpRef.current = false
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [threshold])

  // Scroll automatique quand les dépendances changent
  useEffect(() => {
    if (!enabled) return
    
    // Ne pas scroll si l'utilisateur a remonté récemment
    if (isUserScrolledUpRef.current) return
    
    // Pour les messages longs ou les images, un petit délai est utile
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 50)

    return () => clearTimeout(timer)
  }, [dependencies, enabled, scrollToBottom])

  // Mémoriser la hauteur pour éviter les sauts
  useLayoutEffect(() => {
    const container = containerRef.current?.firstElementChild as HTMLElement
    if (!container) return
    
    const currentScrollHeight = container.scrollHeight
    const scrollDelta = currentScrollHeight - previousScrollHeightRef.current
    
    // Si l'utilisateur n'a pas remonté, on ajuste la position
    if (!isUserScrolledUpRef.current && scrollDelta > 0) {
      container.scrollTop += scrollDelta
    }
    
    previousScrollHeightRef.current = currentScrollHeight
  }, [dependencies])

  // Configurer le conteneur
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const mainContent = document.querySelector('.flex-1.overflow-y-auto')
      if (mainContent) {
        containerRef.current = mainContent as HTMLElement
      }
    }
  }, [])

  // Scroll forcé (ignore l'état de l'utilisateur)
  const forceScrollToBottom = useCallback(() => {
    isUserScrolledUpRef.current = false
    scrollToBottom('auto')
  }, [scrollToBottom])

  // Vérifier si l'utilisateur est en bas du conteneur
  const isAtBottom = useCallback(() => {
    const container = containerRef.current?.firstElementChild as HTMLElement
    if (!container) return true
    
    const { scrollTop, scrollHeight, clientHeight } = container
    return scrollHeight - scrollTop - clientHeight < threshold
  }, [threshold])

  // Nettoyage
  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current)
      }
    }
  }, [])

  return { 
    bottomRef, 
    scrollToBottom, 
    forceScrollToBottom,
    isAtBottom,
    containerRef 
  }
}

// Version simplifiée pour les cas d'usage simples (compatible avec l'original)
export const useSimpleScrollToBottom = <T extends any[]>(dependencies: T) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, dependencies)

  return { bottomRef, scrollToBottom }
}

// Hook pour suivre l'activité de défilement
export const useScrollActivity = () => {
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const lastScrollTopRef = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.flex-1.overflow-y-auto')
      if (!container) return

      setIsScrolling(true)
      const currentScrollTop = container.scrollTop
      const direction = currentScrollTop > lastScrollTopRef.current ? 'down' : 'up'
      setScrollDirection(direction)
      lastScrollTopRef.current = currentScrollTop

      // Reset scrolling flag after 150ms of no scroll
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
        setScrollDirection(null)
      }, 150)
    }

    const container = document.querySelector('.flex-1.overflow-y-auto')
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return { isScrolling, scrollDirection }
}

// Hook pour la position de défilement
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [scrollPercent, setScrollPercent] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.flex-1.overflow-y-auto')
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container
        setScrollPosition(scrollTop)
        setScrollPercent((scrollTop / (scrollHeight - clientHeight)) * 100)
      }
    }

    const container = document.querySelector('.flex-1.overflow-y-auto')
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return { scrollPosition, scrollPercent }
}