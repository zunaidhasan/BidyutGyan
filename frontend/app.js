/* ═══════════════════════════════════════════════════════════
   BidyutGyan (বিদ্যুতজ্ঞান) — Frontend Application Logic
   ═══════════════════════════════════════════════════════════ */

// ── State ────────────────────────────────────────────────
let currentLang = 'bn'; // 'bn' | 'en'
let selectedDistrict = null;
let allDistrictsCache = [];
let searchTimeout = null;
let currentTheme = 'dark'; // 'dark' | 'light'
let isLoading = {
  districts: false,
  divisions: false,
  accordion: false,
};

// ── Strings ──────────────────────────────────────────────
const STRINGS = {
  bn: {
    searchPlaceholder: 'জেলা বা বিভাগের নাম লিখুন (Bangla/English)...',
    locateText: 'আমার অবস্থান',
    searchTitle: '📍 আপনার এলাকা খুঁজুন',
    browserTitle: '🗺️ সব জেলা ব্রাউজ করুন',
    scheduleComingSoon: '⏳ শীঘ্রই আসছে — কমিউনিটি রিপোর্টের ভিত্তিতে সময়সূচী তৈরি হবে',
    demoNote: '* ডেমো সময়সূচী — বাস্তব সময়সূচী কমিউনিটি রিপোর্টের মাধ্যমে তৈরি হবে',
    reportTitle: '📢 আপনার এলাকায় এখন কী অবস্থা?',
    utilityLabel: '⚡ বিদ্যুৎ সরবরাহকারী',
    supplierTypeLabel: '🏢 ধরন',
    coordinatesLabel: '📍 স্থানাঙ্ক',
    distanceLabel: '📏 দূরত্ব',
    scheduleTitle: '📋 আজকের সম্ভাব্য লোডশেডিং সময়সূচী',
    utilityInfoTitle: 'ℹ️ সরবরাহকারীর তথ্য',
    powerCutReported: '🔌 পাওয়ার কাট রিপোর্ট করা হয়েছে!',
    powerOnReported: '💡 পাওয়ার ফিরেছে! ধন্যবাদ।',
    findingLocation: '📡 অবস্থান খোঁজা হচ্ছে...',
    searchNoResults: 'কোনো জেলা পাওয়া যায়নি',
    poweredBy: '⚡ বিদ্যুতজ্ঞান — নির্মিত বাংলাদেশের জন্য',
    footerNote: 'ডেটা নির্ভুলতার জন্য সর্বোচ্চ চেষ্টা করা হয়েছে। সরকারি সূত্র থেকে সর্বশেষ তথ্য যাচাই করুন।',
    typeUrban: 'শহর',
    typeRegional: 'আঞ্চলিক',
    typeRural: 'পল্লী',
    langLabel: 'English',
    searching: 'অনুসন্ধান...',
    locationDenied: 'অবস্থান অ্যাক্সেস করতে ব্যর্থ। দয়া করে অবস্থান অনুমতি দিন।',
    locationNotFound: 'আপনার এলাকা খুঁজে পাওয়া যায়নি',
    noGeolocation: 'আপনার ব্রাউজারে অবস্থান সুবিধা নেই',
    scheduleSlots: [
      { time: 'সকাল ৬-৮টা', status: 'green', label: 'বন্ধ নেই', width: 15 },
      { time: 'সকাল ৮-১২টা', status: 'yellow', label: 'সম্ভাব্য', width: 50 },
      { time: 'দুপুর ১২-২টা', status: 'red', label: 'লোডশেডিং হতে পারে', width: 85 },
      { time: 'বিকাল ২-৬টা', status: 'yellow', label: 'সম্ভাব্য', width: 50 },
      { time: 'রাত ৬-১২টা', status: 'green', label: 'বন্ধ নেই', width: 15 },
    ],
  },
  en: {
    searchPlaceholder: 'Search district or division name...',
    locateText: 'My Location',
    searchTitle: '📍 Find Your Area',
    browserTitle: '🗺️ Browse All Districts',
    scheduleComingSoon: '⏳ Coming soon — schedules will be built from community reports',
    demoNote: '* Demo schedule — real schedule will be built from community reports',
    reportTitle: '📢 What is the power status in your area?',
    utilityLabel: '⚡ Electricity Supplier',
    supplierTypeLabel: '🏢 Type',
    coordinatesLabel: '📍 Coordinates',
    distanceLabel: '📏 Distance',
    scheduleTitle: '📋 Today\'s Expected Load Shedding Schedule',
    utilityInfoTitle: 'ℹ️ Supplier Information',
    powerCutReported: '🔌 Power cut reported!',
    powerOnReported: '💡 Power is back! Thanks.',
    findingLocation: '📡 Finding location...',
    searchNoResults: 'No districts found',
    poweredBy: '⚡ BidyutGyan — Built for Bangladesh',
    footerNote: 'Every effort has been made for data accuracy. Please verify latest info from official sources.',
    typeUrban: 'Urban',
    typeRegional: 'Regional',
    typeRural: 'Rural',
    langLabel: 'বাংলা',
    searching: 'Searching...',
    locationDenied: 'Failed to access location. Please allow location permission.',
    locationNotFound: 'Could not find your area',
    noGeolocation: 'Geolocation not available in your browser',
    scheduleSlots: [
      { time: '6-8 AM', status: 'green', label: 'No outage', width: 15 },
      { time: '8-12 AM', status: 'yellow', label: 'Possible', width: 50 },
      { time: '12-2 PM', status: 'red', label: 'May shed', width: 85 },
      { time: '2-6 PM', status: 'yellow', label: 'Possible', width: 50 },
      { time: '6-12 PM', status: 'green', label: 'No outage', width: 15 },
    ],
  },
};

// ── API Base ─────────────────────────────────────────────
const API_BASE = '/api';

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  showSkeletons('browser');
  loadAllDistricts();
  buildAccordion();

  // Enter key to search
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  });

  // Debounced search input
  document.getElementById('searchInput').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => handleSearch(), 250);
  });

  // Initialize theme
  initTheme();
});

// ── Toast Notification System ────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

// ── Skeleton Loaders ─────────────────────────────────────
function showSkeletons(target) {
  if (target === 'browser') {
    document.getElementById('skeletonBrowser').classList.remove('hidden');
    document.getElementById('browserCard').classList.add('hidden');
  }
}

function hideSkeletons(target) {
  if (target === 'browser') {
    document.getElementById('skeletonBrowser').classList.add('hidden');
    document.getElementById('browserCard').classList.remove('hidden');
  }
}

// ── Load District Data ───────────────────────────────────
async function loadAllDistricts() {
  if (isLoading.districts) return;
  isLoading.districts = true;

  try {
    const res = await fetch(`${API_BASE}/districts`);
    const data = await res.json();
    allDistrictsCache = data.districts || [];
  } catch (err) {
    console.error('Failed to load districts:', err);
    showToast(currentLang === 'bn' ? 'ডেটা লোড করতে ব্যর্থ' : 'Failed to load data', 'error');
  } finally {
    isLoading.districts = false;
  }
}

// ── Toggle Language ──────────────────────────────────────
// ── Theme Toggle ────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('bidyutgyan-theme');
  if (saved === 'light' || saved === 'dark') {
    currentTheme = saved;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    currentTheme = 'light';
  }
  applyTheme(currentTheme);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('bidyutgyan-theme')) {
      currentTheme = e.matches ? 'light' : 'dark';
      applyTheme(currentTheme);
    }
  });
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('bidyutgyan-theme', currentTheme);
  applyTheme(currentTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  // Update color-scheme meta tag for system UI integration
  const meta = document.getElementById('colorSchemeMeta');
  if (meta) {
    meta.content = theme === 'dark' ? 'dark' : 'light';
  }

  // Update theme icon
  const icon = document.getElementById('themeIcon');
  icon.textContent = theme === 'dark' ? '🌙' : '☀️';

  // Add cross-fade transition class for smooth background animation
  document.body.classList.add('theme-transitioning');
  clearTimeout(window._themeTransitionTimer);
  window._themeTransitionTimer = setTimeout(() => {
    document.body.classList.remove('theme-transitioning');
  }, 400);
}

function toggleLang() {
  currentLang = currentLang === 'bn' ? 'en' : 'bn';
  const btn = document.getElementById('langBtn');
  btn.textContent = STRINGS[currentLang].langLabel;
  updateUILanguage();
}

function updateUILanguage() {
  const s = STRINGS[currentLang];

  document.getElementById('searchInput').placeholder = s.searchPlaceholder;
  document.getElementById('locateText').textContent = s.locateText;
  document.getElementById('searchTitle').textContent = s.searchTitle;
  document.getElementById('browserTitle').textContent = s.browserTitle;
  document.getElementById('scheduleComingSoon').textContent = s.scheduleComingSoon;
  document.getElementById('demoNote').textContent = s.demoNote;
  document.getElementById('reportTitle').textContent = s.reportTitle;
  document.getElementById('utilityLabel').textContent = s.utilityLabel;
  document.getElementById('supplierTypeLabel').textContent = s.supplierTypeLabel;
  document.getElementById('coordinatesLabel').textContent = s.coordinatesLabel;
  document.getElementById('distanceLabel').textContent = s.distanceLabel;
  document.getElementById('scheduleTitle').textContent = s.scheduleTitle;
  document.getElementById('utilityInfoTitle').textContent = s.utilityInfoTitle;

  document.querySelector('.footer p:first-child').textContent = s.poweredBy;
  document.querySelector('.footer-small').textContent = s.footerNote;

  // Re-render schedule timeline with new language
  renderScheduleTimeline();

  // Re-render data if district is selected
  if (selectedDistrict) {
    renderDistrictInfo(selectedDistrict);
  }

  // Update accordion headers text without re-fetching
  updateAccordionLanguage();
}

// ── Geolocation ──────────────────────────────────────────
function getLocation() {
  const s = STRINGS[currentLang];

  if (!navigator.geolocation) {
    showToast(s.noGeolocation, 'error');
    return;
  }

  document.getElementById('locateText').textContent = s.findingLocation;
  document.getElementById('locateBtn').disabled = true;

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(`${API_BASE}/lookup?lat=${latitude}&lon=${longitude}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        selectedDistrict = data;
        renderDistrictInfo(data);
        document.getElementById('searchResults').classList.add('hidden');
      } catch {
        showToast(s.locationNotFound, 'error');
      } finally {
        document.getElementById('locateText').textContent = s.locateText;
        document.getElementById('locateBtn').disabled = false;
      }
    },
    () => {
      showToast(s.locationDenied, 'error');
      document.getElementById('locateText').textContent = s.locateText;
      document.getElementById('locateBtn').disabled = false;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ── Search (un-debounced for direct calls) ────────────────
function handleSearch() {
  const query = document.getElementById('searchInput').value.trim();
  const resultsDiv = document.getElementById('searchResults');

  if (query.length < 2) {
    resultsDiv.classList.add('hidden');
    return;
  }

  fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.results && data.results.length > 0) {
        renderSearchResults(data.results);
        resultsDiv.classList.remove('hidden');
      } else {
        resultsDiv.innerHTML = `
          <div class="search-result-item" style="justify-content:center;color:var(--text-secondary)">
            ${STRINGS[currentLang].searchNoResults}
          </div>`;
        resultsDiv.classList.remove('hidden');
      }
    })
    .catch(() => {
      resultsDiv.classList.add('hidden');
    });
}

function renderSearchResults(results) {
  const div = document.getElementById('searchResults');
  div.innerHTML = results
    .map(
      (r) => `
      <div class="search-result-item" onclick="selectDistrict('${r.district.key}')">
        <span class="result-name">${currentLang === 'bn' ? r.district.name_bn : r.district.name_en}</span>
        <span class="result-meta">${currentLang === 'bn' ? r.division.name_bn : r.division.name_en} · ${r.district.utilities.join(', ')}</span>
      </div>
    `
    )
    .join('');
}

// ── Select District ──────────────────────────────────────
async function selectDistrict(slug) {
  document.getElementById('searchResults').classList.add('hidden');
  document.getElementById('searchInput').value = '';

  try {
    const res = await fetch(`${API_BASE}/district/${slug}`);
    const data = await res.json();
    selectedDistrict = data;
    renderDistrictInfo(data);
  } catch {
    showToast(currentLang === 'bn' ? 'জেলা তথ্য লোড করতে ব্যর্থ' : 'Failed to load district', 'error');
  }
}

// ── Schedule Timeline ────────────────────────────────────
function renderScheduleTimeline() {
  const container = document.getElementById('scheduleTimeline');
  const slots = STRINGS[currentLang].scheduleSlots;

  container.innerHTML = slots
    .map(
      (slot) => `
      <div class="schedule-slot">
        <span class="schedule-time">${slot.time}</span>
        <div class="schedule-bar-wrapper">
          <div class="schedule-bar ${slot.status}" style="width:${slot.width}%"></div>
        </div>
        <span class="schedule-status ${slot.status}">${slot.label}</span>
      </div>
    `
    )
    .join('');
}

// ── Render District Info ─────────────────────────────────
function renderDistrictInfo(data) {
  const s = STRINGS[currentLang];
  const dist = data.district;
  const div = data.division;
  const card = document.getElementById('resultCard');

  card.classList.remove('hidden');
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('resultDistrict').textContent = currentLang === 'bn' ? dist.name_bn : dist.name_en;
  document.getElementById('resultDivision').textContent = currentLang === 'bn' ? div.name_bn : div.name_en;
  document.getElementById('resultUtility').textContent = dist.utilities.join(' + ');
  document.getElementById('resultCoords').textContent = `${dist.lat}°, ${dist.lon}°`;

  // Type mapping
  const typeMap = {
    bn: { urban: 'শহর', regional: 'আঞ্চলিক', rural: 'পল্লী' },
    en: { urban: 'Urban', regional: 'Regional', rural: 'Rural' },
  };

  const firstUtil = dist.utilities[0];
  const utilData = getUtilityType(firstUtil);
  document.getElementById('resultType').textContent = utilData
    ? (typeMap[currentLang]?.[utilData.type] || utilData.type)
    : '—';

  // Distance
  const distanceEl = document.getElementById('resultDistance');
  if (data.distance_km != null) {
    distanceEl.textContent = `${data.distance_km} km`;
  } else {
    distanceEl.textContent = '—';
  }

  // Schedule timeline
  renderScheduleTimeline();

  // Upazilas / Sub-districts
  const upazilaSection = document.getElementById('upazilaSection');
  if (dist.upazilas && dist.upazilas.length > 0) {
    const list = document.getElementById('upazilaList');
    const label = document.getElementById('upazilaLabel');
    label.textContent = currentLang === 'bn'
      ? `🏘️ উপজেলা (${dist.total_upazilas})`
      : `🏘️ Upazilas (${dist.total_upazilas})`;

    list.innerHTML = dist.upazilas
      .map((u) => `
        <div class="upazila-item">
          <span class="upazila-name">${currentLang === 'bn' ? u.name_bn : u.name_en}</span>
          <span class="upazila-utility">${u.utility}</span>
        </div>
      `)
      .join('');
    upazilaSection.classList.remove('hidden');
  } else {
    upazilaSection.classList.add('hidden');
  }

  // Utility info
  const utilInfo = document.getElementById('utilityInfo');
  const utilDetails = document.getElementById('utilityDetails');
  const utilLink = document.getElementById('utilityWebsite');

  const allUtils = dist.utilities;
  utilDetails.innerHTML = allUtils
    .map((u) => {
      const info = getUtilityInfo(u);
      return info
        ? `<p><strong>${info.short_bn || info.name_en}</strong> — ${currentLang === 'bn' ? info.name_bn : info.name_en}</p>`
        : '';
    })
    .join('');

  const firstUtilInfo = getUtilityInfo(firstUtil);
  if (firstUtilInfo && firstUtilInfo.website) {
    utilLink.href = firstUtilInfo.website;
    utilLink.textContent = `🌐 ${firstUtilInfo.website}`;
    utilLink.style.display = 'inline-block';
  } else {
    utilLink.style.display = 'none';
  }

  utilInfo.classList.remove('hidden');

  // Display note if exists
  const noteEl = document.getElementById('resultNote');
  if (dist.note) {
    if (!noteEl) {
      const newNote = document.createElement('p');
      newNote.id = 'resultNote';
      newNote.style.cssText = 'font-size:0.8rem;color:var(--text-secondary);font-style:italic;margin-top:0.5rem;';
      document.querySelector('.info-grid').after(newNote);
    }
    document.getElementById('resultNote').textContent = dist.note;
  } else if (noteEl) {
    noteEl.remove();
  }
}

// ── Utility Metadata ─────────────────────────────────────
function getUtilityInfo(code) {
  const cache = window._utilityCache;
  if (!cache) return null;
  return cache[code] || null;
}

function getUtilityType(code) {
  const info = getUtilityInfo(code);
  return info || null;
}

// ── Reports ──────────────────────────────────────────────
function reportPowerCut() {
  if (!selectedDistrict) {
    showToast(currentLang === 'bn' ? 'প্রথমে একটি জেলা নির্বাচন করুন' : 'Select a district first', 'error');
    return;
  }
  showToast(STRINGS[currentLang].powerCutReported, 'error');
}

function reportPowerOn() {
  if (!selectedDistrict) {
    showToast(currentLang === 'bn' ? 'প্রথমে একটি জেলা নির্বাচন করুন' : 'Select a district first', 'error');
    return;
  }
  showToast(STRINGS[currentLang].powerOnReported, 'success');
}

// ── Accordion ────────────────────────────────────────────
async function buildAccordion() {
  if (isLoading.accordion) return;
  isLoading.accordion = true;

  try {
    const res = await fetch(`${API_BASE}/divisions`);
    const { divisions } = await res.json();

    const res2 = await fetch(`${API_BASE}/districts`);
    const { districts } = await res2.json();

    if (!window._utilityCache) {
      const utilRes = await fetch(`${API_BASE}/utilities`);
      const utilData = await utilRes.json();
      window._utilityCache = utilData.utilities || {};
    }

    // Close first open accordion when opening another
    const container = document.getElementById('divisionAccordion');
    container.innerHTML = '';

    divisions.forEach((div) => {
      const divDistricts = districts.filter((d) => d.division.key === div.key);

      const item = document.createElement('div');
      item.className = 'accordion-item';
      item.innerHTML = `
        <button class="accordion-header" onclick="toggleAccordion(this)">
          <span>${currentLang === 'bn' ? div.name_bn : div.name_en} (${div.district_count})</span>
          <span class="chevron">▼</span>
        </button>
        <div class="accordion-body">
          <div>
            ${divDistricts
              .map(
                (d) => `
              <div class="accordion-district" onclick="selectDistrict('${d.district.key}')">
                <span>${currentLang === 'bn' ? d.district.name_bn : d.district.name_en}</span>
                <span class="district-utility">${d.district.utilities[0]}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
      container.appendChild(item);
    });

    hideSkeletons('browser');
  } catch {
    showToast(currentLang === 'bn' ? 'বিভাগের তথ্য লোড করতে ব্যর্থ' : 'Failed to load divisions', 'error');
  } finally {
    isLoading.accordion = false;
  }
}

// ── Update Accordion Language (from cache, no API calls) ──
function updateAccordionLanguage() {
  const items = document.querySelectorAll('.accordion-item');
  items.forEach((item) => {
    const header = item.querySelector('.accordion-header');
    if (!header) return;

    // Find matching division data from cache
    const headerText = header.querySelector('span:first-child');
    if (!headerText) return;

    // Extract division key from the stored district data
    const divKey = headerText.textContent.match(/^[^(]+/)?.[0]?.trim();
    if (!divKey) return;

    // Update division name using cached data
    const divData = allDistrictsCache
      .map((d) => d.division)
      .find((dv) => currentLang === 'bn' ? dv.name_bn === divKey || dv.name_en === divKey : dv.name_en === divKey || dv.name_bn === divKey);

    if (divData) {
      const count = headerText.textContent.match(/\((\d+)\)/)?.[1] || '';
      headerText.textContent = `${currentLang === 'bn' ? divData.name_bn : divData.name_en} (${count})`;
    }

    // Update district names within the accordion body
    const districts = item.querySelectorAll('.accordion-district');
    districts.forEach((d) => {
      const nameSpan = d.querySelector('span:first-child');
      if (!nameSpan) return;

      const origName = nameSpan.textContent.trim();
      const match = allDistrictsCache.find(
        (dist) =>
          dist.district.name_bn === origName ||
          dist.district.name_en === origName
      );
      if (match) {
        nameSpan.textContent = currentLang === 'bn' ? match.district.name_bn : match.district.name_en;
      }
    });
  });
}

function toggleAccordion(header) {
  // Close all other open accordion items
  document.querySelectorAll('.accordion-header.active').forEach((h) => {
    if (h !== header) {
      h.classList.remove('active');
      h.nextElementSibling.classList.remove('open');
    }
  });

  // Toggle current
  header.classList.toggle('active');
  const body = header.nextElementSibling;
  body.classList.toggle('open');
}
