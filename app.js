/* ============================================================
   Канбан · Яндекс Лавка
   Данные хранятся в localStorage этого браузера.
   ============================================================ */

const STORAGE_KEY = 'lavka-kanban-v1';

/* ---------- Справочники ---------- */

const GROUPS = {
  mp: { name: '🧮 Медиаплан', cls: 'group-mp' },
  rk: { name: '🚀 Рекламная кампания', cls: 'group-rk' },
  ar: { name: '🗂 Архив', cls: 'group-ar' },
};

const COLUMNS = [
  { id: 'l1',        group: 'mp', emoji: '📥', title: 'L1 · Новые запросы',    hint: 'Принят запрос на расчёт МП — уточняем вводные' },
  { id: 'mp-calc',   group: 'mp', emoji: '🧮', title: 'Расчёт МП',             hint: 'Считаем медиаплан' },
  { id: 'mp-front',  group: 'mp', emoji: '📨', title: 'МП у фронтов',          hint: 'Отправлен фронтам, ждём ответ заказчика' },
  { id: 'mp-edits',  group: 'mp', emoji: '✏️', title: 'Правки МП',             hint: 'Вернули с правками — пересчитываем' },
  { id: 'mp-done',   group: 'mp', emoji: '✅', title: 'МП согласован',         hint: 'Ждём заявку на РК (может не дойти до запуска)' },
  { id: 'rk-check',  group: 'rk', emoji: '📋', title: 'Проверка заявки',       hint: 'Проверяем: брони, креативы, пиксели, тексты' },
  { id: 'rk-fix',    group: 'rk', emoji: '🔁', title: 'Заявка на доработке',   hint: 'Вернули фронтам — ждём исправления' },
  { id: 'rk-setup',  group: 'rk', emoji: '🛠️', title: 'Заведение РК',          hint: 'Заводим кампанию в кабинете площадки' },
  { id: 'rk-mod',    group: 'rk', emoji: '🛡️', title: 'Модерация',             hint: 'Ждём решение площадки' },
  { id: 'rk-modfix', group: 'rk', emoji: '🚫', title: 'Правки по модерации',   hint: 'Не прошли — фронтам с комментариями площадки' },
  { id: 'rk-launch', group: 'rk', emoji: '🚀', title: 'Запуск · Скрины',       hint: 'Скрины: баннер, посадочная, календарь → фронтам' },
  { id: 'rk-run',    group: 'rk', emoji: '📊', title: 'Ведение · Отчёты',      hint: 'Еженедельные отчёты, корректировки открутки и частоты' },
  { id: 'rk-final',  group: 'rk', emoji: '🏁', title: 'Финальная статистика',  hint: 'Финальный отчёт по завершении РК' },
  { id: 'done',      group: 'ar', emoji: '✔️', title: 'Завершено',             hint: 'Сделано и отправлено' },
];

const PLATFORMS = [
  { id: 'ozon',      name: 'Озон',            cls: 'pf-ozon' },
  { id: 'wb',        name: 'WB',              cls: 'pf-wb' },
  { id: 'ue-market', name: 'УЭ · Маркет',     cls: 'pf-ue-market' },
  { id: 'ue-lavka',  name: 'УЭ · Лавка',      cls: 'pf-ue-lavka' },
  { id: 'ue-go',     name: 'УЭ · Го',         cls: 'pf-ue-go' },
  { id: 'ue-eda',    name: 'УЭ · Еда',        cls: 'pf-ue-eda' },
  { id: 'other',     name: 'Другая',          cls: 'pf-other' },
];

/* Чек-листы этапов: добавляются автоматически при попадании карточки в колонку
   (и вручную кнопкой «Чек-лист этапа») */
const TEMPLATES = {
  'l1': [
    'Зафиксировать вводные: бюджет, период, гео',
    'Уточнить форматы и площадки',
    'Уточнить дедлайн по МП',
  ],
  'mp-calc': [
    'Собрать бенчмарки / прогнозатор площадки',
    'Просчитать медиаплан',
    'Самопроверка: бюджет, охваты, единицы измерения',
    'Отправить МП фронтам',
  ],
  'rk-check': [
    'Брони прописаны',
    'Креативы приложены и соответствуют спекам площадки',
    'Пиксели прописаны',
    'Тексты приложены',
    'Даты, гео и бюджет сходятся с согласованным МП',
  ],
  'rk-setup': [
    'Создать кампанию в кабинете площадки',
    'Загрузить креативы',
    'Прописать пиксели и UTM',
    'Настроить таргетинги и гео',
    'Выставить бюджет и ставки',
    'Проверить календарь / расписание показов',
    'Отправить на модерацию',
  ],
  'rk-modfix': [
    'Зафиксировать комментарии площадки',
    'Отправить фронтам на правки',
    'Получить исправленные материалы',
    'Перезалить и снова отправить на модерацию',
  ],
  'rk-launch': [
    'Скрин баннера на площадке',
    'Скрин перехода на посадочную',
    'Скрин календаря',
    'Отправить скрины фронтам',
  ],
  'rk-run': [
    'Настроить доступ к статистике кабинета',
  ],
  'rk-final': [
    'Выгрузить финальную статистику',
    'Сверить открутку с планом и бюджетом',
    'Собрать финальный отчёт',
    'Отправить фронтам',
  ],
};

/* Пункты еженедельного отчёта — генерятся кнопкой «Отчёты по неделям» */
const WEEKLY_ITEMS = ['выгрузка', '% выполнения', 'открутка/частота', 'отправить фронтам'];

/* ---------- Состояние ---------- */

let state = { cards: [] };
let filters = { search: '', type: '', platform: '', month: '', urgent: false };
let editingId = null;        // id карточки в модалке (null = новая)
let draftChecklist = [];     // чек-лист, редактируемый в модалке
let draftPlatforms = [];     // выбранные площадки в модалке

const $ = (sel) => document.querySelector(sel);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------- Хранение ---------- */

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { state = JSON.parse(raw); return; }
  } catch (e) { /* повреждённые данные — начинаем заново */ }
  state = { cards: seedCards() };
  save();
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { toast('⚠️ Не удалось сохранить данные'); }
}

/* ---------- Утилиты дат ---------- */

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function monthShift(ym, delta) { // '2026-09' + 1 -> '2026-10'
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function currentMonth() { return todayISO().slice(0, 7); }

const MONTH_NAMES = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function monthLabel(ym) {
  if (!ym) return '';
  const [y, m] = ym.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${String(y).slice(2)}`;
}

function fmtDM(d) { return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`; }

/* Недели месяца (пн–вс), обрезанные границами месяца */
function weeksOfMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const weeks = [];
  let start = new Date(first);
  while (start <= last) {
    const end = new Date(start);
    end.setDate(end.getDate() + (7 - ((end.getDay() + 6) % 7)) - 1); // ближайшее воскресенье
    const realEnd = end > last ? last : end;
    weeks.push([new Date(start), new Date(realEnd)]);
    start = new Date(realEnd);
    start.setDate(start.getDate() + 1);
  }
  return weeks;
}

function deadlineInfo(dl) {
  if (!dl) return null;
  const today = new Date(todayISO());
  const d = new Date(dl);
  const diff = Math.round((d - today) / 86400000);
  if (diff < 0)  return { cls: 'meta-deadline-overdue', label: `⚠ просрочен ${fmtDM(d)}` };
  if (diff === 0) return { cls: 'meta-deadline-today', label: '⏰ сегодня' };
  if (diff === 1) return { cls: 'meta-deadline-soon', label: '⏳ завтра' };
  if (diff <= 3) return { cls: 'meta-deadline-soon', label: `⏳ ${fmtDM(d)}` };
  return { cls: '', label: `📅 ${fmtDM(d)}` };
}

/* ---------- Демо-данные ---------- */

function seedCards() {
  const m0 = currentMonth();
  const mNext = monthShift(m0, 1);
  const mPrev = monthShift(m0, -1);
  const day = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const cl = (items, doneCount = 0) => items.map((text, i) => ({ id: uid(), text, done: i < doneCount }));

  return [
    {
      id: uid(), column: 'l1', type: 'МП', title: 'Промо Лавки — баннеры на главной',
      platforms: ['ozon'], month: mNext, deadline: day(2), request: '', budget: '',
      split: '', urgent: false, links: '', notes: 'Вводные от фронтов в письме. Уточнить гео и точный бюджет.',
      checklist: cl(TEMPLATES['l1']),
    },
    {
      id: uid(), column: 'mp-calc', type: 'МП', title: 'МП: промо доставки за 15 минут',
      platforms: ['wb'], month: monthShift(m0, 2), deadline: day(1), request: '', budget: '2 000 000 ₽',
      split: '', urgent: false, links: '', notes: '',
      checklist: cl(TEMPLATES['mp-calc'], 1),
    },
    {
      id: uid(), column: 'mp-front', type: 'МП', title: 'МП: перфоманс-сплит Маркет + Еда',
      platforms: ['ue-market', 'ue-eda'], month: mNext, deadline: '', request: '', budget: '3 500 000 ₽',
      split: '', urgent: false, links: '', notes: 'Отправлен фронтам, ждём ответ заказчика.',
      checklist: cl(TEMPLATES['mp-calc'], 4),
    },
    {
      id: uid(), column: 'mp-edits', type: 'МП', title: 'МП: спецразмещение — пересчёт бюджета',
      platforms: ['ozon'], month: mNext, deadline: day(0), request: '', budget: 'было 1,5 млн → −20%',
      split: '', urgent: true, links: '', notes: 'Фронты просят пересчитать под сниженный бюджет.',
      checklist: [],
    },
    {
      id: uid(), column: 'rk-check', type: 'РК', title: 'РК: баннеры в приложении Лавки',
      platforms: ['ue-lavka'], month: mNext, deadline: day(1), request: 'LAVKA-SEP', budget: '900 000 ₽',
      split: '', urgent: false, links: '', notes: '',
      checklist: cl(TEMPLATES['rk-check'], 2),
    },
    {
      id: uid(), column: 'rk-setup', type: 'РК', title: 'РК: баннеры на главной — сплит Мск',
      platforms: ['ozon'], month: mNext, deadline: day(3), request: 'OZN-SEP', budget: '600 000 ₽',
      split: 'ГЕО: Москва', urgent: false, links: '', notes: 'Второй сплит этого же запроса — на модерации.',
      checklist: cl(TEMPLATES['rk-setup'], 3),
    },
    {
      id: uid(), column: 'rk-mod', type: 'РК', title: 'РК: баннеры на главной — сплит Регионы',
      platforms: ['ozon'], month: mNext, deadline: '', request: 'OZN-SEP', budget: '400 000 ₽',
      split: 'ГЕО: Регионы', urgent: false, links: '', notes: 'На модерации со вчерашнего дня.',
      checklist: cl(TEMPLATES['rk-setup'], 7),
    },
    {
      id: uid(), column: 'rk-launch', type: 'РК', title: 'РК: промо-полка + баннер',
      platforms: ['wb'], month: m0, deadline: day(0), request: 'WB-AUG', budget: '1 100 000 ₽',
      split: '', urgent: true, links: '', notes: 'Запустилась вчера вечером — сегодня отправить скрины.',
      checklist: cl(TEMPLATES['rk-launch'], 1),
    },
    {
      id: uid(), column: 'rk-run', type: 'РК', title: 'РК: баннеры Го — водители и пассажиры',
      platforms: ['ue-go'], month: m0, deadline: '', request: 'GO-AUG', budget: '750 000 ₽',
      split: '', urgent: false, links: '', notes: 'На прошлой неделе открутка 78% плана — подняли ставки, следим.',
      checklist: weeksOfMonth(m0).map(([s, e], i) => ({
        id: uid(),
        text: `Отчёт W${i + 1} (${fmtDM(s)}–${fmtDM(e)}): ${WEEKLY_ITEMS.join(', ')}`,
        done: e < new Date(todayISO()),
      })),
    },
    {
      id: uid(), column: 'rk-final', type: 'РК', title: 'РК: промо Еды в выходные',
      platforms: ['ue-eda'], month: mPrev, deadline: day(1), request: '', budget: '500 000 ₽',
      split: '', urgent: false, links: '', notes: '',
      checklist: cl(TEMPLATES['rk-final'], 2),
    },
    {
      id: uid(), column: 'done', type: 'РК', title: 'РК: спецразмещение к распродаже',
      platforms: ['ozon'], month: mPrev, deadline: '', request: '', budget: '',
      split: '', urgent: false, links: '', notes: 'Финстата отправлена, кампания закрыта.',
      checklist: [],
    },
  ];
}

/* ---------- Рендер доски ---------- */

function cardMatchesFilters(c) {
  if (filters.type && c.type !== filters.type) return false;
  if (filters.platform && !(c.platforms || []).includes(filters.platform)) return false;
  if (filters.month && c.month !== filters.month) return false;
  if (filters.urgent && !c.urgent) return false;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const hay = [c.title, c.notes, c.request, c.split, c.budget].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

/* Зоны доски: сверху — заведение и ведение РК (+ архив), снизу — расчёт МП */
const ZONES = [['rk', 'ar'], ['mp']];

function render() {
  const wrap = $('#board');
  wrap.innerHTML = '';

  ZONES.forEach(groupIds => {
    const cols = COLUMNS.filter(c => groupIds.includes(c.group));
    const zone = document.createElement('div');
    zone.className = 'board';
    zone.style.gridTemplateColumns = `repeat(${cols.length}, 272px)`;

    // Заголовки групп (строка 1 грида зоны)
    let colIndex = 1;
    for (const gid of groupIds) {
      const span = cols.filter(c => c.group === gid).length;
      const gh = document.createElement('div');
      gh.className = `group-head ${GROUPS[gid].cls}`;
      gh.style.gridColumn = `${colIndex} / span ${span}`;
      gh.innerHTML = `<span>${GROUPS[gid].name}</span><span class="group-line"></span>`;
      zone.appendChild(gh);
      colIndex += span;
    }

    // Колонки
    cols.forEach((col, i) => {
      const cards = state.cards.filter(c => c.column === col.id && cardMatchesFilters(c));
      const el = document.createElement('div');
      el.className = `column column-${col.group}`;
      el.style.gridColumn = String(i + 1);
      el.dataset.column = col.id;
      el.innerHTML = `
        <div class="column-head">
          <div class="column-title"><span>${col.emoji}</span><span>${col.title}</span>
            <span class="column-count">${cards.length}</span></div>
          <div class="column-hint">${col.hint}</div>
        </div>
        <div class="column-body" data-column="${col.id}"></div>
        <button class="column-add" data-column="${col.id}">＋ добавить</button>
      `;
      const body = el.querySelector('.column-body');
      cards.forEach(c => body.appendChild(renderCard(c)));
      zone.appendChild(el);

      // DnD на колонку
      el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag-over'); });
      el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        if (id) moveCard(id, col.id);
      });
      el.querySelector('.column-add').addEventListener('click', () => openCardModal(null, col.id));
    });

    wrap.appendChild(zone);
  });

  renderMonthFilter();
}

function renderCard(c) {
  const el = document.createElement('div');
  el.className = 'card';
  el.draggable = true;
  el.dataset.id = c.id;

  const typeBadge = c.type === 'МП'
    ? '<span class="badge badge-type-mp">МП</span>'
    : '<span class="badge badge-type-rk">РК</span>';
  const pfBadges = (c.platforms || []).map(pid => {
    const p = PLATFORMS.find(x => x.id === pid);
    return p ? `<span class="pf ${p.cls}">${p.name}</span>` : '';
  }).join('');
  const fire = c.urgent ? '<span class="badge badge-fire">🔥 срочно</span>' : '';
  const month = c.month ? `<span class="badge badge-month">${monthLabel(c.month)}</span>` : '';

  const dl = deadlineInfo(c.deadline);
  const dlChip = dl ? `<span class="meta-chip ${dl.cls}">${dl.label}</span>` : '';

  let checkChip = '';
  if (c.checklist && c.checklist.length) {
    const done = c.checklist.filter(x => x.done).length;
    const pct = Math.round(done / c.checklist.length * 100);
    checkChip = `<span class="meta-chip meta-check ${done === c.checklist.length ? 'done' : ''}">
      ☑ ${done}/${c.checklist.length} <span class="bar"><i style="width:${pct}%"></i></span></span>`;
  }
  const reqChip = c.request ? `<span class="meta-chip">🔗 ${escapeHtml(c.request)}</span>` : '';
  const budgetChip = c.budget ? `<span class="meta-chip">💰 ${escapeHtml(c.budget)}</span>` : '';
  const notesIcon = c.notes ? '<span class="card-notes-icon">📝</span>' : '';

  el.innerHTML = `
    <div class="card-badges">${typeBadge}${fire}${month}${pfBadges}</div>
    <div class="card-title">${escapeHtml(c.title)}</div>
    ${c.split ? `<div class="card-split">◫ ${escapeHtml(c.split)}</div>` : ''}
    <div class="card-meta">${dlChip}${checkChip}${reqChip}${budgetChip}${notesIcon}</div>
  `;

  el.addEventListener('click', () => openCardModal(c.id));
  el.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', c.id);
    el.classList.add('dragging');
  });
  el.addEventListener('dragend', () => el.classList.remove('dragging'));
  return el;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

/* ---------- Перемещение + авто-чек-лист ---------- */

function moveCard(id, columnId) {
  const c = state.cards.find(x => x.id === id);
  if (!c || c.column === columnId) return;
  c.column = columnId;

  // авто-добавление чек-листа этапа (без дублей)
  const tpl = TEMPLATES[columnId];
  if (tpl) {
    const existing = new Set((c.checklist || []).map(i => i.text));
    const fresh = tpl.filter(t => !existing.has(t));
    if (fresh.length) {
      c.checklist = [...(c.checklist || []), ...fresh.map(t => ({ id: uid(), text: t, done: false }))];
      toast(`📋 Добавлен чек-лист этапа (${fresh.length} п.)`);
    }
  }
  save();
  render();
}

/* ---------- Модалка карточки ---------- */

function openCardModal(cardId, columnId = 'l1') {
  editingId = cardId;
  const c = cardId ? state.cards.find(x => x.id === cardId) : null;

  $('#modal-title').textContent = c ? 'Задача' : 'Новая задача';
  $('#c-title').value = c ? c.title : '';
  $('#c-type').value = c ? c.type : (COLUMNS.find(x => x.id === columnId)?.group === 'rk' ? 'РК' : 'МП');
  $('#c-month').value = c ? (c.month || '') : currentMonth();
  $('#c-deadline').value = c ? (c.deadline || '') : '';
  $('#c-request').value = c ? (c.request || '') : '';
  $('#c-budget').value = c ? (c.budget || '') : '';
  $('#c-split').value = c ? (c.split || '') : '';
  $('#c-notes').value = c ? (c.notes || '') : '';
  $('#c-links').value = c ? (c.links || '') : '';
  $('#c-urgent').checked = c ? !!c.urgent : false;

  // селект колонок
  const colSel = $('#c-column');
  colSel.innerHTML = COLUMNS.map(x =>
    `<option value="${x.id}">${x.emoji} ${x.title}</option>`).join('');
  colSel.value = c ? c.column : columnId;

  draftPlatforms = c ? [...(c.platforms || [])] : [];
  renderPlatformPicker();

  draftChecklist = c ? c.checklist.map(i => ({ ...i })) : [];
  renderChecklist();

  $('#btn-delete').style.display = c ? '' : 'none';
  $('#btn-duplicate').style.display = c ? '' : 'none';
  $('#btn-next-month').style.display = c ? '' : 'none';

  $('#card-modal').hidden = false;
  if (!c) $('#c-title').focus();
}

function closeCardModal() {
  $('#card-modal').hidden = true;
  editingId = null;
}

function renderPlatformPicker() {
  const wrap = $('#c-platforms');
  wrap.innerHTML = '';
  PLATFORMS.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pf-option' + (draftPlatforms.includes(p.id) ? ' selected' : '');
    b.textContent = p.name;
    b.addEventListener('click', () => {
      draftPlatforms = draftPlatforms.includes(p.id)
        ? draftPlatforms.filter(x => x !== p.id)
        : [...draftPlatforms, p.id];
      renderPlatformPicker();
    });
    wrap.appendChild(b);
  });
}

function renderChecklist() {
  const ul = $('#checklist');
  ul.innerHTML = '';
  draftChecklist.forEach(item => {
    const li = document.createElement('li');
    li.className = item.done ? 'done' : '';
    li.innerHTML = `
      <input type="checkbox" ${item.done ? 'checked' : ''}>
      <span class="cl-text">${escapeHtml(item.text)}</span>
      <button type="button" class="cl-del" title="Удалить пункт">✕</button>
    `;
    const toggle = () => { item.done = !item.done; renderChecklist(); };
    li.querySelector('input').addEventListener('change', toggle);
    li.querySelector('.cl-text').addEventListener('click', toggle);
    li.querySelector('.cl-del').addEventListener('click', () => {
      draftChecklist = draftChecklist.filter(x => x.id !== item.id);
      renderChecklist();
    });
    ul.appendChild(li);
  });
  const done = draftChecklist.filter(x => x.done).length;
  $('#checklist-progress').textContent = draftChecklist.length ? `${done}/${draftChecklist.length}` : '';
}

function collectForm() {
  return {
    title: $('#c-title').value.trim(),
    type: $('#c-type').value,
    column: $('#c-column').value,
    platforms: [...draftPlatforms],
    month: $('#c-month').value,
    deadline: $('#c-deadline').value,
    request: $('#c-request').value.trim(),
    budget: $('#c-budget').value.trim(),
    split: $('#c-split').value.trim(),
    notes: $('#c-notes').value,
    links: $('#c-links').value.trim(),
    urgent: $('#c-urgent').checked,
    checklist: draftChecklist,
  };
}

function saveCard() {
  const data = collectForm();
  if (!data.title) { $('#c-title').focus(); toast('⚠️ Укажи название задачи'); return; }

  if (editingId) {
    const c = state.cards.find(x => x.id === editingId);
    const movedTo = c.column !== data.column ? data.column : null;
    Object.assign(c, data);
    if (movedTo) {
      // тот же авто-чек-лист, что и при перетаскивании
      const tpl = TEMPLATES[movedTo];
      if (tpl) {
        const existing = new Set(c.checklist.map(i => i.text));
        const fresh = tpl.filter(t => !existing.has(t));
        if (fresh.length) c.checklist.push(...fresh.map(t => ({ id: uid(), text: t, done: false })));
      }
    }
  } else {
    state.cards.push({ id: uid(), ...data });
  }
  save();
  render();
  closeCardModal();
  toast('✅ Сохранено');
}

function deleteCard() {
  if (!editingId) return;
  if (!confirm('Удалить задачу безвозвратно?')) return;
  state.cards = state.cards.filter(x => x.id !== editingId);
  save();
  render();
  closeCardModal();
  toast('🗑 Задача удалена');
}

function duplicateCard(nextMonth = false) {
  if (!editingId) return;
  const data = collectForm(); // берём актуальное состояние формы
  const copy = { id: uid(), ...data };
  copy.checklist = data.checklist.map(i => ({ id: uid(), text: i.text, done: false }));
  if (nextMonth && copy.month) {
    copy.month = monthShift(copy.month, 1);
    copy.column = 'rk-check'; // новый месяц = новая заявка на заведение
    copy.deadline = '';
    copy.title = data.title;
    toast(`📆 Создана копия на ${monthLabel(copy.month)} — в «Проверке заявки»`);
  } else {
    copy.title = data.title + ' · копия';
    toast('⧉ Дубликат создан — задай сплит (гео/креатив)');
  }
  state.cards.push(copy);
  save();
  render();
  closeCardModal();
  openCardModal(copy.id);
}

/* Кнопка «Чек-лист этапа» в модалке */
function addTemplateChecklist() {
  const columnId = $('#c-column').value;
  const tpl = TEMPLATES[columnId];
  if (!tpl) { toast('Для этого этапа нет шаблона чек-листа'); return; }
  const existing = new Set(draftChecklist.map(i => i.text));
  const fresh = tpl.filter(t => !existing.has(t));
  if (!fresh.length) { toast('Чек-лист этапа уже добавлен'); return; }
  draftChecklist.push(...fresh.map(t => ({ id: uid(), text: t, done: false })));
  renderChecklist();
  toast(`📋 Добавлено пунктов: ${fresh.length}`);
}

/* Кнопка «Отчёты по неделям» */
function addWeeklyReports() {
  const ym = $('#c-month').value;
  if (!ym) { toast('Сначала укажи месяц РК'); $('#c-month').focus(); return; }
  const weeks = weeksOfMonth(ym);
  const existing = new Set(draftChecklist.map(i => i.text));
  let added = 0;
  weeks.forEach(([s, e], i) => {
    const text = `Отчёт W${i + 1} (${fmtDM(s)}–${fmtDM(e)}): ${WEEKLY_ITEMS.join(', ')}`;
    if (!existing.has(text)) { draftChecklist.push({ id: uid(), text, done: false }); added++; }
  });
  renderChecklist();
  toast(added ? `📅 Добавлено отчётов: ${added}` : 'Отчёты этого месяца уже в списке');
}

/* ---------- Фильтры ---------- */

function renderMonthFilter() {
  const sel = $('#f-month');
  const months = [...new Set(state.cards.map(c => c.month).filter(Boolean))].sort();
  const prev = sel.value;
  sel.innerHTML = '<option value="">Месяц: все</option>' +
    months.map(m => `<option value="${m}">${monthLabel(m)}</option>`).join('');
  if (months.includes(prev)) sel.value = prev;
}

function applyFilters() {
  filters.search = $('#f-search').value.trim();
  filters.type = $('#f-type').value;
  filters.platform = $('#f-platform').value;
  filters.month = $('#f-month').value;
  filters.urgent = $('#f-urgent').checked;
  const active = filters.search || filters.type || filters.platform || filters.month || filters.urgent;
  $('#f-reset').hidden = !active;
  render();
}

function resetFilters() {
  $('#f-search').value = '';
  $('#f-type').value = '';
  $('#f-platform').value = '';
  $('#f-month').value = '';
  $('#f-urgent').checked = false;
  applyFilters();
}

/* ---------- Экспорт / импорт ---------- */

function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `lavka-kanban-backup-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('⬇️ Бэкап скачан');
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.cards)) throw new Error('bad format');
      state = data;
      save();
      render();
      toast(`⬆️ Импортировано задач: ${state.cards.length}`);
    } catch (e) {
      toast('⚠️ Не удалось прочитать файл — это точно бэкап доски?');
    }
  };
  reader.readAsText(file);
}

/* ---------- Тосты ---------- */

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ---------- Инициализация ---------- */

function init() {
  load();

  // площадки в фильтр
  $('#f-platform').innerHTML = '<option value="">Площадка: все</option>' +
    PLATFORMS.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

  render();

  // шапка
  $('#btn-add').addEventListener('click', () => openCardModal(null, 'l1'));
  $('#btn-help').addEventListener('click', () => { $('#help-modal').hidden = false; });
  $('#help-close').addEventListener('click', () => { $('#help-modal').hidden = true; });

  $('#btn-menu').addEventListener('click', (e) => {
    e.stopPropagation();
    $('#menu').hidden = !$('#menu').hidden;
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-wrap')) $('#menu').hidden = true;
  });

  $('#btn-export').addEventListener('click', exportJSON);
  $('#btn-import').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', (e) => {
    if (e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = '';
  });
  $('#btn-clear-done').addEventListener('click', () => {
    const n = state.cards.filter(c => c.column === 'done').length;
    if (!n) { toast('В «Завершено» пусто'); return; }
    if (!confirm(`Удалить ${n} задач из «Завершено»?`)) return;
    state.cards = state.cards.filter(c => c.column !== 'done');
    save(); render();
    toast('🧹 Готово');
  });
  $('#btn-reset').addEventListener('click', () => {
    if (!confirm('Стереть ВСЕ задачи и вернуть демо-данные?')) return;
    state = { cards: seedCards() };
    save(); render();
    toast('♻️ Доска сброшена');
  });

  // фильтры
  ['#f-search', '#f-type', '#f-platform', '#f-month', '#f-urgent'].forEach(sel => {
    $(sel).addEventListener('input', applyFilters);
  });
  $('#f-reset').addEventListener('click', resetFilters);

  // модалка карточки
  $('#modal-close').addEventListener('click', closeCardModal);
  $('#btn-cancel').addEventListener('click', closeCardModal);
  $('#btn-save').addEventListener('click', saveCard);
  $('#btn-delete').addEventListener('click', deleteCard);
  $('#btn-duplicate').addEventListener('click', () => duplicateCard(false));
  $('#btn-next-month').addEventListener('click', () => duplicateCard(true));
  $('#btn-template').addEventListener('click', addTemplateChecklist);
  $('#btn-weekly').addEventListener('click', addWeeklyReports);
  $('#card-form').addEventListener('submit', (e) => { e.preventDefault(); saveCard(); });

  $('#checklist-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const text = e.target.value.trim();
      if (!text) return;
      draftChecklist.push({ id: uid(), text, done: false });
      e.target.value = '';
      renderChecklist();
    }
  });

  // закрытие модалок по клику на фон и по Esc
  ['#card-modal', '#help-modal'].forEach(sel => {
    $(sel).addEventListener('mousedown', (e) => {
      if (e.target === $(sel)) $(sel).hidden = true;
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { $('#card-modal').hidden = true; $('#help-modal').hidden = true; $('#menu').hidden = true; }
  });
}

init();
