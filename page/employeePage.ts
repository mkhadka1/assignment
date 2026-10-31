import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./basePage";

// Employee List table columns: 0 checkbox, 1 Id, 2 First (& Middle) Name, 3 Last Name
const FIRST_NAME_COLUMN = 2
const LAST_NAME_COLUMN = 3

export class EmployeePage extends BasePage{
    constructor(page:Page){
        super(page)
    }

    get searchForm():Locator{
        return this.page.locator('.oxd-table-filter')
    }

    async gotoAddEmployee(){
        await this.openMenu('PIM')
        await this.page.getByRole('link', { name: 'Add Employee' }).click()
        await expect(this.page).toHaveURL(/\/pim\/addEmployee/)
    }

    async gotoEmployeeList(){
        await this.openMenu('PIM')
        await this.page.getByRole('link', { name: 'Employee List' }).click()
        await expect(this.page).toHaveURL(/\/pim\/viewEmployeeList/)
    }

    async addEmployee(firstName:string, lastName:string, employeeId:string){
        await this.page.getByPlaceholder('First Name').fill(firstName)
        await this.page.getByPlaceholder('Last Name').fill(lastName)
        await this.field('Employee Id').fill(employeeId)
        await this.page.getByRole('button', { name: 'Save' }).click()
        await this.expectToast('Successfully Saved')
    }

    async expectDetailsPage(firstName:string, lastName:string, employeeId:string){
        // After "Successfully Saved" the demo site can be slow to redirect to the details page
        await expect(this.page).toHaveURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+/, { timeout: 45000 })
        await expect(this.page.locator('.orangehrm-edit-employee-name')).toHaveText(`${firstName} ${lastName}`)
        await expect(this.page.getByPlaceholder('First Name')).toHaveValue(firstName)
        await expect(this.page.getByPlaceholder('Last Name')).toHaveValue(lastName)
        await expect(this.field('Employee Id')).toHaveValue(employeeId)
    }

    async searchByName(name:string){
        await this.field('Employee Name', this.searchForm).fill(name)
        // Wait for the search request itself, otherwise the old list can still be on screen
        await Promise.all([
            this.page.waitForResponse(res => res.url().includes('/api/v2/pim/employees') && res.request().method() === 'GET'),
            this.searchForm.getByRole('button', { name: 'Search' }).click(),
        ])
        await this.waitForTable()
    }

    rowFor(firstName:string, lastName:string):Locator{
        return this.tableRows
            .filter({ has: this.page.locator('.oxd-table-cell').nth(FIRST_NAME_COLUMN).getByText(firstName) })
            .filter({ hasText: lastName })
    }

    async expectEveryRowMatches(firstName:string, lastName:string){
        const rows = this.tableRows
        // Retry as a whole so a table that is still re-rendering does not give a stale row count
        await expect(async () => {
            const count = await rows.count()
            expect(count).toBeGreaterThan(0)
            for (let i = 0; i < count; i++){
                await expect(this.cell(rows.nth(i), FIRST_NAME_COLUMN)).toContainText(firstName, { timeout: 2000 })
                await expect(this.cell(rows.nth(i), LAST_NAME_COLUMN)).toContainText(lastName, { timeout: 2000 })
            }
        }).toPass({ timeout: 20000 })
    }

    async deleteEmployee(firstName:string, lastName:string){
        await this.gotoEmployeeList()
        await this.searchByName(`${firstName} ${lastName}`)
        await this.deleteRow(this.rowFor(firstName, lastName))
    }
}
