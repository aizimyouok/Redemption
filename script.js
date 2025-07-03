// 1. 배포된 Apps Script의 URL을 여기에 붙여넣으세요.
const API_URL = "https://script.google.com/macros/s/AKfycbwt2AhC-rriBSXllRbn3zMcq4N3ZtJ5ZOwMG_m1cyo47GQYKBdRS7NZTWBEFTY2j_UO/exec"; 

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

async function fetchData() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (result.status === 'success') {
            displayData(result.data);
            displayDashboard(result.data);
        } else {
            console.error("데이터 로딩 실패:", result.message);
        }
    } catch (error) {
        console.error("Fetch API 에러:", error);
    }
}

function displayDashboard(data) {
    const dashboard = document.getElementById('dashboard');
    // 여기에 전체 현황판을 만드는 코드를 작성합니다 (예: 총액, 진행률 등)
    dashboard.innerHTML = `
        <div class="card">
            <h2>전체 진행률: 50%</h2>
        </div>
    `;
}

function displayData(data) {
    const container = document.getElementById('data-container');
    container.innerHTML = ''; // 기존 내용 초기화

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        // '이름', '총환수액' 등은 실제 시트의 헤더 이름과 일치해야 합니다.
        card.innerHTML = `
            <h3>${item['이름']}</h3>
            <p>총 환수액: ${item['총환수액']}</p>
            <p>상환액: ${item['상환액']}</p>
            <button>상세보기</button>
        `;
        container.appendChild(card);
    });
}