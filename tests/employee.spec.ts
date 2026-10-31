import { test, expect } from '../fixtures/pages';
import { newEmployee, newSystemUser } from '../data/testData';

// Tasks 2-5 and the clean-up build on each other (the user is linked to the employee,
// the role check logs in as that user), so they run in order and share this data.
test.describe.configure({ mode: 'serial' })

test.describe('Employee and system user lifecycle', () => {
  const employee = newEmployee()
  const employeeName = `${employee.firstName} ${employee.lastName}`
  const user = newSystemUser()

  test('Task 2 - add a new employee', async ({ loggedInAsAdmin, employeePage }) => {
    await test.step('1.Navigate to Add Employee', async () => {
      await employeePage.gotoAddEmployee()
    })
    await test.step('2.Fill and save the employee', async () => {
      await employeePage.addEmployee(employee.firstName, employee.lastName, employee.employeeId)
    })
    await test.step('3.Verify the details page is shown', async () => {
      await employeePage.expectDetailsPage(employee.firstName, employee.lastName, employee.employeeId)
    })
  })

  test('Task 3 - search for the employee', async ({ loggedInAsAdmin, employeePage }) => {
    await test.step('1.Navigate to Employee List', async () => {
      await employeePage.gotoEmployeeList()
    })
    await test.step('2.Search by employee name', async () => {
      await employeePage.searchByName(employeeName)
    })
    await test.step('3.Verify the employee is found and every row matches', async () => {
      await expect(employeePage.rowFor(employee.firstName, employee.lastName)).toHaveCount(1)
      await employeePage.expectEveryRowMatches(employee.firstName, employee.lastName)
    })
  })

  test('Task 4 - create an ESS system user', async ({ loggedInAsAdmin, adminPage }) => {
    await test.step('1.Create the user linked to the employee', async () => {
      await adminPage.createUser(user, employeeName, employee.firstName)
    })
    await test.step('2.Search for the user', async () => {
      await adminPage.searchByUsername(user.username)
    })
    await test.step('3.Verify role and status', async () => {
      await adminPage.expectUser(user, employeeName)
    })
  })

  test('Task 5 - ESS user can see My Info but not Admin', async ({ page, loggedInAsAdmin, loginPage }) => {
    await test.step('1.Log out and log in as the new user', async () => {
      await loginPage.logout()
      await loginPage.loginAs(user.username, user.password)
    })
    await test.step('2.Verify My Info is accessible', async () => {
      await loginPage.openMenu('My Info')
      await expect(page).toHaveURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+/)
      await expect(page.locator('.orangehrm-edit-employee-name')).toHaveText(employeeName)
    })
    await test.step('3.Verify the Admin menu is not shown', async () => {
      await expect(loginPage.menuItem('Admin')).toHaveCount(0)
    })
  })

  test('Bonus - delete the user and employee', async ({ loggedInAsAdmin, adminPage, employeePage }) => {
    await test.step('1.Delete the user and verify it is gone', async () => {
      await adminPage.deleteUser(user.username)
      await adminPage.searchByUsername(user.username)
      await adminPage.expectNoRecords()
    })
    await test.step('2.Delete the employee and verify it is gone', async () => {
      await employeePage.deleteEmployee(employee.firstName, employee.lastName)
      await employeePage.searchByName(employeeName)
      await employeePage.expectNoRecords()
    })
  })
})
