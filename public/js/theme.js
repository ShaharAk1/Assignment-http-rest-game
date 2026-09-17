// Remembers the day/night choice. The styling itself is pure CSS (#theme-switch:checked ~ .page).
(function () {
  const THEME_KEY = 'httpGameTheme';
  const toggle = document.getElementById('theme-switch');
  if (!toggle) return;

  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      toggle.checked = saved === 'night';
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      toggle.checked = true;
    }
  } catch (err) {
    // localStorage unavailable — the theme just won't be remembered.
  }

  toggle.addEventListener('change', () => {
    try {
      localStorage.setItem(THEME_KEY, toggle.checked ? 'night' : 'day');
    } catch (err) {
      // ignore
    }
  });
})();
