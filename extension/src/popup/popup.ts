import type { MessageAction } from '../types';

function send(msg: MessageAction): Promise<any> {
  return chrome.runtime.sendMessage(msg);
}

const loginSection = document.getElementById('login-section')!;
const statusSection = document.getElementById('status-section')!;
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const loginError = document.getElementById('login-error')!;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const userInfo = document.getElementById('user-info')!;
const logoutBtn = document.getElementById('logout-btn')!;
const apiUrlInput = document.getElementById('api-url') as HTMLInputElement;
const saveUrlBtn = document.getElementById('save-url-btn')!;

async function checkAuth() {
  const result = await send({ type: 'GET_AUTH_STATUS' });
  if (result.authenticated) {
    showStatus(result.user);
  } else {
    showLogin();
  }
}

function showLogin() {
  loginSection.style.display = 'block';
  statusSection.style.display = 'none';
  loginError.textContent = '';
}

function showStatus(user: any) {
  loginSection.style.display = 'none';
  statusSection.style.display = 'block';
  userInfo.textContent = `Logged in as ${user?.email ?? 'unknown'}`;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';

  try {
    const result = await send({
      type: 'LOGIN',
      email: emailInput.value,
      password: passwordInput.value,
    });
    if (result.error) throw new Error(result.error);
    showStatus(result.user);
  } catch (err: any) {
    loginError.textContent = err.message || 'Login failed';
  }
});

logoutBtn.addEventListener('click', async () => {
  await send({ type: 'LOGOUT' });
  showLogin();
});

saveUrlBtn.addEventListener('click', async () => {
  const url = apiUrlInput.value.trim().replace(/\/$/, '');
  if (url) {
    await chrome.storage.local.set({ aop_api_url: url });
    saveUrlBtn.textContent = 'Saved!';
    setTimeout(() => (saveUrlBtn.textContent = 'Save'), 1500);
  }
});

// Load saved API URL
chrome.storage.local.get('aop_api_url').then((result) => {
  if (result.aop_api_url) {
    apiUrlInput.value = result.aop_api_url as string;
  }
});

checkAuth();
