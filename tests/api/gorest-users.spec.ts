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

          const createdUser = await createResponse.json();
          userId = createdUser.id;

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
