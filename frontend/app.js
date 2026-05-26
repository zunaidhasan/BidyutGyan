/* ═══════════════════════════════════════════════════════════
   BidyutGyan (বিদ্যুতজ্ঞান) — Frontend Application Logic
   ═══════════════════════════════════════════════════════════ */

// ── State ────────────────────────────────────────────────
let currentLang = 'bn'; // 'bn' | 'en'
let selectedDistrict = null;
let allDistrictsCache = [];

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
    powerCutReported: '✅ রিপোর্ট করা হয়েছে! আপনার রিপোর্ট এলাকার অন্যদের সাহায্য করবে।',
    powerOnReported: '✅ রিপোর্ট করা হয়েছে! ধন্যবাদ, পাওয়ার ফিরেছে।',
    findingLocation: '📡 অবস্থান খোঁজা হচ্ছে...',
    searchNoResults: 'কোনো জেলা পাওয়া যায়নি',
    poweredBy: '⚡ বিদ্যুতজ্ঞান — নির্মিত বাংলাদেশের জন্য',
    footerNote: 'ডেটা নির্ভুলতার জন্য সর্বোচ্চ চেষ্টা করা হয়েছে। সরকারি সূত্র থেকে সর্বশেষ তথ্য যাচাই করুন।',
    typeUrban: 'শহর',
    typeRegional: 'আঞ্চলিক',
    typeRural: 'পল্লী',
    langLabel: 'English',
    searching: 'অনুসন্ধান...',
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
    powerCutReported: '✅ Reported! Your report will help others in your area.',
    powerOnReported: '✅ Reported! Thanks, power is back.',
    findingLocation: '📡 Finding location...',
    searchNoResults: 'No districts found',
    poweredBy: '⚡ BidyutGyan — Built for Bangladesh',
    footerNote: 'Every effort has been made for data accuracy. Please verify latest info from official sources.',
    typeUrban: 'Urban',
    typeRegional: 'Regional',
    typeRural: 'Rural',
    langLabel: 'বাংলা',
    searching: 'Searching...',
  },
};

// ── API Base ─────────────────────────────────────────────
const API_BASE = '/api';

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadAllDistricts();
  buildAccordion();
});

// ── Load District Data ───────────────────────────────────
async function loadAllDistricts() {
  try {
    const res = await fetch(`${API_BASE}/districts`);
    const data = await res.json();
    allDistrictsCache = data.districts || [];
  } catch (err) {
    console.error('Failed to load districts:', err);
  }
}

// ── Toggle Language ──────────────────────────────────────
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

  // Re-render data if district is selected
  if (selectedDistrict) {
    renderDistrictInfo(selectedDistrict);
  }
}

// ── Geolocation ──────────────────────────────────────────
function getLocation() {
  if (!navigator.geolocation) {
    alert(currentLang === 'bn' ? 'আপনার ব্রাউজারে অবস্থান সুবিধা নেই' : 'Geolocation not available');
    return;
  }

  const s = STRINGS[currentLang];
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
      } catch (err) {
        console.error('Location lookup failed:', err);
        alert(currentLang === 'bn' ? 'আপনার এলাকা খুঁজে পাওয়া যায়নি' : 'Could not find your area');
      } finally {
        document.getElementById('locateText').textContent = s.locateText;
        document.getElementById('locateBtn').disabled = false;
      }
    },
    (err) => {
      console.error('Geolocation error:', err);
      alert(currentLang === 'bn' ? 'অবস্থান অ্যাক্সেস করতে ব্যর্থ। দয়া করে অবস্থান অনুমতি দিন।' : 'Failed to access location. Please allow location permission.');
      document.getElementById('locateText').textContent = STRINGS[currentLang].locateText;
      document.getElementById('locateBtn').disabled = false;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ── Search ───────────────────────────────────────────────
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
        resultsDiv.innerHTML = `<div class="search-result-item" style="justify-content:center;color:var(--text-secondary)">${STRINGS[currentLang].searchNoResults}</div>`;
        resultsDiv.classList.remove('hidden');
      }
    })
    .catch((err) => {
      console.error('Search failed:', err);
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
  } catch (err) {
    console.error('Failed to load district:', err);
  }
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

  // Show utility types from first utility
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

  // Show website for first utility
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
  if (!selectedDistrict) return;
  const feedback = document.getElementById('reportFeedback');
  feedback.textContent = STRINGS[currentLang].powerCutReported;
  feedback.className = 'report-feedback status-off';
  feedback.classList.remove('hidden');
  setTimeout(() => feedback.classList.add('hidden'), 3000);
}

function reportPowerOn() {
  if (!selectedDistrict) return;
  const feedback = document.getElementById('reportFeedback');
  feedback.textContent = STRINGS[currentLang].powerOnReported;
  feedback.className = 'report-feedback status-on';
  feedback.classList.remove('hidden');
  setTimeout(() => feedback.classList.add('hidden'), 3000);
}

// ── Accordion ────────────────────────────────────────────
async function buildAccordion() {
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
      `;
      container.appendChild(item);
    });
  } catch (err) {
    console.error('Failed to build accordion:', err);
  }
}

function toggleAccordion(header) {
  header.classList.toggle('active');
  const body = header.nextElementSibling;
  body.classList.toggle('open');
}

// ── Keyboard shortcut: Enter to search ──────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
});
