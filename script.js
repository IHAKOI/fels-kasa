const tablesEl = document.getElementById('tables');
const orderTitle = document.getElementById('order-title');
const orderList = document.getElementById('order-list');
const totalPriceEl = document.getElementById('total-price');
const payBtn = document.getElementById('pay-btn');
const menuItemsEl = document.getElementById('menu-items');
const categoryButtons = document.querySelectorAll('.category-btn');

const MENU = {
  burger: [
    { name: 'Islak Burger', price: 80 },
    { name: 'Hamburger', price: 200 },
    { name: 'Cheeseburger', price: 200 },
    { name: 'Chickenburger', price: 180 },
    { name: 'Devburger', price: 240 },
  ],
  menüler: [
    { name: 'Hamburger Menü', price: 300 },
    { name: 'Cheeseburger Menü', price: 300 },
    { name: 'Chickenburger Menü', price: 280 },
    { name: 'Devburger Menü', price: 350 },
  ],
  köfte: [
    { name: 'Köfte Tabağı Tek', price: 300 },
    { name: 'Köfte Tabağı 1.5', price: 350 },
    { name: 'Köfte Tabağı 2', price: 400 },
  ],
  ekmek: [
    { name: 'Köfte Menü', price: 200 },
    { name: 'Sucuk Ekmek', price: 200 },
    { name: 'Patso', price: 120 },
  ],
  snack: [
    { name: 'Patates Cipsi', price: 100 },
    { name: 'Nugget 8’li', price: 100 },
    { name: 'Soğan Halkası 7’li', price: 90 },
    { name: 'Patates Kroket 5’li', price: 90 },
  ],
  drink: [
    { name: 'İçecek Farkı', price: 20 },
    { name: 'Coca-Cola 200ml', price: 40 },
    { name: 'Fanta 200ml', price: 40 },
    { name: 'Coca-Cola 330ml', price: 60 },
    { name: 'Fanta 330ml', price: 60 },
    { name: 'Coca-Cola Zero 330ml', price: 60 },
    { name: 'Sprite 330ml', price: 60 },
    { name: 'FuseTea 330ml', price: 60 },
    { name: 'Cappy 330ml', price: 60 },
    { name: 'Su 0,5 L', price: 15 },
    { name: 'Ayran 170ml', price: 20 },
    { name: 'Çay', price: 15 },
  ],
};

let currentTable = null;
let orders = {}; // {tableNum: [{name, price, qty}]}

// Masa butonlarını oluştur
for(let i=1; i<=15; i++) {
  const btn = document.createElement('div');
  btn.classList.add('table');
  btn.textContent = i;
  btn.addEventListener('click', () => selectTable(i));
  tablesEl.appendChild(btn);
}

// Kategori butonları
categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadMenu(btn.dataset.cat);
  });
});

function selectTable(num) {
  currentTable = num;
  document.querySelectorAll('.table').forEach(t => {
    t.classList.toggle('active', +t.textContent === num);
  });
  orderTitle.textContent = `Masa ${num} Siparişleri`;
  loadOrder();
  loadMenu(document.querySelector('.category-btn.active').dataset.cat);
  payBtn.disabled = !(orders[num] && orders[num].length > 0);
}

function loadMenu(category) {
  menuItemsEl.innerHTML = '';
  MENU[category].forEach(item => {
    const div = document.createElement('div');
    div.classList.add('menu-item');
    div.textContent = `${item.name} - ${item.price} TL`;
    div.addEventListener('click', () => addOrderItem(item));
    menuItemsEl.appendChild(div);
  });
}

function addOrderItem(item) {
  if (!currentTable) return alert('Önce masa seçin!');
  if (!orders[currentTable]) orders[currentTable] = [];
  let order = orders[currentTable];
  let found = order.find(o => o.name === item.name);
  if (found) {
    found.qty++;
  } else {
    order.push({...item, qty:1});
  }
  payBtn.disabled = false;
  updateTables();
  loadOrder();
}

function loadOrder() {
  orderList.innerHTML = '';
  if (!orders[currentTable] || orders[currentTable].length === 0) {
    orderList.innerHTML = '<p>Masa boş.</p>';
    totalPriceEl.textContent = 'Toplam: 0 TL';
    payBtn.disabled = true;
    updateTables();
    return;
  }
  orders[currentTable].forEach((item, index) => {
    const div = document.createElement('div');
    div.classList.add('order-item');
    div.innerHTML = `
      <span>${item.name} (${item.qty})</span>
      <div class="order-controls">
        <button onclick="changeQty(${index}, -1)">-</button>
        <button onclick="changeQty(${index}, 1)">+</button>
      </div>
    `;
    orderList.appendChild(div);
  });
  updateTotal();
}

function changeQty(index, delta) {
  if (!currentTable) return;
  const order = orders[currentTable];
  if (!order) return;
  order[index].qty += delta;
  if (order[index].qty <= 0) {
    order.splice(index, 1);
  }
  if (order.length === 0) {
    delete orders[currentTable];
    payBtn.disabled = true;
  }
  updateTables();
  loadOrder();
}

function updateTotal() {
  const order = orders[currentTable];
  if (!order) return;
  let total = order.reduce((sum, item) => sum + item.price * item.qty, 0);
  totalPriceEl.textContent = `Toplam: ${total} TL`;
}

function updateTables() {
  document.querySelectorAll('.table').forEach(t => {
    const tableNum = +t.textContent;
    if (orders[tableNum] && orders[tableNum].length > 0) {
      t.classList.add('has-order');
    } else {
      t.classList.remove('has-order');
    }
  });
}

payBtn.addEventListener('click', () => {
  if (!currentTable) return;
  if (confirm(`Masa ${currentTable} siparişlerini ödemek istediğinize emin misiniz?`)) {
    delete orders[currentTable];
    payBtn.disabled = true;
    updateTables();
    loadOrder();
  }
});
