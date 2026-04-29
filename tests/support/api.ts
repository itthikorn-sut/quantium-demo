import fs from 'fs';
import path from 'path';
import { request, type APIRequestContext } from '@playwright/test';

export const apiBaseURL = process.env.API_BASE_URL || 'https://quantiumfundwebapi.azurewebsites.net';

export async function authenticatedApiContext(): Promise<APIRequestContext> {
  const storageStatePath = path.join(process.cwd(), 'tests', '.auth', 'user.json');
  if (!fs.existsSync(storageStatePath)) {
    throw new Error('Missing tests/.auth/user.json. Run Playwright with TEST_EMAIL and TEST_PASSWORD first.');
  }

  return request.newContext({
    baseURL: apiBaseURL,
    storageState: storageStatePath
  });
}

