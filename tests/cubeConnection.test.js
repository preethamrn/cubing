import assert from 'node:assert/strict'
import test from 'node:test'
import { cubeConnectionError, releaseCube, watchCubeConnection } from '../src/utils/cubeConnection.js'

function mockCube() {
  const cube = new EventTarget()
  cube.server = { connected: true, device: new EventTarget() }
  cube.stopCalls = 0
  cube.disconnectCalls = 0
  cube.stopTrackingMoves = () => { cube.stopCalls += 1 }
  cube.disconnect = () => { cube.disconnectCalls += 1 }
  cube.addAlgLeafListener = (listener) => { cube.sendMove = listener }
  return cube
}

test('raw GATT disconnect clears the connection and stops polling', () => {
  const cube = mockCube()
  let moves = 0
  let disconnects = 0
  watchCubeConnection(cube, () => { moves += 1 }, () => { disconnects += 1 })

  cube.sendMove({})
  cube.server.device.dispatchEvent(new Event('gattserverdisconnected'))
  cube.dispatchEvent(new Event('disconnect'))
  cube.sendMove({})

  assert.equal(moves, 1, 'events from a lost connection must be ignored')
  assert.equal(disconnects, 1)
  assert.equal(cube.stopCalls, 1)
})

test('intentional teardown removes listeners before disconnecting', () => {
  const cube = mockCube()
  let disconnects = 0
  const cleanup = watchCubeConnection(cube, () => {}, () => { disconnects += 1 })
  cleanup()
  releaseCube(cube)
  cube.server.device.dispatchEvent(new Event('gattserverdisconnected'))

  assert.equal(disconnects, 0)
  assert.equal(cube.stopCalls, 1)
  assert.equal(cube.disconnectCalls, 1)
})

test('setup detects a GATT link that has already disconnected', () => {
  const cube = mockCube()
  cube.server.connected = false
  let disconnects = 0
  watchCubeConnection(cube, () => {}, () => { disconnects += 1 })
  assert.equal(disconnects, 1)
})

test('GATT setup failures have an actionable reconnect message', () => {
  const error = new Error('GATT Server is disconnected. Cannot retrieve services.')
  assert.match(cubeConnectionError(error), /Connect cube again/)
  assert.equal(cubeConnectionError({ name: 'NotFoundError' }), '')
})
