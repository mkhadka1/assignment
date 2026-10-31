import { test as base } from '@playwright/test';
import { LoginPage } from '../page/loginpage';
import { EmployeePage } from '../page/employeePage';
import { AdminPage } from '../page/adminPage';
import { admin } from '../data/testData';

type Pages = {
    loginPage:LoginPage
    employeePage:EmployeePage
    adminPage:AdminPage
    // Logs in as Admin before the test starts; request it in tests that need a session
    loggedInAsAdmin:LoginPage
}

export const test = base.extend<Pages>({
    loginPage: async ({ page }, use) => { await use(new LoginPage(page)) },
    employeePage: async ({ page }, use) => { await use(new EmployeePage(page)) },
    adminPage: async ({ page }, use) => { await use(new AdminPage(page)) },
    loggedInAsAdmin: async ({ loginPage }, use) => {
        await loginPage.loginAs(admin.username, admin.password)
        await use(loginPage)
    },
})

export { expect } from '@playwright/test';
