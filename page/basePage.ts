import { Page, Locator, expect } from "@playwright/test";

// Helpers shared by every OrangeHRM page. OrangeHRM labels are not linked to their
// inputs, so fields are found through the input group that contains the label text.
export class BasePage{
    constructor(protected readonly page:Page){}

    protected inputGroup(label:string, scope:Locator|Page = this.page):Locator{
        return scope.locator('.oxd-input-group').filter({
            has: this.page.locator('label', { hasText: new RegExp(`^${label}$`) }),
        })
    }

    protected field(label:string, scope?:Locator):Locator{
        return this.inputGroup(label, scope).locator('input')
    }

    protected async selectOption(label:string, option:string, scope?:Locator){
        await this.inputGroup(label, scope).locator('.oxd-select-text').click()
        await this.page.getByRole('listbox').getByRole('option', { name: option, exact: true }).click()
    }

    // Types into an autocomplete field and picks the matching suggestion
    protected async chooseAutocomplete(label:string, text:string, option:string, scope?:Locator){
        await this.field(label, scope).fill(text)
        const suggestion = this.page.getByRole('listbox').getByRole('option', { name: option })
        await suggestion.click()
    }

    get header():Locator{
        return this.page.locator('.oxd-topbar-header-breadcrumb')
    }

    menuItem(name:string):Locator{
        return this.page.locator('.oxd-main-menu').getByRole('link', { name, exact: true })
    }

    async openMenu(name:string){
        await this.menuItem(name).click()
    }

    async expectToast(message:string){
        await expect(this.page.locator('.oxd-toast').filter({ hasText: message }).first()).toBeVisible()
    }

    // Table rows in OrangeHRM list pages
    get tableRows():Locator{
        return this.page.locator('.oxd-table-body .oxd-table-card')
    }

    cell(row:Locator, index:number):Locator{
        return row.locator('.oxd-table-cell').nth(index)
    }

    async waitForTable(){
        await expect(this.page.locator('.oxd-table-loader')).toHaveCount(0)
    }

    async deleteRow(row:Locator){
        await row.locator('button:has(.bi-trash)').click()
        await this.page.getByRole('button', { name: 'Yes, Delete' }).click()
        await this.expectToast('Successfully Deleted')
    }

    async expectNoRecords(){
        await this.waitForTable()
        await expect(this.page.getByText('No Records Found', { exact: true }).first()).toBeVisible()
        await expect(this.tableRows).toHaveCount(0)
    }
}
