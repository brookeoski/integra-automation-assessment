export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const checkoutCustomer: CustomerInfo = {
  firstName: 'Jane',
  lastName: 'Doe',
  postalCode: '12345',
};

export const product = {
  name: 'Sauce Labs Backpack',
  slug: 'sauce-labs-backpack',
};
