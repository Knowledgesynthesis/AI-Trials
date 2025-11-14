import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProgress, LearnerLevel } from '@/types'

interface AppState {
  // Theme and preferences
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // User progress
  userProgress: UserProgress
  completeModule: (moduleId: string) => void
  updateAssessmentScore: (assessmentId: string, score: number) => void
  updateInteractiveCompletion: (interactiveId: string) => void
  setLearnerLevel: (level: LearnerLevel) => void

  // Navigation
  currentModule: string | null
  setCurrentModule: (moduleId: string | null) => void

  // Offline mode
  isOffline: boolean
  setOfflineMode: (offline: boolean) => void

  // Notifications
  notifications: boolean
  setNotifications: (enabled: boolean) => void
}

const defaultUserProgress: UserProgress = {
  userId: 'local-user',
  completedModules: [],
  assessmentScores: {},
  interactiveCompletions: {},
  lastActive: new Date(),
  preferences: {
    theme: 'dark',
    learnerLevel: 'Resident',
    notifications: true,
    offlineMode: true,
  },
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      userProgress: defaultUserProgress,

      completeModule: (moduleId) =>
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            completedModules: [...new Set([...state.userProgress.completedModules, moduleId])],
            lastActive: new Date(),
          },
        })),

      updateAssessmentScore: (assessmentId, score) =>
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            assessmentScores: {
              ...state.userProgress.assessmentScores,
              [assessmentId]: score,
            },
            lastActive: new Date(),
          },
        })),

      updateInteractiveCompletion: (interactiveId) =>
        set((state) => {
          const currentCount = state.userProgress.interactiveCompletions[interactiveId] || 0
          return {
            userProgress: {
              ...state.userProgress,
              interactiveCompletions: {
                ...state.userProgress.interactiveCompletions,
                [interactiveId]: currentCount + 1,
              },
              lastActive: new Date(),
            },
          }
        }),

      setLearnerLevel: (level) =>
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            preferences: {
              ...state.userProgress.preferences,
              learnerLevel: level,
            },
          },
        })),

      currentModule: null,
      setCurrentModule: (moduleId) => set({ currentModule: moduleId }),

      isOffline: false,
      setOfflineMode: (offline) =>
        set((state) => ({
          isOffline: offline,
          userProgress: {
            ...state.userProgress,
            preferences: {
              ...state.userProgress.preferences,
              offlineMode: offline,
            },
          },
        })),

      notifications: true,
      setNotifications: (enabled) =>
        set((state) => ({
          notifications: enabled,
          userProgress: {
            ...state.userProgress,
            preferences: {
              ...state.userProgress.preferences,
              notifications: enabled,
            },
          },
        })),
    }),
    {
      name: 'ai-trials-storage',
      partialize: (state) => ({
        theme: state.theme,
        userProgress: state.userProgress,
        notifications: state.notifications,
      }),
    }
  )
)
