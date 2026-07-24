import { randomUUID } from 'node:crypto';

export type Gender = 'male' | 'female';
export type Status = 'active' | 'inactive';

export interface GorestUserPayload {
  name: string;
  email: string;
  gender: Gender;
  status: Status;
}

export const genderStatusCombinations: Array<{ gender: Gender; status: Status }> = [
  { gender: 'male', status: 'active' },
  { gender: 'male', status: 'inactive' },
  { gender: 'female', status: 'active' },
  { gender: 'female', status: 'inactive' },
];

export function buildUniqueUser(gender: Gender, status: Status): GorestUserPayload {
  const suffix = randomUUID();

  return {
    name: `QA Automation ${suffix.slice(0, 8)}`,
    email: `qa.${suffix}@example.test`,
    gender,
    status,
  };
}
