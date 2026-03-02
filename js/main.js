/**
 * 외부 HTML 컴포넌트를 비동기적으로 로드하여 지정된 요소에 삽입하는 함수
 * @param {string} url - 불러올 HTML 파일의 경로
 * @param {string} elementId - HTML이 삽입될 요소의 ID
 */
async function loadComponent(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${url}: ${response.statusText}`);
        }
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        console.log(`Successfully loaded ${url} into #${elementId}`);
    } catch (error) {
        console.error('Error loading component:', error);
        document.getElementById(elementId).innerHTML = `<p style="color:red;">컴포넌트를 불러오는 데 실패했습니다.</p>`;
    }
}

// DOM이 완전히 로드된 후 컴포넌트들을 불러옵니다.
document.addEventListener('DOMContentLoaded', () => {
    // 헤더와 푸터 모듈 로드
    loadComponent('components/header.html', 'header-container');
    loadComponent('components/footer.html', 'footer-container');
    
    // 달력 초기화
    initCalendar();
});

// --- 달력 관련 로직 ---

const holidays2026 = {
    "01-01": "Neujahr (새해)",
    "04-03": "Karfreitag (성금요일)",
    "04-06": "Ostermontag (부활절 월요일)",
    "05-01": "Tag der Arbeit (노동절)",
    "05-14": "Christi Himmelfahrt (예수 승천일)",
    "05-25": "Pfingstmontag (성령 강림 월요일)",
    "10-03": "Tag der Deutschen Einheit (독일 통일의 날)",
    "12-25": "1. Weihnachtstag (크리스마스)",
    "12-26": "2. Weihnachtstag (성 스테파노의 날)"
};

let currentYear = 2026;
let currentMonth = 2; // 3월 (0부터 시작)

function initCalendar() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    if(!prevBtn || !nextBtn) return;

    renderCalendar(currentYear, currentMonth);

    prevBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentYear, currentMonth);
    });

    nextBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentYear, currentMonth);
    });
}

function renderCalendar(year, month) {
    const grid = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('currentMonthDisplay');
    const holidayListUl = document.getElementById('holidays');
    
    grid.innerHTML = '';
    holidayListUl.innerHTML = '';
    
    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    monthDisplay.textContent = `${year}년 ${monthNames[month]}`;

    // 요일 헤더
    const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 시작 빈 칸
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    // 날짜 생성
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        
        // 주별 색상 계산 (전체 날짜 인덱스를 기반으로 주차 계산)
        const totalIndex = firstDay + day - 1;
        const weekNum = Math.floor(totalIndex / 7);
        cell.className = `calendar-day week-${weekNum % 6}`; // 6가지 색상 반복

        const dateStr = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const holidayName = holidays2026[dateStr];

        let content = `<span class="day-num">${day}</span>`;
        if (holidayName) {
            cell.classList.add('holiday-cell');
            content += `<span class="holiday-name">${holidayName}</span>`;
            
            // 리스트에도 추가
            const li = document.createElement('li');
            li.textContent = `${month + 1}월 ${day}일: ${holidayName}`;
            holidayListUl.appendChild(li);
        }

        cell.innerHTML = content;
        grid.appendChild(cell);
    }

    if (holidayListUl.innerHTML === '') {
        holidayListUl.innerHTML = '<li>이달에는 공휴일이 없습니다.</li>';
    }
}
