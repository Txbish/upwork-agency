import { api, login } from '../lib/api';
import { isAuthenticated, clearAuth, decodeJwt, getToken, getActiveOrg } from '../lib/storage';
import type { MessageAction, Organization, Niche, Project } from '../types';

chrome.runtime.onMessage.addListener((message: MessageAction, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((err) => sendResponse({ error: err.message }));
  return true; // keep channel open for async response
});

async function handleMessage(message: MessageAction): Promise<unknown> {
  switch (message.type) {
    case 'GET_AUTH_STATUS': {
      const authed = await isAuthenticated();
      if (!authed) return { authenticated: false };
      const token = await getToken();
      const payload = token ? decodeJwt(token) : null;
      const activeOrg = await getActiveOrg();
      return { authenticated: true, user: payload, activeOrg };
    }

    case 'LOGIN': {
      const result = await login(message.email, message.password);
      return { authenticated: true, user: result.user };
    }

    case 'LOGOUT': {
      await clearAuth();
      return { authenticated: false };
    }

    case 'GET_ORGANIZATIONS': {
      const data = await api<{ data: Organization[] }>('/organizations?limit=100');
      return data.data;
    }

    case 'GET_NICHES': {
      const data = await api<{ data: Niche[] }>(
        `/niches?organizationId=${message.organizationId}&limit=100`,
      );
      return data.data;
    }

    case 'GET_PROJECTS': {
      const data = await api<{ data: Project[] }>(
        `/projects?organizationId=${message.organizationId}&limit=200`,
      );
      return data.data;
    }

    case 'IMPORT_JOB': {
      return api('/projects/import-from-upwork', {
        method: 'POST',
        body: message.payload,
      });
    }

    case 'SYNC_CHATS': {
      return api(`/projects/${message.projectId}/chats/sync`, {
        method: 'POST',
        body: message.payload,
      });
    }

    case 'GET_LATEST_SYNC': {
      return api(`/projects/${message.projectId}/chats/latest`);
    }

    default:
      throw new Error(`Unknown message type`);
  }
}
