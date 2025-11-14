import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { assessmentItems } from '@/data/modules'
import { useAppStore } from '@/store/appStore'
import { CheckCircle, XCircle } from 'lucide-react'

export function Assessment() {
  const { updateAssessmentScore } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState(0)

  const currentItem = assessmentItems[currentIndex]

  const handleSubmit = () => {
    if (!selectedAnswer) return

    const isCorrect = selectedAnswer === currentItem.correctAnswer
    if (isCorrect) {
      setScore(score + 1)
    }
    setAnsweredQuestions(answeredQuestions + 1)
    setShowResult(true)

    // Update store
    updateAssessmentScore(currentItem.id, isCorrect ? 1 : 0)
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    setShowResult(false)
    if (currentIndex < assessmentItems.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    setSelectedAnswer(null)
    setShowResult(false)
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const isCorrect = selectedAnswer === currentItem.correctAnswer

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assessment Hub</h1>
        <p className="mt-2 text-muted-foreground">
          Test your knowledge with scenario-based questions
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline">
                Question {currentIndex + 1} of {assessmentItems.length}
              </Badge>
              <div className="mt-2 flex items-center gap-2">
                <Badge>{currentItem.type}</Badge>
                <Badge variant="secondary">{currentItem.difficulty}</Badge>
              </div>
            </div>
            {answeredQuestions > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {score}/{answeredQuestions}
                </p>
                <p className="text-sm text-muted-foreground">
                  {((score / answeredQuestions) * 100).toFixed(0)}% correct
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">{currentItem.question}</h3>
          </div>

          {currentItem.options && (
            <div className="space-y-2">
              {currentItem.options.map((option) => (
                <button
                  key={option}
                  onClick={() => !showResult && setSelectedAnswer(option)}
                  disabled={showResult}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    selectedAnswer === option
                      ? showResult
                        ? isCorrect
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-red-500 bg-red-500/10'
                        : 'border-primary bg-primary/10'
                      : showResult && option === currentItem.correctAnswer
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-input hover:border-primary/50'
                  } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showResult && option === currentItem.correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {showResult && selectedAnswer === option && !isCorrect && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {showResult && (
            <Card className={isCorrect ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  {isCorrect ? (
                    <CheckCircle className="mt-0.5 h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-6 w-6 text-red-500" />
                  )}
                  <div className="flex-1">
                    <h4 className="mb-2 font-semibold">
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </h4>
                    <p className="text-sm leading-relaxed">{currentItem.rationale}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>

            {!showResult ? (
              <Button onClick={handleSubmit} disabled={!selectedAnswer}>
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={currentIndex === assessmentItems.length - 1}>
                Next Question
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About This Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Bloom Level:</strong> {currentItem.bloomLevel}
          </p>
          <p>
            <strong>Tags:</strong> {currentItem.tags.join(', ')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
