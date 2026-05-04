export function waitForClerkLoaded(timeoutMs = 8000) {
  if (typeof window === 'undefined') return Promise.resolve(null)

  return new Promise((resolve) => {
    const startedAt = Date.now()

    function check() {
      const clerk = window.Clerk

      if (clerk?.loaded) {
        resolve(clerk)
        return
      }

      if (Date.now() - startedAt >= timeoutMs) {
        resolve(clerk || null)
        return
      }

      window.setTimeout(check, 50)
    }

    check()
  })
}
