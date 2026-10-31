import { test } from '../fixtures/pages';
import { admin } from '../data/testData';

test.describe('Task 1 - Login', () => {
  test('login with valid credentials shows the Dashboard', async ({ loginPage }) => {
    await test.step('1.Navigate to url', async () => {
      await loginPage.goto()
    })
    await test.step('2.Fill with valid creds', async () => {
      await loginPage.login(admin.username, admin.password)
    })
    await test.step('3.Verify Dashboard is displayed', async () => {
      await loginPage.expectDashboard()
    })
  })

  test('login with invalid password shows an error', async ({ loginPage }) => {
    await test.step('1.Navigate to url', async () => {
      await loginPage.goto()
    })
    await test.step('2.Fill with invalid password', async () => {
      await loginPage.login(admin.username, 'wrongPassword123')
    })
    await test.step('3.Verify error message', async () => {
      await loginPage.error('Invalid credentials')
    })
  })
})
