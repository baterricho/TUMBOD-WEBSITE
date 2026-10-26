import { test, expect } from '@playwright/test'

for (const route of ['/', '/en']) {
  test(`gallery stays clear of welcome text: ${route}`, async ({ page }) => {
    await page.goto(route)
    for (const width of [320, 390, 768, 960, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      const geometry = await page.evaluate(() => {
        const copy = document.querySelector('.hero__inner')!.getBoundingClientRect()
        const stage = document.querySelector('.hero__stage')!.getBoundingClientRect()
        const thumbs = document.querySelector('.hero__thumbs')!.getBoundingClientRect()
        return {
          headerTargets: [...document.querySelectorAll('.siteheader__actions > a, .siteheader__actions > button')]
            .filter((el) => el.getBoundingClientRect().width > 0)
            .every((el) => {
              const rect = el.getBoundingClientRect()
              return rect.width >= 44 && rect.height >= 44
            }),
          overlaps: copy.left < stage.right && copy.right > stage.left &&
            copy.top < stage.bottom && copy.bottom > stage.top,
          stageWidth: stage.width,
          stageHeight: stage.height,
          thumbsBelow: thumbs.top >= stage.bottom,
          overflows: document.documentElement.scrollWidth > window.innerWidth,
        }
      })
      expect(geometry.headerTargets, `${width}px: header touch targets`).toBe(true)
      expect(geometry.overlaps, `${width}px: welcome copy covers gallery`).toBe(false)
      expect(geometry.stageWidth).toBeGreaterThan(250)
      expect(geometry.stageHeight).toBeGreaterThan(150)
      expect(geometry.thumbsBelow).toBe(true)
      expect(geometry.overflows, `${width}px: horizontal page overflow`).toBe(false)
    }
  })

  test(`thumbnails show unobstructed photos and gallery link works: ${route}`, async ({ page }) => {
    await page.goto(route)
    const thumb = page.locator('.hero__thumb[data-thumb="hero-falls"]')
    await thumb.click()
    await expect(thumb).toHaveAttribute('aria-current', 'true')
    const photo = page.locator('#hero-falls img').first()
    await expect(photo).toHaveAttribute('src', '/media/tumbod-falls.jpg')
    await page.locator('.hero__stage').scrollIntoViewIfNeeded()
    await expect.poll(() => photo.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === el
    })).toBe(true)
    await page.locator('.hero__gallery-heading a').click()
    await expect(page).toHaveURL(new RegExp(`${route === '/' ? '' : '/en'}/larawan/?$`))
  })

  test(`video controls work on their slide: ${route}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(route)
    const control = page.locator('#hero-video-btn')
    const video = page.locator('#hero-video video')
    await expect(control).toBeHidden()
    await page.locator('.hero__thumb[data-thumb="hero-video"]').click()
    await expect(control).toBeVisible()
    await expect(control).toHaveAttribute('aria-pressed', 'false')
    await control.click()
    await expect.poll(() => video.evaluate((el) => (el as HTMLVideoElement).paused)).toBe(false)
    await expect(control).toHaveAttribute('aria-pressed', 'true')
    await control.click()
    await expect.poll(() => video.evaluate((el) => (el as HTMLVideoElement).paused)).toBe(true)
    await page.locator('.hero__thumb[data-thumb="hero-falls"]').click()
    await expect(control).toBeHidden()
    await expect(page.locator('#hero-mapchrome')).toBeHidden()
  })

}
