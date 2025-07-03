// API_URL 변수는 index.html에서 먼저 불러온 config.js 파일에서 가져옵니다.

let allData = []; // 모든 데이터를 저장할 전역 변수

/**
 * 페이지 로드 시 가장 먼저 실행되는 함수
 */
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    
    // 검색창에 입력할 때마다 필터링 함수 실행
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keyup', filterData);
});

/**
 * Apps Script API로부터 데이터를 불러오는 함수
 */
async function fetchData() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({ action: 'getData' })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            allData = result.data;
            displayDashboard(allData);
            displayData(allData);
        } else {
            handleError("데이터 로딩 실패: " + result.message);
        }
    } catch (error) {
        handleError("네트워크 오류: " + error.message);
    }
}

/**
 * 상단 대시보드를 그리는 함수
 * @param {Array<object>} data - 시트에서 받아온 전체 데이터
 */
function displayDashboard(data) {
    const dashboard = document.getElementById('dashboard');
    
    // 키 이름을 시트에 맞게 '환수원금', '상환중인금액', '상환상태'로 변경
    const totalAmount = data.reduce((sum, row) => sum + (Number(row['환수원금']) || 0), 0);
    const repaidAmount = data.reduce((sum, row) => sum + (Number(row['상환중인금액']) || 0), 0);
    const remainingAmount = totalAmount - repaidAmount;
    const progress = totalAmount > 0 ? ((repaidAmount / totalAmount) * 100) : 0;
    const completedCount = data.filter(row => row['상환상태'] === '완료').length;

    dashboard.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-title">총 환수 대상액</div>
            <div class="kpi-value">₩${totalAmount.toLocaleString()}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-title">총 상환 완료액</div>
            <div class="kpi-value">₩${repaidAmount.toLocaleString()}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-title">남은 잔여액</div>
            <div class="kpi-value">₩${remainingAmount.toLocaleString()}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-title">전체 진행률 (${completedCount}건 완료)</div>
            <div class="kpi-value">${progress.toFixed(1)}%</div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progress}%;"></div>
            </div>
        </div>
    `;
}

/**
 * 개인별 데이터 카드를 그리는 함수
 * @param {Array<object>} data - 화면에 표시할 데이터
 */
function displayData(data) {
    const container = document.getElementById('data-container');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p>표시할 데이터가 없습니다.</p>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'data-card';
        
        // '상환상태'에 따라 뱃지 스타일 변경
        let statusBadge = '';
        if (item['상환상태'] === '완료') {
            statusBadge = '<span class="status-badge completed">완료</span>';
        } else if (item['상환상태'] === '상환중') {
            statusBadge = '<span class="status-badge in-progress">상환중</span>';
        } else if (item['상환상태']) { // 기타 상태가 있을 경우
            statusBadge = `<span class="status-badge on-hold">${item['상환상태']}</span>`;
        }

        // 키 이름을 스크린샷에 맞게 변경 ('연번', '환수원금' 등)
        card.innerHTML = `
            <div class="data-card-header">
                <h3>${item['연번']}</h3>
                ${statusBadge}
            </div>
            <div class="data-card-body">
                <p><span>총 환수액</span> <span>₩${Number(item['환수원금']).toLocaleString()}</span></p>
                <p><span>상환액</span> <span>₩${Number(item['상환중인금액']).toLocaleString()}</span></p>
                <p><span>잔액</span> <span>₩${Number(item['상환잔액']).toLocaleString()}</span></p>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * 검색창 입력에 따라 데이터를 필터링하는 함수
 */
function filterData() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredData = allData.filter(item => {
        // '연번' 컬럼을 기준으로 검색
        return item['연번'].toLowerCase().includes(searchTerm);
    });
    displayData(filteredData);
}

/**
 * 에러 메시지를 화면에 표시하는 함수
 * @param {string} message - 표시할 에러 메시지
 */
function handleError(message) {
    console.error(message);
    const container = document.getElementById('data-container');
    container.innerHTML = `<div class="error-message">${message}</div>`;
}
