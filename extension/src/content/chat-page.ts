import type { MessageAction, ScrapedChatMessage, Project, SyncChatsPayload } from '../types';

function send(msg: MessageAction): Promise<any> {
  return chrome.runtime.sendMessage(msg);
}

// ─── DOM Scraping (selectors from examplechat.html) ─────────────────────────

/**
 * Scrape chat messages from the Upwork messages room.
 *
 * DOM structure per message (from examplechat.html):
 *   .up-d-story-item
 *     .up-d-story
 *       .story-inner
 *         .avatar-section (avatar with initials or image)
 *         .story-section
 *           .story-message-header
 *             span.user-name          → sender name
 *             span.story-timestamp    → time, title attr has full date
 *           .story-message
 *             [data-test="story-message"] p → message content
 *
 * To detect CLIENT vs AGENCY: we compare sender name against the room header
 * title (which shows the client name). Messages from the header person = CLIENT,
 * all others = AGENCY.
 */
function scrapeMessages(): { messages: ScrapedChatMessage[]; roomId: string; clientName: string } {
  const messages: ScrapedChatMessage[] = [];

  // Get client name from room header
  const roomTitleEl = document.querySelector('.room-title, [data-test="room-title"]');
  const clientName = roomTitleEl?.textContent?.trim() ?? '';

  // Get room ID from header avatar data attributes
  const avatarEl = document.querySelector(
    '.room-header-body [data-user-id], #room-header-avatar[data-user-id]',
  );
  const roomId = avatarEl?.getAttribute('data-user-id') ?? '';

  // Get all story items (messages)
  const storyItems = document.querySelectorAll('.up-d-story-item');

  storyItems.forEach((item) => {
    const nameEl = item.querySelector('.user-name');
    const timestampEl = item.querySelector('.story-timestamp');
    const messageEl = item.querySelector('[data-test="story-message"]');

    if (!nameEl || !messageEl) return;

    const senderName = nameEl.textContent?.trim() ?? '';
    const content = messageEl.textContent?.trim() ?? '';
    if (!content) return;

    // Parse timestamp — the title attribute has the full date
    // e.g., title="January 20, 2026 at 3:12 AM"
    const fullDate = timestampEl?.getAttribute('title') ?? '';
    let sentAt: string;
    if (fullDate) {
      // Parse "January 20, 2026 at 3:12 AM" format
      const cleaned = fullDate.replace(' at ', ' ');
      const parsed = new Date(cleaned);
      sentAt = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    } else {
      sentAt = new Date().toISOString();
    }

    // Determine sender type: if the name appears in the client name (from header), it's CLIENT
    const isClient = isClientMessage(senderName, clientName);

    messages.push({
      senderName,
      senderType: isClient ? 'CLIENT' : 'AGENCY',
      content,
      sentAt,
    });
  });

  return { messages, roomId, clientName };
}

/**
 * Heuristic to determine if a message sender is the client.
 * The room header shows the client's name. We check if the sender name
 * matches or is contained in the header name (handles "Maria Galindez" vs "Maria G").
 */
function isClientMessage(senderName: string, headerClientName: string): boolean {
  if (!senderName || !headerClientName) return false;
  const sender = senderName.toLowerCase().trim();
  const header = headerClientName.toLowerCase().trim();

  // Direct match
  if (header.includes(sender) || sender.includes(header)) return true;

  // First name match (handles cases like "Maria Galindez" in header, "Maria G" or "Maria Galindez" as sender)
  const senderFirst = sender.split(/\s+/)[0];
  const headerFirst = header.split(/,/)[0].trim().split(/\s+/)[0];
  return senderFirst === headerFirst && senderFirst.length > 2;
}

// ─── UI ─────────────────────────────────────────────────────────────────────

function showToast(message: string, type: 'success' | 'error') {
  const existing = document.querySelector('.aop-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `aop-toast aop-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function createSyncPanel(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'aop-overlay visible';

  const panel = document.createElement('div');
  panel.className = 'aop-panel visible';
  panel.innerHTML = `
    <div class="aop-panel-header">
      <h3>Sync Chats to AOP</h3>
      <button class="aop-panel-close">&times;</button>
    </div>
    <div class="aop-panel-body">
      <div class="aop-info" id="aop-chat-info">
        Scanning chat messages on this page...
      </div>
      <div class="aop-field">
        <label>Organization</label>
        <select id="aop-sync-org"><option value="">Loading...</option></select>
      </div>
      <div class="aop-field">
        <label>Select Project *</label>
        <select id="aop-sync-project" required><option value="">Select organization first</option></select>
      </div>
      <button class="aop-btn aop-btn-primary" id="aop-sync-btn" disabled>Sync Messages</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  // Close handlers
  overlay.addEventListener('click', () => closePanel(overlay, panel));
  panel
    .querySelector('.aop-panel-close')!
    .addEventListener('click', () => closePanel(overlay, panel));

  // Scrape messages and show count
  const scraped = scrapeMessages();
  const infoEl = panel.querySelector('#aop-chat-info')!;
  infoEl.textContent = `Found ${scraped.messages.length} messages from ${scraped.clientName || 'this chat'}`;

  // Load organizations
  loadOrgs(panel, scraped);

  return panel;
}

async function loadOrgs(panel: HTMLElement, scraped: ReturnType<typeof scrapeMessages>) {
  try {
    const orgs = await send({ type: 'GET_ORGANIZATIONS' });
    const select = panel.querySelector('#aop-sync-org') as HTMLSelectElement;
    select.innerHTML = '<option value="">Select organization...</option>';
    if (Array.isArray(orgs)) {
      orgs.forEach((org: any) => {
        const opt = document.createElement('option');
        opt.value = org.id;
        opt.textContent = org.name;
        select.appendChild(opt);
      });
    }

    select.addEventListener('change', () => loadProjects(panel, select.value, scraped));
  } catch (err: any) {
    showToast(`Failed to load organizations: ${err.message}`, 'error');
  }
}

async function loadProjects(
  panel: HTMLElement,
  orgId: string,
  scraped: ReturnType<typeof scrapeMessages>,
) {
  const projectSelect = panel.querySelector('#aop-sync-project') as HTMLSelectElement;
  const syncBtn = panel.querySelector('#aop-sync-btn') as HTMLButtonElement;
  projectSelect.innerHTML = '<option value="">Loading projects...</option>';
  syncBtn.disabled = true;

  if (!orgId) {
    projectSelect.innerHTML = '<option value="">Select organization first</option>';
    return;
  }

  try {
    const projects: Project[] = await send({ type: 'GET_PROJECTS', organizationId: orgId });
    projectSelect.innerHTML = '<option value="">Select project...</option>';

    if (Array.isArray(projects)) {
      projects.forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.title} (${p.stage})`;
        projectSelect.appendChild(opt);
      });
    }

    projectSelect.addEventListener('change', () => {
      syncBtn.disabled = !projectSelect.value;
    });

    // Wire up sync button
    syncBtn.onclick = () => handleSync(panel, panel.parentElement!, scraped);
  } catch (err: any) {
    projectSelect.innerHTML = '<option value="">Failed to load projects</option>';
  }
}

async function handleSync(
  panel: HTMLElement,
  _overlay: HTMLElement,
  scraped: ReturnType<typeof scrapeMessages>,
) {
  const projectId = (panel.querySelector('#aop-sync-project') as HTMLSelectElement).value;
  const btn = panel.querySelector('#aop-sync-btn') as HTMLButtonElement;

  if (!projectId) {
    showToast('Please select a project', 'error');
    return;
  }

  if (scraped.messages.length === 0) {
    showToast('No messages found to sync', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Syncing...';

  const payload: SyncChatsPayload = {
    upworkRoomId: scraped.roomId || undefined,
    messages: scraped.messages,
  };

  try {
    const result = await send({ type: 'SYNC_CHATS', projectId, payload });
    if (result.error) throw new Error(result.error);

    const overlay = document.querySelector('.aop-overlay');
    if (overlay) overlay.remove();
    panel.remove();
    showToast(`Synced ${result.synced} of ${result.total} messages!`, 'success');
  } catch (err: any) {
    btn.disabled = false;
    btn.textContent = 'Sync Messages';
    showToast(`Sync failed: ${err.message}`, 'error');
  }
}

function closePanel(overlay: HTMLElement, panel: HTMLElement) {
  overlay.remove();
  panel.remove();
}

// ─── Inject Button ──────────────────────────────────────────────────────────

function injectSyncButton() {
  if (document.querySelector('#aop-sync-trigger')) return;

  // Insert near the room header actions
  const headerActions =
    document.querySelector('.up-d-room-header-actions') ??
    document.querySelector('.room-header-body');
  if (!headerActions) return;

  const btn = document.createElement('button');
  btn.id = 'aop-sync-trigger';
  btn.className = 'aop-inject-btn';
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
    </svg>
    Sync to AOP
  `;

  btn.addEventListener('click', async () => {
    const status = await send({ type: 'GET_AUTH_STATUS' });
    if (!status.authenticated) {
      showToast('Please log in to AOP via the extension popup first', 'error');
      return;
    }

    createSyncPanel();
  });

  headerActions.appendChild(btn);
}

// ─── Init ───────────────────────────────────────────────────────────────────

function init() {
  const observer = new MutationObserver(() => {
    if (document.querySelector('.up-d-room-header, .room-header-body')) {
      injectSyncButton();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.querySelector('.up-d-room-header, .room-header-body')) {
    injectSyncButton();
  }
}

init();
