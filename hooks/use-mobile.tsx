import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const DESKTOP_BREAKPOINT = 1280

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'large'

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Hook pour détecter le type d'appareil
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = React.useState<DeviceType>('desktop')

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setDeviceType('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setDeviceType('tablet')
      } else if (width < DESKTOP_BREAKPOINT) {
        setDeviceType('desktop')
      } else {
        setDeviceType('large')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceType
}

// Hook pour détecter l'orientation
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait')

  React.useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    handleOrientationChange()
    window.addEventListener('resize', handleOrientationChange)
    return () => window.removeEventListener('resize', handleOrientationChange)
  }, [])

  return orientation
}

// Hook pour la détection de la vue (utile pour les listes virtuelles)
export function useViewport() {
  const [viewport, setViewport] = React.useState({
    width: 0,
    height: 0,
  })

  React.useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewport
}

// Hook pour les breakpoints personnalisés
export function useBreakpoint(breakpoint: number) {
  const [isAbove, setIsAbove] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`)
    const onChange = () => {
      setIsAbove(mql.matches)
    }
    mql.addEventListener("change", onChange)
    setIsAbove(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  return !!isAbove
}

// Breakpoints prédéfinis
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

// Hook pour utiliser les breakpoints tailwind
export function useTailwindBreakpoints() {
  const isSm = useBreakpoint(breakpoints.sm)
  const isMd = useBreakpoint(breakpoints.md)
  const isLg = useBreakpoint(breakpoints.lg)
  const isXl = useBreakpoint(breakpoints.xl)
  const is2xl = useBreakpoint(breakpoints['2xl'])

  return {
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    isMobile: !isMd,
    isTablet: isMd && !isLg,
    isDesktop: isLg && !isXl,
    isLarge: isXl,
  }
}

// Composant pour rendre conditionnellement selon l'appareil
export function ResponsiveComponent({
  mobile,
  tablet,
  desktop,
  large,
}: {
  mobile?: React.ReactNode
  tablet?: React.ReactNode
  desktop?: React.ReactNode
  large?: React.ReactNode
}) {
  const deviceType = useDeviceType()

  switch (deviceType) {
    case 'mobile':
      return <>{mobile}</>
    case 'tablet':
      return <>{tablet || mobile}</>
    case 'desktop':
      return <>{desktop || tablet || mobile}</>
    case 'large':
      return <>{large || desktop || tablet || mobile}</>
    default:
      return <>{desktop || mobile}</>
  }
}

// Hook avec debounce pour éviter trop de re-renders
export function useDebouncedMobile(delay: number = 100) {
  const [isMobile, setIsMobile] = React.useState(false)
  const [debouncedIsMobile, setDebouncedIsMobile] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedIsMobile(isMobile)
    }, delay)

    return () => clearTimeout(timer)
  }, [isMobile, delay])

  return debouncedIsMobile
}

// Hook pour détecter si le clavier est ouvert (mobile)
export function useKeyboardOpen() {
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => {
      // Sur mobile, quand le clavier s'ouvre, la hauteur de la fenêtre diminue
      const keyboardOpened = window.visualViewport 
        ? window.visualViewport.height < window.innerHeight * 0.75
        : false
      setIsKeyboardOpen(keyboardOpened)
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      return () => window.visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [])

  return isKeyboardOpen
}