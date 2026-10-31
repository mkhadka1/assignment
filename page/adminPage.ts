import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./basePage";

// System Users table columns: 0 checkbox, 1 Username, 2 User Role, 3 Employee Name, 4 Status
const USERNAME_COLUMN = 1
const ROLE_COLUMN = 2
const EMPLOYEE_COLUMN = 3
const STATUS_COLUMN = 4

export type SystemUser = {
    username:string
    password:string
    role:string
    status:string
}

export class AdminPage extends BasePage{
    constructor(page:Page){
        super(page)
    }

    get searchForm():Locator{
        return this.page.locator('.oxd-table-filter')
    }

    async gotoUserManagement(){
        await this.openMenu('Admin')
        await expect(this.page).toHaveURL(/\/admin\/viewSystemUsers/)
    }

    async createUser(user:SystemUser, employeeFullName:string, employeeFirstName:string){
        await this.gotoUserManagement()
        await this.page.getByRole('button', { name: 'Add' }).click()
        await expect(this.page).toHaveURL(/\/admin\/saveSystemUser/)

        await this.selectOption('User Role', user.role)
        await this.chooseAutocomplete('Employee Name', employeeFirstName, employeeFullName)
        await this.selectOption('Status', user.status)
        await this.field('Username').fill(user.username)
        await this.field('Password').fill(user.password)
        await this.field('Confirm Password').fill(user.password)
        await this.page.getByRole('button', { name: 'Save' }).click()

        await this.expectToast('Successfully Saved')
        await expect(this.page).toHaveURL(/\/admin\/viewSystemUsers/)
    }

    async searchByUsername(username:string){
        await this.field('Username', this.searchForm).fill(username)
        // Wait for the search request itself, otherwise the old list can still be on screen
        await Promise.all([
            this.page.waitForResponse(res => res.url().includes('/api/v2/admin/users') && res.request().method() === 'GET'),
            this.searchForm.getByRole('button', { name: 'Search' }).click(),
        ])
        await this.waitForTable()
    }

    rowFor(username:string):Locator{
        return this.tableRows.filter({
            has: this.page.locator('.oxd-table-cell').nth(USERNAME_COLUMN).getByText(username, { exact: true }),
        })
    }

    async expectUser(user:SystemUser, employeeName:string){
        const row = this.rowFor(user.username)
        await expect(this.tableRows).toHaveCount(1)
        await expect(this.cell(row, USERNAME_COLUMN)).toHaveText(user.username)
        await expect(this.cell(row, ROLE_COLUMN)).toHaveText(user.role)
        await expect(this.cell(row, EMPLOYEE_COLUMN)).toHaveText(employeeName)
        await expect(this.cell(row, STATUS_COLUMN)).toHaveText(user.status)
    }

    async deleteUser(username:string){
        await this.gotoUserManagement()
        await this.searchByUsername(username)
        await this.deleteRow(this.rowFor(username))
    }
}
