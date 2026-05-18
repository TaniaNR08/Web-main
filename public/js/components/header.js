function renderHeader({ showBack = true } = {}) {
  const user = sessionStorage.getItem('user');
  const rol = sessionStorage.getItem('rol') || '';

  const header = document.createElement('header');
  header.className = 'app-header';

  header.innerHTML = `
    <div class="header-left">
      ${showBack ? `<button class="header-back-btn" onclick="history.back()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Regresar
      </button>` : '<div></div>'}
    </div>
    <div class="header-center">
      <img src="/assets/logo.png" alt="Logo" class="header-logo" onerror="this.style.display='none'">
      <span class="header-title">San Francisco de Asís</span>
    </div>
    <div class="header-right">
      <div class="header-user">
        <span class="header-user-role">${rol}</span>
        <span class="header-user-id">${user || ''}</span>
      </div>
      <button class="header-logout-btn" onclick="logout()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Salir
      </button>
    </div>
  `;

  document.body.insertBefore(header, document.body.firstChild);
}

function logout() {
  sessionStorage.clear();
  window.location.href = '/';
}
