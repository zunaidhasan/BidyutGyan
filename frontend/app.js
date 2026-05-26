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
    udLabelUtility: '⚡ সরবরাহকারী',
    udLabelType: '🏢 ধরন',
    udLabelPhone: '📞 ফোন',
    udLabelHelpline: '📱 হটলাইন',
    typeUrban: 'শহর',
    typeRegional: 'আঞ্চলিক',
    typeRural: 'পল্লী',
    langLabel: 'English',
    searching: 'অনুসন্ধান...',
    tabDistrict: 'জেলা তথ্য',
    tabMap: 'মানচিত্র',
    tabCompare: 'তুলনা',
    mapTitle: '🗺️ বাংলাদেশের ইউটিলিটি মানচিত্র',
    compareTitle: '📊 ইউটিলিটি কোম্পানির তুলনা',
    compareRows: {
      type: 'ধরন',
      phone: '📞 ফোন',
      helpline: '📱 হটলাইন',
      website: '🌐 ওয়েবসাইট',
      zones: '🏘️ সার্ভিস জোন',
    },
    reportSubmitCut: '🔌 পাওয়ার কাট রিপোর্ট করুন',
    reportSubmitOn: '💡 পাওয়ার ফিরেছে রিপোর্ট করুন',
    reportSubmitted: 'রিপোর্ট জমা হয়েছে!',
    reportFailed: 'রিপোর্ট জমা দিতে ব্যর্থ',
    reportSelectDistrict: 'প্রথমে একটি জেলা নির্বাচন করুন',
    noUpazilaSelected: 'কোনো উপজেলা নির্বাচন করা হয়নি',
    recentReports: 'সাম্প্রতিক রিপোর্ট',
    noReports: 'কোনো রিপোর্ট নেই',
    hoursAgo: '{h} ঘন্টা আগে',
    minsAgo: '{m} মিনিট আগে',
    justNow: 'এইমাত্র',
    upazilaFilterPlaceholder: 'উপজেলা খুঁজুন...',
    upazilaNoResults: 'কোনো উপজেলা পাওয়া যায়নি',
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
    udLabelUtility: '⚡ Supplier',
    udLabelType: '🏢 Type',
    udLabelPhone: '📞 Phone',
    udLabelHelpline: '📱 Helpline',
    typeUrban: 'Urban',
    typeRegional: 'Regional',
    typeRural: 'Rural',
    langLabel: 'বাংলা',
    searching: 'Searching...',
    tabDistrict: '📍 District Info',
    tabMap: '🗺️ Map',
    tabCompare: '📊 Compare',
    mapTitle: '🗺️ Utility Map of Bangladesh',
    compareTitle: '📊 Utility Company Comparison',
    compareRows: {
      type: 'Type',
      phone: '📞 Phone',
      helpline: '📱 Helpline',
      website: '🌐 Website',
      zones: '🏘️ Service Zones',
    },
    reportSubmitCut: '🔌 Report Power Cut',
    reportSubmitOn: '💡 Report Power Back',
    reportSubmitted: 'Report submitted!',
    reportFailed: 'Failed to submit report',
    reportSelectDistrict: 'Select a district first',
    noUpazilaSelected: 'No upazila selected',
    recentReports: 'Recent Reports',
    noReports: 'No reports yet',
    hoursAgo: '{h}h ago',
    minsAgo: '{m}min ago',
    justNow: 'Just now',
    upazilaFilterPlaceholder: 'Filter upazilas...',
    upazilaNoResults: 'No upazilas found',
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

  // Initialize upazila keyboard navigation
  initUpazilaKeyboardNav();

  // Initialize map
  if (typeof L !== 'undefined') {
    initMap();
  }
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

  // Update upazila filter
  const filterInput = document.getElementById('upazilaFilterInput');
  if (filterInput) {
    filterInput.placeholder = s.upazilaFilterPlaceholder;
  }
  document.getElementById('upazilaNoResults').textContent = s.upazilaNoResults;

  // Update tab labels
  document.getElementById('tabLabelDistrict').textContent = s.tabDistrict;
  document.getElementById('tabLabelMap').textContent = s.tabMap;
  document.getElementById('tabLabelCompare').textContent = s.tabCompare;

  // Update map & compare titles
  const mapTitle = document.getElementById('mapTitle');
  if (mapTitle) mapTitle.textContent = s.mapTitle;
  const compareTitle = document.getElementById('compareTitle');
  if (compareTitle) compareTitle.textContent = s.compareTitle;

  // Update upazila detail panel labels
  document.getElementById('udLabelUtility').textContent = s.udLabelUtility;
  document.getElementById('udLabelType').textContent = s.udLabelType;
  document.getElementById('udLabelPhone').textContent = s.udLabelPhone;
  document.getElementById('udLabelHelpline').textContent = s.udLabelHelpline;

  // Re-render comparison table
  renderComparisonTable();

  // Update map markers if visible
  updateMapLanguage();

  // Update accordion headers text without re-fetching
  updateAccordionLanguage();

  // Update upazila detail panel if open
  if (currentUpazilaDetail) {
    showUpazilaDetail(
      currentUpazilaDetail.nameEn,
      currentUpazilaDetail.nameBn,
      currentUpazilaDetail.utilityCode
    );
  }
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
      .map((u, i) => `
        <div class="upazila-item" style="--stagger-index:${i}" onclick="showUpazilaDetail('${u.name_en}', '${u.name_bn}', '${u.utility}')">
          <span class="upazila-name">${currentLang === 'bn' ? u.name_bn : u.name_en}</span>
          <span class="upazila-utility">${u.utility}</span>
        </div>
      `)
      .join('');
    upazilaSection.classList.remove('hidden');
    // Close detail panel and clear filter when a new district is loaded
    closeUpazilaDetail();
    clearUpazilaFilter();
  } else {
    upazilaSection.classList.add('hidden');
    closeUpazilaDetail();
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

// ── Upazila Detail View ───────────────────────────────────
let currentUpazilaDetail = null;

function showUpazilaDetail(nameEn, nameBn, utilityCode) {
  const panel = document.getElementById('upazilaDetailPanel');
  if (!panel) return;

  // If clicking the same upazila, toggle close
  if (currentUpazilaDetail && currentUpazilaDetail.nameEn === nameEn) {
    closeUpazilaDetail();
    return;
  }

  currentUpazilaDetail = { nameEn, nameBn, utilityCode };

  const info = getUtilityInfo(utilityCode);
  const s = STRINGS[currentLang];

  // Upazila name
  document.getElementById('upazilaDetailName').textContent = currentLang === 'bn' ? nameBn : nameEn;

  // Utility name
  const utilNameEl = document.getElementById('upazilaDetailUtility');
  if (info) {
    utilNameEl.textContent = currentLang === 'bn' ? info.name_bn : info.name_en;
  } else {
    utilNameEl.textContent = utilityCode;
  }

  // Utility code badge
  document.getElementById('upazilaDetailCode').textContent = utilityCode;

  // Type
  const typeMap = {
    bn: { urban: '🏙️ শহর', regional: '🏘️ আঞ্চলিক', rural: '🌾 পল্লী' },
    en: { urban: '🏙️ Urban', regional: '🏘️ Regional', rural: '🌾 Rural' },
  };
  document.getElementById('upazilaDetailType').textContent = info
    ? (typeMap[currentLang]?.[info.type] || info.type)
    : '—';

  // Phone
  document.getElementById('upazilaDetailPhone').textContent = info?.phone || '—';

  // Helpline
  document.getElementById('upazilaDetailHelpline').textContent = info?.helpline || '—';

  // Website
  const link = document.getElementById('upazilaDetailWebsite');
  if (info?.website) {
    link.href = info.website;
    link.textContent = `🌐 ${info.website}`;
    link.style.display = 'inline-block';
  } else {
    link.style.display = 'none';
  }

  // Zones
  const zonesEl = document.getElementById('upazilaDetailZones');
  if (info?.zones && info.zones.length > 0) {
    zonesEl.textContent = info.zones.join('; ');
    zonesEl.style.display = 'block';
  } else {
    zonesEl.style.display = 'none';
  }

  // Community reports section
  const reportSection = document.getElementById('upazilaReportSection');
  const reportStatusEl = document.getElementById('upazilaReportStatus');
  const reportHistoryEl = document.getElementById('upazilaReportHistory');

  if (nameEn && selectedDistrict) {
    reportSection.style.display = 'block';

    // Update report buttons with current upazila name
    document.getElementById('upazilaReportCut').setAttribute('onclick', `reportPowerCut('${nameEn.replace(/'/g, "\\'")}')`);
    document.getElementById('upazilaReportOn').setAttribute('onclick', `reportPowerOn('${nameEn.replace(/'/g, "\\'")}')`);
    document.getElementById('upazilaReportCutBtn').textContent = STRINGS[currentLang].reportSubmitCut;
    document.getElementById('upazilaReportOnBtn').textContent = STRINGS[currentLang].reportSubmitOn;

    // Load recent reports
    loadUpazilaReports(nameEn, selectedDistrict.district.key).then((data) => {
      if (data && data.reports && data.reports.length > 0) {
        const latest = data.reports[0];
        const statusIcon = latest.status === 'cut' ? '🔌' : '💡';
        const statusText = latest.status === 'cut'
          ? (currentLang === 'bn' ? 'পাওয়ার কাট' : 'Power Cut')
          : (currentLang === 'bn' ? 'পাওয়ার চালু' : 'Power On');
        reportStatusEl.innerHTML = `<span class="report-indicator ${latest.status === 'cut' ? 'cut' : 'on'}">${statusIcon} ${statusText}</span>`;
      } else {
        reportStatusEl.innerHTML = '';
      }

      renderUpazilaReports('upazilaReportHistory', data?.reports || []);
    });
  } else {
    reportSection.style.display = 'none';
  }

  // Show panel with animation
  panel.classList.remove('hidden');
  panel.classList.remove('closing');
  panel.classList.add('open');
}

function closeUpazilaDetail() {
  const panel = document.getElementById('upazilaDetailPanel');
  if (!panel || panel.classList.contains('hidden')) return;

  panel.classList.add('closing');
  panel.classList.remove('open');

  setTimeout(() => {
    panel.classList.add('hidden');
    panel.classList.remove('closing');
  }, 300);

  currentUpazilaDetail = null;
}

// ── Upazila Filter ─────────────────────────────────────────
let upazilaFocusIndex = -1;

function getVisibleUpazilaItems() {
  return Array.from(document.querySelectorAll('#upazilaList .upazila-item')).filter(
    (item) => item.style.display !== 'none'
  );
}

function focusUpazilaItem(index) {
  // Remove focus from all items
  document.querySelectorAll('#upazilaList .upazila-item').forEach((item) => {
    item.classList.remove('focused');
  });

  const visible = getVisibleUpazilaItems();
  if (visible.length === 0 || index < 0 || index >= visible.length) {
    upazilaFocusIndex = -1;
    return;
  }

  upazilaFocusIndex = index;
  const target = visible[index];
  target.classList.add('focused');
  target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function initUpazilaKeyboardNav() {
  const input = document.getElementById('upazilaFilterInput');
  if (!input) return;

  input.addEventListener('keydown', (e) => {
    const visible = getVisibleUpazilaItems();
    if (visible.length === 0) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = upazilaFocusIndex < visible.length - 1 ? upazilaFocusIndex + 1 : 0;
        focusUpazilaItem(next);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = upazilaFocusIndex > 0 ? upazilaFocusIndex - 1 : visible.length - 1;
        focusUpazilaItem(prev);
        break;
      }
      case 'Enter': {
        if (upazilaFocusIndex >= 0 && upazilaFocusIndex < visible.length) {
          e.preventDefault();
          visible[upazilaFocusIndex].click();
        }
        break;
      }
      case 'Escape': {
        if (currentUpazilaDetail) {
          e.preventDefault();
          closeUpazilaDetail();
        }
        break;
      }
    }
  });

  // Reset focus when input loses focus
  input.addEventListener('blur', () => {
    // Delay so click events on items can fire first
    setTimeout(() => focusUpazilaItem(-1), 150);
  });
}

function filterUpazilas() {
  const input = document.getElementById('upazilaFilterInput');
  const query = input.value.trim().toLowerCase();
  const items = document.querySelectorAll('#upazilaList .upazila-item');
  const noResults = document.getElementById('upazilaNoResults');

  let visibleIndex = 0;
  items.forEach((item) => {
    const name = item.querySelector('.upazila-name');
    if (!name) return;
    const match = name.textContent.toLowerCase().includes(query);
    if (match) {
      item.style.display = '';
      // Re-trigger stagger animation by updating index
      item.style.setProperty('--stagger-index', visibleIndex);
      // Reset animation to re-trigger it
      item.style.animation = 'none';
      item.offsetHeight; // force reflow
      item.style.animation = '';
      visibleIndex++;
    } else {
      item.style.display = 'none';
    }
  });

  // Show/hide no-results message
  if (visibleIndex === 0 && items.length > 0) {
    noResults.classList.remove('hidden');
  } else {
    noResults.classList.add('hidden');
  }

  // Reset keyboard focus when filter changes
  focusUpazilaItem(-1);
}

function clearUpazilaFilter() {
  const input = document.getElementById('upazilaFilterInput');
  if (input) {
    input.value = '';
  }
  document.getElementById('upazilaNoResults').classList.add('hidden');
  // Reset all items to visible with staggered animation
  const items = document.querySelectorAll('#upazilaList .upazila-item');
  items.forEach((item, i) => {
    item.style.display = '';
    item.style.setProperty('--stagger-index', i);
    item.style.animation = 'none';
    item.offsetHeight;
    item.style.animation = '';
  });
  // Reset keyboard focus
  focusUpazilaItem(-1);
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

// ── Tab Switching ──────────────────────────────────────────
function switchTab(tab) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // Show/hide tab content
  document.querySelectorAll('.tab-content').forEach((content) => {
    content.classList.toggle('hidden', !content.id.includes(`TabContent${tab.charAt(0).toUpperCase() + tab.slice(1)}`));
  });

  // Refresh map size when map tab is shown (Leaflet needs re-render)
  if (tab === 'map' && window._mapInstance) {
    setTimeout(() => window._mapInstance.invalidateSize(), 200);
  }
}

// ── Map View (Leaflet) ─────────────────────────────────────
function initMap() {
  const container = document.getElementById('mapContainer');
  if (!container) return;

  const map = L.map('mapContainer', {
    center: [23.8, 90.4],
    zoom: 7,
    zoomControl: true,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  window._mapInstance = map;

  // Utility color mapping
  const utilColors = {
    'DESCO': '#4a7cf7',
    'DPDC': '#34d399',
    'NESCO': '#f59e0b',
    'WZPDCL': '#ef4444',
    'BPDB': '#8b5cf6',
    'BREB': '#06b6d4',
  };

  // Markers for each district
  if (allDistrictsCache.length > 0) {
    addDistrictMarkers(map, utilColors);
  } else {
    // Wait for districts to load
    const checkDistricts = setInterval(() => {
      if (allDistrictsCache.length > 0) {
        clearInterval(checkDistricts);
        addDistrictMarkers(map, utilColors);
      }
    }, 200);
  }
}

function addDistrictMarkers(map, colors) {
  const bounds = L.latLngBounds();
  window._mapMarkers = [];

  allDistrictsCache.forEach((item) => {
    const d = item.district;
    const util = d.utilities[0] || 'BPDB';
    const color = colors[util] || '#8b5cf6';
    const name = currentLang === 'bn' ? d.name_bn : d.name_en;

    const marker = L.circleMarker([d.lat, d.lon], {
      radius: 8,
      fillColor: color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    }).addTo(map);

    marker.bindTooltip(name, {
      direction: 'top',
      offset: [0, -5],
      className: 'map-tooltip',
    });

    marker.on('click', () => {
      selectDistrict(d.key);
      switchTab('district');
    });

    bounds.extend([d.lat, d.lon]);

    // Store reference for language updates
    window._mapMarkers.push({ marker, district: d });
  });

  map.fitBounds(bounds.pad(0.1));
}

function updateMapLanguage() {
  // Update tooltip texts on all map markers
  if (!window._mapMarkers || window._mapMarkers.length === 0) return;
  window._mapMarkers.forEach(({ marker, district }) => {
    const name = currentLang === 'bn' ? district.name_bn : district.name_en;
    marker.setTooltipContent(name);
  });
}

// ── Utility Comparison Table ────────────────────────────────
function renderComparisonTable() {
  const cache = window._utilityCache;
  if (!cache) {
    // Try again after utilities are loaded
    setTimeout(renderComparisonTable, 500);
    return;
  }

  const body = document.getElementById('compareBody');
  if (!body) return;

  const s = STRINGS[currentLang];
  const utilKeys = Object.keys(cache);

  // Define rows: key -> label
  const rows = [
    { key: 'type', label: s.compareRows.type },
    { key: 'phone', label: s.compareRows.phone },
    { key: 'helpline', label: s.compareRows.helpline },
    { key: 'website', label: s.compareRows.website },
    { key: 'zones', label: s.compareRows.zones },
  ];

  const typeMap = {
    bn: { urban: '🏙️ শহর', regional: '🏘️ আঞ্চলিক', rural: '🌾 পল্লী' },
    en: { urban: '🏙️ Urban', regional: '🏘️ Regional', rural: '🌾 Rural' },
  };

  body.innerHTML = rows
    .map((row) => {
      const cells = utilKeys
        .map((key) => {
          const info = cache[key];
          if (!info) return '<td>—</td>';

          let val;
          if (row.key === 'type') {
            val = typeMap[currentLang]?.[info.type] || info.type || '—';
          } else if (row.key === 'website') {
            const url = info.website || '';
            val = url
              ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="compare-link">🌐 ${new URL(url).hostname}</a>`
              : '—';
          } else if (row.key === 'zones') {
            val = Array.isArray(info.zones)
              ? info.zones.join('<br>')
              : (info.zones || '—');
          } else {
            val = info[row.key] || '—';
          }

          return `<td>${val}</td>`;
        })
        .join('');

      return `<tr><td class="compare-row-label">${row.label}</td>${cells}</tr>`;
    })
    .join('');

  // Add subheader row for company names
  const headerRow = body.closest('table').querySelector('thead tr');
  if (headerRow) {
    headerRow.innerHTML = `<th>${currentLang === 'bn' ? 'মাপ' : 'Measure'}</th>` +
      utilKeys.map((key) => {
        const info = cache[key];
        const color = getUtilityColor(key);
        const shortName = currentLang === 'bn' ? (info?.short_bn || key) : key;
        return `<th style="border-top: 3px solid ${color}">${shortName}</th>`;
      }).join('');
  }
}

function getUtilityColor(code) {
  const colors = {
    'DESCO': '#4a7cf7',
    'DPDC': '#34d399',
    'NESCO': '#f59e0b',
    'WZPDCL': '#ef4444',
    'BPDB': '#8b5cf6',
    'BREB': '#06b6d4',
    'REB': '#06b6d4',
  };
  return colors[code] || '#888';
}

// ── Community Power Reports ─────────────────────────────────
function reportPowerCut(upazilaName) {
  if (!selectedDistrict) {
    showToast(STRINGS[currentLang].reportSelectDistrict, 'error');
    return;
  }
  const name = upazilaName || '';
  submitReport(name, 'cut');
}

function reportPowerOn(upazilaName) {
  if (!selectedDistrict) {
    showToast(STRINGS[currentLang].reportSelectDistrict, 'error');
    return;
  }
  const name = upazilaName || '';
  submitReport(name, 'on');
}

async function submitReport(upazilaName, status) {
  const dist = selectedDistrict.district;
  const key = dist.key;

  try {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upazila: upazilaName,
        district: key,
        status: status,
      }),
    });

    if (!res.ok) throw new Error('Failed');

    showToast(STRINGS[currentLang].reportSubmitted, 'success');

    // Refresh upazila detail to show updated report status
    if (currentUpazilaDetail) {
      showUpazilaDetail(
        currentUpazilaDetail.nameEn,
        currentUpazilaDetail.nameBn,
        currentUpazilaDetail.utilityCode
      );
    }
  } catch {
    showToast(STRINGS[currentLang].reportFailed, 'error');
  }
}

async function loadUpazilaReports(upazilaName, districtKey) {
  try {
    const res = await fetch(`${API_BASE}/reports/${districtKey}/${encodeURIComponent(upazilaName)}`);
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

function renderUpazilaReports(containerId, reports) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!reports || reports.length === 0) {
    container.innerHTML = `<p class="no-reports">${STRINGS[currentLang].noReports}</p>`;
    return;
  }

  const now = Math.floor(Date.now() / 1000);

  container.innerHTML = reports
    .map((r) => {
      const diff = now - r.timestamp;
      let timeAgo;
      if (diff < 60) {
        timeAgo = STRINGS[currentLang].justNow;
      } else if (diff < 3600) {
        timeAgo = STRINGS[currentLang].minsAgo.replace('{m}', Math.floor(diff / 60));
      } else {
        timeAgo = STRINGS[currentLang].hoursAgo.replace('{h}', Math.floor(diff / 3600));
      }

      const icon = r.status === 'cut' ? '🔌' : '💡';
      const cls = r.status === 'cut' ? 'report-cut' : 'report-on';

      return `<div class="report-entry ${cls}">
        <span>${icon}</span>
        <span class="report-time">${timeAgo}</span>
        ${r.note ? `<span class="report-note">${r.note}</span>` : ''}
      </div>`;
    })
    .join('');
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

    // Render comparison table now that utilities are loaded
    renderComparisonTable();

    // Add district markers to map if map is initialized
    if (window._mapInstance && window._mapInstance._initHooksCalled) {
      const colors = {
        'DESCO': '#4a7cf7', 'DPDC': '#34d399', 'NESCO': '#f59e0b',
        'WZPDCL': '#ef4444', 'BPDB': '#8b5cf6', 'BREB': '#06b6d4',
      };
      addDistrictMarkers(window._mapInstance, colors);
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
