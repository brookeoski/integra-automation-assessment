import { randomUUID } from 'node:crypto';

export type Gender = 'male' | 'female';
export type Status = 'active' | 'inactive';

export interface GorestUserPayload {
  name: string;
  email: string;
  gender: Gender;
  status: Status;
}

const genders: Gender[] = ['male', 'female'];
const statuses: Status[] = ['active', 'inactive'];

export function buildUniqueUser(): GorestUserPayload {
  const suffix = randomUUID();

  return {
    name: `QA Automation ${suffix.slice(0, 8)}`,
    email: `qa.${suffix}@example.test`,
    gender: genders[Math.floor(Math.random() * genders.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  };
}
