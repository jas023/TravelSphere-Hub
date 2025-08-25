// Simple site JS: toggle navs, favorites using localStorage, share fallback

// NAV TOGGLES (works for all nav toggles with class nav-toggle)
document.querySelectorAll('.nav-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const parent = btn.closest('.nav-wrap') || btn.closest('header');
    const nav = parent.querySelector('.nav');
    nav.classList.toggle('show');
  });
});

// FAVORITES: toggling and storing
const favKey = 'ts_favs_v1';
function loadFavs() {
  try { return JSON.parse(localStorage.getItem(favKey)) || []; }
  catch (e) { return []; }
}
function saveFavs(list) {
  localStorage.setItem(favKey, JSON.stringify(list));
}

function updateFavButtons() {
  const favs = loadFavs();
  document.querySelectorAll('.card').forEach(card => {
    const id = card.dataset.id;
    const btn = card.querySelector('.favorite-btn');
    if (!btn) return;
    if (favs.includes(id)) btn.classList.add('favourite-active');
    else btn.classList.remove('favourite-active');
  });
}

// set up favorite and share listeners
function wireCardActions() {
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      const id = card.dataset.id;
      let favs = loadFavs();
      if (favs.includes(id)) favs = favs.filter(x => x !== id);
      else favs.push(id);
      saveFavs(favs);
      updateFavButtons();
      refreshFavGrid();
    });
  });

  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.card');
      const title = card.querySelector('h3')?.innerText || "Destination";
      const text = card.querySelector('p')?.innerText || "";
      const url = location.href;
      if (navigator.share) {
        try { await navigator.share({ title, text, url }); }
        catch (e) { console.log('share canceled'); }
      } else {
        // fallback: copy to clipboard
        const payload = `${title} - ${text}\n${url}`;
        navigator.clipboard?.writeText(payload)
          .then(() => alert('Destination details copied to clipboard'));
      }
    });
  });
}

// Populate favourites grid on Destinations page and Favourites page
function refreshFavGrid() {
  const favs = loadFavs();
  const favGrid = document.getElementById('favGrid');
  const favGridPage = document.getElementById('favGridPage');
  const favEmpty = document.getElementById('favEmpty');
  const favEmptyPage = document.getElementById('favEmptyPage');

  const allCards = Array.from(document.querySelectorAll('.card'));
  const favCards = allCards.filter(c => favs.includes(c.dataset.id));

  if (favGrid) {
    favGrid.innerHTML = '';
    if (favCards.length === 0) {
      if (favEmpty) favEmpty.style.display = 'block';
    } else {
      if (favEmpty) favEmpty.style.display = 'none';
      favCards.forEach(c => favGrid.appendChild(c.cloneNode(true)));
      wireCardActions();
      updateFavButtons();
    }
  }

  if (favGridPage) {
    const sourceCards = document.querySelectorAll('.card');
    favGridPage.innerHTML = '';
    const nodes = Array.from(sourceCards).filter(c => favs.includes(c.dataset.id));
    if (nodes.length === 0) {
      if (favEmptyPage) favEmptyPage.style.display = 'block';
    } else {
      if (favEmptyPage) favEmptyPage.style.display = 'none';
      nodes.forEach(n => favGridPage.appendChild(n.cloneNode(true)));
      wireCardActions();
      updateFavButtons();
    }
  }
}

// init on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  wireCardActions();
  updateFavButtons();
  refreshFavGrid();

  // smooth scroll for same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href && href.length > 1) {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
