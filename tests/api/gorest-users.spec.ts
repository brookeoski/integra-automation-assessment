import { test, expect } from '@playwright/test';
import { buildUniqueUser, genderStatusCombinations } from './gorest-users.data';

test.describe('GoRest Users API: a user can be created, retrieved, and deleted', () => {
  for (const { gender, status } of genderStatusCombinations) {
    test(`a ${gender}/${status} user is created with all available fields, then retrieved, then permanently deleted`, async ({
      request,
    }) => {
      const payload = buildUniqueUser(gender, status);
      let userId: number | undefined;

      try {
        await test.step('Create a new user using every field the API accepts', async () => {
          const createResponse = await request.post('/public/v2/users', { data: payload });

          await test.step('Expect the user to be created successfully with the submitted data', () => {
            expect(createResponse.status()).toBe(201);
          });
// Here we are parsing the response from the POST request into the createdUser variable.
// This is the user that was created in the POST request. This is where the user id is parsed into our user object.
          const createdUser = await createResponse.json();
// Here we are assigning the id that was returned in the post response to the userId variable, so we can use it in the next test step.
          userId = createdUser.id;
// Here we are asserting that the created user is returned with the submitted data, 
// since we did not submit an id and instead the API has created an id for us, 
// we are just checking that there is an id that has been created, and it is parsed into createResponse in the response from the POST request. 
// We cannot assert it against anything else at this point.
// expect(createdUser.id).toBe(createdUser.id); --> 
// this would not test anything because it is comparing the same value to itself.
// Another way to write the below code is:
// expect(createdUser.id).toEqual(expect.any(Number));
//expect(createdUser).toMatchObject(payload);
          await test.step('Expect the created user to be returned with the submitted data', () => {
            expect(createdUser).toMatchObject({ id: expect.any(Number), ...payload });
          });
        });
        await test.step('Retrieve the user that was just created', async () => {
          const getResponse = await request.get(`/public/v2/users/${userId}`);

          await test.step('Expect the user to be found', () => {
            expect(getResponse.status()).toBe(200);
          });

          const fetchedUser = await getResponse.json();
// Here we are asserting that the retrieved user is returned with the submitted data, 
// AND that the id (assigned to userId variable)is the same as the one created in the POST response.
// Another way  to write this code is 
// expect(fetchedUser.id).toEqual(userId); --> 
// this is not matching the user ID to any number, 
// it is matching it explicitly to the userId varibale 
// that was returned in the POST response and correlates to our created user.
//expect(fetchedUser).toMatchObject(payload);
          await test.step('Expect the retrieved user to match what was created', () => {
            expect(fetchedUser).toMatchObject({ id: userId, ...payload });
          });
        });
      } catch (error) {
        // Best-effort cleanup: don't let a cleanup-side failure hide this error.
        if (userId) {
          await request.delete(`/public/v2/users/${userId}`).catch(() => {});
        }
        throw error;
      }
// Here we are deleting the user that was created in the POST request.
// We are using the userId variable that was assigned to the user id in the POST response.
// We are using the request object to delete the user.
// We are using the delete method to delete the user.
// We are using the userId variable to delete the user.
      await test.step('Delete the user', async () => {
        const deleteResponse = await request.delete(`/public/v2/users/${userId}`);

        await test.step('Expect the deletion to succeed', () => {
          expect(deleteResponse.status()).toBe(204);
        });
      });

      await test.step('Verify the user no longer exists', async () => {
        const getAfterDeleteResponse = await request.get(`/public/v2/users/${userId}`);

        await test.step('Expect the user to no longer be found', () => {
          expect(getAfterDeleteResponse.status()).toBe(404);
        });
      });
    });
  }
});
