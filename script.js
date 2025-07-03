// ⚠️ 여기에 Apps Script 배포 URL을 반드시 붙여넣으세요!
const API_URL = "https://script.google.com/macros/s/AKfycbycwt2AHc-rriBSXII.../exec"; // 예시 URL

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
            allData = result.data; // 받아온 데이터를 전역 변수에 저장
            displayDashboard(allData);
            displayData(allData); // 전체 데이터로 화면 표시
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
    // '총환수액', '상환액' 등은 실제 구글 시트의 헤더 이름과 정확히 일치해야 합니다.
    const totalAmount = data.reduce((sum, row) => sum + (Number(row['총환수액']) || 0), 0);
    const repaidAmount = data.reduce((sum, row) => sum + (Number(row['상환액']) || 0), 0);
    const remainingAmount = totalAmount - repaidAmount;
    const progress = totalAmount > 0 ? ((repaidAmount / totalAmount) * 100) : 0;
    const completedCount = data.filter(row => row['상태'] === '완료').length;

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
    container.innerHTML = ''; // 기존 카드들을 비웁니다.

    if (data.length === 0) {
        container.innerHTML = '<p>표시할 데이터가 없습니다.</p>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'data-card';
        
        // 상태에 따라 뱃지 스타일 변경 (시트의 '상태' 컬럼 값 기준)
        let statusBadge = '';
        if (item['상태'] === '완료') {
            statusBadge = '<span class="status-badge completed">Completed</span>';
        } else if (item['상태'] === '진행중') {
            statusBadge = '<span class="status-badge in-progress">In Progress</span>';
        } else if (item['상태'] === '보류') {
            statusBadge = '<span class="status-badge on-hold">On Hold</span>';
        }

        card.innerHTML = `
            <div class="data-card-header">
                <h3>${item['이름']}</h3>
                ${statusBadge}
            </div>
            <div class="data-card-body">
                <p><span>부서</span> <span>${item['부서']}</span></p>
                <p><span>총 환수액</span> <span>₩${Number(item['총환수액']).toLocaleString()}</span></p>
                <p><span>상환액</span> <span>₩${Number(item['상환액']).toLocaleString()}</span></p>
                <p><span>잔액</span> <span>₩${(Number(item['총환수액']) - Number(item['상환액'])).toLocaleString()}</span></p>
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
        // '이름'은 실제 시트의 헤더 이름과 일치해야 합니다.
        return item['이름'].toLowerCase().includes(searchTerm);
    });
    displayData(filteredData); // 필터링된 데이터로 화면 다시 그리기
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
