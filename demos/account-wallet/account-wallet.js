const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const formatNumber = (value) => Number(value).toLocaleString("zh-TW");

let users = [
  {id:"101",wallet:"DEMO-WA0001",hash:"00000001",name:"示範帳戶01",agent:"Administrator",label:"測試",currency:"JPY",position:"現金",balance:110000,withdrawable:100000,turnover:10000,created:"2026-01-01 12:00:00",updated:"2026-02-01 12:00:00"},
  {id:"102",wallet:"DEMO-WA0002",hash:"00000002",name:"示範帳戶02",agent:"網咖 OTP",label:"警示",currency:"USD",position:"現金",balance:120000,withdrawable:120000,turnover:0,created:"2026-01-02 12:00:00",updated:"2026-02-02 12:00:00"},
  {id:"103",wallet:"DEMO-WA0003",hash:"00000003",name:"示範帳戶03",agent:"網咖免驗證",label:"封禁",currency:"CNY",position:"補點",balance:130000,withdrawable:130000,turnover:0,created:"2026-01-03 12:00:00",updated:"2026-02-03 12:00:00"},
  {id:"104",wallet:"DEMO-WA0004",hash:"00000004",name:"示範帳戶04",agent:"Administrator",label:"金牌",currency:"JPY",position:"現金",balance:140000,withdrawable:130000,turnover:10000,created:"2026-01-04 12:00:00",updated:"2026-02-04 12:00:00"},
  {id:"105",wallet:"DEMO-WA0005",hash:"00000005",name:"示範帳戶05",agent:"網咖 OTP",label:"渠道",currency:"USD",position:"補點",balance:150000,withdrawable:150000,turnover:0,created:"2026-01-05 12:00:00",updated:"2026-02-05 12:00:00"},
  {id:"106",wallet:"DEMO-WA0006",hash:"00000006",name:"示範帳戶06",agent:"網咖免驗證",label:"測試",currency:"CNY",position:"現金",balance:160000,withdrawable:160000,turnover:0,created:"2026-01-06 12:00:00",updated:"2026-02-06 12:00:00"},
  {id:"107",wallet:"DEMO-WA0007",hash:"00000007",name:"示範帳戶07",agent:"Administrator",label:"警示",currency:"JPY",position:"現金",balance:170000,withdrawable:160000,turnover:10000,created:"2026-01-07 12:00:00",updated:"2026-02-07 12:00:00"},
  {id:"108",wallet:"DEMO-WA0008",hash:"00000008",name:"示範帳戶08",agent:"網咖 OTP",label:"測試",currency:"USD",position:"現金",balance:180000,withdrawable:180000,turnover:0,created:"2026-01-08 12:00:00",updated:"2026-02-08 12:00:00"},
  {id:"109",wallet:"DEMO-WA0009",hash:"00000009",name:"示範帳戶09",agent:"網咖免驗證",label:"測試",currency:"CNY",position:"補點",balance:190000,withdrawable:190000,turnover:0,created:"2026-01-09 12:00:00",updated:"2026-02-09 12:00:00"},
  {id:"110",wallet:"DEMO-WA0010",hash:"00000010",name:"示範帳戶10",agent:"Administrator",label:"警示",currency:"JPY",position:"現金",balance:200000,withdrawable:190000,turnover:10000,created:"2026-01-10 12:00:00",updated:"2026-02-10 12:00:00"},
  {id:"111",wallet:"DEMO-WA0011",hash:"00000011",name:"示範帳戶11",agent:"網咖免驗證",label:"封禁",currency:"CNY",position:"補點",balance:210000,withdrawable:210000,turnover:0,created:"2026-01-11 12:00:00",updated:"2026-02-11 12:00:00"}
];

let page = 1;
let pageSize = 10;
let activeUser = null;
let pendingWallet = null;
let riskStep = 0;
let currentMode = "otp";

function openModal(id) {
  $(id).classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  $(id).classList.add("hidden");
  document.body.style.overflow = "";
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.remove("hidden");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.add("hidden"), 2200);
}

function getFilterValue(selector) {
  return $(`${selector} button.active`)?.textContent.trim() || "全部";
}

function getStandardFilterValue(index) {
  return $$(".standard-filter")[index]?.querySelector("button.active")?.textContent.trim() || "全部";
}

function badgeClass(label) {
  if (label === "警示") return "warning";
  if (label === "封禁") return "banned";
  return "";
}

function fallbackCopy(text) {
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
  return Promise.resolve();
}

function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  return fallbackCopy(text);
}

function matches() {
  const query = $("#userFilter").value.trim().toLowerCase();
  const agent = getFilterValue(".agent-filter");
  const label = getStandardFilterValue(0);
  const currency = getStandardFilterValue(1);
  const position = getFilterValue(".position-filter");
  return users.filter((user) => {
    const queryMatched = !query || [user.id, user.wallet, user.hash, user.name].some((value) => value.toLowerCase().includes(query));
    return queryMatched
      && (agent === "全部" || user.agent === agent)
      && (label === "全部" || user.label === label)
      && (currency === "全部" || user.currency === currency)
      && (position === "全部" || user.position === position);
  });
}

function render() {
  const rows = matches();
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  page = Math.min(page, pages);
  const start = (page - 1) * pageSize;
  const shown = rows.slice(start, start + pageSize);

  $("#walletRows").innerHTML = shown.map((user) => `
    <tr>
      <td class="check"><input type="checkbox" aria-label="選取 ${user.hash}"></td>
      <td><a class="cell-link" href="#">${user.id}</a></td>
      <td><a class="cell-link" href="#">${user.wallet}</a><button class="copy" type="button" data-copy="${user.wallet}" aria-label="複製錢包序號"></button></td>
      <td><a class="cell-link" href="#">${user.hash}</a><button class="copy" type="button" data-copy="${user.hash}" aria-label="複製用戶序號"></button></td>
      <td>${user.agent}</td>
      <td><span class="label-badge ${badgeClass(user.label)}">${user.label}</span></td>
      <td>${user.currency}</td>
      <td class="position-col">${user.position}</td>
      <td class="numeric">${formatNumber(user.balance)}</td>
      <td>${user.created}</td>
      <td>${user.updated}</td>
      <td class="operation"><button class="row-action" type="button" data-user="${user.hash}" aria-label="操作 ${user.hash}">•••</button></td>
    </tr>`).join("");

  $("#emptyState").classList.toggle("hidden", rows.length > 0);
  $("#rangeText").textContent = rows.length ? `從 ${start + 1} 到 ${Math.min(start + pageSize, rows.length)}，總共 ${rows.length} 條` : "從 0 到 0，總共 0 條";
  $("#pageNumber").textContent = page;
  $("#prevPage").disabled = page === 1;
  $("#nextPage").disabled = page === pages;
}

function resetWallet() {
  activeUser = null;
  $("#walletForm").reset();
  $("#walletUserId").value = "";
  $("#currentBalance").value = "—";
  $("#currentTurnover").value = "—";
  $("#walletAmount").disabled = false;
  $$(".amount-presets button").forEach((button) => button.classList.remove("active"));
  $$("#walletForm .error").forEach((element) => { element.textContent = ""; });
  configureWalletModal();
}

function configureWalletModal() {
  const otp = currentMode === "otp";
  $$(".otp-only").forEach((element) => element.classList.toggle("hidden", !otp));
  $("#positionSelect").disabled = true;
  $("#positionSelect").value = "現金";
  $("#walletAmount").readOnly = otp;
  $$("[data-mode]").forEach((button) => button.classList.toggle("active", button.dataset.mode === currentMode));
}

function findUser(input) {
  const value = input.value.trim();
  return users.find((user) => user.hash === value || user.wallet === value || user.id === value);
}

function loadWalletUser() {
  const user = findUser($("#walletUserId"));
  activeUser = user || null;
  $("#userError").textContent = user ? "" : "請填寫正確資訊";
  $("#currentBalance").value = user ? `¥ ${formatNumber(user.balance)}` : "—";
  $("#currentTurnover").value = user ? `¥ ${formatNumber(user.turnover)}` : "—";
  return user;
}

function openWallet(id = "") {
  resetWallet();
  openModal("#walletModal");
  if (id) {
    $("#walletUserId").value = id;
    loadWalletUser();
  }
}

function executeWallet(data, clearTurnover = false) {
  users = users.map((user) => user.hash === data.user.hash ? {
    ...user,
    balance: user.balance + data.amount,
    withdrawable: Math.max(0, user.withdrawable + data.amount),
    turnover: clearTurnover ? 0 : Math.max(0, user.turnover + (data.amount > 0 && data.accumulate ? data.amount : 0)),
    position: data.position,
    updated: new Date().toLocaleString("zh-TW", {hour12:false}).replaceAll("/", "-")
  } : user);
  closeModal("#walletModal");
  closeModal("#riskModal");
  render();
  toast(`用戶 ${data.user.hash} 錢包已更新`);
}

function validateWallet() {
  const user = activeUser || loadWalletUser();
  const amount = Number($("#walletAmount").value.replaceAll(",", ""));
  const remark = $("#walletRemark").value.trim();
  $("#userError").textContent = user ? "" : "請填寫正確資訊";
  $("#amountError").textContent = Number.isFinite(amount) && amount !== 0 ? "" : "請輸入額度";
  $("#remarkError").textContent = remark ? "" : "請填寫這個欄位";
  if (!user || !Number.isFinite(amount) || amount === 0 || !remark) return null;
  if (amount < 0 && Math.abs(amount) > user.balance) {
    $("#amountError").textContent = "餘額不足，無法下分";
    return null;
  }
  return {user, amount, remark, position: $("#positionSelect").value, accumulate: $("#accumulateTurnover").checked};
}

function renderRisk() {
  riskStep += 1;
  $("#riskStep").textContent = `確認 ${riskStep} / 3`;
  $("#riskText").textContent = riskStep === 1
    ? `用戶還需消耗 ${formatNumber(pendingWallet.user.turnover)} 円才達到下分標準，確定要進行下分嗎？`
    : riskStep === 2 ? "確定進行下分嗎？" : "是否清空用戶流水限額？";
  openModal("#riskModal");
}

function exportWallets() {
  const headers = ["ID", "錢包序號", "用戶序號", "代理", "標籤", "幣種", "倉位", "餘額", "創建時間", "更新時間"];
  const lines = matches().map((user) => [user.id, user.wallet, user.hash, user.agent, user.label, user.currency, user.position, user.balance, user.created, user.updated]);
  const csv = [headers, ...lines].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["\ufeff", csv], {type:"text/csv;charset=utf-8"}));
  link.download = "account-wallet.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

$("#refreshBtn").onclick = () => { render(); toast("資料已刷新"); };
$("#filterToggleBtn").onclick = (event) => {
  const hidden = !event.currentTarget.classList.contains("active");
  event.currentTarget.classList.toggle("active", hidden);
  $$(".standard-filter").forEach((row) => row.classList.toggle("hidden", !hidden));
};
$("#agentOverviewBtn").onclick = (event) => {
  const row = $(".agent-filter");
  row.classList.toggle("hidden");
  event.currentTarget.classList.toggle("active", !row.classList.contains("hidden"));
};
$("#walletActionBtn").onclick = () => openWallet();
$("#resetWalletBtn").onclick = resetWallet;
$("#turnoverActionBtn").onclick = () => {
  $("#turnoverForm").reset();
  $("#turnoverCurrent").value = "—";
  $$("#turnoverForm .error").forEach((element) => { element.textContent = ""; });
  openModal("#turnoverModal");
};
$("#exportWalletBtn").onclick = exportWallets;
$("#userFilter").oninput = () => { page = 1; render(); };
$("#clearSearch").onclick = () => { $("#userFilter").value = ""; page = 1; render(); };
$("#prevPage").onclick = () => { page -= 1; render(); };
$("#nextPage").onclick = () => { page += 1; render(); };
$("#pageSize").onchange = (event) => { pageSize = Number(event.target.value); page = 1; render(); };

$("#walletRows").onclick = (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) {
    copyText(copyButton.dataset.copy).then(() => toast("已複製"));
    return;
  }
  if (event.target.closest(".cell-link")) event.preventDefault();
  const action = event.target.closest("[data-user]");
  if (action) openWallet(action.dataset.user);
};

$$('.filter-row button').forEach((button) => {
  button.onclick = () => {
    button.parentElement.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    page = 1;
    render();
  };
});

$$('[data-mode]').forEach((button) => {
  button.onclick = () => {
    currentMode = button.dataset.mode;
    configureWalletModal();
    $("#walletAmount").value = "";
    $$(".amount-presets button").forEach((item) => item.classList.remove("active"));
  };
});

$("#lookupUser").onclick = loadWalletUser;
$("#walletUserId").oninput = (event) => {
  activeUser = null;
  if (event.target.value.length >= 3) loadWalletUser();
};
$$('[data-amount]').forEach((button) => {
  button.onclick = () => {
    $$(".amount-presets button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    $("#walletAmount").value = formatNumber(Number(button.dataset.amount));
  };
});
$("#withdrawAll").onclick = () => {
  if (!activeUser && !loadWalletUser()) return;
  $$(".amount-presets button").forEach((item) => item.classList.remove("active"));
  $("#withdrawAll").classList.add("active");
  $("#walletAmount").value = formatNumber(-activeUser.withdrawable);
};
$("#walletAmount").oninput = () => { $("#positionSelect").value = "現金"; };
$("#walletForm").onsubmit = (event) => {
  event.preventDefault();
  const data = validateWallet();
  if (!data) return;
  if (currentMode === "otp" && data.amount < 0 && data.user.turnover > 0) {
    pendingWallet = data;
    riskStep = 0;
    renderRisk();
  } else {
    executeWallet(data);
  }
};
$("#riskConfirm").onclick = () => { if (riskStep < 3) renderRisk(); else executeWallet(pendingWallet, true); };

$("#lookupTurnover").onclick = () => {
  const user = findUser($("#turnoverUserId"));
  $("#turnoverUserError").textContent = user ? "" : "請填寫正確資訊";
  $("#turnoverCurrent").value = user ? `¥ ${formatNumber(user.turnover)}` : "—";
};
$("#turnoverUserId").oninput = (event) => { if (event.target.value.length >= 3) $("#lookupTurnover").click(); };
$("#turnoverForm").onsubmit = (event) => {
  event.preventDefault();
  const user = findUser($("#turnoverUserId"));
  const amount = Number($("#turnoverAmount").value.replaceAll(",", ""));
  const remark = $("#turnoverRemark").value.trim();
  $("#turnoverUserError").textContent = user ? "" : "請填寫正確資訊";
  $("#turnoverAmountError").textContent = Number.isFinite(amount) && amount !== 0 ? "" : "請輸入正確值";
  $("#turnoverRemarkError").textContent = remark ? "" : "請輸入備註";
  if (!user || !Number.isFinite(amount) || amount === 0 || !remark) return;
  if (user.turnover + amount < 0) {
    $("#turnoverAmountError").textContent = "調整後流水限額不得小於 0";
    return;
  }
  users = users.map((item) => item.hash === user.hash ? {...item, turnover:item.turnover + amount, updated:new Date().toLocaleString("zh-TW", {hour12:false}).replaceAll("/", "-")} : item);
  closeModal("#turnoverModal");
  render();
  toast(`用戶 ${user.hash} 流水限額已更新`);
};

document.addEventListener("click", (event) => {
  const close = event.target.closest("[data-close]");
  if (close) closeModal(`#${close.dataset.close}`);
  if (event.target.classList.contains("modal-layer")) closeModal(`#${event.target.id}`);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") $$(".modal-layer:not(.hidden)").forEach((modal) => closeModal(`#${modal.id}`));
});

render();
