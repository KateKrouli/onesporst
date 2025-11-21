const footballContainer = document.getElementById('footballLeagues');
const cricketContainer = document.getElementById('cricketLeagues');
const basketballContainer = document.getElementById('basketballLeagues');
const volleyballContainer = document.getElementById('volleyballLeagues');

// Храним текущие даты для каждого вида спорта
const currentDates = {
  football: new Date(),
  cricket: new Date()
};

// Константы для кеширования
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
const CACHE_KEYS = {
  FOOTBALL: 'football_matches',
  CRICKET: 'cricket_matches', 
  BASKETBALL: 'basketball_matches',
  VOLLEYBALL: 'volleyball_matches',
  STANDINGS: 'football_standings'
};

// Выносим formatDate наружу, чтобы она была доступна везде
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Функция для получения фиксированных дат
function getFixedDates() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dayBeforeYesterday = new Date(today);
  dayBeforeYesterday.setDate(today.getDate() - 2);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  return {
    today: formatDate(today),
    yesterday: formatDate(yesterday),
    dayBeforeYesterday: formatDate(dayBeforeYesterday),
    tomorrow: formatDate(tomorrow)
  };
}

// Функции для работы с кешем
function getCachedData(key) {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Проверяем, не устарели ли данные
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

function setCachedData(key, data) {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

// Универсальная функция для запросов с кешированием
async function fetchWithCache(url, cacheKey) {
  // Пытаемся получить данные из кеша
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    // console.log(`Using cached data for ${cacheKey}`);
    return cachedData;
  }
  
  // Если данных в кеше нет или они устарели, делаем запрос
  // console.log(`Fetching fresh data for ${cacheKey}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Сохраняем в кеш
    setCachedData(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${cacheKey}:`, error);
    throw error;
  }
}

async function loadMatches() {
  const fixedDates = getFixedDates();
  await Promise.all([
    loadFootballMatches(currentDates.football),
    loadCricketMatches(currentDates.cricket), 
    loadBasketballMatches(currentDates.football),
    loadVolleyballMatches(currentDates.football)
  ]);
}

// --- Футбол ---
const allowedFootballKeywords = [
  'Premier League', 'Saudi Pro League', 'English Premier League', 'sudan', 'UEFA Champions League', 'oman',
];

document.addEventListener('DOMContentLoaded', () => {
  // Инициализация всех видов спорта
  loadMatches();

  // Обработчики для футбола
  const footballPicker = document.getElementById('footballDatePicker');
  if (footballPicker) {
    const prevBtn = footballPicker.querySelector('.prevDay');
    const todayBtn = footballPicker.querySelector('.todayButton');
    const nextBtn = footballPicker.querySelector('.nextDay');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        footballPicker.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        prevBtn.classList.add('active');
        
        const fixedDates = getFixedDates();
        currentDates.football = fixedDates.yesterday;
        loadFootballMatches(fixedDates.yesterday);
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        footballPicker.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        todayBtn.classList.add('active');
        
        const fixedDates = getFixedDates();
        currentDates.football = fixedDates.today;
        loadFootballMatches(fixedDates.today);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        footballPicker.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        nextBtn.classList.add('active');
        
        const fixedDates = getFixedDates();
        currentDates.football = fixedDates.tomorrow;
        loadFootballMatches(fixedDates.tomorrow);
      });
    }
  }

  // Обработчики для крикета
  const cricketPicker = document.getElementById('cricketDatePicker');
  if (cricketPicker) {
    const prevPrevBtn = cricketPicker.querySelector('.prevPrevDay');
    const prevBtn = cricketPicker.querySelector('.prevDay');
    const todayBtn = cricketPicker.querySelector('.todayButton');

    if (prevPrevBtn) {
      prevPrevBtn.addEventListener('click', () => {
        cricketPicker.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        prevPrevBtn.classList.add('active');
        
        const fixedDates = getFixedDates();
        currentDates.cricket = fixedDates.dayBeforeYesterday;
        loadCricketMatches(fixedDates.dayBeforeYesterday);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        cricketPicker.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        prevBtn.classList.add('active');
        
        const fixedDates = getFixedDates();
        currentDates.cricket = fixedDates.yesterday;
        loadCricketMatches(fixedDates.yesterday);
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        cricketPicker.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        todayBtn.classList.add('active');
        
        const fixedDates = getFixedDates();
        currentDates.cricket = fixedDates.today;
        loadCricketMatches(fixedDates.today);
      });
    }
  }
});

// --- Футбол --- 
async function loadFootballMatches(dateStr) {
  // Если передана дата как строка, используем её, если объект Date - форматируем
  const dateToLoad = typeof dateStr === 'string' ? dateStr : formatDate(dateStr);
  
  footballContainer.innerHTML = "<p>...</p>";
  try {
    const data = await fetchWithCache(`/matches/football?date=${dateToLoad}`, `${CACHE_KEYS.FOOTBALL}_${dateToLoad}`);
    
    if (!data.response || data.response.length === 0) {
      footballContainer.innerHTML = `<p>No matches ${dateToLoad}</p>`;
      return;
    }
    renderFootball(data.response);
  } catch (e) {
    footballContainer.innerHTML = "<p>Error</p>";
    console.error(e);
  }
}

// ... остальные функции (isAllowedFootball, renderFootball, loadCricketMatches и т.д.) остаются без изменений

function isAllowedFootball(event) {
  const leagueName = (event.league?.name || '');
  const leagueCountry = (event.league?.country || '');
  const leagueSlug = (event.league?.slug || '');
  const home = (event.teams?.home?.name || '');
  const away = (event.teams?.away?.name || '');

  const hay = [leagueName, leagueCountry, leagueSlug, home, away].join(' ').toLowerCase();
  const ok = allowedFootballKeywords.some(k => hay.includes(k));
  // console.log(`[DEBUG] filterFootball -> league="${leagueName}" teams="${home} vs ${away}" matched=${ok}`);
  return ok;
}

function renderFootball(matches) {
  footballContainer.innerHTML = "";

  let filtered = matches.filter(isAllowedFootball);

  if (!filtered.length) {
    console.log('[DEBUG] No matches found, adding top 3 leagues');
    const firstThreeMatches = matches.slice(0, 3);
    filtered = [...firstThreeMatches];
  }

  const leaguesMap = {};
  filtered.forEach(event => {
    const leagueId = event.league.id;
    if (!leaguesMap[leagueId]) leaguesMap[leagueId] = { league: event.league, events: [] };
    leaguesMap[leagueId].events.push(event);
  });

  const filteredLeagues = Object.keys(leaguesMap).length;

  if (filteredLeagues < 3) {
    const additionalMatches = matches.filter(event => {
      const leagueId = event.league.id;
      return !leaguesMap[leagueId];
    }).slice(0, 3 - filteredLeagues);
    filtered = [...filtered, ...additionalMatches];
  }

  filtered.forEach(event => {
    const leagueId = event.league.id;
    if (!leaguesMap[leagueId]) leaguesMap[leagueId] = { league: event.league, events: [] };
    leaguesMap[leagueId].events.push(event);
  });

  for (const leagueId in leaguesMap) {
    const { league, events } = leaguesMap[leagueId];
    const leagueEl = document.createElement('div');
    leagueEl.className = 'league';
    leagueEl.innerHTML = `<div class="league__header"><div class="league__logo"><img src="${league.logo}" alt="${league.name}"></div><h2>${league.name}</h2></div>`;
    events.forEach(event => {
      const status = event.fixture.status;
      const isLive = ['1H','2H','ET','P','LIVE','HT'].includes(status.short);
      let displayTime;
      if (isLive && status.elapsed !== null) displayTime = `<span class="live">LIVE ${status.elapsed}'</span><strong>${event.goals.home ?? 0} - ${event.goals.away ?? 0}</strong><span class="watch">Watch</span>`; 
      else if (['FT','AET','P'].includes(status.short)) displayTime = `<strong>${event.goals.home ?? 0} - ${event.goals.away ?? 0}</strong><span class="hightlights">Hightlights</span>`;
      else {
          const matchDate = new Date(event.fixture.date);
         displayTime = `<strong>${matchDate.toLocaleString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          hour: '2-digit', 
          minute: '2-digit'
        }).replace(',', '')}</strong><span class="watch">Watch</span>`;
      }

      const matchEl = document.createElement('a');
      matchEl.className = 'match';
      matchEl.href = '#';
      if (isLive) matchEl.classList.add('live');
      matchEl.innerHTML = `<div class="team"><div class="team__logo"><img src="${event.teams.home.logo}" alt="${event.teams.home.name}"></div><span>${event.teams.home.name}</span></div><div class="time">${displayTime}</div><div class="team team--2"><span>${event.teams.away.name}</span><div class="team__logo"><img src="${event.teams.away.logo}" alt="${event.teams.away.name}"></div></div>`;
      leagueEl.appendChild(matchEl);
    });
    footballContainer.appendChild(leagueEl);
  }
}

// --- Крикет ---
async function loadCricketMatches(dateStr) {
  // Если передана дата как строка, используем её, если объект Date - форматируем
  const dateToLoad = typeof dateStr === 'string' ? dateStr : formatDate(dateStr);
  
  console.log("=== loadCricketMatches START ===");
  console.log("Received date parameter:", dateStr);
  console.log("Date to load:", dateToLoad);
  
  cricketContainer.innerHTML = "<p>Загрузка...</p>";
  try {
    const data = await fetchWithCache(`/matches/cricket?date=${dateToLoad}`, `${CACHE_KEYS.CRICKET}_${dateToLoad}`);
    console.log("Cricket API response:", data);
    
    if (!data.data || data.data.length === 0) {
      console.log("No matches found or empty array");
      cricketContainer.innerHTML = "<p>No matches</p>";
      return;
    }
    
    console.log(`Found ${data.data.length} matches, proceeding to render`);
    renderCricket(data.data, dateToLoad);
  } catch (e) {
    console.error("Error loading matches:", e);
    cricketContainer.innerHTML = "<p>Error</p>";
  }
  console.log("=== loadCricketMatches END ===");
}

function sortAndGroupMatches(matches) {
  // console.log("sortAndGroupMatches called with:", matches);
  
  // Преобразуем дату в формате ISO в строку вида "YYYY-MM-DD"
  matches.forEach(match => {
    const dateString = match.date || match.dateTimeGMT;
    if (!dateString) {
      console.warn("Missing date for match:", match);
      match.dateOnly = "unknown";
      return;
    }
    const matchDate = new Date(dateString);
    if (isNaN(matchDate.getTime())) {
      console.warn("Invalid date:", dateString, "for match:", match);
      match.dateOnly = "invalid";
      return;
    }
    // Преобразуем в строку "YYYY-MM-DD"
    match.dateOnly = matchDate.toISOString().split('T')[0];
    // console.log(`Match date: ${dateString} -> ${match.dateOnly}`);
  });

  const validMatches = matches.filter(match => 
    match.dateOnly && match.dateOnly !== "unknown" && match.dateOnly !== "invalid"
  );
  
  // console.log("Valid matches:", validMatches.length, "out of", matches.length);

  validMatches.sort((a, b) => a.dateOnly.localeCompare(b.dateOnly));

  const groupedMatches = validMatches.reduce((acc, match) => {
    if (!acc[match.dateOnly]) {
      acc[match.dateOnly] = [];
    }
    acc[match.dateOnly].push(match);
    return acc;
  }, {});

  console.log("Grouped matches result:", groupedMatches);
  return groupedMatches;
}

function renderCricket(matches, selectedDate) {
  // console.log("renderCricket called with matches:", matches);
  // console.log(`Selected date: "${selectedDate}"`);
  cricketContainer.innerHTML = "";
  
  try {
    const groupedMatches = sortAndGroupMatches(matches);
    // console.log("Available dates:", Object.keys(groupedMatches));
    // console.log("Looking for date:", selectedDate);

    if (groupedMatches[selectedDate] && groupedMatches[selectedDate].length > 0) {
      // console.log(`✓ Found ${groupedMatches[selectedDate].length} matches for ${selectedDate}`);
      
      groupedMatches[selectedDate].forEach(match => {
        const matchEl = document.createElement('a');
        matchEl.className = 'match match--cricket';
        matchEl.href = '#';
        
        // Форматируем дату в формат "14 Nov 15:00"
        let displayDate = 'Дата не указана';
        if (match.date) {
          const matchDate = new Date(match.date);
          displayDate = matchDate.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).replace(',', '');
        }
        
        matchEl.innerHTML = `
          <div class="match__cricket">
            <div class="team">
              <div class="team__logo"><img src="${match.teamInfo[0]?.img}" alt="${match.teamInfo[0]?.name}"></div>
              <span>${match.teamInfo[0]?.shortname || match.teamInfo[0]?.name}</span>
            </div>
            <div class="time"><strong>${displayDate}</strong><span class="watch">Watch</span></div>
            <div class="team team--2">
              <span>${match.teamInfo[1]?.shortname || match.teamInfo[1]?.name}</span>
              <div class="team__logo"><img src="${match.teamInfo[1]?.img}" alt="${match.teamInfo[1]?.name}"></div>
            </div>
          </div>
          <div class="match-status">${match.status}</div>
        `;
        
        cricketContainer.appendChild(matchEl);
      });
    } else {
      console.log(`✗ No matches found for selected date: "${selectedDate}"`);
      console.log("Available dates are:", Object.keys(groupedMatches));
      cricketContainer.innerHTML = `<p>No matches.</p>`;
    }
  } catch (error) {
    console.error("Error in renderCricket:", error);
    cricketContainer.innerHTML = "<p>Error</p>";
  }
}

// --- Баскетбол ---
async function loadBasketballMatches(dateStr) {
  // Если передана дата как строка, используем её, если объект Date - форматируем
  const dateToLoad = typeof dateStr === 'string' ? dateStr : formatDate(dateStr);
  
  basketballContainer.innerHTML = "<p>Загрузка...</p>";
  try {
    const data = await fetchWithCache(`/matches/basketball?date=${dateToLoad}`, `${CACHE_KEYS.BASKETBALL}_${dateToLoad}`);
    console.log("Basketball API response:", data);

    const leagues = Array.isArray(data.data) ? data.data.slice(0, 3) : [];
    if (leagues.length === 0) {
      basketballContainer.innerHTML = "<p>Нет матчей</p>";
      return;
    }

    basketballContainer.innerHTML = "";

    leagues.forEach(leagueBlock => {
      const league = leagueBlock.league;
      const matches = leagueBlock.matches;

      if (!matches || matches.length === 0) return;

      const leagueEl = document.createElement('div');
      leagueEl.className = 'league';
      leagueEl.innerHTML = `
        <div class="league__header">
          <div class="league__logo"><img src="${league.logo}" alt="${league.name}"></div>
          <h2>${league.name}</h2>
        </div>
      `;

      matches.forEach(match => {
        const matchEl = document.createElement('a');
        matchEl.className = 'match';
        matchEl.href = '#';
        matchEl.innerHTML = `
          <div class="team">
            <div class="team__logo"><img src="${match.teamInfo[0]?.img}" alt="${match.teamInfo[0]?.name}"></div>
            <span>${match.teamInfo[0]?.name}</span>
          </div>
          <div class="time">${match.status}<span class="watch">Watch</span></div>
          <div class="team team--2">
            <span>${match.teamInfo[1]?.name}</span>
            <div class="team__logo"><img src="${match.teamInfo[1]?.img}" alt="${match.teamInfo[1]?.name}"></div>
          </div>
        `;
        leagueEl.appendChild(matchEl);
      });

      basketballContainer.appendChild(leagueEl);
    });

  } catch (e) {
    console.error("Basketball fetch error:", e);
    basketballContainer.innerHTML = "<p>Ошибка загрузки</p>";
  }
}
// --- Волейбол ---
async function loadVolleyballMatches(dateStr) {
  // Если передана дата как строка, используем её, если объект Date - форматируем
  const dateToLoad = typeof dateStr === 'string' ? dateStr : formatDate(dateStr);
  
  volleyballContainer.innerHTML = "<p>Загрузка...</p>";
  try {
    const data = await fetchWithCache(`/matches/volleyball?date=${dateToLoad}`, `${CACHE_KEYS.VOLLEYBALL}_${dateToLoad}`);
    // console.log("Volleyball API response:", data);

    const leagues = Array.isArray(data.data) ? data.data.slice(0, 3) : [];
    if (leagues.length === 0) {
      volleyballContainer.innerHTML = "<p>Нет матчей</p>";
      return;
    }

    volleyballContainer.innerHTML = "";

    leagues.forEach(leagueBlock => {
      const league = leagueBlock.league;
      const matches = leagueBlock.matches;
      if (!matches || matches.length === 0) return;

      const leagueEl = document.createElement('div');
      leagueEl.className = 'league';
      leagueEl.innerHTML = `
        <div class="league__header">
          <div class="league__logo"><img src="${league.logo}" alt="${league.name}"></div>
          <h2>${league.name}</h2>
        </div>
      `;

      matches.forEach(match => {
        const matchEl = document.createElement('a');
        matchEl.className = 'match';
        matchEl.href = '#';
        matchEl.innerHTML = `
          <div class="team">
            <div class="team__logo"><img src="${match.teamInfo[0]?.img}" alt="${match.teamInfo[0]?.name}"></div>
            <span>${match.teamInfo[0]?.name}</span>
          </div>
          <div class="time">${match.status}<span class="watch">Watch</span></div>
          <div class="team team--2">
           <span>${match.teamInfo[1]?.name}</span>
            <div class="team__logo"><img src="${match.teamInfo[1]?.img}" alt="${match.teamInfo[1]?.name}"></div>
          </div>
        `;
        leagueEl.appendChild(matchEl);
      });

      volleyballContainer.appendChild(leagueEl);
    });

  } catch (e) {
    console.error("Volleyball fetch error:", e);
    volleyballContainer.innerHTML = "<p>Ошибка загрузки</p>";
  }
}

loadMatches(); // Инициализация

// сразу загружаем турнирную таблицу в div#leagueTable
loadStandings(39, 2023);

// Функция загрузки и отображения таблицы
async function loadStandings(league = 39, season = 2023, containerId = 'leagueTable') {
   const container = document.getElementById(containerId);
   if (!container) return;
   container.innerHTML = '<p>Загрузка таблицы...</p>';

   try {
     const data = await fetchWithCache(
       `/standings/football?league=${encodeURIComponent(league)}&season=${encodeURIComponent(season)}`,
       `${CACHE_KEYS.STANDINGS}_${league}_${season}`
     );
     
    console.log('Standings response:', data);

     if (!data.standings || data.standings.length === 0) {
       container.innerHTML = '<p>Таблица пустая</p>';
       return;
     }

     // Создаём таблицу
     const table = document.createElement('div');
     table.className = 'tab__content';

     const thead = document.createElement('div');
     thead.className = 'tab__head';
     thead.innerHTML = `
         <div class="tab__club">
            <div>#</div>
            <div>Club</div>
         </div>
          <div class="tab__digits">
            <div>W</div>
            <div>D</div>
            <div>L</div>
            <div>Poin</div>
         </div>
         <div>Last Match</div>
     `;
     table.appendChild(thead);

     const tbody = document.createElement('div');
     tbody.className = 'tab__body';

     // Создаём контейнер для логотипов в отдельном месте
     const logosContainer = document.getElementById('teamsLogos');
     if (logosContainer) {

       // Заполняем логотипы
       data.standings.forEach(row => {
         if (row.logo && row.team) {
           const logoElement = document.createElement('div');
           logoElement.className = 'teams__item';
           logoElement.innerHTML = `
             <img src="${row.logo}" 
                  alt="${row.team}" 
                  title="${row.team}"> 
           `;
           logosContainer.appendChild(logoElement);
         }
       });
     }

     data.standings.forEach(row => {
       // Попытка достать подробную статистику (api возвращает в поле all)
       const all = row.all || row.stats || {};
       const played = all.played ?? row.played ?? '';
       const win = all.win ?? row.win ?? '';
       const draw = all.draw ?? row.draw ?? '';
       const lose = all.lose ?? row.lose ?? '';
       const goalsFor = (all.goals && (all.goals.for ?? all.goals['for'])) ?? (row.goals?.for ?? row.goalsFor) ?? '';
       const goalsAgainst = (all.goals && (all.goals.against ?? all.goals['against'])) ?? (row.goals?.against ?? row.goalsAgainst) ?? '';
       const gfNum = Number(goalsFor) || 0;
       const gaNum = Number(goalsAgainst) || 0;
       const gd = (Number.isFinite(gfNum) && Number.isFinite(gaNum)) ? (gfNum - gaNum) : '';
       const points = row.points ?? row.pts ?? '';
       const form = row.form ?? '';

       // Преобразуем форму в цветные span'ы
       let formHTML = '';
       if (form) {
         formHTML = form.split('').map(char => {
           let className = '';
           switch(char) {
             case 'W':
               className = 'win';
               break;
             case 'D':
               className = 'draw';
               break;
             case 'L': 
               className = 'lose';
               break;
             default:
               className = '';
           }
           return `<span class="form-badge ${className}">${char}</span>`;
         }).join('');
       }

       const tr = document.createElement('div');
       tr.className = "tab__row";
       tr.innerHTML = `
         <div class="tab__club">
         <div>${row.rank ?? ''}</div>
         <div class="tab__team">
           ${row.logo ? `<img src="${row.logo}" alt="${row.team}" style="width:32px;height:32px;object-fit:contain">` : ''}
             <div class="tab__team-name">${row.team ?? ''}</div>
         </div> 
         </div>
         <div class="tab__digits">
            <div>${win}</div>
            <div>${draw}</div>
            <div>${lose}</div>
            <div>${points}</div>
         </div>
         <div class="tab__form">${formHTML}</div>
       `;
       tbody.appendChild(tr);
     });

     table.appendChild(tbody);

     container.innerHTML = '';
     const header = document.createElement('div');
     header.className = 'tab__header';
     
     if (data.league?.name && data.league?.logo) {
       header.innerHTML = `
         <img src="${data.league.logo}" alt="${data.league.name}" style="width:32px;height:32px;object-fit:contain">
         <div class="tab__league">${data.league.name} — ${data.season}</div>
         <a href="" class="tab__link">View All</a>
       `;
     } else {
       header.textContent = `Таблица — ${data.season}`;
     }
     
     container.appendChild(header);
     container.appendChild(table);

   } catch (err) {
     console.error('Error loading standings:', err);
     container.innerHTML = '<p>Ошибка при получении таблицы</p>';
   }
}

// Функция для принудительного обновления кеша (можно вызвать из консоли)
function clearCache() {
  Object.values(CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('Cache cleared');
  location.reload();
}

// Добавляем глобальную функцию для очистки кеша
window.clearCache = clearCache;


// // Функция для тестирования доступных endpoints
// async function testEndpoints() {
//   // Сначала проверим текущие запросы которые работают
//   console.log('=== Проверка работающих endpoints ===');
  
//   const workingEndpoints = [
//     '/matches/football?date=2024-01-15',
//     '/matches/cricket?date=2024-01-15',
//     '/matches/basketball?date=2024-01-15', 
//     '/matches/volleyball?date=2024-01-15',
//     '/standings/football?league=39&season=2025'
//   ];
  
//   for (const endpoint of workingEndpoints) {
//     try {
//       const response = await fetch(endpoint);
//       console.log(`${endpoint}: ${response.status} ${response.statusText}`);
      
//       if (response.ok) {
//         const data = await response.json();
//         console.log(`  ✅ Успех! Структура ответа:`, Object.keys(data));
        
//         // Для matches выведем количество матчей
//         if (endpoint.includes('/matches/')) {
//           const sport = endpoint.split('/')[2];
//           if (data.response) {
//             console.log(`  📊 Матчей ${sport}: ${data.response.length}`);
//           } else if (data.data) {
//             console.log(`  📊 Матчей ${sport}: ${data.data.length}`);
//           }
//         }
        
//         // Для standings выведем информацию о лиге
//         if (endpoint.includes('/standings/')) {
//           console.log(`  🏆 Лига: ${data.league?.name || 'Не указана'}`);
//           console.log(`  👥 Команд: ${data.standings?.length || 0}`);
//         }
//       } else {
//         console.log(`  ❌ Ошибка: ${response.status}`);
//       }
//     } catch (error) {
//       console.log(`${endpoint}: ❌ Ошибка -`, error.message);
//     }
//     console.log('---');
//   }
// }

// window.testEndpoints = testEndpoints;

// // Функция для анализа структуры данных standings
// async function analyzeStandingsData() {
//   try {
//     console.log('=== Анализ структуры данных standings ===');
    
//     const response = await fetch('/standings/football?league=39&season=2025');
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     const data = await response.json();
//     console.log('Полная структура данных:');
//     console.dir(data, { depth: 3 });
    
//     // Проанализируем структуру
//     if (data.league) {
//       console.log('\n=== Информация о лиге ===');
//       console.log('ID:', data.league.id);
//       console.log('Название:', data.league.name);
//       console.log('Страна:', data.league.country);
//       console.log('Лого:', data.league.logo);
//       console.log('Сезон:', data.season);
//     }
    
//     if (data.standings && data.standings.length > 0) {
//       console.log('\n=== Информация о командах ===');
//       const firstTeam = data.standings[0];
//       console.log('Структура данных команды:');
//       console.dir(firstTeam, { depth: 3 });
      
//       console.log('\nДоступные поля:');
//       console.log('- rank:', firstTeam.rank);
//       console.log('- team:', firstTeam.team);
//       console.log('- points:', firstTeam.points);
//       console.log('- goalsFor:', firstTeam.goals?.for);
//       console.log('- goalsAgainst:', firstTeam.goals?.against);
//       console.log('- form:', firstTeam.form);
//       console.log('- all:', firstTeam.all);
//     }
    
//     return data;
    
//   } catch (error) {
//     console.error('Ошибка при анализе данных:', error);
//     return null;
//   }
// }

// window.analyzeStandingsData = analyzeStandingsData;

// // Функция для поиска ID лиг через анализ standings
// async function findLeagueIds() {
//   console.log('=== Поиск ID лиг через тестовые запросы ===');
  
//   // Список популярных лиг для тестирования
//   const testLeagues = [
//     {id: 39, name: 'Premier League'},
//     {id: 140, name: 'La Liga'},
//     {id: 78, name: 'Bundesliga'},
//     {id: 135, name: 'Serie A'},
//     {id: 61, name: 'Ligue 1'},
//     {id: 2, name: 'Champions League'},
//     {id: 3, name: 'Europa League'},
//     {id: 848, name: 'Saudi Pro League'},
//     {id: 1, name: 'World Cup'},
//     {id: 45, name: 'FA Cup'}
//   ];
  
//   const availableLeagues = [];
  
//   for (const league of testLeagues) {
//     try {
//       const response = await fetch(`/standings/football?league=${league.id}&season=2023`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.league && data.standings) {
//           availableLeagues.push({
//             id: data.league.id,
//             name: data.league.name,
//             country: data.league.country,
//             season: data.season,
//             teams: data.standings.length
//           });
//           console.log(`✅ ${league.name} (ID: ${league.id}) - ${data.standings.length} команд`);
//         }
//       } else {
//         console.log(`❌ ${league.name} (ID: ${league.id}) - ${response.status}`);
//       }
//     } catch (error) {
//       console.log(`❌ ${league.name} (ID: ${league.id}) - ошибка`);
//     }
//   }
  
//   if (availableLeagues.length > 0) {
//     console.log('\n=== Найденные лиги ===');
//     console.table(availableLeagues);
//   } else {
//     console.log('Не найдено доступных лиг');
//   }
  
//   return availableLeagues;
// }

// window.findLeagueIds = findLeagueIds;

// console.log('Функции для анализа endpoints загружены!');
// console.log('Используйте в консоли:');
// console.log('- testEndpoints() - проверить работающие endpoints');
// console.log('- analyzeStandingsData() - проанализировать структуру данных');
// console.log('- findLeagueIds() - найти ID доступных лиг');