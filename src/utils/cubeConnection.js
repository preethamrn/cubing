export function releaseCube(cube) {
  // GAN's polling loop is not stopped by cubing.js's disconnect() method.
  try {
    cube.stopTrackingMoves?.()
  } catch {
    // Some adapters have already stopped tracking when the link is lost.
  }
  try {
    cube.disconnect()
  } catch {
    // A disconnected GATT server needs no further teardown.
  }
}

export function watchCubeConnection(cube, onMove, onDisconnect) {
  // cubing.js 0.66 adapters retain the GATT server here. Not all adapters
  // forward its disconnect event, so also listen to the underlying device
  // when available. Keep the library-level event as a fallback.
  const server = cube.server
  const device = server?.device
  let active = true

  function cleanup() {
    active = false
    cube.removeEventListener('disconnect', disconnected)
    device?.removeEventListener('gattserverdisconnected', disconnected)
  }

  function disconnected() {
    if (!active) return
    cleanup()
    releaseCube(cube)
    onDisconnect()
  }

  cube.addEventListener('disconnect', disconnected)
  device?.addEventListener('gattserverdisconnected', disconnected)
  cube.addAlgLeafListener((event) => {
    if (active) onMove(event)
  })

  if (server?.connected === false) {
    disconnected()
  }

  return cleanup
}

export function cubeConnectionError(error) {
  if (error?.name === 'NotFoundError') return ''
  const message = error?.message || String(error || 'Could not connect to the smart cube.')
  if (/gatt.*disconnect|disconnect.*gatt/i.test(message)) {
    return 'The cube disconnected while connecting. Wake it up, close other tabs or apps connected to it, then click Connect cube again. Pairing alone does not establish an active connection.'
  }
  return message
}
