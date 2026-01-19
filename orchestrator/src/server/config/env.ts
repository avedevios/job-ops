import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

const candidates = [
  join(process.cwd(), '.env'),
  join(process.cwd(), '..', '.env'),
];

for (const envPath of candidates) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}
