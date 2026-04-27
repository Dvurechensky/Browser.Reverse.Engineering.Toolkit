import type { SiteClientOptions } from './types';
import { endpoints, type SiteEndpoints } from './endpoints';

export interface SiteClient extends SiteEndpoints {}

export function createSiteClient(options: SiteClientOptions = {}): SiteClient {
  const fetchImpl = options.fetchImpl || fetch;
  const baseUrls = {
    base: options.baseUrl || "https://vk.com",
    api: options.apiBaseUrl || "https://api.vk.com",
    auth: options.authBaseUrl || "https://api.vk.com",
    media: options.mediaBaseUrl || "https://st1-54.vk.com",
    telemetry: options.telemetryBaseUrl || "https://stats.vk-portal.net",
  };

  return endpoints({
    fetchImpl,
    baseUrls,
    accessToken: options.accessToken,
    sessionCookie: options.sessionCookie,
    csrfToken: options.csrfToken,
    defaultHeaders: options.defaultHeaders || {},
  });
}
