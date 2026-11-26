'use strict';
const zones = [
  ['Asia/Seoul', '대한민국', '서울', 'Seoul'],
  ['Asia/Tokyo', '일본', '도쿄', 'Tokyo'],
  ['Asia/Shanghai', '중국', '상하이', 'Shanghai'],
  ['Asia/Taipei', '대만', '타이베이', 'Taipei'],
  ['Asia/Singapore', '싱가포르', '싱가포르', 'Singapore'],
  ['Asia/Bangkok', '태국', '방콕', 'Bangkok'],
  ['Asia/Kolkata', '인도', '콜카타', 'Kolkata'],
  ['Asia/Dubai', '아랍에미리트', '두바이', 'Dubai'],
  ['Europe/London', '영국', '런던', 'London'],
  ['Europe/Paris', '프랑스', '파리', 'Paris'],
  ['Europe/Berlin', '독일', '베를린', 'Berlin'],
  ['America/New_York', '미국', '뉴욕', 'New York'],
  ['America/Chicago', '미국', '시카고', 'Chicago'],
  ['America/Denver', '미국', '덴버', 'Denver'],
  ['America/Los_Angeles', '미국', '로스앤젤레스', 'Los Angeles'],
  ['America/Vancouver', '캐나다', '밴쿠버', 'Vancouver'],
  ['America/Toronto', '캐나다', '토론토', 'Toronto'],
  ['America/Sao_Paulo', '브라질', '상파울루', 'São Paulo'],
  ['Pacific/Honolulu', '미국', '호놀룰루', 'Honolulu'],
  ['Australia/Sydney', '호주', '시드니', 'Sydney'],
  ['Australia/Perth', '호주', '퍼스', 'Perth'],
  ['Pacific/Auckland', '뉴질랜드', '오클랜드', 'Auckland'],
  ['Africa/Johannesburg', '남아프리카공화국', '요하네스버그', 'Johannesburg'],
];
const $ = (s) => document.querySelector(s),
  desktop = $('#desktop'),
  dialog = $('#settings');
const key = 'little-world-v1';
const compactLayout = matchMedia('(max-width:640px)');
const defaultWidth = 296;
const defaultSceneHeight = 222;
const maxSceneHeight = 650;
let clocks = [],
  editing = null,
  photoData = '',
  topZ = 1,
  toastTimer;
const elements = new Map();
function notify(message) {
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($('#toast').hidden = true), 3500);
}
function save() {
  try {
    localStorage.setItem(key, JSON.stringify(clocks));
    $('#saved').textContent = '이 브라우저에 저장됨';
  } catch {
    $('#saved').textContent = '저장 실패';
    notify(
      '저장 공간이 부족하거나 저장이 차단됐어요. 사진을 줄이거나 브라우저 설정을 확인해 주세요.',
    );
  }
}
function sample() {
  return [
    {
      id: crypto.randomUUID(),
      zone: 'Asia/Seoul',
      name: '민지',
      message: '좋은날',
      photo: '',
      x: 54,
      y: 43,
    },
    {
      id: crypto.randomUUID(),
      zone: 'Europe/London',
      name: '수진',
      message: '영화보고싶다',
      photo: '',
      x: 410,
      y: 112,
    },
    {
      id: crypto.randomUUID(),
      zone: 'America/New_York',
      name: '준',
      message: '과제너무많아,,',
      photo: '',
      x: 765,
      y: 55,
    },
  ];
}
try {
  const raw = localStorage.getItem(key);
  clocks = raw === null ? sample() : JSON.parse(raw);
  if (!Array.isArray(clocks)) throw Error();
  clocks = clocks
    .filter(
      (c) =>
        c &&
        typeof c.id === 'string' &&
        zones.some((z) => z[0] === c.zone) &&
        typeof c.name === 'string',
    )
    .map((c) => ({
      ...c,
      message: typeof c.message === 'string' ? c.message.slice(0, 60) : '',
      photo:
        typeof c.photo === 'string' &&
        /^data:image\/(jpeg|png|webp|gif);base64,/.test(c.photo)
          ? c.photo
          : '',
      x: Number.isFinite(c.x) ? c.x : 20,
      y: Number.isFinite(c.y) ? c.y : 20,
      width: Number.isFinite(c.width)
        ? Math.max(defaultWidth, c.width)
        : defaultWidth,
      sceneHeight: Number.isFinite(c.sceneHeight)
        ? Math.max(defaultSceneHeight, Math.min(maxSceneHeight, c.sceneHeight))
        : defaultSceneHeight,
    }));
} catch {
  clocks = sample();
  notify('저장한 설정을 읽지 못해 예시 시계를 열었어요.');
}
const landscape = `
  <svg class="landscape" viewBox="0 0 140 110" preserveAspectRatio="none" aria-hidden="true" shape-rendering="crispEdges">
    <path class="cloud" d="M0 22h8v-4h19v4h10v5H0zM78 13h9V9h21v4h13v5H78zM112 36h14v-4h14v10h-28z"/>
    <path class="stars" d="M15 9h2v2h-2zM58 18h2v2h-2zM104 41h2v2h-2zM72 5h2v2h-2z"/>
    <path class="sun" d="M119 8h6v3h3v6h-3v3h-6v-3h-3v-6h3z"/>
    <path class="moon-cut" d="M123 5h8v14h-8v-3h-3V8h3z"/>
    <path class="hill" d="M0 65h13v-4h15v-4h18v3h16v5h19v5h20v8h22v6h17v26H0z"/>
    <path class="hill2" d="M0 95h20v-4h18v-5h20v-7h20v-5h24v-3h20v4h18v35H0z"/>
  </svg>
`;
function cat() {
  return `
    <svg viewBox="0 0 32 32" role="img" aria-label="기본 고양이 캐릭터" shape-rendering="crispEdges">
      <rect width="32" height="32" fill="#f2e7ce"/>
      <path d="M6 7h5v4h10V7h5v18h-3v3H9v-3H6z" fill="#fffdf1"/>
      <path d="M8 9h2v5H8zm14 0h2v5h-2z" fill="#e6b4a7"/>
      <path d="M10 17h3v3h-3zm9 0h3v3h-3zM15 22h3v2h-3z" fill="#394333"/>
      <path d="M6 22h5v2H6zm15 0h5v2h-5z" fill="#e6b4a7"/>
    </svg>
  `;
}
function getParts(zone, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  return Object.fromEntries(parts.map((p) => [p.type, p.value]));
}
function update() {
  const now = new Date();
  $('#local-date').textContent = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  for (const c of clocks) {
    const el = elements.get(c.id);
    if (!el) continue;
    const p = getParts(c.zone, now),
      night = +p.hour < 6 || +p.hour >= 18;
    el.querySelector('.time').textContent = `${p.hour}:${p.minute}`;
    el.querySelector('.date').textContent = new Intl.DateTimeFormat('ko-KR', {
      timeZone: c.zone,
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }).format(now);
    el.querySelector('.scene').classList.toggle('night', night);
    el.querySelector('.scene-label').textContent = night ? '밤' : '낮';
    el.querySelector('.scene-label').style.color = night ? '#fff' : '#000';
    el.querySelector('.scene-label').style.textShadow = night
      ? '1px 1px 2px #000'
      : '1px 1px 2px #fff';
  }
}
function focusWindow(el) {
  document
    .querySelectorAll('.clock-window')
    .forEach((n) => n.classList.remove('active'));
  el.classList.add('active');
  el.style.zIndex = ++topZ;
}
function widthLimit() {
  const padding = compactLayout.matches ? 20 : 4;
  return Math.max(1, desktop.clientWidth - padding);
}
function applySize(c, el) {
  const width = Math.min(c.width ?? defaultWidth, widthLimit());
  const sceneHeight = c.sceneHeight ?? defaultSceneHeight;
  const contentScale = Math.min(
    width / defaultWidth,
    sceneHeight / defaultSceneHeight,
  );
  el.style.width = width + 'px';
  el.style.setProperty('--scene-height', sceneHeight + 'px');
  el.style.setProperty('--clock-unit', contentScale + 'px');
}
function clamp(c, el) {
  if (compactLayout.matches) return;
  c.x = Math.max(0, Math.min(c.x, widthLimit() - el.offsetWidth));
  c.y = Math.max(0, Math.min(c.y, desktop.clientHeight - el.offsetHeight - 5));
}
function positionWindow(c, el) {
  clamp(c, el);
  el.style.left = c.x + 'px';
  el.style.top = c.y + 'px';
}
function fitDesktop() {
  if (compactLayout.matches) {
    desktop.style.minHeight = '';
    return;
  }
  const bottom = Math.max(
    desktop.clientWidth < 1000 ? 780 : 510,
    ...clocks.map((c) => c.y + elements.get(c.id).offsetHeight + 30),
  );
  desktop.style.minHeight = bottom + 'px';
}
function bindResize(c, el) {
  const handle = el.querySelector('.resize-handle');
  function resize(width, sceneHeight, left = c.x) {
    c.width = Math.min(widthLimit(), Math.max(defaultWidth, width));
    c.sceneHeight = Math.min(
      maxSceneHeight,
      Math.max(defaultSceneHeight, sceneHeight),
    );
    applySize(c, el);
    if (!compactLayout.matches) c.x = left;
    fitDesktop();
    positionWindow(c, el);
  }
  handle.onkeydown = (e) => {
    const dx = e.key === 'ArrowRight' ? 10 : e.key === 'ArrowLeft' ? -10 : 0;
    const dy = e.key === 'ArrowDown' ? 10 : e.key === 'ArrowUp' ? -10 : 0;
    if (!dx && !dy) return;
    e.preventDefault();
    focusWindow(el);
    resize(el.offsetWidth + dx, (c.sceneHeight ?? defaultSceneHeight) + dy);
    save();
  };
  let drag;
  handle.onpointerdown = (e) => {
    if (e.button !== 0 || drag) return;
    e.preventDefault();
    handle.focus({ preventScroll: true });
    drag = {
      id: e.pointerId,
      x: e.pageX,
      y: e.pageY,
      width: el.offsetWidth,
      left: c.x,
      height: c.sceneHeight ?? defaultSceneHeight,
      changed: false,
    };
    handle.setPointerCapture(e.pointerId);
  };
  handle.onpointermove = (e) => {
    if (e.pointerId !== drag?.id) return;
    const dx = e.pageX - drag.x;
    const dy = e.pageY - drag.y;
    if (!dx && !dy && !drag.changed) return;
    resize(drag.width + dx, drag.height + dy, drag.left);
    drag.changed = true;
  };
  const end = (e) => {
    if (e.pointerId !== drag?.id) return;
    if (drag.changed) save();
    drag = null;
  };
  handle.onpointerup = handle.onpointercancel = handle.onlostpointercapture = end;
}
function render() {
  elements.forEach((el) => el.remove());
  elements.clear();
  $('#empty').hidden = clocks.length > 0;
  for (const c of clocks) {
    const z = zones.find((z) => z[0] === c.zone);
    const el = document.createElement('article');
    el.className = 'clock-window';
    applySize(c, el);
    el.setAttribute('aria-label', c.name + '의 시계');
    el.innerHTML = `
      <div class="titlebar" tabindex="0" aria-label="창 이동: 방향키 또는 드래그">
        <span></span>
        <button type="button" aria-label="시계 삭제">×</button>
      </div>
      <div class="window-menu">
        <span></span>
        <button type="button">설정</button>
      </div>
      <div class="scene">
        ${landscape}
        <div class="time-panel">
          <div class="time"></div>
          <div class="date"></div>
        </div>
        <div class="avatar"></div>
        <div class="bubble"></div>
        <span class="scene-label"></span>
      </div>
      <form class="status-form">
        <input maxlength="60" aria-label="상태 메시지" placeholder="상태메세지 남기기">
        <button>등록</button>
        <button type="button" class="resize-handle" aria-label="창 크기 조절: 드래그 또는 방향키" title="드래그해서 창 크기 조절"></button>
      </form>
    `;
    el.querySelector('.titlebar span').textContent = z[1] + ' · ' + c.name;
    el.querySelector('.window-menu span').textContent = z[3] + ' / ' + z[2];
    el.querySelector('.bubble').textContent =
      c.message || '안부를 남겨 주세요!';
    if (c.photo) {
      const img = new Image();
      img.src = c.photo;
      img.alt = c.name + '의 사진';
      el.querySelector('.avatar').append(img);
    } else el.querySelector('.avatar').innerHTML = cat();
    el.querySelector('.titlebar button').onclick = () => {
      clocks = clocks.filter((x) => x.id !== c.id);
      save();
      render();
      notify('시계를 삭제했어요.');
      $('#add').focus();
    };
    el.querySelector('.window-menu button').onclick = () => openSettings(c);
    el.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      const input = el.querySelector('.status-form input');
      c.message = input.value.trim();
      el.querySelector('.bubble').textContent =
        c.message || '메세지를 남겨 주세요!';
      input.value = '';
      save();
      notify('메세지를 저장했어요.');
    };
    el.addEventListener('pointerdown', () => focusWindow(el));
    const bar = el.querySelector('.titlebar');
    bar.onkeydown = (e) => {
      const moves = {
        ArrowLeft: [-10, 0],
        ArrowRight: [10, 0],
        ArrowUp: [0, -10],
        ArrowDown: [0, 10],
      };
      if (
        e.target !== bar ||
        !moves[e.key] ||
        compactLayout.matches
      )
        return;
      e.preventDefault();
      c.x += moves[e.key][0];
      c.y += moves[e.key][1];
      positionWindow(c, el);
      save();
    };
    bar.onpointerdown = (e) => {
      if (
        e.target.closest('button') ||
        e.button !== 0 ||
        compactLayout.matches
      )
        return;
      e.preventDefault();
      focusWindow(el);
      const startX = e.clientX,
        startY = e.clientY,
        oldX = c.x,
        oldY = c.y;
      bar.setPointerCapture(e.pointerId);
      bar.onpointermove = (ev) => {
        c.x = oldX + ev.clientX - startX;
        c.y = oldY + ev.clientY - startY;
        positionWindow(c, el);
      };
      const end = () => {
        bar.onpointermove = null;
        bar.onpointerup = null;
        bar.onpointercancel = null;
        save();
      };
      bar.onpointerup = end;
      bar.onpointercancel = end;
    };
    desktop.append(el);
    elements.set(c.id, el);
    bindResize(c, el);
  }
  fitDesktop();
  for (const c of clocks) positionWindow(c, elements.get(c.id));
  update();
}
for (const z of zones) {
  const option = document.createElement('option');
  option.value = z[0];
  option.textContent = z[1] + ' — ' + z[2];
  $('#zone').append(option);
}
function openSettings(c = null) {
  editing = c;
  photoData = c?.photo || '';
  $('#settings-form').reset();
  $('#form-error').textContent = '';
  $('#zone').value = c?.zone || 'Asia/Seoul';
  $('#nickname').value = c?.name || '';
  $('#message').value = c?.message || '';
  $('#photo-state').textContent = photoData
    ? '등록된 사진이 있어요. 새 사진을 선택하면 교체돼요.'
    : '';
  $('#dialog-title').textContent = c ? '시계 설정' : '새로운 시계 만들기';
  $('#submit').textContent = c ? '변경 저장' : '시계 만들기';
  dialog.showModal();
}
$('#add').onclick = () => openSettings();
$('#empty-add').onclick = () => openSettings();
$('#close').onclick = $('#cancel').onclick = () => dialog.close();
let uploadVersion = 0;
$('#photo').onchange = async (e) => {
  const file = e.target.files[0],
    version = ++uploadVersion;
  if (!file) return;
  if (
    file.size > 5 * 1024 * 1024 ||
    !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)
  ) {
    $('#form-error').textContent =
      '5MB 이하의 JPG, PNG, WEBP, GIF 파일을 선택해 주세요.';
    e.target.value = '';
    return;
  }
  $('#submit').disabled = true;
  $('#form-error').textContent = '';
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 320 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext('2d')
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    if (version === uploadVersion) {
      photoData = canvas.toDataURL('image/jpeg', 0.85);
      $('#photo-state').textContent = '사진 준비 완료';
    }
  } catch {
    $('#form-error').textContent =
      '사진을 읽지 못했어요. 다른 파일을 선택해 주세요.';
  } finally {
    if (version === uploadVersion) $('#submit').disabled = false;
  }
};
$('#settings-form').onsubmit = (e) => {
  e.preventDefault();
  const name = $('#nickname').value.trim();
  if (!name) {
    $('#nickname').setCustomValidity('닉네임을 입력해 주세요.');
    $('#nickname').reportValidity();
    return;
  }
  const data = {
    name,
    zone: $('#zone').value,
    message: $('#message').value.trim(),
    photo: photoData,
  };
  if (editing) Object.assign(editing, data);
  else {
    clocks.push({
      id: crypto.randomUUID(),
      ...data,
      x: 30 + (clocks.length % 4) * 55,
      y: 35 + (clocks.length % 4) * 40,
    });
  }
  save();
  render();
  dialog.close();
  notify(editing ? '시계 설정을 변경했어요.' : '새로운 시계를 만들었어요.');
};
$('#nickname').oninput = () => $('#nickname').setCustomValidity('');
dialog.addEventListener('close', () => {
  uploadVersion++;
  $('#submit').disabled = false;
});
window.addEventListener('resize', () => {
  for (const c of clocks) applySize(c, elements.get(c.id));
  fitDesktop();
  for (const c of clocks) positionWindow(c, elements.get(c.id));
});
if (desktop.clientWidth < 1000 && clocks.length === 3 && clocks[2].x === 765) {
  clocks[2].x = 100;
  clocks[2].y = 420;
}
render();
setInterval(update, 1000);
