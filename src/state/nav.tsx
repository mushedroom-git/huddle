import { createContext, useContext, type ReactNode } from 'react'

export type Tab = 'home' | 'people' | 'group' | 'day' | 'ask' | 'me'
export type PeopleFilter = 'circuit' | 'all' | 'matches' | 'unmet'
export type DayPane = 'agenda' | 'photos' | 'logistics' | 'wall' | 'feedback'
export type AskPane = 'qa' | 'wall' | 'feedback'

export type Overlay =
  | { type: 'person'; id: string }
  | { type: 'card' }
  | { type: 'scan' }
  | { type: 'setup'; focus?: 'privacy' }
  | { type: 'organizer' }
  | { type: 'graph' }
  | { type: 'challenge' }
  | { type: 'switch' }
  | { type: 'commitment' }

export type NavValue = {
  tab: Tab
  dayPane: DayPane
  askPane: AskPane
  peopleFilter: PeopleFilter
  dept: string | null
  overlay: Overlay | null
  setTab: (tab: Tab, opts?: { filter?: PeopleFilter; dept?: string | null; day?: DayPane; ask?: AskPane }) => void
  open: (overlay: Overlay) => void
  close: () => void
}

const NavContext = createContext<NavValue | null>(null)

export function NavProvider({ value, children }: { value: NavValue; children: ReactNode }) {
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export function useNav() {
  const value = useContext(NavContext)
  if (!value) throw new Error('Nav missing')
  return value
}
