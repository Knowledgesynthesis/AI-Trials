import { useEffect, useRef, useState } from 'react'
import type { WorkerRequest } from '@/workers/compute.worker'

type Kind = WorkerRequest['kind']
type PayloadOf<K extends Kind> = Extract<WorkerRequest, { kind: K }>['payload']

let worker: Worker | null = null
let nextId = 1
const listeners = new Map<number, (msg: { result?: unknown; error?: string; progress?: number }) => void>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/compute.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e) => {
      const { id, ...rest } = e.data as { id: number; result?: unknown; error?: string; progress?: number }
      listeners.get(id)?.(rest)
    }
  }
  return worker
}

export function runCompute<K extends Kind, R>(kind: K, payload: PayloadOf<K>, onProgress?: (p: number) => void): Promise<R> {
  const id = nextId++
  return new Promise<R>((resolve, reject) => {
    listeners.set(id, (msg) => {
      if (msg.progress !== undefined) {
        onProgress?.(msg.progress)
        return
      }
      listeners.delete(id)
      if (msg.error) reject(new Error(msg.error))
      else resolve(msg.result as R)
    })
    getWorker().postMessage({ id, kind, payload } as WorkerRequest)
  })
}

/**
 * Run a computation off the main thread whenever `payload` changes (debounced).
 * Results from superseded requests are discarded.
 */
export function useCompute<K extends Kind, R>(kind: K, payload: PayloadOf<K> | null, debounceMs = 150) {
  const [state, setState] = useState<{ data: R | null; loading: boolean; error: string | null; progress: number }>({
    data: null,
    loading: payload !== null,
    error: null,
    progress: 0,
  })
  const key = payload === null ? null : JSON.stringify(payload)
  const latest = useRef(0)

  useEffect(() => {
    if (key === null) return
    const ticket = ++latest.current
    const timer = setTimeout(() => {
      setState((s) => ({ ...s, loading: true, error: null, progress: 0 }))
      runCompute<K, R>(kind, JSON.parse(key) as PayloadOf<K>, (p) => {
        if (ticket === latest.current) setState((s) => ({ ...s, progress: p }))
      })
        .then((data) => {
          if (ticket === latest.current) setState({ data, loading: false, error: null, progress: 1 })
        })
        .catch((err: Error) => {
          if (ticket === latest.current) setState((s) => ({ ...s, loading: false, error: err.message }))
        })
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [kind, key, debounceMs])

  return state
}
