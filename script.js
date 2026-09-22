document.addEventListener("DOMContentLoaded", () => {
    // 1. DỮ LIỆU ĐƯỢC CHUẨN HÓA CHO PHÉP NHẬP THỦ CÔNG 
    // Thay số 0, null thành dữ liệu thực tế khi có
    const reportData = {
        oldPeriod: {
            label: "04/2026 – 08/2026",
            days: 150
        },
        newPeriod: {
            label: "30/08/2026 – 22/09/2026",
            days: 24
        },
        
        // NHẬP SỐ LIỆU 6 CHỈ SỐ Ở ĐÂY 
        // Dùng null nếu chưa có dữ liệu để hiển thị "Đang cập nhật"
        kpiData: {
            views: { old: 9504, new: 5262 },
            menu: { old: 0, new: 5 },
            calls: { old: 167, new: 32 },
            bookings: { old: 0, new: 0 },
            directions: { old: 1.379, new: 518 },
            website: { old: 1, new: 0 },
        },

        oldKeywords: [
            { keyword: "kiwi hotel & apartments, ngũ hành sơn, đà nẵng", value: 845, meaning: "Khách tìm phòng lưu trú" },
            { keyword: "kiwi", value: 416, meaning: "Thương hiệu chung" },
            { keyword: "hotels", value: 316, meaning: "Khách tìm khách sạn" },
            { keyword: "kiwi hotel & apartments, xn. 387, ngũ hành sơn, đà nẵng", value: 305, meaning: "Khách tìm phòng lưu trú" },
            { keyword: "kiwi hotel & apartments, ngu hanh son, da nang", value: 121, meaning: "Khách tìm phòng lưu trú" }
        ],
        
        oldDevices: {
            googleMapsMobile: 6774, googleSearchMobile: 1264,
            googleMapsDesktop: 975, googleSearchDesktop: 491
        },
        newDevices: {
            googleMapsMobile: 1155, googleMapsDesktop: 153,
            googleSearchMobile: 97, googleSearchDesktop: 16
        }
    };

    // 2. HÀM HỖ TRỢ
    const formatNum = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Tổng lượt xem ban đầu
    document.getElementById('oldTotalViews').innerText = formatNum(reportData.kpiData.views.old);
    document.getElementById('newTotalViews').innerText = formatNum(reportData.kpiData.views.new);

    // Bảng từ khóa cũ
    const tbody = document.getElementById('keywordTableBody');
    reportData.oldKeywords.forEach((kw, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${index + 1}</td><td><strong>${kw.keyword}</strong></td><td>${kw.value}</td><td>${kw.meaning}</td>`;
        tbody.appendChild(tr);
    });

    // 3. LOGIC CẬP NHẬT THẺ KPI DỰA THEO THỜI GIAN
    const kpiKeys = ['views', 'menu', 'calls', 'bookings', 'directions', 'website'];
    
    function renderKPIs(mode) {
        kpiKeys.forEach(key => {
            const data = reportData.kpiData[key];
            const valEl = document.getElementById(`val-${key}`);
            const cardEl = document.getElementById(`card-${key}`);
            const compBox = document.getElementById(`comp-${key}`);
            const badgeEl = document.getElementById(`badge-${key}`);
            const uspEl = document.getElementById(`usp-${key}`);

            let oldVal = data.old;
            let newVal = data.new;

            // Xử lý hiển thị mốc cũ / mới độc lập
            if (mode === 'old' || mode === 'new') {
                compBox.classList.add('hidden');
                let targetVal = mode === 'old' ? oldVal : newVal;
                
                if (targetVal === null) {
                    valEl.innerText = "Đang cập nhật";
                    cardEl.classList.add('empty-state');
                } else {
                    valEl.innerText = formatNum(targetVal);
                    cardEl.classList.remove('empty-state');
                }
            } 
            // Xử lý tính toán So sánh USP tự động
            else if (mode === 'compare') {
                if (oldVal === null || newVal === null) {
                    compBox.classList.add('hidden');
                    valEl.innerText = (newVal !== null) ? formatNum(newVal) : "Đang cập nhật";
                    if(newVal === null) cardEl.classList.add('empty-state');
                } else {
                    valEl.innerText = formatNum(newVal);
                    cardEl.classList.remove('empty-state');
                    compBox.classList.remove('hidden');

                    // So sánh tốc độ tiếp cận trung bình ngày vì mốc thời gian chênh lệch (150 ngày vs 14 ngày)
                    let oldAvg = oldVal / reportData.oldPeriod.days;
                    let newAvg = newVal / reportData.newPeriod.days;
                    let pctChange = ((newAvg - oldAvg) / oldAvg) * 100;

                    if (pctChange > 0) {
                        badgeEl.className = 'kpi-badge up';
                        badgeEl.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px;">arrow_upward</span> Tăng ${pctChange.toFixed(1)}% / ngày`;
                        uspEl.innerText = "Tín hiệu tích cực khi tiếp cận đúng tệp khách F&B.";
                    } else {
                        badgeEl.className = 'kpi-badge down';
                        badgeEl.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px;">arrow_downward</span> Giảm ${Math.abs(pctChange).toFixed(1)}% / ngày`;
                        uspEl.innerText = "Đang loại bỏ dần tệp người dùng tìm khách sạn ảo.";
                    }
                }
            }
        });
    }

    // Khởi tạo KPI lần đầu
    renderKPIs('compare');

    // 4. CHART.JS CẤU HÌNH
    Chart.defaults.font.family = "'Public Sans', -apple-system, sans-serif";
    Chart.defaults.color = '#5F6368';
    
    const ctxTotal = document.getElementById('totalViewsChart').getContext('2d');
    new Chart(ctxTotal, {
        type: 'bar',
        data: {
            labels: [reportData.oldPeriod.label, reportData.newPeriod.label],
            datasets: [{
                label: 'Lượt xem hồ sơ',
                data: [reportData.kpiData.views.old, reportData.kpiData.views.new],
                backgroundColor: ['#DADCE0', '#1A73E8'],
                borderRadius: 6,
                barPercentage: 0.6
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { display: true, color: '#f0f0f0' } }, x: { grid: { display: false } } } }
    });

    const ctxDaily = document.getElementById('dailyAvgChart').getContext('2d');
    new Chart(ctxDaily, {
        type: 'bar',
        data: {
            labels: [reportData.oldPeriod.label, reportData.newPeriod.label],
            datasets: [{
                label: 'Lượt xem TB/ngày',
                data: [(reportData.kpiData.views.old / reportData.oldPeriod.days).toFixed(0), (reportData.kpiData.views.new / reportData.newPeriod.days).toFixed(0)],
                backgroundColor: ['#DADCE0', '#188038'],
                borderRadius: 6,
                barPercentage: 0.6
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { display: true, color: '#f0f0f0' } }, x: { grid: { display: false } } } }
    });

    // Donut cũ
    const ctxOldDev = document.getElementById('oldDeviceChart').getContext('2d');
    new Chart(ctxOldDev, {
        type: 'doughnut',
        data: {
            labels: ['Maps - Mobile', 'Tìm kiếm - Mobile', 'Maps - PC', 'Tìm kiếm - PC'],
            datasets: [{
                data: [reportData.oldDevices.googleMapsMobile, reportData.oldDevices.googleSearchMobile, reportData.oldDevices.googleMapsDesktop, reportData.oldDevices.googleSearchDesktop],
                backgroundColor: ['#EA4335', '#FBBC04', '#34A853', '#4285F4'], borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }, cutout: '65%' }
    });

    // Donut mới
    const ctxNewDev = document.getElementById('newDeviceChart').getContext('2d');
    new Chart(ctxNewDev, {
        type: 'doughnut',
        data: {
            labels: ['Maps - Mobile', 'Maps - PC', 'Tìm kiếm - Mobile', 'Tìm kiếm - PC'],
            datasets: [{
                data: [reportData.newDevices.googleMapsMobile, reportData.newDevices.googleMapsDesktop, reportData.newDevices.googleSearchMobile, reportData.newDevices.googleSearchDesktop],
                backgroundColor: ['#EA4335', '#34A853', '#FBBC04', '#4285F4'], borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }, cutout: '65%' }
    });

    // 5. BỘ LỌC EVENT
    const timeFilter = document.getElementById('timeFilter');
    const sections = document.querySelectorAll('section[data-view]');
    const periodSpecifics = document.querySelectorAll('[data-period]');

    timeFilter.addEventListener('change', (e) => {
        const val = e.target.value; 

        // Ẩn hiện Section
        sections.forEach(sec => {
            const views = sec.getAttribute('data-view').split(' ');
            if (views.includes('all') || views.includes(val)) {
                sec.classList.remove('hidden');
            } else {
                sec.classList.add('hidden');
            }
        });

        // Ẩn hiện thẻ nhỏ
        periodSpecifics.forEach(el => {
            const p = el.getAttribute('data-period');
            if (val === 'compare' || p === val) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });

        // Chạy lại render thẻ KPI
        renderKPIs(val);
    });

    // 6. ĐIỀU HƯỚNG BẤM TAY THAY ĐỔI TRẠNG THÁI ACTIVE
    const navLinks = document.querySelectorAll('.sidebar-nav a, .mobile-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            const href = this.getAttribute('href');
            document.querySelectorAll(`a[href="${href}"]`).forEach(a => a.classList.add('active'));
        });
    });
});
