import { beforeEach, describe, expect, test } from 'bun:test'
import type { Session } from '@shared/types'
import { useSessionStore } from '../stores/sessionStore'
import { sortSessions } from '../utils/sessions'

const baseSession: Session = {
  id: 'session-1',
  name: 'alpha',
  tmuxWindow: 'agentboard:1',
  projectPath: '/Users/example/project',
  status: 'waiting',
  lastActivity: new Date('2024-01-01T00:00:00.000Z').toISOString(),
  source: 'managed',
}

function makeSession(overrides: Partial<Session> = {}): Session {
  return { ...baseSession, ...overrides }
}

beforeEach(() => {
  useSessionStore.setState({
    sessions: [],
    selectedSessionId: null,
    hasLoaded: false,
    connectionStatus: 'connecting',
    connectionError: null,
  })
})

describe('sortSessions', () => {
  test('orders by status then last activity', () => {
    const sessions = [
      makeSession({
        id: 'working',
        status: 'working',
        lastActivity: new Date('2024-01-02T00:00:00.000Z').toISOString(),
      }),
      makeSession({
        id: 'waiting-newer',
        status: 'waiting',
        lastActivity: new Date('2024-01-03T00:00:00.000Z').toISOString(),
      }),
      makeSession({
        id: 'waiting-older',
        status: 'waiting',
        lastActivity: new Date('2024-01-01T00:00:00.000Z').toISOString(),
      }),
      makeSession({
        id: 'unknown',
        status: 'unknown',
        lastActivity: new Date('2024-01-04T00:00:00.000Z').toISOString(),
      }),
    ]

    const sorted = sortSessions(sessions)
    expect(sorted.map((session) => session.id)).toEqual([
      'waiting-newer',
      'waiting-older',
      'working',
      'unknown',
    ])
  })
})

describe('useSessionStore', () => {
  test('auto-selects a session when current selection is missing', () => {
    useSessionStore.setState({ selectedSessionId: 'missing' })

    const sessions = [
      makeSession({
        id: 'waiting',
        status: 'waiting',
        lastActivity: new Date('2024-01-02T00:00:00.000Z').toISOString(),
      }),
      makeSession({
        id: 'working',
        status: 'working',
        lastActivity: new Date('2024-01-03T00:00:00.000Z').toISOString(),
      }),
    ]

    useSessionStore.getState().setSessions(sessions)

    expect(useSessionStore.getState().selectedSessionId).toBe('waiting')
    expect(useSessionStore.getState().hasLoaded).toBe(true)
  })

  test('preserves selection when session still exists', () => {
    const sessions = [
      makeSession({ id: 'keep', status: 'working' }),
      makeSession({ id: 'other', status: 'waiting' }),
    ]
    useSessionStore.setState({ selectedSessionId: 'keep' })

    useSessionStore.getState().setSessions(sessions)

    expect(useSessionStore.getState().selectedSessionId).toBe('keep')
  })

  test('updates a session in place', () => {
    const sessions = [
      makeSession({ id: 'first', status: 'waiting' }),
      makeSession({ id: 'second', status: 'working' }),
    ]
    useSessionStore.setState({ sessions })

    useSessionStore
      .getState()
      .updateSession({ ...sessions[0], status: 'unknown' })

    const updated = useSessionStore
      .getState()
      .sessions.find((session) => session.id === 'first')
    expect(updated?.status).toBe('unknown')
  })
})
