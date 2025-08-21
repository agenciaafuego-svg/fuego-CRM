import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Wraps a Promise with a timeout. If the promise does not resolve or reject within the specified timeout,
 * it will be rejected with a timeout error.
 * @param promise The Promise to wrap.
 * @param timeoutMs The timeout duration in milliseconds.
 * @returns A Promise that resolves with the original promise's value or rejects with a timeout error.
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: NodeJS.Timeout
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      console.warn(
        `⚠️ Operation timed out after ${timeoutMs} ms. This might indicate a network issue or a slow database response.`,
      )
      reject(new Error(`Operation timed out after ${timeoutMs} ms`))
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId)
  })
}
