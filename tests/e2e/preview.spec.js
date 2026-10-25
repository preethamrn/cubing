import { expect, test } from '@playwright/test'

async function expectRenderedCube(page) {
  const player = page.locator('twisty-player')
  await player.scrollIntoViewIfNeeded()

  // TwistyPlayer uses a closed shadow root. Its public canvas API lets us
  // check the actual rendering surface rather than just the outer element.
  await expect.poll(async () => player.evaluate(async (element) => {
    const canvases = await element.experimentalCurrentCanvases()
    return canvases.some((canvas) => {
      const bounds = canvas.getBoundingClientRect()
      return bounds.width > 100 && bounds.height > 100
    })
  })).toBe(true)
}

test('cube renders initially and after a case reset or change', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('algtrainer')
  await expectRenderedCube(page)
  await page.getByRole('button', { name: 'Restart case', exact: true }).click()
  await expectRenderedCube(page)
  await page.getByRole('button', { name: 'Next case', exact: true }).click()
  await expectRenderedCube(page)

  expect(errors).toEqual([])
})

test('incoming moves update the preview and record a completed solve', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('algTrainerSettings', JSON.stringify({
      algSet: 'PLL', selector: 'custom', timer: 'browser', waitTime: 3000,
    }))
    localStorage.setItem('customAlgSet', JSON.stringify({ name: 'PLL', list: [0] }))
    localStorage.setItem('customAlgs.PLL', JSON.stringify({ Aa: "R U R' U'" }))
    localStorage.removeItem('timesList')
  })

  await page.goto('algtrainer')
  await expectRenderedCube(page)
  const player = page.locator('twisty-player')
  const before = await player.evaluate(async (element) => (await element.experimentalGet.alg()).toString())

  await page.keyboard.press('r')
  await expect(page.locator('.move-correct')).toHaveText('R')
  await expect.poll(() => player.evaluate(async (element) => (
    (await element.experimentalGet.alg()).toString()
  ))).toBe(`${before} R`)

  await page.keyboard.press('u')
  await page.keyboard.press('Shift+R')
  await page.keyboard.press('Shift+U')
  await expect(page.locator('.history-row')).toHaveCount(1)
  await expect(page.locator('.notice-error')).toHaveCount(0)
  await expectRenderedCube(page)
})

test('rotated V-perm progress follows smart-cube face turns without rotation events', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('algTrainerSettings', JSON.stringify({
      algSet: 'PLL', selector: 'custom', timer: 'browser', waitTime: 3000,
    }))
    localStorage.setItem('customAlgSet', JSON.stringify({ name: 'PLL', list: [18] }))
    localStorage.removeItem('timesList')
  })

  await page.goto('algtrainer')
  await expect(page.locator('.alg-case-name')).toHaveText('V')
  await expectRenderedCube(page)

  const physicalTurns = [
    ['R', -1], ['U', 2], ['R', 1], ['U', 2], ['L', 1],
    ['U', -1], ['R', -1], ['U', 1], ['L', -1], ['U', 1],
    ['L', 1], ['U', -1], ['R', 1], ['U', 1], ['L', -1],
  ]

  for (const [face, amount] of physicalTurns) {
    const key = amount === -1 ? `Shift+${face}` : face.toLowerCase()
    for (let turn = 0; turn < Math.abs(amount); turn += 1) {
      await page.keyboard.press(key)
    }
    await expect(page.locator('.move-incorrect')).toHaveText('')
  }

  await expect(page.locator('.history-row')).toHaveCount(1)
  await expect(page.locator('.notice-error')).toHaveCount(0)
  await expectRenderedCube(page)
})

test('GATT setup failure leaves the preview usable and allows another connection attempt', async ({ page }) => {
  await page.addInitScript(() => {
    const device = new EventTarget()
    device.name = 'GAN-test'
    const server = {
      device,
      connected: false,
      async getPrimaryService() {
        throw new DOMException('GATT Server is disconnected. Cannot retrieve services.', 'NetworkError')
      },
    }
    device.gatt = { connect: async () => server }
    Object.defineProperty(navigator, 'bluetooth', {
      configurable: true,
      value: { requestDevice: async () => device },
    })
  })

  await page.goto('algtrainer')
  await page.getByRole('button', { name: 'Connect cube', exact: true }).click()
  await expect(page.locator('.notice-error')).toContainText('Connect cube again')
  await expect(page.getByRole('button', { name: 'Connect cube', exact: true })).toBeEnabled()
  await expectRenderedCube(page)
})
