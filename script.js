document.addEventListener("DOMContentLoaded", () => {
    // 1. DATA STRUCTURE
    const reportData = {
        oldPeriod: {
            label: "04/2026 – 08/2026",
            totalViews: 9504,
            days: 150,
            dailyAverage: 63
        },
        newPeriod: {
            label: "30/08/2026 – 12/09/2026",
            totalViews: 1421,
            days: 14,
            dailyAverage: 101
        },
        oldKeywords: [
            { keyword: "kiwi hotel & apartments, ngũ hành sơn, đà nẵng", value: 845, meaning: "Khách tìm phòng lưu trú" },
            { keyword: "kiwi", value: 416, meaning: "Thương hiệu chung" },
            { keyword: "hotels", value: 316, meaning: "Khách tìm khách sạn" },
            { keyword: "kiwi hotel & apartments, xn. 387, ngũ hành sơn, đà nẵng", value: 305, meaning: "Khách tìm phòng lưu trú" },
            { keyword: "kiwi hotel & apartments, ngu hanh son, da nang", value: 121, meaning: "Khách tìm phòng lưu trú" }
        ],
        oldDevices: {
            googleMapsMobile: 6774,
            googleSearchMobile: 1264,
            googleMapsDesktop: 975,
            googleSearchDesktop: 491
        },
        newDevices: {
            googleMapsMobile: 1155,
            googleMapsDesktop: 153,
            googleSearchMobile: 97,
            googleSearchDesktop: 16
        },
        actions: {
            menu: null,
            calls: null,
            bookings: null,
            directions: null,
            websiteClicks: null
        }
    };

    // 2. HELPER FUNCTIONS
    const formatNum = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // 3. POPULATE UI DATA
    document.getElementById('oldTotalViews').innerText = formatNum(reportData.oldPeriod.totalViews);
    document.getElementById('newTotalViews').innerText = formatNum(reportData.newPeriod.totalViews);

    // Populate Keywords Table (Old Period)
    const tbody = document.getElementById('keywordTableBody');
    reportData.oldKeywords.forEach((kw, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${kw.keyword}</strong></td>
            <td>${kw.value}</td>
            <td>${kw.meaning}</td>
        `;
        tbody.appendChild(tr);
    });

    // 4. CHART.JS CONFIGURATIONS
    // Cập nhật Font Chart.js sang Public Sans
    Chart.defaults.font.family = "'Public Sans', -apple-system, sans-serif";
    Chart.defaults.color = '#5F6368';
    
    // Total Views Bar Chart
    const ctxTotal = document.getElementById('totalViewsChart').getContext('2d');
    const totalViewsChart = new Chart(ctxTotal, {
        type: 'bar',
        data: {
            labels: [reportData.oldPeriod.label, reportData.newPeriod.label],
            datasets: [{
                label: 'Lượt xem hồ sơ',
                data: [reportData.oldPeriod.totalViews, reportData.newPeriod.totalViews],
                backgroundColor: ['#DADCE0', '#1A73E8'],
                borderRadius: 6,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            scales: { y: { beginAtZero: true, grid: { display: true, color: '#f0f0f0' } }, x: { grid: { display: false } } }
        }
    });

    // Daily Avg Bar Chart
    const ctxDaily = document.getElementById('dailyAvgChart').getContext('2d');
    const dailyAvgChart = new Chart(ctxDaily, {
        type: 'bar',
        data: {
            labels: [reportData.oldPeriod.label, reportData.newPeriod.label],
            datasets: [{
                label: 'Lượt xem TB/ngày',
                data: [reportData.oldPeriod.dailyAverage, reportData.newPeriod.dailyAverage],
                backgroundColor: ['#DADCE0', '#188038'],
                borderRadius: 6,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { display: true, color: '#f0f0f0' } }, x: { grid: { display: false } } }
        }
    });

    // Donut Chart - Old Devices
    const oldDevData = [
        reportData.oldDevices.googleMapsMobile,
        reportData.oldDevices.googleSearchMobile,
        reportData.oldDevices.googleMapsDesktop,
        reportData.oldDevices.googleSearchDesktop
    ];
    const ctxOldDev = document.getElementById('oldDeviceChart').getContext('2d');
    new Chart(ctxOldDev, {
        type: 'doughnut',
        data: {
            labels: ['Maps - Mobile (71%)', 'Tìm kiếm - Mobile (13%)', 'Maps - Máy tính (10%)', 'Tìm kiếm - Máy tính (5%)'],
            datasets: [{
                data: oldDevData,
                backgroundColor: ['#EA4335', '#FBBC04', '#34A853', '#4285F4'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } } },
            cutout: '65%'
        }
    });

    // Donut Chart - New Devices
    const newDevData = [
        reportData.newDevices.googleMapsMobile,
        reportData.newDevices.googleMapsDesktop,
        reportData.newDevices.googleSearchMobile,
        reportData.newDevices.googleSearchDesktop
    ];
    const ctxNewDev = document.getElementById('newDeviceChart').getContext('2d');
    new Chart(ctxNewDev, {
        type: 'doughnut',
        data: {
            labels: ['Maps - Mobile (81%)', 'Maps - Máy tính (11%)', 'Tìm kiếm - Mobile (7%)', 'Tìm kiếm - Máy tính (1%)'],
            datasets: [{
                data: newDevData,
                backgroundColor: ['#EA4335', '#34A853', '#FBBC04', '#4285F4'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } } },
            cutout: '65%'
        }
    });

    // 5. FILTER LOGIC
    const timeFilter = document.getElementById('timeFilter');
    const sections = document.querySelectorAll('section[data-view]');
    const periodSpecifics = document.querySelectorAll('[data-period]');

    timeFilter.addEventListener('change', (e) => {
        const val = e.target.value; 

        // Show/Hide top level sections
        sections.forEach(sec => {
            const views = sec.getAttribute('data-view').split(' ');
            if (views.includes('all') || views.includes(val)) {
                sec.classList.remove('hidden');
            } else {
                sec.classList.add('hidden');
            }
        });

        // Show/Hide granular elements inside sections (like stats or specific charts)
        periodSpecifics.forEach(el => {
            const p = el.getAttribute('data-period');
            if (val === 'compare') {
                el.classList.remove('hidden');
            } else if (p === val) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });
    });

    // 6. NAVIGATION ACTIVE STATE
    const navLinks = document.querySelectorAll('.sidebar-nav a, .mobile-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Remove active from all
            navLinks.forEach(l => l.classList.remove('active'));
            // Add to corresponding links (both mobile and desktop)
            const href = this.getAttribute('href');
            document.querySelectorAll(`a[href="${href}"]`).forEach(a => a.classList.add('active'));
        });
    });
});