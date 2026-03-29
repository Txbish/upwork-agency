import type {
  MessageAction,
  ScrapedJobData,
  Organization,
  Niche,
  ImportFromUpworkPayload,
} from '../types';

function send(msg: MessageAction): Promise<any> {
  return chrome.runtime.sendMessage(msg);
}

// ─── DOM Scraping (selectors from exampleproject.html) ──────────────────────

function scrapeJobData(): ScrapedJobData | null {
  // Title: h4 > span.flex-1 inside .job-details
  const titleEl = document.querySelector('.job-details h4 span.flex-1');
  const title = titleEl?.textContent?.trim();
  if (!title) return null;

  // Description: [data-test="Description"] p
  const descEl = document.querySelector('[data-test="Description"] p');
  const jobDescription = descEl?.textContent?.trim() ?? '';

  // Pricing: check for [data-cy="fixed-price"] or [data-cy="hourly"]
  const fixedPriceEl = document.querySelector('[data-cy="fixed-price"]');
  const hourlyEl = document.querySelector('[data-cy="hourly"]');

  let pricingType: 'HOURLY' | 'FIXED' = 'FIXED';
  let fixedPrice: number | undefined;
  let hourlyRateMin: number | undefined;
  let hourlyRateMax: number | undefined;

  if (fixedPriceEl) {
    pricingType = 'FIXED';
    // Price is in the parent <li> → strong text (e.g., "$25.00")
    const priceText = fixedPriceEl.closest('li')?.querySelector('strong')?.textContent?.trim();
    if (priceText) {
      fixedPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    }
  } else if (hourlyEl) {
    pricingType = 'HOURLY';
    // Hourly rates are typically shown as "$30.00 - $60.00"
    const rateText = hourlyEl.closest('li')?.querySelector('strong')?.textContent?.trim();
    if (rateText) {
      const nums = rateText.match(/[\d.]+/g);
      if (nums && nums.length >= 2) {
        hourlyRateMin = parseFloat(nums[0]);
        hourlyRateMax = parseFloat(nums[1]);
      } else if (nums && nums.length === 1) {
        hourlyRateMin = parseFloat(nums[0]);
      }
    }
  }

  // Also check the description div for "Fixed-price" or "Hourly" text
  const featureDescriptions = document.querySelectorAll('.features .description');
  for (const desc of featureDescriptions) {
    const text = desc.textContent?.trim().toLowerCase() ?? '';
    if (text.includes('hourly')) pricingType = 'HOURLY';
    if (text.includes('fixed')) pricingType = 'FIXED';
  }

  // Skills: .skills-list .air3-line-clamp text
  const skillEls = document.querySelectorAll('.skills-list .air3-line-clamp');
  const skills: string[] = [];
  skillEls.forEach((el) => {
    const text = el.textContent?.trim();
    if (text) skills.push(text);
  });

  return {
    title,
    jobUrl: window.location.href,
    jobDescription,
    pricingType,
    fixedPrice,
    hourlyRateMin,
    hourlyRateMax,
    skills,
  };
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

function createPanel(jobData: ScrapedJobData): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'aop-overlay visible';

  const panel = document.createElement('div');
  panel.className = 'aop-panel visible';
  panel.innerHTML = `
    <div class="aop-panel-header">
      <h3>Export to AOP</h3>
      <button class="aop-panel-close">&times;</button>
    </div>
    <div class="aop-panel-body">
      <div class="aop-info">
        Scraped from current Upwork job listing. Review and select organization to export.
      </div>
      <div class="aop-field">
        <label>Title</label>
        <input type="text" id="aop-title" value="${escapeAttr(jobData.title)}" />
      </div>
      <div class="aop-field">
        <label>Pricing</label>
        <select id="aop-pricing">
          <option value="FIXED" ${jobData.pricingType === 'FIXED' ? 'selected' : ''}>Fixed Price</option>
          <option value="HOURLY" ${jobData.pricingType === 'HOURLY' ? 'selected' : ''}>Hourly</option>
        </select>
      </div>
      <div class="aop-field" id="aop-fixed-field" style="display:${jobData.pricingType === 'FIXED' ? 'block' : 'none'}">
        <label>Fixed Price ($)</label>
        <input type="number" id="aop-fixed-price" value="${jobData.fixedPrice ?? ''}" min="0" step="0.01" />
      </div>
      <div class="aop-field" id="aop-hourly-field" style="display:${jobData.pricingType === 'HOURLY' ? 'block' : 'none'}">
        <label>Hourly Rate Range ($)</label>
        <div style="display:flex;gap:8px">
          <input type="number" id="aop-hourly-min" placeholder="Min" value="${jobData.hourlyRateMin ?? ''}" min="0" step="0.01" />
          <input type="number" id="aop-hourly-max" placeholder="Max" value="${jobData.hourlyRateMax ?? ''}" min="0" step="0.01" />
        </div>
      </div>
      ${jobData.skills.length > 0 ? `<div class="aop-field"><label>Skills</label><div class="aop-skills-list">${jobData.skills.map((s) => `<span class="aop-skill-tag">${escapeHtml(s)}</span>`).join('')}</div></div>` : ''}
      <div class="aop-field">
        <label>Organization *</label>
        <select id="aop-org" required><option value="">Loading...</option></select>
      </div>
      <div class="aop-field">
        <label>Niche</label>
        <select id="aop-niche"><option value="">None</option></select>
      </div>
      <button class="aop-btn aop-btn-primary" id="aop-export-btn">Export to AOP</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  // Close handlers
  overlay.addEventListener('click', () => closePanel(overlay, panel));
  panel
    .querySelector('.aop-panel-close')!
    .addEventListener('click', () => closePanel(overlay, panel));

  // Pricing toggle
  const pricingSelect = panel.querySelector('#aop-pricing') as HTMLSelectElement;
  pricingSelect.addEventListener('change', () => {
    const isFixed = pricingSelect.value === 'FIXED';
    (panel.querySelector('#aop-fixed-field') as HTMLElement).style.display = isFixed
      ? 'block'
      : 'none';
    (panel.querySelector('#aop-hourly-field') as HTMLElement).style.display = isFixed
      ? 'none'
      : 'block';
  });

  // Load organizations
  loadOrganizations(panel);

  // Export handler
  panel
    .querySelector('#aop-export-btn')!
    .addEventListener('click', () => handleExport(panel, overlay, jobData));

  return panel;
}

async function loadOrganizations(panel: HTMLElement) {
  try {
    const orgs: Organization[] = await send({ type: 'GET_ORGANIZATIONS' });
    const select = panel.querySelector('#aop-org') as HTMLSelectElement;
    select.innerHTML = '<option value="">Select organization...</option>';
    if (Array.isArray(orgs)) {
      orgs.forEach((org) => {
        const opt = document.createElement('option');
        opt.value = org.id;
        opt.textContent = org.name;
        select.appendChild(opt);
      });
    }

    // Load niches when org changes
    select.addEventListener('change', () => loadNiches(panel, select.value));
  } catch (err: any) {
    showToast(`Failed to load organizations: ${err.message}`, 'error');
  }
}

async function loadNiches(panel: HTMLElement, orgId: string) {
  const nicheSelect = panel.querySelector('#aop-niche') as HTMLSelectElement;
  nicheSelect.innerHTML = '<option value="">None</option>';
  if (!orgId) return;

  try {
    const niches: Niche[] = await send({ type: 'GET_NICHES', organizationId: orgId });
    if (Array.isArray(niches)) {
      niches.forEach((niche) => {
        const opt = document.createElement('option');
        opt.value = niche.id;
        opt.textContent = niche.name;
        nicheSelect.appendChild(opt);
      });
    }
  } catch {
    // Niches are optional, fail silently
  }
}

async function handleExport(panel: HTMLElement, overlay: HTMLElement, jobData: ScrapedJobData) {
  const btn = panel.querySelector('#aop-export-btn') as HTMLButtonElement;
  const orgId = (panel.querySelector('#aop-org') as HTMLSelectElement).value;
  const nicheId = (panel.querySelector('#aop-niche') as HTMLSelectElement).value;
  const title = (panel.querySelector('#aop-title') as HTMLInputElement).value;
  const pricingType = (panel.querySelector('#aop-pricing') as HTMLSelectElement).value as
    | 'FIXED'
    | 'HOURLY';

  if (!orgId) {
    showToast('Please select an organization', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Exporting...';

  const payload: ImportFromUpworkPayload = {
    title,
    jobUrl: jobData.jobUrl,
    jobDescription: jobData.jobDescription,
    pricingType,
    skills: jobData.skills,
    organizationId: orgId,
  };

  if (pricingType === 'FIXED') {
    const fixedVal = (panel.querySelector('#aop-fixed-price') as HTMLInputElement).value;
    if (fixedVal) payload.fixedPrice = parseFloat(fixedVal);
  } else {
    const minVal = (panel.querySelector('#aop-hourly-min') as HTMLInputElement).value;
    const maxVal = (panel.querySelector('#aop-hourly-max') as HTMLInputElement).value;
    if (minVal) payload.hourlyRateMin = parseFloat(minVal);
    if (maxVal) payload.hourlyRateMax = parseFloat(maxVal);
  }

  if (nicheId) payload.nicheId = nicheId;

  try {
    const result = await send({ type: 'IMPORT_JOB', payload });
    if (result.error) throw new Error(result.error);
    closePanel(overlay, panel);
    showToast(`Project "${title}" exported to AOP!`, 'success');
  } catch (err: any) {
    btn.disabled = false;
    btn.textContent = 'Export to AOP';
    showToast(`Export failed: ${err.message}`, 'error');
  }
}

function closePanel(overlay: HTMLElement, panel: HTMLElement) {
  overlay.remove();
  panel.remove();
}

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ─── Inject Button ──────────────────────────────────────────────────────────

function injectExportButton() {
  if (document.querySelector('#aop-export-trigger')) return;

  // Find the job title section to inject near
  const titleSection = document.querySelector('.job-details-content .air3-card-section');
  if (!titleSection) return;

  const btn = document.createElement('button');
  btn.id = 'aop-export-trigger';
  btn.className = 'aop-inject-btn';
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
    Export to AOP
  `;

  btn.addEventListener('click', async () => {
    // Check auth first
    const status = await send({ type: 'GET_AUTH_STATUS' });
    if (!status.authenticated) {
      showToast('Please log in to AOP via the extension popup first', 'error');
      return;
    }

    const jobData = scrapeJobData();
    if (!jobData) {
      showToast('Could not scrape job data from this page', 'error');
      return;
    }

    createPanel(jobData);
  });

  // Insert after the title h4
  const h4 = titleSection.querySelector('h4');
  if (h4) {
    h4.style.display = 'flex';
    h4.style.justifyContent = 'space-between';
    h4.style.alignItems = 'center';
    h4.appendChild(btn);
  } else {
    titleSection.appendChild(btn);
  }
}

// ─── Init ───────────────────────────────────────────────────────────────────

function init() {
  // Wait for job details to load (Upwork is a SPA)
  const observer = new MutationObserver(() => {
    if (document.querySelector('.job-details')) {
      injectExportButton();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Also try immediately in case page is already loaded
  if (document.querySelector('.job-details')) {
    injectExportButton();
  }
}

init();
