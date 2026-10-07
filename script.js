'use strict';
const CATEGORIES = [
  'Author Meet',
  'Book Launch',
  'Poetry Reading',
  "Children's Reading",
  'Writing Workshop',
  'Community Discussion'
];
const SAMPLE_EVENTS = [
  {
    id: 'evt-001',
    title: 'An Evening with Aarav Mehta',
    author: 'Aarav Mehta',
    date: '2026-10-10',
    time: '18:30',
    category: 'Author Meet',
    seats: 45,
    description:
      'Join the Bengaluru novelist for a conversation about his new coming-of-age novel, followed by a Q&A and book signing.'
  },
  {
    id: 'evt-002',
    title: 'Monsoon Pages: Book Launch',
    author: 'Nisha Kapoor',
    date: '2026-10-17',
    time: '17:00',
    category: 'Book Launch',
    seats: 80,
    description:
      'Celebrate the Delhi release of a new short-story collection with readings, a panel discussion and refreshments.'
  },
  {
    id: 'evt-003',
    title: 'Shaam-e-Shayari: An Evening of Poetry',
    author: 'Kabir Malhotra',
    date: '2026-10-23',
    time: '19:00',
    category: 'Poetry Reading',
    seats: 35,
    description:
      'An evening of Urdu and Hindi poetry in Jaipur, with ghazals and nazms from the poet and invited guests. A short open mic follows.'
  },
  {
    id: 'evt-004',
    title: 'Saturday Story Hour',
    author: 'Ananya Iyer',
    date: '2026-11-07',
    time: '11:00',
    category: "Children's Reading",
    seats: 20,
    description:
      'An interactive picture-book reading in Mumbai for children aged 4 to 8, with a short craft activity. Parents are welcome to stay and browse.'
  },
  {
    id: 'evt-005',
    title: 'Writing Your First Short Story',
    author: 'Rohan Sharma',
    date: '2026-11-15',
    time: '10:30',
    category: 'Writing Workshop',
    seats: 15,
    description:
      'A hands-on Sunday workshop in Pune covering story ideas, structure and revision. Bring a notebook and a rough idea to develop.'
  },
  {
    id: 'evt-006',
    title: 'Books, Cities & Local Stories',
    author: 'Meera Joshi',
    date: '2026-11-19',
    time: '18:00',
    category: 'Community Discussion',
    seats: 30,
    description:
      "A community conversation in Lucknow on how the city's history and neighbourhoods shape the stories we read. Readers of all ages are welcome."
  }
];

const FIELDS = [
  'title',
  'author',
  'date',
  'time',
  'category',
  'seats',
  'description'
];

const LOADING_MS = 1500;

const $ = (id) => document.getElementById(id);

const grid = $('events-grid');
const searchInput = $('search');
const form = $('event-form');
const statusEl = $('results-status');
const toastEl = $('toast');
const themeBtn = $('theme-toggle');

let events = [];
let toastTimer;

function sanitizeInput(value) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return String(value)
    .trim()
    .replace(/[&<>"']/g, (char) => map[char]);
}

function escapeStored(value) {
  const map = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return String(value).replace(/[<>"']/g, (char) => map[char]);
}

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatTime(time) {
  const [hours, minutes] = time.split(':');

  return new Date(
    2000,
    0,
    1,
    Number(hours),
    Number(minutes)
  ).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function cardTemplate(event) {
  return `
    <article class="card" aria-label="${event.title}">
      <span class="badge">${event.category}</span>

      <h3>${event.title}</h3>

      <p class="author">
        by ${event.author}
      </p>

      <p class="meta">
        <span>${formatDate(event.date)}</span>
        <span>${formatTime(event.time)}</span>
      </p>

      <p class="desc">
        ${event.description}
      </p>

      <div class="card-footer">
        <p class="seats">
          ${event.seats} seats available
        </p>

        <button
          type="button"
          class="btn-delete"
          data-id="${event.id}"
          aria-label="Delete event: ${event.title}"
        >
          Delete
        </button>
      </div>
    </article>
  `;
}

function showLoadingState() {
  grid.setAttribute('aria-busy', 'true');

  statusEl.textContent = 'Loading events…';

  grid.innerHTML = Array.from(
    { length: 6 },
    () => `
      <div class="card skeleton" aria-hidden="true">
        <div class="bar sm"></div>
        <div class="bar lg"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar sm"></div>
      </div>
    `
  ).join('');
}

function showEmptyState() {
  grid.innerHTML = `
    <div class="empty">
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <rect x="12" y="10" width="14" height="44" rx="2"/>
        <rect x="28" y="16" width="14" height="38" rx="2"/>
        <path
          d="M46 20l10 4-10 30-6-2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8 54h48"
          stroke-linecap="round"
        />
      </svg>

      <h3>No Events Found</h3>

      <p>
        There are currently no bookstore events available.
      </p>
    </div>
  `;
}

function renderEvents(list) {
  grid.setAttribute('aria-busy', 'false');

  if (!list.length) {
    showEmptyState();
    statusEl.textContent = 'No events found.';
    return;
  }

  grid.innerHTML = list
    .map(cardTemplate)
    .join('');

  statusEl.textContent =
    `${list.length} event${list.length === 1 ? '' : 's'} shown.`;
}

function filterEvents(query) {
  const q = sanitizeInput(query).toLowerCase();

  if (!q) {
    return events;
  }

  return events.filter((event) =>
    [
      event.title,
      event.author,
      event.category
    ].some((field) =>
      field.toLowerCase().includes(q)
    )
  );
}

const RULES = {
  title: (value) =>
    value ? '' : 'Enter an event title.',

  author: (value) =>
    value ? '' : 'Enter the author name.',

  date: (value) =>
    value ? '' : 'Choose a date.',

  time: (value) =>
    value ? '' : 'Choose a time.',

  category: (value) =>
    CATEGORIES.includes(value)
      ? ''
      : 'Select a category.',

  seats: (value) =>
    Number.isInteger(Number(value)) &&
    Number(value) >= 1 &&
    value !== ''
      ? ''
      : 'Enter at least 1 seat.',

  description: (value) =>
    value ? '' : 'Enter a short description.'
};

function setError(name, message) {
  const input = $(name);
  const errorElement = $(`${name}-error`);

  errorElement.textContent = message;

  input.classList.toggle(
    'invalid',
    Boolean(message)
  );

  input.setAttribute(
    'aria-invalid',
    message ? 'true' : 'false'
  );
}

function validateForm() {
  let firstInvalid = null;

  FIELDS.forEach((name) => {
    const value = $(name).value.trim();
    const message = RULES[name](value);

    setError(name, message);

    if (message && !firstInvalid) {
      firstInvalid = $(name);
    }
  });

  if (firstInvalid) {
    firstInvalid.focus();
  }

  return !firstInvalid;
}

const STORAGE_KEY = 'bookstoreEvents';

function newId() {
  return `evt-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function saveEvents() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(events)
    );
  } catch (error) {
    console.warn(
      'Could not save events:',
      error
    );
  }
}

function isValidEvent(event) {
  return (
    event &&
    typeof event === 'object' &&
    ['title', 'author', 'category', 'description']
      .every(
        (key) => typeof event[key] === 'string'
      ) &&
    /^\d{4}-\d{2}-\d{2}$/.test(event.date) &&
    /^\d{2}:\d{2}$/.test(event.time) &&
    Number.isInteger(event.seats) &&
    event.seats >= 1
  );
}

function loadEvents() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    if (Array.isArray(saved)) {
      const seen = new Set();

      const uniqueId = (id) => {
        const valid =
          typeof id === 'string' &&
          /^[\w-]+$/.test(id) &&
          !seen.has(id);

        const finalId = valid
          ? id
          : newId();

        seen.add(finalId);

        return finalId;
      };

      events = saved
        .filter(isValidEvent)
        .map((event) => ({
          title: escapeStored(event.title),
          author: escapeStored(event.author),
          category: escapeStored(event.category),
          description: escapeStored(event.description),
          date: event.date,
          time: event.time,
          seats: event.seats,
          id: uniqueId(event.id)
        }));

      return;
    }
  } catch (error) {
  }

  events = SAMPLE_EVENTS.map((event) =>
    Object.fromEntries(
      Object.entries(event).map(([key, value]) => [
        key,
        typeof value === 'string'
          ? sanitizeInput(value)
          : value
      ])
    )
  );

  saveEvents();
}

function deleteEvent(id) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this event?'
  );

  if (!confirmed) {
    return;
  }

  const buttons = [
    ...grid.querySelectorAll('.btn-delete')
  ];

  const before = buttons.findIndex(
    (button) => button.dataset.id === id
  );

  events = events.filter(
    (event) => event.id !== id
  );

  saveEvents();

  renderEvents(
    filterEvents(searchInput.value)
  );

  showToast('Event deleted.');

  console.log(
    '[Analytics] User deleted a bookstore event'
  );

  const remaining =
    grid.querySelectorAll('.btn-delete');

  const nextButton =
    remaining[
      Math.min(
        before,
        remaining.length - 1
      )
    ];

  (nextButton || searchInput).focus();
}

function showToast(message) {
  toastEl.textContent = message;

  toastEl.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 4000);
}

function addEvent() {
  const data = Object.fromEntries(
    FIELDS.map((name) => [
      name,
      sanitizeInput($(name).value)
    ])
  );

  data.seats = Number(data.seats);
  data.id = newId();

  events.unshift(data);

  saveEvents();

  form.reset();
  searchInput.value = '';

  renderEvents(events);

  showToast(
    'Event added successfully.'
  );

  console.log(
    '[Analytics] User interacted with Independent Bookstore Events Page'
  );
}

const THEME_KEY = 'bookstoreTheme';

function applyTheme(theme) {
  const dark = theme === 'dark';

  document.documentElement.dataset.theme =
    dark ? 'dark' : 'light';

  $('theme-icon').textContent =
    dark ? '\u263E' : '\u2600';

  $('theme-label').textContent =
    dark ? 'Dark Mode' : 'Light Mode';

  themeBtn.setAttribute(
    'aria-label',
    dark
      ? 'Dark Mode active. Switch to Light Mode'
      : 'Light Mode active. Switch to Dark Mode'
  );
}

function loadTheme() {
  let theme = 'light';

  try {
    if (
      localStorage.getItem(THEME_KEY) === 'dark'
    ) {
      theme = 'dark';
    }
  } catch (error) {
  }

  applyTheme(theme);
}

function toggleTheme() {
  const next =
    document.documentElement.dataset.theme === 'dark'
      ? 'light'
      : 'dark';

  applyTheme(next);

  try {
    localStorage.setItem(
      THEME_KEY,
      next
    );
  } catch (error) {
    console.warn(
      'Could not save theme:',
      error
    );
  }
}

function init() {
  loadTheme();

  themeBtn.addEventListener(
    'click',
    toggleTheme
  );

  $('today-date').textContent =
    new Date().toLocaleDateString(
      'en-IN',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    );

  $('category').innerHTML =
    '<option value="">Select a category</option>' +
    CATEGORIES
      .map(
        (category) => `
          <option value="${sanitizeInput(category)}">
            ${sanitizeInput(category)}
          </option>
        `
      )
      .join('');

  searchInput.addEventListener(
    'input',
    () => {
      renderEvents(
        filterEvents(searchInput.value)
      );
    }
  );

  grid.addEventListener(
    'click',
    (event) => {
      const button =
        event.target.closest('.btn-delete');

      if (button) {
        deleteEvent(
          button.dataset.id
        );
      }
    }
  );

  form.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();

      if (validateForm()) {
        addEvent();
      }
    }
  );

  FIELDS.forEach((name) => {
    $(name).addEventListener(
      'input',
      () => {
        setError(name, '');
      }
    );
  });

  showLoadingState();

  setTimeout(() => {
    loadEvents();

    renderEvents(
      filterEvents(searchInput.value)
    );
  }, LOADING_MS);
}

document.addEventListener(
  'DOMContentLoaded',
  init
);
