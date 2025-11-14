import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/appStore'
import { LearnerLevel } from '@/types'

export function Settings() {
  const {
    theme,
    setTheme,
    userProgress,
    setLearnerLevel,
    setNotifications,
    setOfflineMode,
  } = useAppStore()

  const learnerLevels: LearnerLevel[] = [
    'MS3',
    'MS4',
    'Resident',
    'Fellow',
    'Attending',
    'Coordinator',
    'Researcher',
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Customize your learning experience
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the visual theme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`rounded-md border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  theme === 'light'
                    ? 'border-primary bg-primary/10'
                    : 'border-input hover:bg-accent'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`rounded-md border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/10'
                    : 'border-input hover:bg-accent'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`rounded-md border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  theme === 'system'
                    ? 'border-primary bg-primary/10'
                    : 'border-input hover:bg-accent'
                }`}
              >
                System
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning Profile</CardTitle>
          <CardDescription>
            Customize content based on your training level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Learner Level</label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {learnerLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setLearnerLevel(level)}
                  className={`rounded-md border-2 px-4 py-2 text-sm font-medium transition-colors ${
                    userProgress.preferences.learnerLevel === level
                      ? 'border-primary bg-primary/10'
                      : 'border-input hover:bg-accent'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Configure app behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Offline Mode</p>
              <p className="text-sm text-muted-foreground">
                Download content for offline access
              </p>
            </div>
            <button
              onClick={() => setOfflineMode(!userProgress.preferences.offlineMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                userProgress.preferences.offlineMode ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  userProgress.preferences.offlineMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-sm text-muted-foreground">
                Get reminders and updates
              </p>
            </div>
            <button
              onClick={() => setNotifications(!userProgress.preferences.notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                userProgress.preferences.notifications ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  userProgress.preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>Your learning statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">Modules Completed</span>
            <span className="font-medium">{userProgress.completedModules.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Assessments Taken</span>
            <span className="font-medium">{Object.keys(userProgress.assessmentScores).length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Interactive Simulations</span>
            <span className="font-medium">
              {Object.keys(userProgress.interactiveCompletions).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Last Active</span>
            <span className="font-medium">
              {new Date(userProgress.lastActive).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                localStorage.clear()
                window.location.reload()
              }
            }}
          >
            Reset All Progress
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
