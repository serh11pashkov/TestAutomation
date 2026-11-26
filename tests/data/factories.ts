import { faker } from '@faker-js/faker';

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode('#####'),
    ...overrides,
  };
}
