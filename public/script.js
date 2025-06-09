function dangnhap(){
    // Khai báo tài khoản và mật khẩu mặc định
    const correctUsername = "admin";
    const correctPassword = "123456";

    const form = document.getElementById('loginForm');
    const message = document.getElementById('message');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Ngăn reload trang

        // Lấy giá trị người dùng nhập
        const enteredUsername = document.getElementById('usernameInput').value;
        const enteredPassword = document.getElementById('passwordInput').value;

        // So sánh với thông tin khai báo sẵn
        if (enteredUsername === correctUsername && enteredPassword === correctPassword) {
            window.location.href ='form.html';
        } else {
            message.textContent = "Tên đăng nhập hoặc mật khẩu không đúng!";
            message.style.color = "red";
        }
    });
}

//render cards
    async function renderCards(endpoint, containerId, isRider = true) {
      const res = await fetch(endpoint);
      const data = await res.json();
      const container = document.getElementById(containerId);

      container.innerHTML = data.map(item => `
        <div class="card">
          <img src="${item.image}" alt="Image">
          <h3>${item.name}</h3>
          <p>${isRider ? item.team : 'Points: ' + item.points}</p>
        </div>
      `).join('');
    }

    renderCards('/api/riders', 'riders-container', true);
    renderCards('/api/teams', 'teams-container', false);

  function renderTable(data, elementId) {
    const table = document.getElementById(elementId);
    table.innerHTML = ''; // Clear existing

    if (!data || data.length === 0) {
      table.innerHTML = '<tr><td class="text-center">Không có dữ liệu</td></tr>';
      return;
    }

    // Header
    const headers = Object.keys(data[0]).map(key => `<th>${key}</th>`).join('');
    table.innerHTML += `<thead class="table-light"><tr>${headers}</tr></thead><tbody></tbody>`;

    // Rows
    const tbody = table.querySelector('tbody');
    data.forEach(row => {
      const rowHTML = Object.values(row).map(val => `<td>${val}</td>`).join('');
      tbody.innerHTML += `<tr>${rowHTML}</tr>`;
    });
  }

  async function fetchAndRender(endpoint, elementId) {
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      renderTable(data, elementId);
    } catch (error) {
      console.error(`Lỗi khi tải ${endpoint}:`, error);
    }
  }

  // Gọi bảng kết quảquả
  fetchAndRender('/api/results', 'results-table');
    fetch('/api/calendar')
      .then(response => response.json())
      .then(data => {
        const tbody = document.getElementById('calendar-body');
        data.forEach(entry => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${entry.country}</td>
            <td>${entry.tournament}</td>
            <td>${entry.time || ''}</td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch(error => {
        console.error('Lỗi khi tải dữ liệu:', error);
      });

    //gọi bảng xếp hạng
    fetchAndRender('/api/riders', 'standing-table');
    fetch('/api/riders')
      .then(response => response.json())
      .then(data => {
        const tbody = document.getElementById('standing-body');
        data.forEach(entry => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${entry.country}</td>
            <td>${entry.tournament}</td>
            <td>${entry.time || ''}</td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch(error => {
        console.error('Lỗi khi tải dữ liệu:', error);
      });