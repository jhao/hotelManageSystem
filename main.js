const STORAGE_KEY = 'hotelAppData';
const LOGIN_PASSWORD = 'h123';

const NAV_ITEMS = [
  { id: 'dashboard', label: '仪表盘' },
  { id: 'personnel', label: '人员管理' },
  { id: 'rooms', label: '房间管理' },
  { id: 'cleaning', label: '房间打扫' },
  { id: 'linen', label: '布草管理' },
  { id: 'assets', label: '资产管理' },
  { id: 'users', label: '用户管理' },
  { id: 'system', label: '系统管理' },
];

const ROOM_STATUS = {
  available: { label: '可用', badge: 'badge--success' },
  occupied: { label: '入住', badge: 'badge--info' },
  cleaning: { label: '打扫中', badge: 'badge--warning' },
  maintenance: { label: '维修中', badge: 'badge--danger' },
};

const state = {
  data: loadData(),
  currentUser: null,
  activeView: 'dashboard',
};

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (err) {
      console.warn('无法解析保存的数据，使用示例数据', err);
    }
  }
  return generateSampleData();
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function generateSampleData() {
  const staff = [
    { id: crypto.randomUUID(), name: '爱丽丝', role: '保洁' },
    { id: crypto.randomUUID(), name: '鲍勃', role: '保洁' },
    { id: crypto.randomUUID(), name: '查理', role: '前台' },
    { id: crypto.randomUUID(), name: '戴安娜', role: '经理' },
    { id: crypto.randomUUID(), name: '伊桑', role: '维修' },
  ];

  const rooms = [];
  for (let floor = 1; floor <= 4; floor++) {
    for (let num = 1; num <= 8; num++) {
      rooms.push({
        id: crypto.randomUUID(),
        floor,
        roomNumber: `${floor}0${num}`,
        capacity: num % 3 === 0 ? 4 : 2,
        status: 'available',
        currentBookingId: null,
        bookingHistory: [],
      });
    }
  }

  const linens = ['枕套', '床单', '被套', '浴巾', '毛巾'].flatMap((name) =>
    Array.from({ length: 20 }, () => ({
      id: crypto.randomUUID(),
      name,
      price: Math.floor(Math.random() * 20) + 10,
      status: '库存',
    })),
  );

  const assets = rooms.flatMap((room) => [
    { name: '电视', category: '电子产品' },
    { name: '床架', category: '家具' },
    { name: '台灯', category: '家具' },
    { name: '迷你冰箱', category: '电子产品' },
  ].map((asset) => ({
    id: crypto.randomUUID(),
    name: asset.name,
    category: asset.category,
    location: `房间 ${room.roomNumber}`,
    purchaseDate: new Date(Date.now() - Math.random() * 500 * 24 * 3600 * 1000)
      .toISOString()
      .slice(0, 10),
    value: Math.floor(Math.random() * 600) + 200,
  })));

  const data = {
    staff,
    rooms,
    guests: [],
    bookings: [],
    cleaningLogs: [],
    linens,
    linenCleaningLogs: [],
    assets,
    users: [
      { id: 'user-admin', username: '管理员', role: '管理员' },
      { id: 'user-standard', username: '普通用户', role: '普通用户' },
    ],
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function setView(view) {
  state.activeView = view;
  render();
}

function logout() {
  state.currentUser = null;
  render();
}

function updateRoom(roomId, updater) {
  const index = state.data.rooms.findIndex((r) => r.id === roomId);
  if (index === -1) return;
  const updated = { ...state.data.rooms[index], ...updater(state.data.rooms[index]) };
  state.data.rooms.splice(index, 1, updated);
  saveData();
  render();
}

function checkIn(room) {
  openFormModal({
    title: `办理入住 - 房间 ${room.roomNumber}`,
    submitText: '确认入住',
    fields: [
      { name: 'name', label: '住客姓名', value: '', placeholder: '请输入住客姓名', required: true },
      { name: 'idNumber', label: '证件号码', value: '', placeholder: '请输入证件号', required: true },
      { name: 'phone', label: '联系电话', value: '', placeholder: '可选', required: false },
    ],
    onSubmit: ({ name, idNumber, phone }, close) => {
      if (!name || !idNumber) return alert('请填写必填信息');
      const guest = { id: crypto.randomUUID(), name, idNumber, phone: phone || '' };
      const booking = {
        id: crypto.randomUUID(),
        guestId: guest.id,
        roomId: room.id,
        checkIn: new Date().toISOString(),
        checkOut: null,
      };

      state.data.guests.push(guest);
      state.data.bookings.push(booking);
      updateRoom(room.id, () => ({
        status: 'occupied',
        currentBookingId: booking.id,
        bookingHistory: [...room.bookingHistory, booking.id],
      }));
      close();
    },
  });
}

function checkOut(room) {
  if (!room.currentBookingId) return;
  const confirmOut = confirm('确认要为该房间办理退房吗？');
  if (!confirmOut) return;
  state.data.bookings = state.data.bookings.map((booking) =>
    booking.id === room.currentBookingId ? { ...booking, checkOut: new Date().toISOString() } : booking,
  );
  state.data.cleaningLogs.push({
    id: crypto.randomUUID(),
    roomId: room.id,
    staffId: null,
    assignedDate: new Date().toISOString(),
    completedDate: null,
  });
  updateRoom(room.id, () => ({ status: 'cleaning', currentBookingId: null }));
}

function markClean(room) {
  state.data.cleaningLogs = state.data.cleaningLogs.map((log) =>
    log.roomId === room.id && !log.completedDate ? { ...log, completedDate: new Date().toISOString() } : log,
  );
  updateRoom(room.id, () => ({ status: 'available' }));
}

function toggleMaintenance(room) {
  const next = room.status === 'maintenance' ? 'available' : 'maintenance';
  updateRoom(room.id, () => ({ status: next }));
}

function assignCleaner(room) {
  const cleaners = state.data.staff.filter((member) => member.role === '保洁');
  if (!cleaners.length) return alert('当前没有可用的保洁人员');

  openFormModal({
    title: `指派保洁 - 房间 ${room.roomNumber}`,
    submitText: '指派',
    fields: [
      {
        name: 'staffId',
        label: '选择保洁员',
        type: 'select',
        options: cleaners.map((c) => ({ value: c.id, label: `${c.name}（${c.role}）` })),
        value: cleaners[0].id,
        required: true,
      },
    ],
    onSubmit: ({ staffId }, close) => {
      const staff = cleaners.find((c) => c.id === staffId);
      if (!staff) return alert('未找到匹配的保洁员');
      state.data.cleaningLogs.push({
        id: crypto.randomUUID(),
        roomId: room.id,
        staffId: staff.id,
        assignedDate: new Date().toISOString(),
        completedDate: null,
      });
      updateRoom(room.id, () => ({ status: 'cleaning' }));
      close();
    },
  });
}

function resetData() {
  state.data = generateSampleData();
  alert('示例数据重置成功');
  render();
}

function clearBusinessData() {
  state.data = {
    ...state.data,
    staff: [],
    rooms: [],
    guests: [],
    bookings: [],
    cleaningLogs: [],
    linens: [],
    linenCleaningLogs: [],
    assets: [],
  };
  saveData();
  render();
  alert('业务数据已清空，用户数据保留。');
}

function exportData() {
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hotel-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function createEl(tag, className, content) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (content !== undefined) el.innerHTML = content;
  return el;
}

function openFormModal({ title, fields, submitText = '保存', onSubmit }) {
  const overlay = createEl('div', 'modal-overlay');
  const modal = createEl('div', 'modal');

  const header = createEl('div', 'modal__header');
  header.innerHTML = `<h3>${title}</h3>`;
  const closeBtn = createEl('button', 'modal__close', '&times;');
  closeBtn.addEventListener('click', close);
  header.appendChild(closeBtn);

  const form = createEl('form', 'modal__form');
  fields.forEach((field) => {
    const wrapper = createEl('label', 'modal__field');
    wrapper.appendChild(createEl('span', 'modal__label', field.label));

    let input;
    if (field.type === 'select') {
      input = createEl('select', 'input');
      field.options.forEach((option) => {
        const opt = createEl('option');
        opt.value = option.value;
        opt.textContent = option.label;
        input.appendChild(opt);
      });
      input.value = field.value ?? field.options?.[0]?.value ?? '';
    } else {
      input = createEl('input', 'input');
      input.type = field.type || 'text';
      if (field.placeholder) input.placeholder = field.placeholder;
      if (field.min !== undefined) input.min = field.min;
      input.value = field.value ?? '';
    }

    input.name = field.name;
    if (field.required) input.required = true;

    wrapper.appendChild(input);
    form.appendChild(wrapper);
  });

  const actions = createEl('div', 'modal__actions');
  const cancel = createEl('button', 'btn btn--outline', '取消');
  cancel.type = 'button';
  cancel.addEventListener('click', close);
  const submit = createEl('button', 'btn btn--primary', submitText);
  submit.type = 'submit';
  actions.append(cancel, submit);
  form.appendChild(actions);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const values = {};
    fields.forEach((field) => {
      let value = formData.get(field.name);
      if (field.type === 'number') value = Number(value);
      values[field.name] = value;
    });
    onSubmit(values, close);
  });

  modal.append(header, form);
  overlay.appendChild(modal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  function close() {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 150);
  }

  return { close };
}

function renderNav() {
  const nav = createEl('div', 'nav');
  NAV_ITEMS.forEach((item) => {
    const btn = createEl('button', `nav__item ${state.activeView === item.id ? 'nav__item--active' : ''}`);
    btn.innerHTML = `<span>${item.label}</span>`;
    btn.addEventListener('click', () => setView(item.id));
    nav.appendChild(btn);
  });
  return nav;
}

function renderStatCard(title, value, badgeText, badgeClass) {
  const card = createEl('div', 'stat-card');
  card.innerHTML = `<div><h3>${title}</h3><strong>${value}</strong></div><span class="badge ${badgeClass}">${badgeText}</span>`;
  return card;
}

function renderRoomsGrid(rooms) {
  const grid = createEl('div', 'room-grid');
  rooms.forEach((room) => {
    const card = createEl('div', 'room-card');
    const status = ROOM_STATUS[room.status];
    const guest = room.currentBookingId
      ? state.data.guests.find((g) => {
          const booking = state.data.bookings.find((b) => b.id === room.currentBookingId);
          return booking && booking.guestId === g.id;
        })
      : null;

    const title = createEl('div', 'room-card__title');
    title.innerHTML = `<span>房间 ${room.roomNumber}</span><span class="badge ${status.badge}">${status.label}</span>`;

    const meta = createEl('div', 'muted');
    meta.textContent = guest ? `当前住客：${guest.name}` : `可入住人数：${room.capacity} 人`;

    const actions = createEl('div', 'room-card__actions');
    if (room.status === 'available') {
      const btn = createEl('button', 'btn btn--primary', '办理入住');
      btn.addEventListener('click', () => checkIn(room));
      actions.appendChild(btn);
    }
    if (room.status === 'occupied') {
      const outBtn = createEl('button', 'btn btn--danger', '退房');
      outBtn.addEventListener('click', () => checkOut(room));
      const cleanBtn = createEl('button', 'btn btn--warning', '指派打扫');
      cleanBtn.addEventListener('click', () => assignCleaner(room));
      actions.append(outBtn, cleanBtn);
    }
    if (room.status === 'cleaning') {
      const done = createEl('button', 'btn btn--success', '已打扫');
      done.addEventListener('click', () => markClean(room));
      actions.appendChild(done);
    }
    const maintenance = createEl('button', 'btn btn--outline', room.status === 'maintenance' ? '结束维修' : '维修中');
    maintenance.addEventListener('click', () => toggleMaintenance(room));
    actions.appendChild(maintenance);

    card.append(title, meta, actions);
    grid.appendChild(card);
  });
  return grid;
}

function renderDashboard() {
  const container = createEl('div', 'grid', '');
  container.classList.add('grid--stats');
  const totalRooms = state.data.rooms.length;
  const available = state.data.rooms.filter((r) => r.status === 'available').length;
  const occupied = state.data.rooms.filter((r) => r.status === 'occupied').length;
  const cleaning = state.data.rooms.filter((r) => r.status === 'cleaning').length;
  const maintenance = state.data.rooms.filter((r) => r.status === 'maintenance').length;

  const stats = createEl('div', 'grid grid--stats');
  stats.append(
    renderStatCard('房间总数', totalRooms, '全部', 'badge--info'),
    renderStatCard('可用房间', available, '可接待', 'badge--success'),
    renderStatCard('入住中', occupied, '处理中', 'badge--info'),
    renderStatCard('维修/打扫', cleaning + maintenance, '关注', 'badge--warning'),
  );

  const roomsCard = createEl('div', 'card');
  roomsCard.append(createEl('h3', 'section-title', '房间概览'), renderRoomsGrid(state.data.rooms.slice(0, 12)));

  const overview = createEl('div', 'card');
  overview.append(createEl('h3', 'section-title', '运行情况'));
  const list = createEl('div', 'grid');
  list.style.gridTemplateColumns = 'repeat(auto-fit, minmax(260px, 1fr))';
  list.append(
    createEl('div', '', `<strong>${state.data.staff.length}</strong><div class="muted">在职员工</div>`),
    createEl('div', '', `<strong>${state.data.assets.length}</strong><div class="muted">资产记录</div>`),
    createEl('div', '', `<strong>${state.data.linens.length}</strong><div class="muted">布草件数</div>`),
    createEl('div', '', `<strong>${state.data.bookings.length}</strong><div class="muted">历史订单</div>`),
  );
  overview.appendChild(list);

  const wrapper = createEl('div', 'grid');
  wrapper.append(stats, roomsCard, overview);
  return wrapper;
}

function renderPersonnel() {
  const card = createEl('div', 'card');
  card.append(createEl('h3', 'section-title', '员工名录'));

  const form = createEl('form', 'form-grid');
  form.innerHTML = `
    <div>
      <label class="muted">姓名</label>
      <input required class="input" placeholder="例如：张三" />
    </div>
    <div>
      <label class="muted">岗位</label>
      <input required class="input" placeholder="例如：保洁 / 前台" />
    </div>
    <button class="btn btn--primary" type="submit">新增员工</button>
  `;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const [nameInput, roleInput] = form.querySelectorAll('input');
    state.data.staff.push({ id: crypto.randomUUID(), name: nameInput.value.trim(), role: roleInput.value.trim() });
    saveData();
    render();
  });

  const table = createEl('table', 'table');
  table.innerHTML = `<thead><tr><th>姓名</th><th>岗位</th><th>负责楼层</th><th>操作</th></tr></thead>`;
  const body = createEl('tbody');
  state.data.staff.forEach((member, index) => {
    const tr = createEl('tr');
    const actions = createEl('div', 'table-actions');
    const edit = createEl('button', 'btn btn--outline', '编辑');
    edit.addEventListener('click', () => {
      openFormModal({
        title: '编辑员工',
        fields: [
          { name: 'name', label: '姓名', value: member.name, required: true },
          { name: 'role', label: '岗位', value: member.role, required: true },
        ],
        onSubmit: ({ name, role }, close) => {
          if (!name || !role) return;
          state.data.staff[index] = { ...member, name, role };
          saveData();
          render();
          close();
        },
      });
    });
    const del = createEl('button', 'btn btn--danger', '删除');
    del.addEventListener('click', () => {
      if (!confirm('确认删除该员工？')) return;
      state.data.staff.splice(index, 1);
      state.data.cleaningLogs = state.data.cleaningLogs.map((log) =>
        log.staffId === member.id ? { ...log, staffId: null } : log,
      );
      saveData();
      render();
    });
    actions.append(edit, del);
    tr.innerHTML = `<td>${member.name}</td><td>${member.role}</td><td>${(index % 4) + 1} 层</td>`;
    const actionTd = createEl('td');
    actionTd.appendChild(actions);
    tr.appendChild(actionTd);
    body.appendChild(tr);
  });
  table.appendChild(body);
  card.append(form, table);
  return card;
}

function renderRooms() {
  const card = createEl('div', 'card');
  card.append(createEl('h3', 'section-title', '房间列表'));

  const form = createEl('form', 'form-grid');
  form.innerHTML = `
    <div>
      <label class="muted">房间号</label>
      <input required class="input" placeholder="例如：302" />
    </div>
    <div>
      <label class="muted">楼层</label>
      <input required type="number" min="1" class="input" placeholder="3" />
    </div>
    <div>
      <label class="muted">容量（人数）</label>
      <input required type="number" min="1" class="input" value="2" />
    </div>
    <button class="btn btn--primary" type="submit">新增房间</button>
  `;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const [roomInput, floorInput, capacityInput] = form.querySelectorAll('input');
    state.data.rooms.push({
      id: crypto.randomUUID(),
      floor: Number(floorInput.value || 1),
      roomNumber: roomInput.value.trim(),
      capacity: Number(capacityInput.value || 1),
      status: 'available',
      currentBookingId: null,
      bookingHistory: [],
    });
    saveData();
    render();
  });

  const table = createEl('table', 'table');
  table.innerHTML = `<thead><tr><th>房间号</th><th>状态</th><th>容量</th><th>入住人</th><th>操作</th></tr></thead>`;
  const body = createEl('tbody');
  state.data.rooms.forEach((room, index) => {
    const status = ROOM_STATUS[room.status];
    const booking = room.currentBookingId ? state.data.bookings.find((b) => b.id === room.currentBookingId) : null;
    const guest = booking ? state.data.guests.find((g) => g.id === booking.guestId) : null;
    const tr = createEl('tr');
    const actions = createEl('div', 'table-actions');

    const edit = createEl('button', 'btn btn--outline', '编辑');
    edit.addEventListener('click', () => {
      openFormModal({
        title: '编辑房间',
        fields: [
          { name: 'roomNumber', label: '房间号', value: room.roomNumber, required: true },
          { name: 'floor', label: '楼层', type: 'number', value: room.floor, min: 1, required: true },
          { name: 'capacity', label: '容量', type: 'number', value: room.capacity, min: 1, required: true },
        ],
        onSubmit: ({ roomNumber, floor, capacity }, close) => {
          if (!roomNumber) return;
          state.data.rooms[index] = { ...room, roomNumber, floor: Number(floor) || room.floor, capacity: Number(capacity) || room.capacity };
          saveData();
          render();
          close();
        },
      });
    });

    const del = createEl('button', 'btn btn--danger', '删除');
    del.addEventListener('click', () => {
      if (!confirm('确认删除该房间？删除后相关预订与打扫记录会丢失。')) return;
      state.data.rooms.splice(index, 1);
      state.data.cleaningLogs = state.data.cleaningLogs.filter((log) => log.roomId !== room.id);
      state.data.bookings = state.data.bookings.filter((b) => b.roomId !== room.id);
      saveData();
      render();
    });

    actions.append(edit, del);
    tr.innerHTML = `<td>${room.roomNumber}</td><td><span class="badge ${status.badge}">${status.label}</span></td><td>${room.capacity} 人</td><td>${guest ? guest.name : '<span class="muted">暂无</span>'}</td>`;
    const actionTd = createEl('td');
    actionTd.appendChild(actions);
    tr.appendChild(actionTd);
    body.appendChild(tr);
  });
  table.appendChild(body);
  card.append(form, table, createEl('div', 'muted', '在仪表盘的房间卡片中可以进行入住、退房、指派打扫等操作。'));
  return card;
}

function renderCleaning() {
  const container = createEl('div', 'grid');
  container.style.gap = '14px';

  const createForm = createEl('div', 'card');
  createForm.append(createEl('h3', 'section-title', '新增打扫任务'));
  const form = createEl('form', 'form-grid');

  const roomSelect = createEl('select', 'input');
  roomSelect.required = true;
  roomSelect.innerHTML = '<option value="">选择房间</option>';
  state.data.rooms.forEach((room) => {
    const option = createEl('option');
    option.value = room.id;
    option.textContent = `房间 ${room.roomNumber}`;
    roomSelect.appendChild(option);
  });

  const staffSelect = createEl('select', 'input');
  staffSelect.required = true;
  staffSelect.innerHTML = '<option value="">选择人员</option>';
  state.data.staff.forEach((staff) => {
    const option = createEl('option');
    option.value = staff.id;
    option.textContent = `${staff.name}（${staff.role}）`;
    staffSelect.appendChild(option);
  });

  const submitBtn = createEl('button', 'btn btn--primary', '创建任务');
  submitBtn.type = 'submit';

  const roomField = createEl('div');
  roomField.append(createEl('label', 'muted', '房间'), roomSelect);
  const staffField = createEl('div');
  staffField.append(createEl('label', 'muted', '人员'), staffSelect);

  form.append(roomField, staffField, submitBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!roomSelect.value || !staffSelect.value) return;
    state.data.cleaningLogs.push({
      id: crypto.randomUUID(),
      roomId: roomSelect.value,
      staffId: staffSelect.value,
      assignedDate: new Date().toISOString(),
      completedDate: null,
    });
    const room = state.data.rooms.find((r) => r.id === roomSelect.value);
    if (room) room.status = 'cleaning';
    saveData();
    render();
  });

  createForm.append(form);
  container.appendChild(createForm);

  const activeLogs = state.data.cleaningLogs.filter((log) => !log.completedDate);
  const finished = state.data.cleaningLogs.filter((log) => log.completedDate);

  const makeList = (title, logs) => {
    const card = createEl('div', 'card');
    card.append(createEl('h3', 'section-title', title));
    if (!logs.length) {
      card.append(createEl('p', 'muted', '暂无记录'));
      return card;
    }
    const list = createEl('div', 'grid');
    list.style.gridTemplateColumns = 'repeat(auto-fit, minmax(260px, 1fr))';
    logs.forEach((log) => {
      const room = state.data.rooms.find((r) => r.id === log.roomId);
      const staff = log.staffId ? state.data.staff.find((s) => s.id === log.staffId) : null;
      const box = createEl('div', 'room-card');
      box.style.borderLeftColor = '#f59e0b';
      box.innerHTML = `<div class="room-card__title"><span>${room ? `房间 ${room.roomNumber}` : '未知房间'}</span><span class="badge ${log.completedDate ? 'badge--success' : 'badge--warning'}">${log.completedDate ? '完成' : '进行中'}</span></div>`;
      box.appendChild(createEl('div', 'muted', `${staff ? staff.name : '待指派'} · ${new Date(log.assignedDate).toLocaleString()}`));
      if (!log.completedDate) {
        const btn = createEl('button', 'btn btn--success', '标记完成');
        btn.addEventListener('click', () => {
          log.completedDate = new Date().toISOString();
          const roomData = state.data.rooms.find((r) => r.id === log.roomId);
          if (roomData) roomData.status = 'available';
          saveData();
          render();
        });
        box.appendChild(btn);
      }
      list.appendChild(box);
    });
    card.appendChild(list);
    return card;
  };

  container.append(makeList('待完成的打扫任务', activeLogs), makeList('历史打扫记录', finished.slice(-6)));
  return container;
}

function renderLinen() {
  const card = createEl('div', 'card');
  card.append(createEl('h3', 'section-title', '布草管理'));

  const form = createEl('form', 'form-grid');
  form.innerHTML = `
    <div>
      <label class="muted">名称</label>
      <input class="input" required placeholder="枕套" />
    </div>
    <div>
      <label class="muted">单价</label>
      <input class="input" type="number" min="0" required value="10" />
    </div>
    <div>
      <label class="muted">状态</label>
      <select class="input" required>
        <option value="库存">库存</option>
        <option value="使用中">使用中</option>
        <option value="清洗中">清洗中</option>
      </select>
    </div>
    <button class="btn btn--primary" type="submit">新增布草</button>
  `;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const [nameInput, priceInput, statusInput] = form.querySelectorAll('input, select');
    state.data.linens.push({
      id: crypto.randomUUID(),
      name: nameInput.value.trim(),
      price: Number(priceInput.value || 0),
      status: statusInput.value,
    });
    saveData();
    render();
  });

  const total = state.data.linens.length;
  const inUse = state.data.linens.filter((l) => l.status === '使用中').length;
  const washing = state.data.linens.filter((l) => l.status === '清洗中').length;
  const stock = total - inUse - washing;

  const stats = createEl('div', 'grid grid--stats');
  stats.append(
    renderStatCard('总件数', total, '布草', 'badge--info'),
    renderStatCard('库存', stock, '可用', 'badge--success'),
    renderStatCard('使用中', inUse, '客房', 'badge--warning'),
    renderStatCard('清洗中', washing, '后勤', 'badge--danger'),
  );

  const table = createEl('table', 'table');
  table.innerHTML = `<thead><tr><th>名称</th><th>价格</th><th>状态</th><th>操作</th></tr></thead>`;
  const body = createEl('tbody');
  state.data.linens.forEach((item, index) => {
    const tr = createEl('tr');
    const actions = createEl('div', 'table-actions');
    const edit = createEl('button', 'btn btn--outline', '编辑');
    edit.addEventListener('click', () => {
      openFormModal({
        title: '编辑布草',
        fields: [
          { name: 'name', label: '名称', value: item.name, required: true },
          { name: 'price', label: '单价', type: 'number', value: item.price, min: 0, required: true },
          {
            name: 'status',
            label: '状态',
            type: 'select',
            value: item.status,
            options: [
              { value: '库存', label: '库存' },
              { value: '使用中', label: '使用中' },
              { value: '清洗中', label: '清洗中' },
            ],
          },
        ],
        onSubmit: ({ name, price, status }, close) => {
          if (!name) return;
          state.data.linens[index] = { ...item, name, price: Number(price) || 0, status };
          saveData();
          render();
          close();
        },
      });
    });
    const del = createEl('button', 'btn btn--danger', '删除');
    del.addEventListener('click', () => {
      if (!confirm('确认删除该布草记录？')) return;
      state.data.linens.splice(index, 1);
      saveData();
      render();
    });
    actions.append(edit, del);
    tr.innerHTML = `<td>${item.name}</td><td>￥${item.price}</td><td>${item.status}</td>`;
    const td = createEl('td');
    td.appendChild(actions);
    tr.appendChild(td);
    body.appendChild(tr);
  });
  table.appendChild(body);

  card.append(form, stats, table);
  return card;
}

function renderAssets() {
  const card = createEl('div', 'card');
  card.append(createEl('h3', 'section-title', '资产管理'));

  const form = createEl('form', 'form-grid');
  form.innerHTML = `
    <div>
      <label class="muted">名称</label>
      <input required class="input" placeholder="电视" />
    </div>
    <div>
      <label class="muted">类别</label>
      <input required class="input" placeholder="电子产品" />
    </div>
    <div>
      <label class="muted">位置</label>
      <input required class="input" placeholder="房间 302" />
    </div>
    <div>
      <label class="muted">购入日期</label>
      <input required class="input" type="date" value="${new Date().toISOString().slice(0, 10)}" />
    </div>
    <div>
      <label class="muted">估值</label>
      <input required class="input" type="number" min="0" value="500" />
    </div>
    <button class="btn btn--primary" type="submit">新增资产</button>
  `;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const [nameInput, categoryInput, locationInput, dateInput, valueInput] = form.querySelectorAll('input');
    state.data.assets.unshift({
      id: crypto.randomUUID(),
      name: nameInput.value.trim(),
      category: categoryInput.value.trim(),
      location: locationInput.value.trim(),
      purchaseDate: dateInput.value,
      value: Number(valueInput.value || 0),
    });
    saveData();
    render();
  });

  const table = createEl('table', 'table');
  table.innerHTML = `<thead><tr><th>名称</th><th>类别</th><th>位置</th><th>购入日期</th><th>估值</th><th>操作</th></tr></thead>`;
  const body = createEl('tbody');
  state.data.assets.slice(0, 50).forEach((asset, index) => {
    const tr = createEl('tr');
    const actions = createEl('div', 'table-actions');
    const edit = createEl('button', 'btn btn--outline', '编辑');
    edit.addEventListener('click', () => {
      openFormModal({
        title: '编辑资产',
        fields: [
          { name: 'name', label: '名称', value: asset.name, required: true },
          { name: 'category', label: '类别', value: asset.category, required: true },
          { name: 'location', label: '位置', value: asset.location, required: true },
          { name: 'purchaseDate', label: '购入日期', type: 'date', value: asset.purchaseDate, required: true },
          { name: 'value', label: '估值', type: 'number', value: asset.value, min: 0, required: true },
        ],
        onSubmit: ({ name, category, location, purchaseDate, value }, close) => {
          if (!name) return;
          state.data.assets[index] = {
            ...asset,
            name,
            category,
            location,
            purchaseDate,
            value: Number(value) || 0,
          };
          saveData();
          render();
          close();
        },
      });
    });
    const del = createEl('button', 'btn btn--danger', '删除');
    del.addEventListener('click', () => {
      if (!confirm('确认删除该资产记录？')) return;
      state.data.assets.splice(index, 1);
      saveData();
      render();
    });
    actions.append(edit, del);
    tr.innerHTML = `<td>${asset.name}</td><td>${asset.category}</td><td>${asset.location}</td><td>${asset.purchaseDate}</td><td>￥${asset.value}</td>`;
    const td = createEl('td');
    td.appendChild(actions);
    tr.appendChild(td);
    body.appendChild(tr);
  });
  table.appendChild(body);
  card.append(form, table);
  return card;
}

function renderUsers() {
  const card = createEl('div', 'card');
  card.append(createEl('h3', 'section-title', '用户管理'));

  const form = createEl('form', 'form-grid');
  form.innerHTML = `
    <div>
      <label class="muted">用户名</label>
      <input required class="input" placeholder="新用户" />
    </div>
    <div>
      <label class="muted">角色</label>
      <select class="input">
        <option value="管理员">管理员</option>
        <option value="普通用户">普通用户</option>
      </select>
    </div>
    <button class="btn btn--primary" type="submit">新增用户</button>
  `;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const [nameInput, roleInput] = form.querySelectorAll('input, select');
    state.data.users.push({ id: crypto.randomUUID(), username: nameInput.value.trim(), role: roleInput.value });
    saveData();
    render();
  });

  const list = createEl('div', 'grid');
  list.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
  state.data.users.forEach((user, index) => {
    const box = createEl('div', 'room-card');
    box.style.borderLeftColor = user.role === '管理员' ? '#4f46e5' : '#0ea5e9';
    box.innerHTML = `<div class="room-card__title"><span>${user.username}</span><span class="badge ${user.role === '管理员' ? 'badge--danger' : 'badge--info'}">${user.role}</span></div>`;
    box.appendChild(createEl('div', 'muted', '登录密码统一为 h123')); 

    const actions = createEl('div', 'room-card__actions');
    const edit = createEl('button', 'btn btn--outline', '编辑');
    edit.addEventListener('click', () => {
      openFormModal({
        title: '编辑用户',
        fields: [
          { name: 'username', label: '用户名', value: user.username, required: true },
          {
            name: 'role',
            label: '角色',
            type: 'select',
            value: user.role,
            options: [
              { value: '管理员', label: '管理员' },
              { value: '普通用户', label: '普通用户' },
            ],
          },
        ],
        onSubmit: ({ username, role }, close) => {
          if (!username) return;
          state.data.users[index] = { ...user, username, role };
          if (state.currentUser && state.currentUser.id === user.id) {
            state.currentUser = state.data.users[index];
          }
          saveData();
          render();
          close();
        },
      });
    });

    const del = createEl('button', 'btn btn--danger', '删除');
    del.addEventListener('click', () => {
      if (!confirm('确认删除该用户？')) return;
      state.data.users.splice(index, 1);
      if (state.currentUser && state.currentUser.id === user.id) {
        state.currentUser = null;
      }
      saveData();
      render();
    });
    actions.append(edit, del);
    box.appendChild(actions);
    list.appendChild(box);
  });
  card.append(form, list);
  return card;
}

function renderSystem() {
  const card = createEl('div', 'card');
  card.append(createEl('h3', 'section-title', '系统维护'));
  const row = createEl('div', 'actions-row');
  const resetBtn = createEl('button', 'btn btn--primary', '重置示例数据');
  const exportBtn = createEl('button', 'btn btn--outline', '导出当前数据');
  const clearBtn = createEl('button', 'btn btn--danger', '清空数据');
  resetBtn.addEventListener('click', resetData);
  exportBtn.addEventListener('click', exportData);
  clearBtn.addEventListener('click', () => {
    if (!confirm('确认清空除用户以外的业务数据？')) return;
    clearBusinessData();
  });
  row.append(resetBtn, exportBtn, clearBtn);
  card.append(row, createEl('p', 'muted', '所有数据都存储在浏览器本地，无需后端服务。'));
  return card;
}

function renderContent() {
  switch (state.activeView) {
    case 'dashboard':
      return renderDashboard();
    case 'personnel':
      return renderPersonnel();
    case 'rooms':
      return renderRooms();
    case 'cleaning':
      return renderCleaning();
    case 'linen':
      return renderLinen();
    case 'assets':
      return renderAssets();
    case 'users':
      return renderUsers();
    case 'system':
      return renderSystem();
    default:
      return createEl('div', '', '未知视图');
  }
}

function renderAppShell() {
  const shell = createEl('div', 'app-shell');
  const sidebar = createEl('aside', 'sidebar');
  const brand = createEl('div', 'sidebar__brand');
  brand.innerHTML = `<div class="logo">H</div><div><div>酒店管理系统</div></div>`;
  sidebar.append(brand, renderNav());

  const userCard = createEl('div', 'user-card');
  userCard.innerHTML = `<strong>${state.currentUser.username}</strong><span class="muted">${state.currentUser.role}</span>`;
  const logoutBtn = createEl('button', 'logout-btn', '退出登录');
  logoutBtn.addEventListener('click', logout);
  userCard.appendChild(logoutBtn);
  sidebar.appendChild(userCard);

  const main = createEl('div', 'main');
  const header = createEl('div', 'main__header');
  header.append(createEl('div', '', `<h2 style="margin:0">${NAV_ITEMS.find((i) => i.id === state.activeView)?.label || ''}</h2>`));

  const content = createEl('div', 'content');
  content.appendChild(renderContent());

  main.append(header, content);
  shell.append(sidebar, main);
  return shell;
}

function renderLogin() {
  const container = createEl('div', 'login');
  const panel = createEl('div', 'login__panel');
  panel.innerHTML = `<div class="logo" style="margin-bottom:8px">H</div><h1>酒店管理系统</h1><p class="muted">选择账号并输入密码（默认 h123）即可进入系统，完全由浏览器本地驱动。</p>`;

  const select = createEl('select', 'select');
  state.data.users.forEach((user) => {
    const option = createEl('option');
    option.value = user.id;
    option.textContent = `${user.username}（${user.role}）`;
    select.appendChild(option);
  });

  const password = createEl('input', 'input');
  password.type = 'password';
  password.placeholder = '请输入密码 h123';
  password.style.marginTop = '10px';

  const loginBtn = createEl('button', 'btn btn--primary', '立即登录');
  loginBtn.style.width = '100%';
  loginBtn.style.marginTop = '12px';
  loginBtn.addEventListener('click', () => {
    const user = state.data.users.find((u) => u.id === select.value);
    if (!password.value) return alert('请输入密码');
    if (password.value !== LOGIN_PASSWORD) return alert('密码不正确，默认密码为 h123');
    if (user) {
      state.currentUser = user;
      render();
    }
  });

  panel.append(select, password, loginBtn);
  container.appendChild(panel);
  return container;
}

function render() {
  const root = document.getElementById('app');
  root.innerHTML = '';
  root.appendChild(state.currentUser ? renderAppShell() : renderLogin());
}

render();
