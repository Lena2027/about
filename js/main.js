async function loadComponent(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        
        // Header가 로드된 후 테마 토글 이벤트 연결
        if (elementId === 'header-container') {
            setupThemeToggle();
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // 저장된 테마 적용
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    toggleBtn.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';

    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        toggleBtn.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 테마 즉시 적용 (깜빡임 방지)
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    loadComponent('components/header.html', 'header-container');
    loadComponent('components/footer.html', 'footer-container');
    initCalendar();
});

const nationalHolidays2026 = {
    "01-01": "New Year's Day",
    "04-03": "Good Friday",
    "04-06": "Easter Monday",
    "05-01": "Labor Day",
    "05-14": "Ascension Day",
    "05-25": "Whit Monday",
    "10-03": "German Unity Day",
    "12-25": "Christmas Day",
    "12-26": "Boxing Day"
};

const stateSpecificHolidays2026 = {
    "01-06": { name: "Epiphany", states: ["BW", "BY", "ST"] },
    "03-08": { name: "Women's Day", states: ["BE", "MV"] },
    "04-05": { name: "Easter Sunday", states: ["BB"] },
    "05-24": { name: "Whit Sunday", states: ["BB"] },
    "06-04": { name: "Corpus Christi", states: ["BW", "BY", "HE", "NW", "RP", "SL"] },
    "08-15": { name: "Assumption Day", states: ["BY", "SL"] },
    "10-31": { name: "Reformation Day", states: ["BB", "HB", "HH", "MV", "NI", "SH", "SN", "ST", "TH"] },
    "11-01": { name: "All Saints' Day", states: ["BW", "BY", "NW", "RP", "SL"] },
    "11-18": { name: "Day of Prayer", states: ["SN"] }
};

let currentYear = 2026;
let currentMonth = 2; // March
let selectedState = "ALL";

function initCalendar() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    const stateSelect = document.getElementById('stateSelect');
    
    if(!prevBtn || !nextBtn || !stateSelect) return;

    renderCalendar(currentYear, currentMonth);

    prevBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar(currentYear, currentMonth);
    });

    nextBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar(currentYear, currentMonth);
    });

    stateSelect.addEventListener('change', (e) => {
        selectedState = e.target.value;
        renderCalendar(currentYear, currentMonth);
    });
}

function renderCalendar(year, month) {
    const grid = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('currentMonthDisplay');
    const holidayListUl = document.getElementById('holidays');
    
    if(!grid || !monthDisplay || !holidayListUl) return;
    
    grid.innerHTML = '';
    holidayListUl.innerHTML = '';
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthDisplay.textContent = `${monthNames[month]} ${year}`;

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        const totalIndex = firstDay + day - 1;
        const weekNum = Math.floor(totalIndex / 7);
        cell.className = `calendar-day week-${weekNum % 6}`;

        const dateStr = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let holidayName = nationalHolidays2026[dateStr];
        const stateHoliday = stateSpecificHolidays2026[dateStr];

        if (stateHoliday && (selectedState === "ALL" || stateHoliday.states.includes(selectedState))) {
            holidayName = holidayName ? `${holidayName} / ${stateHoliday.name}` : stateHoliday.name;
        }

        cell.innerHTML = `<span class="day-num">${day}</span>`;
        if (holidayName) {
            cell.classList.add('holiday-cell');
            cell.innerHTML += `<span class="holiday-name">${holidayName}</span>`;
            const li = document.createElement('li');
            li.textContent = `${monthNames[month]} ${day}: ${holidayName}`;
            holidayListUl.appendChild(li);
        }
        grid.appendChild(cell);
    }

    if (!holidayListUl.innerHTML) {
        holidayListUl.innerHTML = '<li>No holidays this month.</li>';
    }
}
