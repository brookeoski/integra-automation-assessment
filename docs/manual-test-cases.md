# Manual Test Cases — Sauce Demo

Application under test: https://www.saucedemo.com/

## TC_UI_001 – Successful Login

**Preconditions**

- User is on the Sauce Demo login page.
- A valid user account exists (`standard_user` / `secret_sauce`).

**Test Steps**

1. Enter a valid username.
2. Enter the matching password.
3. Click the **Login** button.

**Expected Result**

User is redirected to the Inventory page (`/inventory.html`) and the product list is displayed.

---

## TC_UI_002 – Add and Remove Product from Cart

**Preconditions**

- User is logged in and on the Inventory page.

**Test Steps**

1. Click **Add to cart** on a product.
2. Verify the cart icon badge shows a count of 1.
3. Click **Remove** on the same product.

**Expected Result**

The cart badge count is removed and the product's button reverts to **Add to cart**.

---

## TC_UI_003 – Complete Checkout

**Preconditions**

- User is logged in and on the Inventory page.

**Test Steps**

1. Add a product to the cart.
2. Open the cart and verify the added product is listed.
3. Click **Checkout**.
4. Enter first name, last name, and postal code.
5. Click **Continue**.
6. Review the order summary, then click **Finish**.

**Expected Result**

The order completes and the confirmation page displays "Thank you for your order!".

---

## TC_UI_004 – Invalid Login Attempt

**Preconditions**

- User is on the Sauce Demo login page and not authenticated.

**Test Steps**

1. Enter a valid username with an incorrect password.
2. Click the **Login** button.

**Expected Result**

An error message is displayed ("Epic sadface: Username and password do not match any user in this service") and the user remains on the login page.
