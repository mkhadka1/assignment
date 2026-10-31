import { faker } from '@faker-js/faker';

// Values come from .env (loaded in playwright.config.ts). Fail fast with a clear message
// instead of letting a test time out on a login page.
function requireEnv(name:string):string{
    const value = process.env[name]
    if (!value){
        throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in.`)
    }
    return value
}

export const admin = {
    username: requireEnv('ORANGEHRM_USER'),
    password: requireEnv('ORANGEHRM_PASSWORD'),
}

// Faker gives realistic names; the random letters keep them unique on the shared demo
// site, so searching by name only finds the employee this run created.
// Faker can return names like "O'Keefe"; keep letters only so search behaves predictably
function lettersOnly(text:string):string{
    return text.replace(/[^a-zA-Z]/g, '')
}

export function newEmployee(){
    const suffix = faker.string.alpha({ length: 5, casing: 'lower' })
    return {
        firstName: `${lettersOnly(faker.person.firstName())}${suffix}`,
        lastName: `${lettersOnly(faker.person.lastName())}${suffix}`,
        // The auto-generated id is the "next free" number, which collides when runs overlap.
        // Max length is 10 characters.
        employeeId: faker.string.numeric(10),
    }
}

export function newSystemUser(){
    return {
        username: `${faker.internet.username().replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20)}_${faker.string.alphanumeric(5)}`,
        // OrangeHRM needs at least 7 characters with a lowercase letter and a number
        password: `${faker.internet.password({ length: 8 })}a1`,
        role: 'ESS',
        status: 'Enabled',
    }
}
