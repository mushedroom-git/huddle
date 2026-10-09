import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Frame = 'phone' | 'tablet' | 'desk'

const FrameContext = createContext<Frame>('phone')

function readFrame(): Frame {
  if (typeof window === 'undefined') return 'phone'
  if (window.matchMedia('(min-width: 1280px)').matches) return 'desk'
  if (window.matchMedia('(min-width: 768px)').matches) return 'tablet'
  return 'phone'
}

export function FrameProvider({ children }: { children: ReactNode }) {
  const [frame, setFrame] = useState(readFrame)

  useEffect(() => {
    const queries = [window.matchMedia('(min-width: 768px)'), window.matchMedia('(min-width: 1280px)')]
    const update = () => setFrame(readFrame())
    queries.forEach((query) => query.addEventListener('change', update))
    update()
    return () => queries.forEach((query) => query.removeEventListener('change', update))
  }, [])

  return <FrameContext.Provider value={frame}>{children}</FrameContext.Provider>
}

export function useFrame() {
  return useContext(FrameContext)
}
