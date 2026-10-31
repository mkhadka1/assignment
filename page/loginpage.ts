import { Page, expect } from "@playwright/test";
import { loginpage } from "../locators/loginLocator"
import { BasePage } from "./basePage";

export class LoginPage extends BasePage{
    constructor(page:Page){
        super(page)
    }

    async goto(){
        await this.page.goto('/web/index.php/auth/login')
    }

    async login(username:string, password:string){
        await this.page.locator(loginpage.userNameInput).fill(username)
        await this.page.locator(loginpage.passwordInput).fill(password)
        await this.page.locator(loginpage.loginButton).click()
    }

    // Reusable entry point for any test that needs a logged-in session
    async loginAs(username:string, password:string){
        await this.goto()
        await this.login(username, password)
        await this.expectDashboard()
    }

    async expectDashboard(){
        await expect(this.page).toHaveURL(/\/dashboard\/index/)
        await expect(this.header.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    }

    async error(message:string){
        await expect(this.page.locator(loginpage.errorMessage)).toContainText(message);
    }

    async logout(){
        // While the dashboard widgets are still loading, the Logout click is sometimes
        // swallowed, so retry opening the menu and clicking until we land on the login page.
        await expect(async () => {
            if (!(await this.page.getByRole('menuitem', { name: 'Logout' }).isVisible())){
                await this.page.locator('.oxd-userdropdown-tab').click()
            }
            await this.page.getByRole('menuitem', { name: 'Logout' }).click({ timeout: 5000 })
            await expect(this.page).toHaveURL(/\/auth\/login/, { timeout: 5000 })
        }).toPass({ timeout: 30000 })
        await expect(this.page.locator(loginpage.loginButton)).toBeVisible()
    }
}
