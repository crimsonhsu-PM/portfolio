'use strict';
/* 多語言資源平台 V2 原型（規格標準：《多語言資源平台》規格文件）
 * 純前端示範：資料存在記憶體，重新整理會回到示範資料。
 * 前端身分切換只用於展示權限，不代表安全驗證。 */

// ───────────────────────── 時間工具 ─────────────────────────
const pad = value => String(value).padStart(2, '0');
const formatTime = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
const nowText = () => formatTime(new Date());
function daysAgo(days, hour = 10, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return formatTime(date);
}
const parseTime = text => new Date(String(text).replace(' ', 'T'));
const DAY = 24 * 60 * 60 * 1000;
const RECYCLE_DAYS = 30;

// ───────────────────────── 角色與帳號 ─────────────────────────
const roles = {
  admin: { name: '超管', account: 'admin01', avatar: '管', ip: '10.20.1.11', desc: '管理專案、介面、原文／翻譯與平台檔名，可封存、匯出及從回收區復原；不能指派或審核。' },
  planner: { name: '企劃', account: 'planner01', avatar: '企', ip: '10.20.1.12', desc: '與超管權限相同。' },
  lead: { name: '美術組長', account: 'artlead01', avatar: '組', ip: '10.20.3.45', desc: '修改美術指派、上傳各語系圖片、填寫動畫路徑、調整高寬限制，並執行唯一的審核與退回。' },
  artist: { name: '美術', account: 'artist08', avatar: '美', userId: 'u-mimi', ip: '10.20.5.8', desc: '只能操作指派給本人的專案：上傳翻譯語系圖片、填寫動畫路徑、編輯製作備註。' },
  qa: { name: 'QA', account: 'qa0007', avatar: 'QA', ip: '10.20.7.7', desc: '純查看：可搜尋、預覽與複製文字，查看不會改變任何狀態。' }
};
const roleLabel = { admin: '超管', planner: '企劃', lead: '美術組長', artist: '美術', qa: 'QA' };

const accounts = [
  { id: 'a-planner', role: 'planner', account: 'planner01', name: '大頭', login: daysAgo(0, 9, 12), auth: '已綁定', active: true },
  { id: 'a-lead', role: 'lead', account: 'artlead01', name: '小鹿', login: daysAgo(0, 9, 8), auth: '已綁定', active: true },
  { id: 'a-lead2', role: 'lead', account: 'artlead02', name: '阿哲', login: daysAgo(1, 18, 2), auth: '已綁定', active: true },
  { id: 'u-amy', role: 'artist', account: 'artist01', name: 'Amy', login: daysAgo(1, 18, 31), auth: '已綁定', active: true },
  { id: 'u-andy', role: 'artist', account: 'artist02', name: 'Andy', login: daysAgo(1, 17, 45), auth: '已綁定', active: true },
  { id: 'u-mimi', role: 'artist', account: 'artist08', name: '米米', login: daysAgo(0, 8, 55), auth: '已綁定', active: true },
  { id: 'u-louis', role: 'artist', account: 'artist12', name: 'Louis', login: daysAgo(25, 12, 20), auth: '未綁定', active: false },
  { id: 'a-qa', role: 'qa', account: 'qa0007', name: '測試七號', login: daysAgo(1, 16, 12), auth: '已綁定', active: true }
];
const artists = () => accounts.filter(account => account.role === 'artist');
const accountById = id => accounts.find(account => account.id === id);
const isActiveArtist = id => !!accountById(id)?.active;

// ───────────────────────── 語系 ─────────────────────────
const localeMeta = {
  zh: { name: '簡中', full: '簡體中文', code: 'zh-CN' },
  en: { name: '英文', full: '英文', code: 'en-US' },
  id: { name: '印尼文', full: '印尼文', code: 'id-ID' },
  pt: { name: '葡萄牙文', full: '巴西葡萄牙文', code: 'pt-BR' }
};
const requiredLocales = ['en', 'id', 'pt'];
const allLocales = ['zh', ...requiredLocales];

// ───────────────────────── 示範資料 ─────────────────────────
function version(no, name, width, height, status = 'current', days = 3) {
  return { id: `${name}-v${no}`, no, name, width, height, status, createdAt: daysAgo(days, 10, 20 + no) };
}

const projects = [
  { id: 'p-invite', name: '邀請好友', scenario: '製作中｜混合資源', assignments: { static: ['u-amy', 'u-mimi', 'u-louis'], motion: ['u-andy'] }, updatedAt: daysAgo(0, 9, 10), updatedBy: 'artlead01' },
  { id: 'p-register', name: '註冊', scenario: '全部審核｜可封存、可選語系匯出', assignments: { static: ['u-amy'], motion: ['u-andy'] }, updatedAt: daysAgo(0, 9, 5), updatedBy: 'admin01' },
  { id: 'p-redeem', name: '兌換中心', scenario: '待分配｜剛建立，只有簡中原圖', assignments: { static: [], motion: [] }, updatedAt: daysAgo(0, 9, 0), updatedBy: 'planner01' },
  { id: 'p-lucky', name: '幸運奪寶', scenario: '待組長審核｜靜態與動畫', assignments: { static: ['u-andy'], motion: ['u-mimi'] }, updatedAt: daysAgo(0, 8, 55), updatedBy: 'artlead01' },
  { id: 'p-conflict', name: '檔名衝突測試', scenario: '匯出例外｜cocos 檔名重複', assignments: { static: ['u-amy'], motion: [] }, updatedAt: daysAgo(0, 8, 50), updatedBy: 'admin01' },
  { id: 'p-daily', name: '每日任務', scenario: '已指派｜翻譯待上傳', assignments: { static: ['u-mimi'], motion: [] }, updatedAt: daysAgo(1, 15, 20), updatedBy: 'artlead01' },
  { id: 'p-newbie', name: '新手禮包', scenario: '已封存｜負責人已清空', assignments: { static: [], motion: [] }, updatedAt: daysAgo(4, 14, 32), updatedBy: 'planner01', archived: true, archivedAt: daysAgo(4, 14, 32), archivedBy: 'planner01' },
  { id: 'p-spring', name: '春節活動', scenario: '已封存｜有指派美術', assignments: { static: ['u-amy', 'u-mimi'], motion: ['u-andy'] }, updatedAt: daysAgo(7, 17, 5), updatedBy: 'admin01', archived: true, archivedAt: daysAgo(7, 17, 5), archivedBy: 'admin01' },
  { id: 'p-register-old', name: '註冊', assignments: { static: [], motion: [] }, updatedAt: daysAgo(30, 10, 10), updatedBy: 'admin01', deleted: true, deletedGroup: 'trash-project-register' }
];

const screens = [
  { id: 's-invite-c1', projectId: 'p-invite', name: '遊戲轉盤05.png', platform: 'cocos', uploadedAt: daysAgo(13, 11, 20) },
  { id: 's-invite-c2', projectId: 'p-invite', name: '遊戲轉盤04.jpg', platform: 'cocos', uploadedAt: daysAgo(13, 11, 22) },
  { id: 's-invite-h1', projectId: 'p-invite', name: '遊戲轉盤03.png', platform: 'h5', uploadedAt: daysAgo(13, 11, 25) },
  { id: 's-invite-h2', projectId: 'p-invite', name: '活動規則.webp', platform: 'h5', uploadedAt: daysAgo(13, 11, 28) },
  { id: 's-register-c1', projectId: 'p-register', name: '註冊首頁.png', platform: 'cocos', uploadedAt: daysAgo(12, 10, 30) },
  { id: 's-register-h1', projectId: 'p-register', name: '手機驗證.webp', platform: 'h5', uploadedAt: daysAgo(12, 10, 32) },
  { id: 's-lucky-c1', projectId: 'p-lucky', name: '獎勵彈窗.png', platform: 'cocos', uploadedAt: daysAgo(12, 14, 15) },
  { id: 's-lucky-h1', projectId: 'p-lucky', name: '遊戲大廳.jpg', platform: 'h5', uploadedAt: daysAgo(12, 14, 17) },
  { id: 's-conflict-c1', projectId: 'p-conflict', name: '檔名衝突.png', platform: 'cocos', uploadedAt: daysAgo(10, 8, 40) },
  { id: 's-redeem-c1', projectId: 'p-redeem', name: '兌換頁.png', platform: 'cocos', uploadedAt: daysAgo(0, 9, 0) },
  { id: 's-daily-c1', projectId: 'p-daily', name: '任務頁.png', platform: 'cocos', uploadedAt: daysAgo(1, 15, 0) },
  { id: 's-newbie-c1', projectId: 'p-newbie', name: '禮包頁.png', platform: 'cocos', uploadedAt: daysAgo(20, 10, 0) },
  { id: 's-newbie-h1', projectId: 'p-newbie', name: '禮包頁.png', platform: 'h5', uploadedAt: daysAgo(20, 10, 5) },
  { id: 's-spring-c1', projectId: 'p-spring', name: '春節首頁.png', platform: 'cocos', uploadedAt: daysAgo(30, 10, 0) },
  { id: 's-spring-h1', projectId: 'p-spring', name: '紅包彈窗.png', platform: 'h5', uploadedAt: daysAgo(30, 10, 5) },
  { id: 's-regold-c1', projectId: 'p-register-old', name: '註冊首頁.png', platform: 'cocos', uploadedAt: daysAgo(40, 10, 0), deleted: true, deletedGroup: 'trash-project-register' },
  { id: 's-invite-deleted', projectId: 'p-invite', name: '遊戲轉盤05.png', platform: 'cocos', uploadedAt: daysAgo(25, 10, 0), deleted: true, deletedGroup: 'trash-screen-invite' }
];

const approved = (days, hour = 16, minute = 35) => ({ status: 'approved', by: 'artlead01', at: daysAgo(days, hour, minute) });
const fourLocales = (prefix, ext, w, h, sizes = {}) => Object.fromEntries(allLocales.map(locale => [locale, [version(1, `${prefix}_${locale}.${ext}`, sizes[locale]?.[0] ?? w, sizes[locale]?.[1] ?? h)]]));

const resources = [
  { id: 'r-banner', screenId: 's-invite-c1', type: 'static', cocos: 'banner_bg', h5: 'invite_banner_bg', text: { zh: '邀请好友', en: 'Invite Friends', id: 'Undang Teman', pt: 'Convidar amigos' }, note: '標題置中，保留安全區', leadNote: '四語系已確認', scenario: '靜態｜四語系審核鎖定｜固定寬高', fixedWidth: true, fixedHeight: true, rework: [], locked: true, review: approved(1, 8, 50), reviewLog: [], assets: fourLocales('banner_bg', 'png', 1456, 576) },
  { id: 'r-invite-button', screenId: 's-invite-c1', type: 'static', cocos: 'btn_invite', h5: 'invite_now', text: { zh: '立即邀请', en: 'Invite Now', id: 'Undang Sekarang', pt: 'Convidar agora' }, note: '按鈕文字不可換行', leadNote: '等待葡語', scenario: '靜態｜缺葡語｜英文有舊版｜固定高', fixedWidth: false, fixedHeight: true, rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], assets: { zh: [version(1, 'btn_invite_zh.png', 728, 288)], en: [version(2, 'btn_invite_en.png', 760, 288), version(1, 'btn_invite_en.png', 728, 288, 'superseded', 5)], id: [version(1, 'btn_invite_id.png', 752, 288)], pt: [] } },
  { id: 'r-rules', screenId: 's-invite-h2', type: 'static', cocos: 'rule_panel', h5: 'event_rules_panel', text: { zh: '活动规则', en: 'Event Rules', id: 'Aturan Acara', pt: 'Regras do evento' }, note: '支援長條內容', leadNote: '待組長審核', scenario: '靜態｜四語系待查看｜固定寬', fixedWidth: true, fixedHeight: false, rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], assets: fourLocales('rule_panel', 'webp', 1200, 860, { en: [1200, 900], id: [1200, 910], pt: [1200, 940] }) },
  { id: 'r-motion', screenId: 's-invite-c2', type: 'motion', cocos: 'reward_title', h5: 'reward_title_anim', text: { zh: '丰厚奖励', en: 'Big Rewards', id: 'Hadiah Besar', pt: 'Grandes prêmios' }, note: '使用 Spine 動畫', leadNote: '共用一條路徑', scenario: '動畫｜有路徑待查看', path: '\\\\design-nas\\motion\\invite\\reward_title', motionFlag: '', rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], assets: {} },
  { id: 'r-checkin', screenId: 's-invite-h1', type: 'static', cocos: 'checkin_title', h5: 'daily_checkin_title', text: { zh: '每日签到', en: 'Daily Check-in', id: 'Check-in Harian', pt: 'Check-in diário' }, note: '米米的本人任務', leadNote: '注意英文長度', scenario: '靜態｜英文被組長退回', fixedWidth: true, fixedHeight: false, rework: ['en'], locked: false, review: { status: 'rejected' }, reviewLog: [{ action: '退回', by: 'artlead01', at: daysAgo(1, 15, 10), locales: ['en'], reason: '英文排版超出安全區' }], assets: fourLocales('checkin_title', 'png', 780, 180) },
  { id: 'r-source-only', screenId: 's-invite-h1', type: 'static', cocos: 'source_only', h5: 'source_only_h5', text: { zh: '仅有原图', en: 'Source Only', id: 'Hanya Sumber', pt: 'Somente origem' }, note: '新增資源後只建立簡中版本', leadNote: '', scenario: '靜態｜僅簡中原圖｜不限尺寸', fixedWidth: false, fixedHeight: false, rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], assets: { zh: [version(1, 'source_only_zh.jpg', 680, 240)], en: [], id: [], pt: [] } },
  { id: 'r-source-resized', screenId: 's-invite-h2', type: 'static', cocos: 'source_resized', h5: 'source_resized_h5', text: { zh: '原图已改尺寸', en: 'Source Resized', id: 'Sumber Diubah', pt: 'Origem redimensionada' }, note: '簡中原圖尺寸已改變', leadNote: '全部翻譯需重製', scenario: '靜態｜原圖改尺寸｜三語系待重做', fixedWidth: true, fixedHeight: true, rework: ['en', 'id', 'pt'], locked: false, review: { status: 'pending' }, reviewLog: [], assets: { zh: [version(2, 'source_resized_zh.png', 900, 320), version(1, 'source_resized_zh.png', 860, 300, 'superseded', 5)], en: [version(1, 'source_resized_en.png', 860, 300)], id: [version(1, 'source_resized_id.png', 860, 300)], pt: [version(1, 'source_resized_pt.png', 860, 300)] } },
  { id: 'r-motion-empty', screenId: 's-invite-c2', type: 'motion', cocos: 'motion_no_path', h5: 'motion_no_path_h5', text: { zh: '动画尚未提供', en: 'Animation Missing', id: 'Animasi Belum Ada', pt: 'Animação ausente' }, note: '動畫尚未填內網路徑', leadNote: '', scenario: '動畫｜缺少共用路徑', path: '', motionFlag: '', rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], assets: {} },
  { id: 'r-register-title', screenId: 's-register-c1', type: 'static', cocos: 'register_title', h5: 'signup_title', text: { zh: '创建账号', en: 'Create Account', id: 'Buat Akun', pt: 'Criar conta' }, note: '', leadNote: '已審核', scenario: '可匯出｜靜態 PNG', fixedWidth: true, fixedHeight: true, rework: [], locked: true, review: approved(2), reviewLog: [], assets: fourLocales('register_title', 'png', 640, 160) },
  { id: 'r-register-code', screenId: 's-register-h1', type: 'static', cocos: 'verify_code', h5: 'otp_verify', text: { zh: '输入验证码', en: 'Enter verification code', id: 'Masukkan kode verifikasi', pt: 'Insira o código de verificação' }, note: '手機驗證畫面', leadNote: '已審核', scenario: '可匯出｜靜態 WebP', fixedWidth: false, fixedHeight: true, rework: [], locked: true, review: approved(2, 16, 38), reviewLog: [], assets: fourLocales('verify_code', 'webp', 720, 120, { en: [900, 120], id: [960, 120], pt: [900, 120] }) },
  { id: 'r-register-motion', screenId: 's-register-h1', type: 'motion', cocos: 'signup_success', h5: 'signup_success_anim', text: { zh: '注册成功', en: 'Sign-up Complete', id: 'Pendaftaran Berhasil', pt: 'Cadastro concluído' }, note: '', leadNote: '路徑正確', scenario: '動畫｜已審核鎖定', path: '\\\\design-nas\\motion\\register\\signup_success', motionFlag: '', rework: [], locked: true, review: approved(1, 8, 45), reviewLog: [], assets: {} },
  { id: 'r-lucky-card', screenId: 's-lucky-c1', type: 'static', cocos: 'prize_card', h5: 'reward_card', text: { zh: '恭喜获得', en: 'Congratulations', id: 'Selamat', pt: 'Parabéns' }, note: '所有語系已上傳', leadNote: '', scenario: '待組長審核｜靜態', fixedWidth: true, fixedHeight: true, rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], assets: fourLocales('prize_card', 'png', 860, 520) },
  { id: 'r-lucky-motion', screenId: 's-lucky-h1', type: 'motion', cocos: 'prize_glow', h5: 'mega_prize_anim', text: { zh: '超级大奖', en: 'Mega Prize', id: 'Hadiah Utama', pt: 'Grande prêmio' }, note: '共用動畫路徑', leadNote: '', scenario: '待組長審核｜動畫', path: '\\\\design-nas\\motion\\lucky\\prize_glow', motionFlag: '', rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], assets: {} },
  { id: 'r-conflict-a', screenId: 's-conflict-c1', type: 'static', cocos: 'duplicate_title', h5: 'conflict_title_a_h5', text: { zh: '冲突标题甲', en: 'Conflict A', id: 'Konflik A', pt: 'Conflito A' }, note: '與另一筆 cocos 檔名重複', leadNote: '', scenario: '匯出例外｜重複檔名 A', fixedWidth: false, fixedHeight: false, rework: [], locked: true, review: approved(0, 8, 40), reviewLog: [], assets: fourLocales('conflict_a', 'png', 600, 120) },
  { id: 'r-conflict-b', screenId: 's-conflict-c1', type: 'static', cocos: 'duplicate_title', h5: 'conflict_title_b_h5', text: { zh: '冲突标题乙', en: 'Conflict B', id: 'Konflik B', pt: 'Conflito B' }, note: '與另一筆 cocos 檔名重複', leadNote: '', scenario: '匯出例外｜重複檔名 B', fixedWidth: false, fixedHeight: false, rework: [], locked: true, review: approved(0, 8, 41), reviewLog: [], assets: fourLocales('conflict_b', 'png', 600, 120) },
  { id: 'r-redeem-btn', screenId: 's-redeem-c1', type: 'static', cocos: 'redeem_btn', h5: 'redeem_btn_h5', text: { zh: '立即兑换', en: 'Redeem Now', id: 'Tukar Sekarang', pt: 'Resgatar agora' }, note: '', leadNote: '', scenario: '待分配｜只有簡中原圖', fixedWidth: false, fixedHeight: true, rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], assets: { zh: [version(1, 'redeem_btn_zh.png', 600, 160, 'current', 0)], en: [], id: [], pt: [] } },
  { id: 'r-daily-title', screenId: 's-daily-c1', type: 'static', cocos: 'task_title', h5: 'task_title_h5', text: { zh: '每日任务', en: 'Daily Tasks', id: 'Tugas Harian', pt: 'Tarefas diárias' }, note: '米米的本人任務', leadNote: '', scenario: '已指派｜三語系待上傳｜固定高', fixedWidth: false, fixedHeight: true, rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], assets: { zh: [version(1, 'task_title_zh.png', 640, 120, 'current', 1)], en: [], id: [], pt: [] } },
  { id: 'r-newbie-title', screenId: 's-newbie-c1', type: 'static', cocos: 'gift_title', h5: 'gift_title_h5', text: { zh: '新手礼包', en: 'Starter Pack', id: 'Paket Pemula', pt: 'Pacote inicial' }, note: '', leadNote: '', scenario: '已封存｜靜態', fixedWidth: false, fixedHeight: true, rework: [], locked: true, review: approved(5), reviewLog: [], assets: fourLocales('gift_title', 'png', 520, 140, { en: [560, 140], pt: [600, 140] }) },
  { id: 'r-newbie-motion', screenId: 's-newbie-h1', type: 'motion', cocos: 'gift_open', h5: 'gift_open_anim', text: { zh: '打开礼包', en: 'Open Pack', id: 'Buka Paket', pt: 'Abrir pacote' }, note: '', leadNote: '', scenario: '已封存｜動畫', path: '\\\\design-nas\\motion\\newbie\\gift_open', motionFlag: '', rework: [], locked: true, review: approved(5, 16, 40), reviewLog: [], assets: {} },
  { id: 'r-spring-title', screenId: 's-spring-c1', type: 'static', cocos: 'spring_title', h5: 'spring_title_h5', text: { zh: '春节快乐', en: 'Happy New Year', id: 'Selamat Tahun Baru', pt: 'Feliz Ano Novo' }, note: '米米製作', leadNote: '', scenario: '已封存｜靜態', fixedWidth: false, fixedHeight: true, rework: [], locked: true, review: approved(8, 15, 20), reviewLog: [], assets: fourLocales('spring_title', 'png', 600, 160, { en: [640, 160], id: [700, 160], pt: [660, 160] }) },
  { id: 'r-spring-btn', screenId: 's-spring-c1', type: 'static', cocos: 'redbag_btn', h5: 'redbag_btn_h5', text: { zh: '领红包', en: 'Claim', id: 'Klaim', pt: 'Resgatar' }, note: 'Amy 製作', leadNote: '', scenario: '已封存｜固定寬高', fixedWidth: true, fixedHeight: true, rework: [], locked: true, review: approved(8, 15, 25), reviewLog: [], assets: fourLocales('redbag_btn', 'png', 280, 96) },
  { id: 'r-spring-anim', screenId: 's-spring-h1', type: 'motion', cocos: 'redbag_open', h5: 'redbag_open_anim', text: { zh: '红包开启', en: 'Open Red Packet', id: 'Buka Angpao', pt: 'Abrir envelope' }, note: 'Andy 製作', leadNote: '', scenario: '已封存｜動畫', path: '\\\\design-nas\\motion\\spring\\redbag_open', motionFlag: '', rework: [], locked: true, review: approved(8, 15, 30), reviewLog: [], assets: {} },
  // 回收區資料
  { id: 'r-banner-old', screenId: 's-invite-c1', type: 'static', cocos: 'banner_bg', h5: 'invite_banner_bg', text: { zh: '旧邀请横幅', en: 'Old Invite Banner', id: 'Banner Lama', pt: 'Banner antigo' }, note: '回收區資源重名情境', leadNote: '', fixedWidth: true, fixedHeight: true, rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], assets: { zh: [version(1, 'old_banner_zh.png', 1456, 576)], en: [], id: [], pt: [] }, deleted: true, deletedGroup: 'trash-resource-banner' },
  { id: 'r-regold-title', screenId: 's-regold-c1', type: 'static', cocos: 'register_title_old', h5: 'signup_title_old', text: { zh: '旧版注册', en: 'Old Sign-up', id: 'Daftar Lama', pt: 'Cadastro antigo' }, note: '隨專案一起刪除', leadNote: '', fixedWidth: false, fixedHeight: false, rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], assets: { zh: [version(1, 'register_old_zh.png', 640, 160)], en: [], id: [], pt: [] }, deleted: true, deletedGroup: 'trash-project-register' },
  { id: 'r-spin-btn', screenId: 's-invite-deleted', type: 'static', cocos: 'spin_btn', h5: 'spin_btn_h5', text: { zh: '开始转盘', en: 'Spin', id: 'Putar', pt: 'Girar' }, note: '比所屬介面更早單獨刪除', leadNote: '', fixedWidth: false, fixedHeight: false, rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], assets: { zh: [version(1, 'spin_btn_zh.png', 300, 120)], en: [], id: [], pt: [] }, deleted: true, deletedGroup: 'trash-resource-spin' },
  { id: 'r-wheel-bg', screenId: 's-invite-deleted', type: 'static', cocos: 'wheel_bg', h5: 'wheel_bg_h5', text: { zh: '转盘背景', en: 'Wheel', id: 'Roda', pt: 'Roda' }, note: '與介面一起刪除', leadNote: '', fixedWidth: false, fixedHeight: false, rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], assets: { zh: [version(1, 'wheel_bg_zh.png', 900, 900)], en: [], id: [], pt: [] }, deleted: true, deletedGroup: 'trash-screen-invite' }
];

const recycleBin = [
  { id: 'trash-project-register', entityType: 'project', entityId: 'p-register-old', deletedAt: daysAgo(24, 10, 12), deletedBy: 'admin01' },
  { id: 'trash-screen-invite', entityType: 'screen', entityId: 's-invite-deleted', deletedAt: daysAgo(13, 16, 40), deletedBy: 'planner01' },
  { id: 'trash-resource-spin', entityType: 'resource', entityId: 'r-spin-btn', deletedAt: daysAgo(14, 11, 20), deletedBy: 'planner01' },
  { id: 'trash-resource-banner', entityType: 'resource', entityId: 'r-banner-old', deletedAt: daysAgo(29, 15, 30), deletedBy: 'admin01' }
];

const logs = [];
let logSeq = 0;
function seedLog(at, actor, actorRole, action, entity, target, summary, changes = [], api = '') {
  const [apiMethod = '', apiPath = ''] = api.split(' ');
  const requestId = api ? `req_${(Date.parse(at.replace(' ', 'T')) / 1000).toString(36)}${(logSeq * 7919).toString(16).padStart(6, '0')}` : '';
  logs.push({ id: `log-${++logSeq}`, at, actor, actorRole, action, entity, target, summary, changes, ip: roles[actorRole]?.ip || '10.20.0.1', apiMethod, apiPath, requestId });
}
seedLog(daysAgo(29, 15, 30), 'admin01', 'admin', '刪除', '資源', 'banner_bg', '移到回收區', [{ field: '狀態', before: '使用中', after: '回收區' }], 'DELETE /api/resources/r-banner-old');
seedLog(daysAgo(25, 10, 30), 'artlead01', 'lead', '停用帳號', '帳號', 'artist12', '帳號停用，既有登入已失效', [{ field: '帳號狀態', before: '啟用', after: '已停用' }], 'PATCH /api/users/u-louis/deactivate');
seedLog(daysAgo(24, 10, 12), 'admin01', 'admin', '刪除', '專案', '註冊', '專案連同介面與資源移到回收區', [{ field: '狀態', before: '使用中', after: '回收區' }], 'DELETE /api/projects/p-register-old');
seedLog(daysAgo(14, 11, 20), 'planner01', 'planner', '刪除', '資源', 'spin_btn', '移到回收區', [{ field: '狀態', before: '使用中', after: '回收區' }], 'DELETE /api/resources/r-spin-btn');
seedLog(daysAgo(13, 16, 40), 'planner01', 'planner', '刪除', '介面', '遊戲轉盤05.png（cocos）', '介面連同資源移到回收區', [{ field: '狀態', before: '使用中', after: '回收區' }], 'DELETE /api/screens/s-invite-deleted');
seedLog(daysAgo(7, 17, 5), 'admin01', 'admin', '封存', '專案', '春節活動', '專案已封存', [{ field: '封存狀態', before: '未封存', after: '已封存' }], 'POST /api/projects/p-spring/archive');
seedLog(daysAgo(4, 14, 32), 'planner01', 'planner', '封存', '專案', '新手禮包', '專案已封存', [{ field: '封存狀態', before: '未封存', after: '已封存' }], 'POST /api/projects/p-newbie/archive');
seedLog(daysAgo(1, 8, 50), 'artlead01', 'lead', '審核', '資源', 'banner_bg', '審核通過並鎖定', [{ field: '資源狀態', before: '待查看', after: '已審核' }], 'POST /api/resources/r-banner/lead-review');
seedLog(daysAgo(0, 9, 12), 'admin01', 'admin', '重設密碼', '帳號', 'artist01', '密碼已重設（不記錄內容）', [], 'POST /api/users/u-amy/reset-password');
seedLog(daysAgo(0, 9, 10), 'artlead01', 'lead', '指派', '專案', '邀請好友', '靜態美術新增 米米', [{ field: '靜態美術', before: 'Amy、Louis', after: 'Amy、米米、Louis' }], 'PUT /api/projects/p-invite/assignments/static');
seedLog(daysAgo(1, 15, 10), 'artlead01', 'lead', '退回', '資源', 'checkin_title', '英文待重做', [{ field: '資源狀態', before: '待查看', after: '待製作' }, { field: '英文 待重做', before: '否', after: '是' }, { field: '退回原因', before: '無', after: '英文排版超出安全區' }], 'POST /api/resources/r-checkin/lead-review');

// ───────────────────────── 執行狀態 ─────────────────────────
let currentRole = 'admin';
let currentPage = 'projects';
let currentTab = 'all';
let currentProjectId = null;
const selectedResources = new Set();
let resourcePageSize = 30;
let resourcePage = 1;
let logPage = 1;
const LOG_PAGE_SIZE = 10;

// ───────────────────────── DOM 工具 ─────────────────────────
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const me = () => roles[currentRole];
const isAdmin = () => currentRole === 'admin' || currentRole === 'planner';

function toast(message, type = 'success') {
  const element = $('#toast');
  element.innerHTML = `<span class="toast-icon ${type}" aria-hidden="true">${type === 'error' ? '!' : '✓'}</span>${esc(message)}`;
  element.className = 'toast show';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { element.className = 'toast'; }, 3200);
}

/* 每次寫入操作對應一次 API 請求；同一請求產生的多筆日誌共用請求編號（例如批次修改、建立專案）。 */
let currentRequest = null;
const newRequestId = () => `req_${Date.now().toString(36)}${Math.random().toString(16).slice(2, 8)}`;
function beginRequest(method, path) {
  currentRequest = { method, path, id: newRequestId() };
  queueMicrotask(() => { currentRequest = null; });
}

function addLog(action, entity, target, summary, changes = []) {
  const request = currentRequest || { method: '', path: '', id: '' };
  logs.push({ id: `log-${++logSeq}`, at: nowText(), actor: me().account, actorRole: currentRole, action, entity, target, summary, changes, ip: me().ip, apiMethod: request.method, apiPath: request.path, requestId: request.id });
}

// ───────────────────────── 資料查詢 ─────────────────────────
const projectById = id => projects.find(project => project.id === id && !project.deleted);
const screenById = id => screens.find(screen => screen.id === id && !screen.deleted);
const resourceById = id => resources.find(resource => resource.id === id && !resource.deleted);
const screensForProject = projectId => screens.filter(screen => !screen.deleted && screen.projectId === projectId);
function resourcesForProject(projectId) {
  const ids = new Set(screensForProject(projectId).map(screen => screen.id));
  return resources.filter(resource => !resource.deleted && ids.has(resource.screenId));
}
function projectOfResource(resource) {
  const screen = screens.find(item => item.id === resource.screenId);
  return screen ? projects.find(project => project.id === screen.projectId) : null;
}
const currentAsset = (resource, locale) => (resource.assets?.[locale] || []).find(item => item.status === 'current') || null;
function sourceSize(resource) {
  const source = currentAsset(resource, 'zh');
  return source ? { w: source.width, h: source.height } : { w: 0, h: 0 };
}
const artistName = id => accountById(id)?.name || id;
/* 情境標籤（scenario）只描述示範資料的初始狀態；資料一經異動就移除，避免標籤與實際狀態不一致。 */
function touchProject(project) {
  if (!project) return;
  project.updatedAt = nowText();
  project.updatedBy = me().account;
  project.scenario = '';
}

function touchResource(resource) {
  if (!resource) return;
  resource.scenario = '';
  touchProject(projectOfResource(resource));
}

// ───────────────────────── 狀態推導 ─────────────────────────
function resourceState(resource) {
  if (resource.type === 'motion') {
    if (!String(resource.path || '').trim() || resource.motionFlag) return 'needs_production';
    return resource.locked && resource.review?.status === 'approved' ? 'completed' : 'pending_review';
  }
  const missing = requiredLocales.some(locale => !currentAsset(resource, locale) || resource.rework.includes(locale));
  if (missing || !currentAsset(resource, 'zh')) return 'needs_production';
  return resource.locked && resource.review?.status === 'approved' ? 'completed' : 'pending_review';
}

function activeAssignees(project) {
  return [...project.assignments.static, ...project.assignments.motion].filter(isActiveArtist);
}

function isProjectDone(project) {
  const list = resourcesForProject(project.id);
  return list.length > 0 && list.every(resource => resourceState(resource) === 'completed');
}

/** 回傳 unassigned／in_progress／pending_acceptance，全部資源經美術組長審核通過則為 review_done。
 * 專案建立時必有介面與資源，且不可刪到空，所以不存在「尚無資源」狀態。 */
function projectState(project) {
  const list = resourcesForProject(project.id);
  if (isProjectDone(project)) return 'review_done';
  if (!activeAssignees(project).length) return 'unassigned';
  if (list.some(resource => resourceState(resource) === 'needs_production')) return 'in_progress';
  return 'pending_acceptance';
}

const stateText = { unassigned: '待分配', in_progress: '製作中', pending_acceptance: '待組長審核', review_done: '審核完成', needs_production: '待製作', pending_review: '待查看', completed: '已審核', archived: '已封存' };
const stateTag = { unassigned: 'tag-orange', in_progress: 'tag-blue', pending_acceptance: 'tag-purple', review_done: 'tag-green', needs_production: 'tag-orange', pending_review: 'tag-purple', completed: 'tag-green', archived: 'tag-default' };
const tag = (text, cls = 'tag-default', title = '') => `<span class="tag ${cls}"${title ? ` title="${esc(title)}"` : ''}>${esc(text)}</span>`;

function projectStatusHtml(project) {
  if (project.archived) return tag('已封存');
  const state = projectState(project);
  if (state === 'review_done') return tag(stateText[state], stateTag[state], '所有資源均已由美術組長審核通過，可封存');
  return tag(stateText[state], stateTag[state]);
}

// ───────────────────────── 權限 ─────────────────────────
const artistId = () => roles.artist.userId;
function isOwnProject(project) {
  if (!project || currentRole !== 'artist' || !isActiveArtist(artistId())) return false;
  return project.assignments.static.includes(artistId()) || project.assignments.motion.includes(artistId());
}
function isOwnTask(resource) {
  if (currentRole !== 'artist' || !isActiveArtist(artistId())) return false;
  const project = projectOfResource(resource);
  return !!project && project.assignments[resource.type === 'motion' ? 'motion' : 'static'].includes(artistId());
}
const isArchived = resource => !!projectOfResource(resource)?.archived;
const perm = {
  editSourceText: r => isAdmin() && !isArchived(r),
  editTranslation: r => isAdmin() && !isArchived(r) && !r.locked,
  editNote: r => !isArchived(r) && !r.locked && (isAdmin() || isOwnTask(r)),
  editLeadNote: r => currentRole === 'lead' && !isArchived(r),
  editFilename: r => isAdmin() && !isArchived(r),
  editLimits: r => currentRole === 'lead' && !isArchived(r) && !r.locked && r.type === 'static',
  upload: (r, locale) => {
    if (isArchived(r) || r.locked || r.type !== 'static') return false;
    if (locale === 'zh') return isAdmin() || currentRole === 'lead';
    return currentRole === 'lead' || isOwnTask(r);
  },
  editMotion: r => !isArchived(r) && !r.locked && r.type === 'motion' && (currentRole === 'lead' || isOwnTask(r)),
  review: r => currentRole === 'lead' && !isArchived(r),
  select: r => !isArchived(r) && (isAdmin() || currentRole === 'lead' || isOwnTask(r))
};
const pageRoles = { projects: null, archive: null, recycle: ['admin', 'planner'], accounts: ['admin', 'planner', 'lead'], logs: ['admin', 'planner', 'lead'] };
const canSeePage = page => !pageRoles[page] || pageRoles[page].includes(currentRole);

function visibleProjects() {
  const active = projects.filter(project => !project.deleted);
  return currentRole === 'artist' ? active.filter(isOwnProject) : active;
}

// ───────────────────────── 角色切換 ─────────────────────────
function applyRole() {
  const role = me();
  document.body.dataset.role = currentRole;
  $('#roleAvatar').textContent = role.avatar;
  $('#roleName').textContent = role.name;
  $('#roleAccount').textContent = role.account;
  $('#bannerAvatar').textContent = role.avatar;
  $('#bannerTitle').textContent = `目前以${role.name}身分預覽`;
  $('#bannerDesc').textContent = role.desc;
  $$('[data-roles]').forEach(element => element.classList.toggle('hidden', !element.dataset.roles.split(' ').includes(currentRole)));
  $$('#roleMenu [data-role]').forEach(option => option.setAttribute('aria-checked', String(option.dataset.role === currentRole)));
  selectedResources.clear();
  syncArtistFilter();
  if (!canSeePage(currentPage)) showPage('projects');
  if (currentProjectId && !visibleProjects().some(project => project.id === currentProjectId)) closeDrawer();
  renderAll();
}

function syncArtistFilter() {
  const select = $('#artistFilter');
  if (currentRole === 'artist') {
    select.innerHTML = `<option value="">僅本人（${esc(artistName(artistId()))}）</option>`;
    select.disabled = true;
    return;
  }
  select.disabled = false;
  select.innerHTML = '<option value="">全部美術</option>' + artists().map(artist => `<option value="${artist.id}">${esc(artist.name)}${artist.active ? '' : '（已停用）'}</option>`).join('');
}

// ───────────────────────── 頁面切換 ─────────────────────────
function showPage(page) {
  if (!canSeePage(page)) { toast('目前身分沒有此頁面的權限', 'error'); page = 'projects'; }
  currentPage = page;
  $$('.page').forEach(element => element.classList.toggle('active', element.id === `${page}Page`));
  $$('.menu-item').forEach(element => {
    const active = element.dataset.page === page;
    element.classList.toggle('active', active);
    if (active) element.setAttribute('aria-current', 'page'); else element.removeAttribute('aria-current');
  });
  $('#sider').classList.remove('open');
  renderPage();
}

function renderPage() {
  ({ projects: renderProjects, archive: renderArchive, recycle: renderRecycle, accounts: renderAccounts, logs: renderLogs })[currentPage]();
}

function renderAll() {
  renderPage();
  if (currentProjectId) renderDrawer();
}

// ───────────────────────── 專案列表 ─────────────────────────
function assigneeHtml(project, type) {
  const ids = project.assignments[type];
  if (!ids.length && isProjectDone(project) && !project.assignments.static.length && !project.assignments.motion.length) return '<span>美術組長</span>';
  if (!ids.length) return '<span class="muted">尚未指派</span>';
  return ids.map(id => isActiveArtist(id) ? esc(artistName(id)) : `<span class="muted" title="已停用，不計入負責人">${esc(artistName(id))}（已停用）</span>`).join('、');
}

function assigneeCell(project, type) {
  const html = assigneeHtml(project, type);
  if (currentRole !== 'lead' || project.archived) return html;
  return `<button type="button" class="assign-btn" data-assign-type="${type}" data-project-id="${project.id}" aria-haspopup="listbox" aria-expanded="false"><span>${html}</span><span aria-hidden="true">▾</span></button>`;
}

// 專案列表排序：點欄位標題依序 升冪 → 降冪 → 取消（Ant Design 預設）。
let projectSort = { key: '', dir: '' };
const projectStateOrder = ['unassigned', 'in_progress', 'pending_acceptance', 'review_done'];
const collator = new Intl.Collator('zh-Hant', { numeric: true, sensitivity: 'base' });
function assigneeSortText(project, type) {
  return project.assignments[type].filter(isActiveArtist).map(artistName).join('、');
}
function projectSortValue(project, key) {
  switch (key) {
    case 'name': return project.name;
    case 'state': return project.archived ? projectStateOrder.length : projectStateOrder.indexOf(projectState(project));
    case 'screens': return screensForProject(project.id).length;
    case 'static': case 'motion': return assigneeSortText(project, key);
    case 'updated': return project.updatedAt;
    default: return '';
  }
}
function sortProjects(list) {
  const { key, dir } = projectSort;
  if (!key) return list;
  const sign = dir === 'desc' ? -1 : 1;
  return list.sort((a, b) => {
    const x = projectSortValue(a, key);
    const y = projectSortValue(b, key);
    if (x === '' && y !== '') return 1; // 未指派一律排最後
    if (y === '' && x !== '') return -1;
    const result = typeof x === 'number' ? x - y : collator.compare(x, y);
    return result * sign;
  });
}
function toggleProjectSort(key) {
  if (projectSort.key !== key) projectSort = { key, dir: 'asc' };
  else if (projectSort.dir === 'asc') projectSort = { key, dir: 'desc' };
  else projectSort = { key: '', dir: '' };
  renderProjects();
}

function renderProjects() {
  const projectQuery = $('#projectFilter').value.trim().toLowerCase();
  const screenQuery = $('#screenFilter').value.trim().toLowerCase();
  const artistFilter = $('#artistFilter').value;
  const scope = visibleProjects();
  const counts = { all: 0, unassigned: 0, in_progress: 0, pending_acceptance: 0, review_done: 0, archived: 0 };
  scope.forEach(project => {
    if (project.archived) { counts.archived += 1; return; }
    counts.all += 1;
    const state = projectState(project);
    if (counts[state] !== undefined) counts[state] += 1;
  });
  $$('.tab[data-tab]').forEach(tab => { $('span', tab).textContent = counts[tab.dataset.tab]; });

  const list = scope.filter(project => {
    const inTab = currentTab === 'archived' ? project.archived : !project.archived && (currentTab === 'all' || projectState(project) === currentTab);
    const screenNames = screensForProject(project.id).map(screen => screen.name).join(' ').toLowerCase();
    const assigned = [...project.assignments.static, ...project.assignments.motion];
    return inTab
      && (!projectQuery || project.name.toLowerCase().includes(projectQuery))
      && (!screenQuery || screenNames.includes(screenQuery))
      && (!artistFilter || assigned.includes(artistFilter));
  });

  sortProjects(list);
  $$('#projectHead th[aria-sort]').forEach(th => {
    const key = $('.sort-btn', th).dataset.sort;
    th.setAttribute('aria-sort', projectSort.key === key ? (projectSort.dir === 'asc' ? 'ascending' : 'descending') : 'none');
  });
  $('#projectRows').innerHTML = list.map(project => {
    const projectScreens = screensForProject(project.id);
    const done = isProjectDone(project);
    const actions = [`<button type="button" class="link open-project" data-project-id="${project.id}">${currentRole === 'qa' || project.archived ? '查看' : '開啟'}</button>`];
    if (isAdmin() && !project.archived) {
      actions.push(done
        ? `<button type="button" class="link archive-project" data-project-id="${project.id}">封存</button>`
        : `<button type="button" class="link danger delete-project" data-project-id="${project.id}">刪除</button>`);
    }
    if (isAdmin() && project.archived) actions.push(`<button type="button" class="link unarchive-project" data-project-id="${project.id}">取消封存</button>`);
    return `<tr>
      <td><div class="name-cell">${projectNameHtml(project)}${project.scenario ? `<span class="fixture">${esc(project.scenario)}</span>` : ''}</div></td>
      <td>${projectStatusHtml(project)}</td>
      <td><span class="dotted" title="${esc(projectScreens.map(screen => `${screen.platform} ${screen.name}`).join('、') || '尚無介面')}">${projectScreens.length}</span></td>
      <td>${assigneeCell(project, 'static')}</td>
      <td>${assigneeCell(project, 'motion')}</td>
      <td><span class="nowrap">${esc(project.updatedAt)}</span><br><small class="muted">${esc(project.updatedBy)}</small></td>
      <td><div class="actions">${actions.join('')}</div></td>
    </tr>`;
  }).join('');
  $('#projectEmpty').classList.toggle('hidden', list.length > 0);
  $('#projectSummary').textContent = `共 ${list.length} 筆`;
}

// ───────────────────────── 專案操作 ─────────────────────────
function projectNameTaken(name, exceptId) {
  return projects.some(project => !project.deleted && project.id !== exceptId && project.name === name);
}

/** 資源欄位：靜態資源須有簡中原文與簡中原圖；動畫資源須有簡中原文，路徑由美術填寫。 */
function resourceFieldsHtml() {
  return `<div class="form">
    <div class="grid-2"><label class="field"><span class="req">資源類型</span><select name="type" class="input"><option value="static">靜態圖片</option><option value="motion">動畫</option></select></label><span></span>
    <label class="field"><span class="req">cocos 檔名</span><input name="cocos" class="input" maxlength="50"></label><label class="field"><span class="req">h5 檔名</span><input name="h5" class="input" maxlength="50"></label></div>
    <div class="grid-2"><label class="field"><span class="req">簡中原文</span><input name="zh" class="input" maxlength="50"></label><label class="field">英文翻譯<input name="en" class="input" maxlength="50"></label><label class="field">印尼文翻譯<input name="id" class="input" maxlength="50"></label><label class="field">葡萄牙文翻譯<input name="pt" class="input" maxlength="50"></label></div>
    <div class="static-fields form"><fieldset class="fieldset"><legend class="req">簡中原圖</legend><label class="upload-box"><input name="sourceFile" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"><span>點擊選擇簡中原圖</span><small class="muted">支援 PNG、JPG、WebP；沒有圖檔可按下方示範</small></label><div class="demo-row"><button type="button" class="btn small demo-source">使用示範原圖 728 × 288</button><span class="source-picked muted small"></span></div></fieldset>
    <fieldset class="fieldset"><legend>高寬限制（依簡中原圖）</legend><label class="check"><input name="fixedWidth" type="checkbox"> 固定寬度</label> <label class="check"><input name="fixedHeight" type="checkbox"> 固定高度</label></fieldset></div>
    <div class="motion-fields alert alert-info hidden">動畫不需上傳圖片；路徑留空，由指派的動態美術或美術組長填寫，超管／企劃不可填寫。</div>
    <label class="field">製作備註<input name="note" class="input" maxlength="50"></label></div>`;
}

function bindResourceFields(layer) {
  const typeSelect = $('select[name="type"]', layer);
  typeSelect.onchange = () => {
    $('.static-fields', layer).classList.toggle('hidden', typeSelect.value === 'motion');
    $('.motion-fields', layer).classList.toggle('hidden', typeSelect.value !== 'motion');
  };
  layer._source = null;
  $('.demo-source', layer).onclick = () => {
    layer._source = { name: 'demo_source.png', width: 728, height: 288 };
    $('input[name="sourceFile"]', layer).value = '';
    $('.source-picked', layer).textContent = '已選擇示範原圖 728 × 288';
  };
  $('input[name="sourceFile"]', layer).onchange = async event => {
    const file = event.target.files[0];
    if (!file) return;
    if (!/\.(png|jpe?g|webp)$/i.test(file.name)) { layer._source = null; $('.source-picked', layer).textContent = '僅支援 PNG、JPG、WebP'; return; }
    const url = URL.createObjectURL(file);
    const dims = await readImageDimensions(url);
    URL.revokeObjectURL(url);
    layer._source = { name: file.name, width: dims.width, height: dims.height };
    $('.source-picked', layer).textContent = `已選擇 ${file.name} · ${dims.width} × ${dims.height}`;
  };
}

function readResourceFields(layer, projectId) {
  const get = name => String($(`[name="${name}"]`, layer)?.value || '').trim();
  const type = get('type');
  const cocos = get('cocos');
  const h5 = get('h5');
  if (!cocos || !h5) return { error: '請填寫 cocos 檔名與 h5 檔名' };
  if (!get('zh')) return { error: '請填寫簡中原文' };
  if (projectId) {
    const siblings = resourcesForProject(projectId);
    if (siblings.some(resource => resource.cocos === cocos)) return { error: `同一專案已有 cocos 檔名「${cocos}」` };
    if (siblings.some(resource => resource.h5 === h5)) return { error: `同一專案已有 h5 檔名「${h5}」` };
  }
  const source = layer._source;
  if (type === 'static' && !source) return { error: '靜態資源須上傳簡中原圖' };
  const resource = {
    id: `r-${Date.now()}`, type, cocos, h5,
    text: { zh: get('zh'), en: get('en'), id: get('id'), pt: get('pt') }, note: get('note'), leadNote: '',
    fixedWidth: !!$('input[name="fixedWidth"]', layer)?.checked, fixedHeight: !!$('input[name="fixedHeight"]', layer)?.checked,
    rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], path: '', motionFlag: '',
    assets: type === 'static' ? { zh: [{ id: `${cocos}-zh-v1-${Date.now()}`, no: 1, name: source.name, width: source.width, height: source.height, status: 'current', createdAt: nowText() }], en: [], id: [], pt: [] } : {}
  };
  return { resource };
}

const PENCIL = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M13.5 6.5l4 4" stroke="currentColor" stroke-width="2"></path></svg>';
const TRASH = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
let editingProjectId = null;

/** 專案名稱：超管／企劃在未封存專案名稱旁有筆形圖示，點擊直接在列表內改名。 */
function projectNameHtml(project) {
  if (editingProjectId === project.id) {
    return `<div class="inline-edit"><input class="input small-input rename-input" data-project-id="${project.id}" maxlength="50" value="${esc(project.name)}" aria-label="專案名稱"><button type="button" class="icon-btn small save-name" data-project-id="${project.id}" aria-label="儲存專案名稱" title="儲存（Enter）">✓</button><button type="button" class="icon-btn small cancel-name" data-project-id="${project.id}" aria-label="取消修改" title="取消（Esc）">✕</button></div>`;
  }
  const canRename = isAdmin() && !project.archived;
  return `<div class="name-line"><button type="button" class="link strong open-project" data-project-id="${project.id}">${esc(project.name)}</button>${canRename ? `<button type="button" class="icon-btn small edit-name" data-project-id="${project.id}" aria-label="修改專案名稱「${esc(project.name)}」" title="修改專案名稱">${PENCIL}</button>` : ''}</div>`;
}

function startRenameProject(projectId) {
  const project = projectById(projectId);
  if (!project || !isAdmin() || project.archived) return;
  editingProjectId = projectId;
  renderProjects();
  const input = $(`.rename-input[data-project-id="${projectId}"]`);
  input?.focus();
  input?.select();
}

function cancelRenameProject() {
  const id = editingProjectId;
  editingProjectId = null;
  renderProjects();
  $(`.edit-name[data-project-id="${id}"]`)?.focus();
}

function saveRenameProject(projectId) {
  const project = projectById(projectId);
  const input = $(`.rename-input[data-project-id="${projectId}"]`);
  if (!project || !input) return;
  const name = input.value.trim();
  if (!name) { toast('專案名稱不可為空', 'error'); input.focus(); return; }
  if (projectNameTaken(name, project.id)) { toast('已有相同名稱的專案，請修改名稱', 'error'); input.focus(); return; }
  editingProjectId = null;
  if (name !== project.name) {
    beginRequest('PATCH', `/api/projects/${project.id}`);
    addLog('改名', '專案', project.name, `改名為 ${name}`, [{ field: '專案名稱', before: project.name, after: name }]);
    project.name = name;
    touchProject(project);
    toast('專案名稱已更新，資料夾名稱同步更新');
  }
  renderAll();
  $(`.edit-name[data-project-id="${projectId}"]`)?.focus();
}

function deleteProject(projectId) {
  const project = projectById(projectId);
  if (!project || !isAdmin() || project.archived) return;
  const approvedList = resourcesForProject(projectId).filter(resource => resource.locked || resource.review?.status === 'approved');
  if (approvedList.length) { showErrorList('無法刪除專案', approvedList.map(resource => `${resource.cocos}：已審核，請先由美術組長退回`)); return; }
  confirmAction('刪除專案', `「${project.name}」的介面與資源會一併移到回收區，保留 30 天。`, () => {
    const trashId = `trash-${project.id}-${Date.now()}`;
    project.deleted = true;
    project.deletedGroup = trashId;
    screensForProject(project.id).forEach(screen => { screen.deleted = true; screen.deletedGroup = trashId; });
    resources.filter(resource => !resource.deleted && projectOfResource(resource)?.id === project.id).forEach(resource => { resource.deleted = true; resource.deletedGroup = trashId; });
    recycleBin.unshift({ id: trashId, entityType: 'project', entityId: project.id, deletedAt: nowText(), deletedBy: me().account });
    beginRequest('DELETE', `/api/projects/${project.id}`);
    addLog('刪除', '專案', project.name, '專案連同介面與資源移到回收區', [{ field: '狀態', before: '使用中', after: '回收區' }]);
    if (currentProjectId === project.id) closeDrawer();
    renderAll();
    toast('專案、介面與資源已一併移到回收區');
  }, true);
}

function archiveProject(projectId) {
  const project = projectById(projectId);
  if (!project || !isAdmin() || project.archived) return;
  if (!isProjectDone(project)) { showErrorList('無法封存', ['專案須至少一筆資源，且全部經美術組長審核通過才能封存。']); return; }
  confirmAction('封存專案', `封存「${project.name}」後專案為唯讀，可查看與匯出；之後可由超管／企劃取消封存。`, () => {
    project.archived = true;
    project.archivedAt = nowText();
    project.archivedBy = me().account;
    touchProject(project);
    beginRequest('POST', `/api/projects/${project.id}/archive`);
    addLog('封存', '專案', project.name, '專案已封存', [{ field: '封存狀態', before: '未封存', after: '已封存' }]);
    renderAll();
    toast('專案已封存，可於「已封存」篩選或專案封存頁查看');
  });
}

function unarchiveProject(projectId) {
  const project = projectById(projectId);
  if (!project || !isAdmin() || !project.archived) return;
  confirmAction('取消封存', `取消封存「${project.name}」？專案會回到「全部」列表，審核結果與版本不變。`, () => {
    project.archived = false;
    project.archivedAt = '';
    project.archivedBy = '';
    touchProject(project);
    beginRequest('POST', `/api/projects/${project.id}/archive`);
    addLog('取消封存', '專案', project.name, '專案已取消封存', [{ field: '封存狀態', before: '已封存', after: '未封存' }]);
    renderAll();
    toast('已取消封存');
  });
}

// ───────────────────────── 美術指派（美術組長） ─────────────────────────
function closeAssignDropdown() {
  const menu = $('.assign-menu');
  if (!menu) return;
  $(`.assign-btn[data-project-id="${menu.dataset.projectId}"][data-assign-type="${menu.dataset.type}"]`)?.setAttribute('aria-expanded', 'false');
  menu.remove();
}

function openAssignDropdown(trigger) {
  const project = projectById(trigger.dataset.projectId);
  const type = trigger.dataset.assignType;
  if (!project || currentRole !== 'lead' || project.archived) return;
  const existing = $('.assign-menu');
  if (existing && existing.dataset.projectId === project.id && existing.dataset.type === type) { closeAssignDropdown(); return; }
  closeAssignDropdown();
  const typeName = type === 'static' ? '靜態' : '動態';
  const menu = document.createElement('div');
  menu.className = 'dropdown assign-menu';
  menu.dataset.projectId = project.id;
  menu.dataset.type = type;
  menu.innerHTML = `<div class="dropdown-head">${esc(project.name)} · ${typeName}美術<small>可複選；停用帳號不可新增</small></div><div role="listbox" aria-multiselectable="true" aria-label="${typeName}美術">${artists().map(artist => {
    const checked = project.assignments[type].includes(artist.id);
    const disabled = !artist.active && !checked;
    return `<label class="option ${artist.active ? '' : 'is-disabled'}" role="option" aria-selected="${checked}"><input type="checkbox" value="${artist.id}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span><b>${esc(artist.name)}</b><small>${artist.account}${artist.active ? '' : ' · 已停用'}</small></span></label>`;
  }).join('')}</div><div class="dropdown-foot"><button type="button" class="btn small cancel-assign">取消</button><button type="button" class="btn small primary apply-assign">套用</button></div>`;
  document.body.append(menu);
  const rect = trigger.getBoundingClientRect();
  menu.style.left = `${Math.min(Math.max(8, rect.left), window.innerWidth - menu.offsetWidth - 8)}px`;
  const below = rect.bottom + 4;
  menu.style.top = `${below + menu.offsetHeight > window.innerHeight - 8 ? Math.max(8, rect.top - menu.offsetHeight - 4) : below}px`;
  trigger.setAttribute('aria-expanded', 'true');
  menu.onclick = event => event.stopPropagation();
  $$('input', menu).forEach(input => input.onchange = () => input.closest('[role="option"]').setAttribute('aria-selected', String(input.checked)));
  $('.cancel-assign', menu).onclick = closeAssignDropdown;
  $('.apply-assign', menu).onclick = () => {
    const selected = $$('input:checked', menu).map(input => input.value);
    const before = project.assignments[type];
    const removed = before.filter(id => !selected.includes(id));
    const save = () => {
      project.assignments[type] = selected;
      touchProject(project);
      beginRequest('PUT', `/api/projects/${project.id}/assignments/${type}`);
      addLog('指派', '專案', project.name, `${typeName}美術更新`, [{ field: `${typeName}美術`, before: before.map(artistName).join('、') || '無', after: selected.map(artistName).join('、') || '無' }]);
      closeAssignDropdown();
      renderAll();
      toast(`${typeName}美術指派已更新`);
    };
    if (selected.join() === before.join()) { closeAssignDropdown(); return; }
    if (!selected.filter(isActiveArtist).length && before.filter(isActiveArtist).length) {
      const unfinished = resourcesForProject(project.id).filter(resource => (resource.type === 'motion' ? 'motion' : 'static') === type && resourceState(resource) !== 'completed');
      closeAssignDropdown();
      confirmAction(`清空${typeName}美術`, `清空後此類別沒有啟用中的負責人；目前有 ${unfinished.length} 筆未完成的${typeName}資源${unfinished.length ? `（${unfinished.map(resource => resource.cocos).join('、')}）` : ''}。既有資源與版本會保留，確定清空？`, save, true);
    } else if (removed.length) {
      closeAssignDropdown();
      confirmAction('移除美術', `將移除 ${removed.map(artistName).join('、')}，對方立即失去此專案的操作權；已上傳資源與版本保留。`, save);
    } else save();
  };
  $('input:not(:disabled)', menu)?.focus();
}

// ───────────────────────── 專案明細抽屜 ─────────────────────────
function openProject(projectId) {
  const project = projectById(projectId);
  if (!project || !visibleProjects().includes(project)) return;
  currentProjectId = projectId;
  selectedResources.clear();
  $$('.platforms input').forEach(input => { input.checked = true; });
  resetResourceFilters(false);
  $('#drawer').classList.add('open');
  $('#drawer').setAttribute('aria-hidden', 'false');
  $('#drawerMask').classList.remove('hidden');
  document.body.classList.add('no-scroll');
  renderDrawer();
  setTimeout(() => $('#closeDrawer').focus(), 0);
}

function closeDrawer() {
  $('#drawer').classList.remove('open');
  $('#drawer').setAttribute('aria-hidden', 'true');
  $('#drawerMask').classList.add('hidden');
  document.body.classList.remove('no-scroll');
  currentProjectId = null;
  selectedResources.clear();
}

const currentProject = () => projectById(currentProjectId);

function renderDrawer() {
  const project = currentProject();
  if (!project) { closeDrawer(); return; }
  $('#drawerProject').textContent = project.name;
  $('#drawerState').innerHTML = projectStatusHtml(project);
  $('#drawerFolder').textContent = ` 資料夾：/${project.name}`;
  $('#archivedNotice').classList.toggle('hidden', !project.archived);
  $('#addScreenBtn').classList.toggle('hidden', !isAdmin() || !!project.archived);
  $('#addResourceBtn').classList.toggle('hidden', !isAdmin() || !!project.archived);
  $('#exportBtn').classList.toggle('hidden', !isAdmin());
  syncScreenFilter();
  renderScreens();
  renderResources();
}

const enabledPlatforms = () => new Set($$('.platforms input:checked').map(input => input.value));

function renderScreens() {
  const project = currentProject();
  const projectScreens = screensForProject(project.id);
  const platforms = enabledPlatforms();
  const list = projectScreens.filter(screen => platforms.has(screen.platform));
  const editable = isAdmin() && !project.archived;
  $('#screenCards').innerHTML = list.map(screen => {
    const count = resources.filter(resource => !resource.deleted && resource.screenId === screen.id).length;
    return `<article class="screen-card">
      <button type="button" class="screen-preview ${screen.image ? 'has-image' : ''}" data-screen-id="${screen.id}" aria-label="預覽介面 ${esc(screen.name)}">${screen.image ? `<img src="${screen.image}" alt="">` : ''}<span class="tag tag-default">${screen.platform}</span><span class="count-chip">${count} 筆資源</span></button>
      <div class="screen-meta"><div><b title="${esc(screen.name)}">${esc(screen.name)}</b><small class="muted">${screen.platform} · ${esc(screen.uploadedAt)}</small></div>
      ${editable ? `<div class="icon-actions"><button type="button" class="icon-btn small rename-screen" data-screen-id="${screen.id}" aria-label="修改介面名稱「${esc(screen.name)}」" title="修改介面名稱">${PENCIL}</button><button type="button" class="icon-btn small danger-icon delete-screen" data-screen-id="${screen.id}" aria-label="刪除介面「${esc(screen.name)}」" title="刪除介面">${TRASH}</button></div>` : ''}</div>
    </article>`;
  }).join('');
  $('#screenEmpty').classList.toggle('hidden', list.length > 0);
  ['cocos', 'h5'].forEach(platform => {
    const platformScreens = projectScreens.filter(screen => screen.platform === platform);
    const count = resources.filter(resource => !resource.deleted && platformScreens.some(screen => screen.id === resource.screenId)).length;
    $(`#${platform}Summary`).textContent = `${platformScreens.length} 介面 · ${count} 資源`;
  });
}

function syncScreenFilter() {
  const select = $('#resourceScreen');
  const value = select.value;
  const platforms = enabledPlatforms();
  const list = screensForProject(currentProjectId).filter(screen => platforms.has(screen.platform));
  select.innerHTML = '<option value="">全部介面</option>' + list.map(screen => `<option value="${screen.id}">${esc(screen.platform)} · ${esc(screen.name)}</option>`).join('');
  select.value = list.some(screen => screen.id === value) ? value : '';
}

function openScreenPreview(screenId) {
  const screen = screenById(screenId);
  if (!screen) return;
  const list = resources.filter(resource => !resource.deleted && resource.screenId === screenId);
  openModal({
    title: screen.name, subtitle: `${screen.platform} 介面 · ${list.length} 筆資源`,
    body: `${screen.image ? `<img class="screen-full" src="${screen.image}" alt="介面圖 ${esc(screen.name)}">` : ''}<div class="preview-art ${screen.image ? 'hidden' : ''}"><b>${esc(screen.name.replace(/\.(png|jpe?g|webp)$/i, ''))}</b><small>${esc(projectById(screen.projectId)?.name)} · ${screen.platform}</small></div><ul class="plain-list">${list.map(resource => `<li>${esc(resource.cocos)} ${tag(stateText[resourceState(resource)], stateTag[resourceState(resource)])}</li>`).join('') || '<li class="muted">尚無資源</li>'}</ul>`,
    actions: [{ label: '關閉', primary: true }]
  });
}

function screenNameTaken(projectId, platform, name, exceptId) {
  return screens.some(screen => !screen.deleted && screen.id !== exceptId && screen.projectId === projectId && screen.platform === platform && screen.name === name);
}

function openRenameScreen(screenId) {
  const screen = screenById(screenId);
  const project = screen && projectById(screen.projectId);
  if (!screen || !isAdmin() || project?.archived) return;
  const layer = openModal({
    title: '修改介面名稱', subtitle: `${project.name} · ${screen.platform}；不影響底下資源與審核狀態`,
    body: `<form class="form"><label class="field"><span class="req">介面名稱</span><input name="name" class="input" maxlength="50" value="${esc(screen.name)}"></label><p class="field-error" role="alert"></p></form>`,
    actions: [{ label: '取消' }, { label: '儲存', primary: true, id: 'saveScreenName' }]
  });
  $('#saveScreenName', layer).onclick = () => {
    const name = $('input[name="name"]', layer).value.trim();
    const error = $('.field-error', layer);
    if (!name) { error.textContent = '介面名稱不可為空'; return; }
    if (screenNameTaken(screen.projectId, screen.platform, name, screen.id)) { error.textContent = '同一專案、同一平台已有相同介面名稱'; return; }
    if (name !== screen.name) {
      beginRequest('PATCH', `/api/screens/${screen.id}`);
      addLog('改名', '介面', `${screen.name}（${screen.platform}）`, `改名為 ${name}`, [{ field: '介面名稱', before: screen.name, after: name }]);
      screen.name = name;
      touchProject(project);
    }
    closeModal(layer);
    renderDrawer();
    toast('介面名稱已更新');
  };
}

function deleteScreen(screenId) {
  const screen = screenById(screenId);
  const project = screen && projectById(screen.projectId);
  if (!screen || !isAdmin() || project?.archived) return;
  if (screensForProject(project.id).length <= 1) { showErrorList('無法刪除介面', [`「${screen.name}」是「${project.name}」唯一的介面，專案至少要保留一個介面；如要全部清除，請刪除整個專案。`]); return; }
  const children = resources.filter(resource => !resource.deleted && resource.screenId === screenId);
  const approvedList = children.filter(resource => resource.locked || resource.review?.status === 'approved');
  if (approvedList.length) { showErrorList('無法刪除介面', approvedList.map(resource => `${resource.cocos}：已審核，請先由美術組長退回`)); return; }
  confirmAction('刪除介面', `「${screen.name}」與底下 ${children.length} 筆資源會一併移到回收區。`, () => {
    const trashId = `trash-${screen.id}-${Date.now()}`;
    screen.deleted = true;
    screen.deletedGroup = trashId;
    children.forEach(resource => { resource.deleted = true; resource.deletedGroup = trashId; selectedResources.delete(resource.id); });
    recycleBin.unshift({ id: trashId, entityType: 'screen', entityId: screen.id, deletedAt: nowText(), deletedBy: me().account });
    touchProject(project);
    beginRequest('DELETE', `/api/screens/${screen.id}`);
    addLog('刪除', '介面', `${screen.name}（${screen.platform}）`, '介面連同資源移到回收區', [{ field: '狀態', before: '使用中', after: '回收區' }]);
    renderDrawer();
    renderPage();
    toast('介面與底下資源已一併移到回收區');
  }, true);
}

// ───────────────────────── 資源列表 ─────────────────────────
function resourceMatches(resource) {
  const state = $('#resourceState').value;
  const screenId = $('#resourceScreen').value;
  const filenames = $('#filenameSearch').value.split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
  const translation = $('#translationSearch').value.trim().toLowerCase();
  const remark = $('#remarkSearch').value.trim().toLowerCase();
  return (state === 'all' || resourceState(resource) === state)
    && (!screenId || resource.screenId === screenId)
    && (!filenames.length || filenames.some(value => resource.cocos.toLowerCase() === value || resource.h5.toLowerCase() === value))
    && (!translation || Object.values(resource.text).join(' ').toLowerCase().includes(translation))
    && (!remark || `${resource.note} ${resource.leadNote}`.toLowerCase().includes(remark));
}

function scopedResources() {
  const platforms = enabledPlatforms();
  const screenIds = new Set(screensForProject(currentProjectId).filter(screen => platforms.has(screen.platform)).map(screen => screen.id));
  return resources.filter(resource => !resource.deleted && screenIds.has(resource.screenId));
}

function limitText(resource) {
  if (resource.fixedWidth && resource.fixedHeight) return '固定寬高';
  if (resource.fixedWidth) return '固定寬';
  if (resource.fixedHeight) return '固定高';
  return '不限';
}

const svg = (paths, size = 14) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const ICON = {
  upload: svg('<path d="M12 16V4M7 9l5-5 5 5M4 17v3h16v-3"></path>', 12),
  pencil: svg('<path d="M4 20h4L19 9l-4-4L4 16v4z"></path><path d="M13.5 6.5l4 4"></path>', 12),
  eye: svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle>', 13),
  lock: svg('<rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path>', 11),
  image: svg('<rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><path d="M21 16l-5-5-9 9"></path>', 13),
  film: svg('<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4"></path>', 13),
  link: svg('<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"></path><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"></path>', 12),
  check: svg('<path d="M5 12l5 5 9-10"></path>', 12),
  undo: svg('<path d="M9 14L4 9l5-5"></path><path d="M4 9h10a6 6 0 0 1 0 12h-3"></path>', 12),
  width: svg('<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"></path>', 12),
  height: svg('<path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"></path>', 12)
};
const LOCALE_HUE = { zh: 0, en: 210, id: 150, pt: 280 };

function limitTag(resource) {
  const icons = `${resource.fixedWidth ? ICON.width : ''}${resource.fixedHeight ? ICON.height : ''}`;
  const fixed = resource.fixedWidth || resource.fixedHeight;
  return `<span class="tag ${fixed ? 'tag-blue' : 'tag-default'} icon-tag" title="${fixed ? `${limitText(resource)}：翻譯圖須與簡中原圖相同` : '不限制翻譯圖尺寸'}">${icons}${limitText(resource)}</span>`;
}

function sizeCell(resource) {
  if (resource.type === 'motion') return '<span class="muted small">不適用</span>';
  const size = sourceSize(resource);
  const edit = perm.editLimits(resource) ? `<button type="button" class="icon-btn small edit-limits" data-resource-id="${resource.id}" aria-label="調整 ${esc(resource.cocos)} 的高寬限制" title="調整高寬限制">${ICON.pencil}</button>` : '';
  return `<div class="size-cell"><span class="nowrap">${size.w} × ${size.h}</span><div class="size-limit">${limitTag(resource)}${edit}</div></div>`;
}

function editableCell(resource, field, allowed, extraClass = '') {
  const value = field.startsWith('text.') ? resource.text[field.slice(5)] : resource[field];
  if (!allowed) return `<td class="${extraClass}">${value ? esc(value) : '<span class="muted">—</span>'}</td>`;
  return `<td class="${extraClass} editable" contenteditable="true" tabindex="0" data-resource-id="${resource.id}" data-field="${field}" title="點擊修改，Enter 儲存、Esc 取消">${esc(value || '')}</td>`;
}

function assetCell(resource, locale) {
  if (resource.type === 'motion') {
    if (locale !== 'zh') return `<td class="lang-${locale}"><span class="shared-path" title="動畫不分語系，共用一條路徑">${ICON.link}共用路徑</span></td>`;
    const flag = !resource.path ? tag('待填寫', 'tag-orange dot') : resource.motionFlag === 'fix' ? tag('待修改', 'tag-red dot') : resource.motionFlag === 'reupload' ? tag('待重新上傳', 'tag-red dot') : tag('已提供', 'tag-green dot');
    const editable = perm.editMotion(resource);
    const button = `<button type="button" class="icon-btn small motion-path ${editable ? 'primary-icon' : ''}" data-resource-id="${resource.id}" aria-label="${editable ? (resource.path ? '修改' : '填寫') : '查看'} ${esc(resource.cocos)} 的動畫路徑" title="${editable ? (resource.path ? '修改路徑' : '填寫路徑') : '查看路徑'}">${editable ? ICON.pencil : ICON.eye}</button>`;
    return `<td class="lang-zh"><div class="motion-cell"><code title="${esc(resource.path)}">${esc(resource.path || '尚未填寫路徑')}</code><div class="motion-meta">${flag}${button}</div></div></td>`;
  }
  const asset = currentAsset(resource, locale);
  const rework = locale !== 'zh' && resource.rework.includes(locale);
  const name = localeMeta[locale].name;
  const status = !asset ? '<span class="asset-missing">待上傳</span>' : rework ? tag('待重做', 'tag-red dot') : `<span class="version-chip">${asset.width}×${asset.height}</span>`;
  const overlay = perm.upload(resource, locale)
    ? `<button type="button" class="thumb-badge edit upload-asset" data-resource-id="${resource.id}" data-locale="${locale}" aria-label="${asset ? '重新上傳' : '上傳'}${name}${locale === 'zh' ? '原圖' : '資源'}" title="${asset ? '重新上傳' : '上傳'}">${asset ? ICON.pencil : ICON.upload}</button>`
    : resource.locked && asset ? `<span class="thumb-badge locked" role="img" aria-label="已審核鎖定" title="已審核鎖定">${ICON.lock}</span>` : '';
  return `<td class="lang-${locale}"><div class="asset-cell">
    <div class="thumb-wrap"><button type="button" class="thumb ${asset ? '' : 'missing'} ${rework ? 'rework' : ''}" style="${asset ? `--hue:${LOCALE_HUE[locale]}` : ''}" data-preview-resource="${resource.id}" data-locale="${locale}" aria-label="預覽${name}資源">${asset ? localeMeta[locale].code.slice(0, 2).toUpperCase() : '＋'}</button>${overlay}</div>
    <div class="asset-meta">${status}</div>
  </div></td>`;
}

function lastReject(resource) {
  return [...(resource.reviewLog || [])].reverse().find(entry => entry.action === '退回');
}

function reviewCell(resource) {
  const state = resourceState(resource);
  const parts = [tag(stateText[state], `${stateTag[state]} dot`)];
  if (state === 'completed' && resource.review?.at) parts.push(`<small class="muted">${esc(resource.review.at)}</small>`);
  if (state === 'needs_production') {
    const rejected = resource.review?.status === 'rejected' && lastReject(resource);
    if (rejected) parts.push(`<small class="reject-note" title="退回原因">${ICON.undo}${esc(rejected.reason)}</small>`);
    else if (resource.type === 'motion' && resource.motionFlag === 'reupload') parts.push('<small class="muted">翻譯已修改，請更新動畫</small>');
  }
  if (perm.review(resource)) {
    if (state === 'pending_review') parts.push(`<div class="actions"><button type="button" class="btn small success approve" data-resource-id="${resource.id}">${ICON.check}審核通過</button><button type="button" class="btn small warning reject" data-resource-id="${resource.id}">${ICON.undo}退回</button></div>`);
    if (state === 'completed') parts.push(`<button type="button" class="btn small warning reject" data-resource-id="${resource.id}">${ICON.undo}取消審核並退回</button>`);
  }
  return `<div class="review-cell">${parts.join('')}</div>`;
}

function renderResources() {
  const project = currentProject();
  if (!project) return;
  const scope = scopedResources();
  const list = scope.filter(resourceMatches);
  const pageCount = Math.max(1, Math.ceil(list.length / resourcePageSize));
  resourcePage = Math.max(1, Math.min(resourcePage, pageCount));
  const offset = (resourcePage - 1) * resourcePageSize;
  const page = list.slice(offset, offset + resourcePageSize);
  $('#resourceRows').innerHTML = page.map(resource => {
    const state = resourceState(resource);
    const screen = screenById(resource.screenId);
    const selectable = perm.select(resource);
    return `<tr class="row-${state}">
      <td><input class="resource-check" type="checkbox" data-resource-id="${resource.id}" ${selectedResources.has(resource.id) ? 'checked' : ''} ${selectable ? '' : 'disabled'} aria-label="選取 ${esc(resource.cocos)}"></td>
      <td><div class="name-cell"><span class="name-line"><span class="type-icon ${resource.type}" role="img" aria-label="${resource.type === 'motion' ? '動畫資源' : '靜態資源'}" title="${resource.type === 'motion' ? '動畫資源' : '靜態資源'}">${resource.type === 'motion' ? ICON.film : ICON.image}</span><b>${esc(resource.cocos)}</b>${resource.locked ? `<span class="lock-mark" role="img" aria-label="已審核鎖定" title="已審核鎖定">${ICON.lock}</span>` : ''}</span>${resource.scenario ? `<span class="fixture">${esc(resource.scenario)}</span>` : ''}</div></td>
      <td><span class="screen-badge ${screen?.platform || ''}" title="${esc(screen?.name || '')}">${esc(screen?.name.replace(/\.(png|jpe?g|webp)$/i, '') || '—')}</span><br><small class="platform-text ${screen?.platform || ''}">${esc(screen?.platform || '')}</small></td>
      <td>${sizeCell(resource)}</td>
      ${editableCell(resource, 'text.zh', perm.editSourceText(resource), 'lang-zh text-cell')}${assetCell(resource, 'zh')}
      ${requiredLocales.map(locale => editableCell(resource, `text.${locale}`, perm.editTranslation(resource), `lang-${locale} text-cell`) + assetCell(resource, locale)).join('')}
      ${editableCell(resource, 'note', perm.editNote(resource), 'text-cell')}
      ${editableCell(resource, 'leadNote', perm.editLeadNote(resource), 'text-cell')}
      ${editableCell(resource, 'cocos', perm.editFilename(resource), 'nowrap')}
      ${editableCell(resource, 'h5', perm.editFilename(resource), 'nowrap')}
      <td>${reviewCell(resource)}</td>
    </tr>`;
  }).join('');
  $('#resourceEmpty').classList.toggle('hidden', list.length > 0);
  $('#resourceSummary').textContent = `共 ${list.length} 筆資源${list.length !== scope.length ? `（篩選前 ${scope.length} 筆）` : ''} · 顯示 ${list.length ? `${offset + 1}–${offset + page.length}` : 0} 筆`;
  $('#resourceScope').textContent = ` · ${list.length} 筆資源`;
  $('#resourcePageLabel').textContent = `${resourcePage} / ${pageCount}`;
  $('#resourcePrev').disabled = resourcePage === 1;
  $('#resourceNext').disabled = resourcePage === pageCount;
  applyLanguageColumns();
  updateSelection();
}

function applyLanguageColumns() {
  $$('.column-toggles [data-lang]').forEach(button => {
    $$(`.lang-${button.dataset.lang}`).forEach(cell => cell.classList.toggle('hidden', !button.classList.contains('active')));
  });
}

// ───────────────────────── 文字編輯 ─────────────────────────
const fieldLabel = field => ({ 'text.zh': '簡中原文', 'text.en': '英文翻譯', 'text.id': '印尼文翻譯', 'text.pt': '葡萄牙文翻譯', note: '製作備註', leadNote: '組長備註', cocos: 'cocos 檔名', h5: 'h5 檔名' })[field] || field;

function filenameTaken(resource, platform, name) {
  const project = projectOfResource(resource);
  return resourcesForProject(project.id).some(item => item.id !== resource.id && item[platform] === name);
}

/** 套用文字修改並回傳提示訊息；不合法時回傳 { error }。 */
function applyTextChange(resource, field, value) {
  const required = field.startsWith('text.') || field === 'cocos' || field === 'h5';
  if (required && !value) return { error: `${fieldLabel(field)}不可為空` };
  if ((field === 'cocos' || field === 'h5') && filenameTaken(resource, field, value)) return { error: `同一專案的 ${field} 已有檔名「${value}」` };
  const before = field.startsWith('text.') ? resource.text[field.slice(5)] : resource[field];
  if (before === value) return { message: '' };
  if (field.startsWith('text.')) resource.text[field.slice(5)] = value; else resource[field] = value;
  const locale = field.startsWith('text.') ? field.slice(5) : '';
  const changes = [{ field: fieldLabel(field), before: before || '無', after: value || '無' }];
  let message = `${fieldLabel(field)}已更新，不影響審核`;
  if (requiredLocales.includes(locale)) {
    if (resource.type === 'motion') {
      resource.motionFlag = 'reupload';
      resource.review = { status: 'pending' };
      changes.push({ field: '動畫', before: '—', after: '待重新上傳' });
      message = `${fieldLabel(field)}已更新，動畫標示待重新上傳`;
    } else {
      if (!resource.rework.includes(locale)) resource.rework.push(locale);
      resource.review = { status: 'pending' };
      changes.push({ field: `${localeMeta[locale].name} 待重做`, before: '否', after: '是' });
      message = `${fieldLabel(field)}已更新，${localeMeta[locale].name}轉為待重做`;
    }
  }
  touchResource(resource);
  if (!currentRequest) beginRequest('PATCH', `/api/resources/${resource.id}/${field === 'cocos' || field === 'h5' ? 'filenames' : field === 'leadNote' ? 'lead-settings' : 'texts'}`);
  addLog('修改', '資源', resource.cocos, `${fieldLabel(field)}修改`, changes);
  return { message };
}

function bindEditable(cell) {
  cell.addEventListener('focus', () => { cell.dataset.original = cell.textContent.trim(); });
  cell.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); cell.blur(); }
    if (event.key === 'Escape') { event.stopPropagation(); cell.textContent = cell.dataset.original ?? cell.textContent; cell.dataset.cancel = '1'; cell.blur(); }
  });
  cell.addEventListener('blur', () => {
    if (cell.dataset.cancel) { delete cell.dataset.cancel; return; }
    const resource = resourceById(cell.dataset.resourceId);
    if (!resource) return;
    const result = applyTextChange(resource, cell.dataset.field, cell.textContent.trim());
    if (result.error) { cell.textContent = cell.dataset.original || ''; toast(result.error, 'error'); return; }
    if (result.message) { renderDrawer(); renderPage(); toast(result.message); }
  });
}

// ───────────────────────── 選取與批次 ─────────────────────────
function updateSelection() {
  const project = currentProject();
  const canBulk = project && !project.archived && currentRole !== 'qa';
  [...selectedResources].forEach(id => { const resource = resourceById(id); if (!resource || !perm.select(resource)) selectedResources.delete(id); });
  const inputs = $$('.resource-check:not(:disabled)');
  const checked = inputs.filter(input => input.checked).length;
  $('#selectedCount').textContent = selectedResources.size;
  $('#bulkBar').classList.toggle('hidden', !selectedResources.size || !canBulk);
  $('#selectAllResources').disabled = !canBulk || !inputs.length;
  $('#selectAllResources').checked = inputs.length > 0 && checked === inputs.length;
  $('#selectAllResources').indeterminate = checked > 0 && checked < inputs.length;
  configureBulkFields();
}

function configureBulkFields() {
  const field = $('#bulkField');
  const previous = field.value;
  const options = isAdmin()
    ? [['text.zh', '簡中原文'], ['text.en', '英文翻譯'], ['text.id', '印尼文翻譯'], ['text.pt', '葡萄牙文翻譯'], ['note', '製作備註']]
    : currentRole === 'lead' ? [['leadNote', '組長備註']] : [['note', '製作備註']];
  const html = options.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
  if (field.innerHTML !== html) field.innerHTML = html;
  if (options.some(([value]) => value === previous)) field.value = previous;
  $('#bulkLimitField').classList.toggle('hidden', currentRole !== 'lead');
}

function clearSelection(reason) {
  resourcePage = 1;
  const count = selectedResources.size;
  selectedResources.clear();
  if (count && reason) toast(`${reason}，原本選取的 ${count} 筆資源已取消。`);
}

function resetBulkEditor() {
  $('#bulkValue').value = '';
  $('#bulkUpdateLimits').checked = false;
  ['#bulkFixedWidth', '#bulkFixedHeight'].forEach(selector => { $(selector).checked = false; $(selector).disabled = true; });
}

function mismatchesLimits(resource, asset) {
  const size = sourceSize(resource);
  return (resource.fixedWidth && asset.width !== size.w) || (resource.fixedHeight && asset.height !== size.h);
}

/** 套用高寬限制（取代模式），尺寸不符的語系轉為待重做；回傳轉為待重做的語系。 */
function applyLimits(resource, fixedWidth, fixedHeight) {
  const before = limitText(resource);
  resource.fixedWidth = fixedWidth;
  resource.fixedHeight = fixedHeight;
  const changed = requiredLocales.filter(locale => {
    const asset = currentAsset(resource, locale);
    if (!asset || resource.rework.includes(locale) || !mismatchesLimits(resource, asset)) return false;
    resource.rework.push(locale);
    return true;
  });
  if (changed.length) { resource.review = { status: 'pending' }; }
  const changes = [{ field: '高寬限制', before, after: limitText(resource) }, ...changed.map(locale => ({ field: `${localeMeta[locale].name} 待重做`, before: '否', after: '是' }))];
  if (!currentRequest) beginRequest('PATCH', `/api/resources/${resource.id}/lead-settings`);
  if (before !== limitText(resource) || changed.length) addLog('修改', '資源', resource.cocos, '高寬限制變更', changes);
  return changed;
}

function openLimitEditor(resourceId) {
  const resource = resourceById(resourceId);
  if (!resource || !perm.editLimits(resource)) return;
  const size = sourceSize(resource);
  const layer = openModal({
    title: '調整高寬限制', subtitle: `${resource.cocos} · 以目前簡中原圖 ${size.w} × ${size.h} 為基準`,
    body: `<form class="form"><label class="check"><input type="checkbox" name="w" ${resource.fixedWidth ? 'checked' : ''}> 固定寬度（${size.w} px）</label><label class="check"><input type="checkbox" name="h" ${resource.fixedHeight ? 'checked' : ''}> 固定高度（${size.h} px）</label><p class="muted small">變更後，目前版本尺寸不符新限制的語系會轉為待重做。</p></form>`,
    actions: [{ label: '取消' }, { label: '儲存', primary: true, id: 'saveLimits' }]
  });
  $('#saveLimits', layer).onclick = () => {
    const changed = applyLimits(resource, $('input[name="w"]', layer).checked, $('input[name="h"]', layer).checked);
    touchResource(resource);
    closeModal(layer);
    renderDrawer();
    renderPage();
    toast(changed.length ? `高寬限制已更新，${changed.map(locale => localeMeta[locale].name).join('、')}尺寸不符，轉為待重做` : '高寬限制已更新');
  };
}

function applyBulk() {
  const list = [...selectedResources].map(resourceById).filter(Boolean);
  if (!list.length) return;
  const field = $('#bulkField').value;
  const value = $('#bulkValue').value.trim();
  const updateLimits = currentRole === 'lead' && $('#bulkUpdateLimits').checked;
  if (!value && !updateLimits) { toast('請輸入修改內容，或啟用更新高寬限制', 'error'); return; }
  const lockExempt = ['text.zh', 'leadNote'].includes(field);
  const blocked = list.filter(resource => resource.locked && ((value && !lockExempt) || updateLimits));
  const forbidden = list.filter(resource => !perm.select(resource));
  if (blocked.length || forbidden.length) {
    showErrorList('無法執行批次修改，整批未套用', [
      ...blocked.map(resource => `${resource.cocos}：已由美術組長審核鎖定`),
      ...forbidden.map(resource => `${resource.cocos}：目前身分無權限`)
    ]);
    return;
  }
  const width = $('#bulkFixedWidth').checked;
  const height = $('#bulkFixedHeight').checked;
  const motionCount = list.filter(resource => resource.type === 'motion').length;
  const limitDesc = updateLimits ? (width && height ? '固定寬高' : width ? '固定寬' : height ? '固定高' : '清除所有限制') : '不變更';
  const lines = [
    `影響資源：${list.length} 筆`,
    `修改欄位：${value ? fieldLabel(field) : '不修改文字'}`,
    value ? `修改後內容：${value}` : '',
    `高寬限制：${limitDesc}${updateLimits && motionCount ? `（${list.length - motionCount} 筆靜態；${motionCount} 筆動畫不套用）` : ''}`
  ].filter(Boolean);
  confirmAction('確認批次修改', lines.join('\n'), () => {
    beginRequest('POST', '/api/resources/batch-update');
    const reworked = [];
    list.forEach(resource => {
      if (value) applyTextChange(resource, field, value);
      if (updateLimits && resource.type === 'static') {
        const changed = applyLimits(resource, width, height);
        if (changed.length) reworked.push(`${resource.cocos}（${changed.map(locale => localeMeta[locale].name).join('、')}）`);
        touchResource(resource);
      }
    });
    selectedResources.clear();
    resetBulkEditor();
    renderDrawer();
    renderPage();
    toast(`已完成 ${list.length} 筆資源的批次修改${reworked.length ? `；尺寸不符轉待重做：${reworked.join('、')}` : ''}`);
  });
}

function deleteSelected() {
  if (!isAdmin()) return;
  const list = [...selectedResources].map(resourceById).filter(Boolean);
  if (!list.length) return;
  const approvedList = list.filter(resource => resource.locked || resource.review?.status === 'approved');
  if (approvedList.length) { showErrorList('無法移到回收區', approvedList.map(resource => `${resource.cocos}：已審核，請先由美術組長退回`)); return; }
  const emptied = [...new Set(list.map(resource => resource.screenId))].map(screenById).filter(screen => screen && resources.every(resource => resource.deleted || resource.screenId !== screen.id || list.includes(resource)));
  if (emptied.length) { showErrorList('無法移到回收區', emptied.map(screen => `介面「${screen.name}」（${screen.platform}）至少要保留一筆資源；如要全部清除，請刪除該介面。`)); return; }
  confirmAction('移到回收區', `確定將 ${list.length} 筆資源移到回收區？保留 30 天。`, () => {
    list.forEach(resource => {
      const trashId = `trash-${resource.id}-${Date.now()}`;
      resource.deleted = true;
      resource.deletedGroup = trashId;
      recycleBin.unshift({ id: trashId, entityType: 'resource', entityId: resource.id, deletedAt: nowText(), deletedBy: me().account });
      beginRequest('DELETE', `/api/resources/${resource.id}`);
      addLog('刪除', '資源', resource.cocos, '移到回收區', [{ field: '狀態', before: '使用中', after: '回收區' }]);
    });
    touchProject(currentProject());
    selectedResources.clear();
    resetBulkEditor();
    renderDrawer();
    renderPage();
    toast(`${list.length} 筆資源已移到回收區`);
  }, true);
}

// ───────────────────────── 預覽 ─────────────────────────
function previewAsset(resourceId, locale) {
  const resource = resourceById(resourceId);
  if (!resource) return;
  const pane = target => {
    const asset = currentAsset(resource, target);
    return `<section class="preview-pane"><header><span class="tag tag-default">${localeMeta[target].code}</span> <b>${localeMeta[target].full}</b> <small class="muted">${asset ? `${esc(asset.name)} · ${asset.width} × ${asset.height}` : '尚未上傳'}</small></header><div class="preview-stage ${asset ? '' : 'empty-stage'}">${asset ? `<div class="preview-art small-art"><b>${esc(resource.text[target])}</b><small>${esc(resource.cocos)}</small></div>` : '<span class="muted">尚未上傳資源</span>'}</div></section>`;
  };
  const compare = locale !== 'zh';
  openModal({
    title: compare ? `${localeMeta[locale].name}資源對照` : '簡中原圖預覽', subtitle: `${resource.cocos} · 只顯示目前版本`, wide: true,
    body: `<div class="preview-grid ${compare ? '' : 'single'}">${pane('zh')}${compare ? pane(locale) : ''}</div><p class="muted small">預覽不會改變狀態；只有美術組長審核會更新資源狀態。</p>`,
    actions: [{ label: '關閉', primary: true }]
  });
}

// ───────────────────────── 上傳 ─────────────────────────
function sizeRequirement(resource) {
  const size = sourceSize(resource);
  if (resource.fixedWidth && resource.fixedHeight) return `固定寬高 ${size.w} × ${size.h} px`;
  if (resource.fixedWidth) return `固定寬度 ${size.w} px（高度不限）`;
  if (resource.fixedHeight) return `固定高度 ${size.h} px（寬度不限）`;
  return '不限制尺寸';
}

function readImageDimensions(url) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve({ width: 0, height: 0 });
    image.src = url;
  });
}

function addAssetVersion(resource, locale, fileName, width, height) {
  const versions = resource.assets[locale] || (resource.assets[locale] = []);
  versions.forEach(item => { if (item.status === 'current') item.status = 'superseded'; });
  const no = Math.max(0, ...versions.map(item => item.no)) + 1;
  versions.unshift({ id: `${resource.id}-${locale}-v${no}-${Date.now()}`, no, name: fileName, width, height, status: 'current', createdAt: nowText() });
  resource.rework = resource.rework.filter(item => item !== locale);
  resource.review = { status: resource.review?.status === 'rejected' && resource.rework.length ? 'rejected' : 'pending' };
}

function showSizeError(resource, width, height) {
  const size = sourceSize(resource);
  const lines = [];
  if (resource.fixedWidth && width !== size.w) lines.push(`圖片寬度不符：要求 ${size.w} px，實際 ${width} px`);
  if (resource.fixedHeight && height !== size.h) lines.push(`圖片高度不符：要求 ${size.h} px，實際 ${height} px`);
  const layer = openModal({
    title: lines.length > 1 ? '圖片寬度與高度不符' : lines[0].startsWith('圖片寬度') ? '圖片寬度不符' : '圖片高度不符',
    alert: true,
    body: `<div class="result-error"><span class="result-icon" aria-hidden="true">✕</span><div>${lines.map(line => `<p>${esc(line)}，請調整後重新上傳。</p>`).join('')}<p class="muted small">此次上傳未建立新版本，舊圖與原有狀態不變，待上傳／待重做標示保留。</p></div></div>`,
    actions: [{ label: '知道了', primary: true }]
  });
  return layer;
}

function openUpload(resourceId, locale) {
  const resource = resourceById(resourceId);
  if (!resource || !perm.upload(resource, locale)) { toast('目前身分或資源狀態不允許上傳', 'error'); return; }
  const existing = currentAsset(resource, locale);
  const size = sourceSize(resource);
  const isSource = locale === 'zh';
  const hasLimit = resource.fixedWidth || resource.fixedHeight;
  const badSize = { w: resource.fixedWidth ? size.w + 12 : size.w, h: resource.fixedHeight ? size.h + 12 : size.h };
  const demoButtons = isSource
    ? `<button type="button" class="btn small demo" data-w="${size.w}" data-h="${size.h}">示範：相同尺寸</button><button type="button" class="btn small demo" data-w="${size.w + 40}" data-h="${size.h + 20}">示範：改變尺寸 ${size.w + 40} × ${size.h + 20}</button>`
    : `<button type="button" class="btn small demo" data-w="${resource.fixedWidth ? size.w : size.w + 24}" data-h="${size.h}">示範：符合尺寸</button>${hasLimit ? `<button type="button" class="btn small demo" data-w="${badSize.w}" data-h="${badSize.h}">示範：尺寸不符 ${badSize.w} × ${badSize.h}</button>` : ''}`;
  const layer = openModal({
    title: `${existing ? '重新上傳' : '上傳'}${localeMeta[locale].name}${isSource ? '原圖' : '資源'}`,
    subtitle: `${resource.cocos} · ${localeMeta[locale].code}`,
    body: `<form class="form"><dl class="desc"><dt>尺寸要求</dt><dd>${isSource ? `目前原圖 ${size.w} × ${size.h}；改變尺寸時三個翻譯語系全部待製作` : `${sizeRequirement(resource)}（依簡中原圖 ${size.w} × ${size.h}）`}</dd><dt>目前版本</dt><dd>${existing ? `${esc(existing.name)} · ${existing.width} × ${existing.height}` : '尚未上傳'}</dd></dl>
      <label class="upload-box"><input name="file" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"><span>點擊選擇圖片上傳</span><small class="muted">支援 PNG、JPG、WebP；同名檔案會建立新版本</small></label>
      <div class="demo-row"><span class="muted small">沒有圖檔可用示範檔案：</span>${demoButtons}</div>
      <div id="uploadPicked" class="alert alert-info hidden"></div><p class="field-error" role="alert"></p></form>`,
    actions: [{ label: '取消' }, { label: '上傳', primary: true, id: 'confirmUpload' }]
  });
  let picked = null;
  $$('.demo', layer).forEach(button => button.onclick = () => {
    picked = { name: `${resource.cocos}_${locale}.png`, width: Number(button.dataset.w), height: Number(button.dataset.h) };
    $('#uploadPicked', layer).textContent = `已選擇示範檔案：${picked.name} · ${picked.width} × ${picked.height}`;
    $('#uploadPicked', layer).classList.remove('hidden');
    $('input[name="file"]', layer).value = '';
  });
  $('input[name="file"]', layer).onchange = async event => {
    const file = event.target.files[0];
    if (!file) return;
    if (!/\.(png|jpe?g|webp)$/i.test(file.name)) { $('.field-error', layer).textContent = '僅支援 PNG、JPG、WebP'; picked = null; return; }
    const url = URL.createObjectURL(file);
    const dims = await readImageDimensions(url);
    URL.revokeObjectURL(url);
    picked = { name: file.name, width: dims.width, height: dims.height };
    $('.field-error', layer).textContent = '';
    $('#uploadPicked', layer).textContent = `已選擇：${file.name} · ${dims.width} × ${dims.height}`;
    $('#uploadPicked', layer).classList.remove('hidden');
  };
  $('#confirmUpload', layer).onclick = () => {
    if (!picked) { $('.field-error', layer).textContent = '請選擇圖片或使用示範檔案'; return; }
    if (!isSource && mismatchesLimits(resource, { width: picked.width, height: picked.height })) { showSizeError(resource, picked.width, picked.height); return; }
    const changes = [{ field: `${localeMeta[locale].name}目前版本`, before: existing ? `${existing.name} ${existing.width}×${existing.height}` : '無', after: `${picked.name} ${picked.width}×${picked.height}` }];
    addAssetVersion(resource, locale, picked.name, picked.width, picked.height);
    let message = `${localeMeta[locale].name}已建立新版本`;
    if (isSource && (picked.width !== size.w || picked.height !== size.h) && size.w) {
      requiredLocales.forEach(item => { if (!resource.rework.includes(item)) resource.rework.push(item); });
      resource.review = { status: 'pending' };
      changes.push({ field: '翻譯語系', before: '—', after: '英文、印尼文、葡萄牙文全部待重做' });
      message = '簡中原圖尺寸已改變，三個翻譯語系全部轉為待重做';
    }
    touchResource(resource);
    beginRequest('POST', `/api/resources/${resource.id}/locales/${localeMeta[locale].code}/assets`);
    addLog('上傳', '資源', `${resource.cocos} / ${localeMeta[locale].code}`, existing ? '重新上傳，建立新版本' : '上傳，建立目前版本', changes);
    closeModal(layer);
    renderDrawer();
    renderPage();
    toast(message);
  };
}

// ───────────────────────── 動畫路徑 ─────────────────────────
function openMotion(resourceId) {
  const resource = resourceById(resourceId);
  if (!resource) return;
  if (!perm.editMotion(resource)) {
    openModal({ title: '動畫共用路徑', subtitle: `${resource.cocos} · 不分語系`, body: `<pre class="code-block">${esc(resource.path || '尚未填寫')}</pre><p class="muted small">路徑有值即視為已提供；不驗證格式或是否可存取。</p>`, actions: [{ label: '關閉', primary: true }] });
    return;
  }
  const flagHint = resource.motionFlag === 'fix' ? '組長已退回，請修改後重新儲存。' : resource.motionFlag === 'reupload' ? '翻譯已修改，請更新動畫後重新儲存；可沿用相同路徑。' : '';
  const layer = openModal({
    title: resource.path ? '修改動畫路徑' : '填寫動畫路徑', subtitle: `${resource.cocos} · 一筆動畫只有一條共用路徑`,
    body: `<form class="form">${flagHint ? `<div class="alert alert-warning">${esc(flagHint)}</div>` : ''}<label class="field"><span class="req">內網路徑</span><input name="path" class="input" maxlength="255" value="${esc(resource.path)}" placeholder="例：\\\\design-nas\\motion\\..."></label><p class="muted small">不限制開頭、網域或格式，也不驗證是否可存取。儲存後資源進入待查看，由美術組長審核。</p><p class="field-error" role="alert"></p></form>`,
    actions: [{ label: '取消' }, { label: '儲存路徑', primary: true, id: 'saveMotion' }]
  });
  $('#saveMotion', layer).onclick = () => {
    const value = $('input[name="path"]', layer).value.trim();
    if (!value) { $('.field-error', layer).textContent = '請填寫路徑'; return; }
    beginRequest('PATCH', `/api/resources/${resource.id}/motion-path`);
    addLog('上傳', '資源', resource.cocos, resource.path ? '修改動畫路徑' : '填寫動畫路徑', [{ field: '動畫路徑', before: resource.path || '無', after: value }, ...(resource.motionFlag ? [{ field: '動畫標示', before: resource.motionFlag === 'fix' ? '待修改' : '待重新上傳', after: '無' }] : [])]);
    resource.path = value;
    resource.motionFlag = '';
    resource.review = { status: 'pending' };
    touchResource(resource);
    closeModal(layer);
    renderDrawer();
    renderPage();
    toast('動畫路徑已儲存，資源轉為待查看');
  };
}

// ───────────────────────── 審核 ─────────────────────────
function openApprove(resourceId) {
  const resource = resourceById(resourceId);
  if (!resource || !perm.review(resource) || resourceState(resource) !== 'pending_review') return;
  const details = resource.type === 'motion'
    ? `<div class="review-row"><span><b>共用路徑</b><small class="muted">${esc(resource.path)}</small></span>${tag('已提供', 'tag-green')}</div>`
    : allLocales.map(locale => { const asset = currentAsset(resource, locale); return `<div class="review-row"><span><b>${localeMeta[locale].full}</b><small class="muted">${esc(asset.name)} · ${asset.width} × ${asset.height}</small></span>${tag('目前版本', 'tag-green')}</div>`; }).join('');
  const layer = openModal({
    title: '審核資源', subtitle: `${resource.cocos} · 審核通過後整筆鎖定`, wide: true,
    body: `<div class="review-list">${details}</div><dl class="desc"><dt>製作備註</dt><dd>${esc(resource.note || '—')}</dd></dl><label class="field">組長備註（選填）<textarea class="input" id="approvalNote" rows="2">${esc(resource.leadNote)}</textarea></label><p class="muted small">鎖定後只可修改簡中原文、平台檔名與組長備註。</p>`,
    actions: [{ label: '取消' }, { label: '退回修改', danger: true, id: 'goReject' }, { label: '審核通過', primary: true, id: 'confirmApprove' }]
  });
  $('#goReject', layer).onclick = () => { closeModal(layer); openReject(resource.id); };
  $('#confirmApprove', layer).onclick = () => {
    const note = $('#approvalNote', layer).value.trim();
    if (note !== resource.leadNote) resource.leadNote = note;
    resource.locked = true;
    resource.rework = [];
    resource.review = { status: 'approved', by: me().account, at: nowText() };
    resource.reviewLog.push({ action: '審核通過', by: me().account, at: nowText() });
    touchResource(resource);
    beginRequest('POST', `/api/resources/${resource.id}/lead-review`);
    addLog('審核', '資源', resource.cocos, '審核通過並鎖定', [{ field: '資源狀態', before: '待查看', after: '已審核' }]);
    closeModal(layer);
    renderDrawer();
    renderPage();
    toast('審核通過，資源已鎖定');
  };
}

function openReject(resourceId) {
  const resource = resourceById(resourceId);
  if (!resource || !perm.review(resource)) return;
  const state = resourceState(resource);
  if (!['pending_review', 'completed'].includes(state)) return;
  const cancel = state === 'completed';
  const layer = openModal({
    title: cancel ? '取消審核並退回' : '退回修改', subtitle: `${resource.cocos} · 退回後整筆解除鎖定，只有勾選的語系需要重做`,
    body: `<form class="form"><fieldset class="fieldset"><legend class="req">需要重做的語系</legend><div class="check-grid">${requiredLocales.map(locale => `<label class="check-card"><input type="checkbox" name="locale" value="${locale}"> ${localeMeta[locale].name} ${localeMeta[locale].code}</label>`).join('')}</div><p class="muted small">簡中原文不可退回。${resource.type === 'motion' ? '動畫會保留原路徑並標示待修改。' : ''}</p></fieldset>
      <label class="field"><span class="req">退回原因</span><textarea name="reason" class="input" rows="3" placeholder="請說明需要修改的內容"></textarea></label><p class="muted small">原因存入審核紀錄，不會覆寫組長備註。</p><p class="field-error" role="alert"></p></form>`,
    actions: [{ label: '取消' }, { label: '確認退回', danger: true, primary: true, id: 'confirmReject' }]
  });
  $('#confirmReject', layer).onclick = () => {
    const locales = $$('input[name="locale"]:checked', layer).map(input => input.value);
    const reason = $('textarea[name="reason"]', layer).value.trim();
    const error = $('.field-error', layer);
    if (!locales.length) { error.textContent = '請至少選擇一個需要重做的語系'; return; }
    if (!reason) { error.textContent = '請填寫退回原因'; return; }
    resource.locked = false;
    resource.review = { status: 'rejected' };
    resource.reviewLog.push({ action: '退回', by: me().account, at: nowText(), locales, reason });
    if (resource.type === 'motion') resource.motionFlag = 'fix';
    else resource.rework = [...new Set([...resource.rework, ...locales])];
    touchResource(resource);
    beginRequest('POST', `/api/resources/${resource.id}/lead-review${cancel ? '/reopen' : ''}`);
    addLog('退回', '資源', resource.cocos, `${locales.map(locale => localeMeta[locale].name).join('、')}待重做`, [
      { field: '資源狀態', before: stateText[state], after: '待製作' },
      ...locales.map(locale => ({ field: `${localeMeta[locale].name} 待重做`, before: '否', after: '是' })),
      { field: '退回原因', before: '無', after: reason }
    ]);
    closeModal(layer);
    renderDrawer();
    renderPage();
    toast('已退回，資源解除鎖定並轉為待製作');
  };
}

// ───────────────────────── 新增資源 ─────────────────────────
function openAddResource() {
  const project = currentProject();
  if (!project || !isAdmin() || project.archived) return;
  const projectScreens = screensForProject(project.id);
  const layer = openModal({
    title: '新增資源', subtitle: '靜態資源須有簡中原文與原圖，三個翻譯語系待上傳；動畫路徑由美術或美術組長填寫', wide: true,
    body: `<form class="form"><label class="field"><span class="req">隸屬介面</span><select name="screen" class="input">${projectScreens.map(screen => `<option value="${screen.id}">${esc(screen.platform)} · ${esc(screen.name)}</option>`).join('')}</select></label>${resourceFieldsHtml()}<p class="field-error" role="alert"></p></form>`,
    actions: [{ label: '取消' }, { label: '建立資源', primary: true, id: 'confirmAddResource' }]
  });
  bindResourceFields(layer);
  $('#confirmAddResource', layer).onclick = () => {
    const data = readResourceFields(layer, project.id);
    if (data.error) { $('.field-error', layer).textContent = data.error; return; }
    const resource = { ...data.resource, screenId: $('select[name="screen"]', layer).value };
    resources.unshift(resource);
    touchProject(project);
    beginRequest('POST', `/api/projects/${project.id}/resources`);
    addLog('新增', '資源', resource.cocos, `新增${resource.type === 'static' ? '靜態' : '動畫'}資源於 ${project.name}`, [{ field: 'cocos 檔名', before: '無', after: resource.cocos }, { field: 'h5 檔名', before: '無', after: resource.h5 }]);
    closeModal(layer);
    renderDrawer();
    renderPage();
    toast(resource.type === 'static' ? '靜態資源已建立：只有簡中原圖，三個翻譯語系待上傳' : '動畫資源已建立，等待美術填寫路徑');
  };
}

// ───────────────────────── 介面＋資源包上傳 ─────────────────────────
/* 新增專案與新增介面共用：每一組 = 平台＋介面圖（.png/.jpg）＋資源包（.zip/.gzip/.tgz 或資料夾）。
 * 資源包內含 resources.csv 清單與各靜態資源的簡中原圖（以 cocos 檔名命名）。 */
const MANIFEST_NAME = 'resources.csv';
const MANIFEST_HEADERS = ['cocos檔名', 'h5檔名', '類型', '簡中原文', '英文', '印尼文', '葡萄牙文', '固定寬度', '固定高度', '製作備註'];
const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;
const SCREEN_EXT = /\.(png|jpe?g)$/i;
const PACKAGE_EXT = /\.(zip|gzip|gz|tgz)$/i;
let demoSeq = 0;

async function inflate(bytes, format) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readZipEntries(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let eocd = -1;
  for (let index = bytes.length - 22; index >= Math.max(0, bytes.length - 65557); index -= 1) {
    if (view.getUint32(index, true) === 0x06054b50) { eocd = index; break; }
  }
  if (eocd < 0) throw new Error('不是有效的 ZIP 檔');
  const count = view.getUint16(eocd + 10, true);
  let pointer = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  const entries = [];
  for (let n = 0; n < count; n += 1) {
    if (view.getUint32(pointer, true) !== 0x02014b50) throw new Error('ZIP 目錄損毀');
    const method = view.getUint16(pointer + 10, true);
    const size = view.getUint32(pointer + 20, true);
    const nameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);
    const localOffset = view.getUint32(pointer + 42, true);
    const name = decoder.decode(bytes.subarray(pointer + 46, pointer + 46 + nameLength));
    pointer += 46 + nameLength + extraLength + commentLength;
    if (name.endsWith('/')) continue;
    const start = localOffset + 30 + view.getUint16(localOffset + 26, true) + view.getUint16(localOffset + 28, true);
    const data = bytes.subarray(start, start + size);
    if (method === 0) entries.push({ name, data });
    else if (method === 8) entries.push({ name, data: await inflate(data, 'deflate-raw') });
    else throw new Error(`不支援的壓縮方式：${name}`);
  }
  return entries;
}

function readTarEntries(bytes) {
  const decoder = new TextDecoder();
  const text = (from, to) => decoder.decode(bytes.subarray(from, to)).replace(/\0[\s\S]*$/, '');
  const entries = [];
  let offset = 0;
  while (offset + 512 <= bytes.length) {
    if (bytes.subarray(offset, offset + 512).every(value => value === 0)) break;
    let name = text(offset, offset + 100);
    const prefix = text(offset + 345, offset + 500);
    if (prefix) name = `${prefix}/${name}`;
    const size = parseInt(text(offset + 124, offset + 136).trim() || '0', 8);
    const type = bytes[offset + 156];
    offset += 512;
    if (type === 48 || type === 0) entries.push({ name, data: bytes.slice(offset, offset + size) });
    offset += Math.ceil(size / 512) * 512;
  }
  return entries;
}

async function entriesFromArchive(file) {
  const buffer = await file.arrayBuffer();
  if (/\.zip$/i.test(file.name)) return readZipEntries(buffer);
  const raw = await inflate(new Uint8Array(buffer), 'gzip');
  return readTarEntries(raw);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const source = text.replace(/^﻿/, '');
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[index + 1] === '\n') index += 1;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter(cells => cells.some(cell => cell.trim()));
}

const truthy = value => /^(是|y|yes|true|1|v|✓)$/i.test(String(value || '').trim());
const baseName = path => path.split('/').pop();

async function imageSize(blob) {
  const url = URL.createObjectURL(blob);
  const size = await readImageDimensions(url);
  URL.revokeObjectURL(url);
  return size;
}

/** 解析資源包：回傳 { resources } 或 { errors }；任一列有誤整包不匯入。 */
async function parsePackage(entries) {
  const files = entries.filter(entry => !entry.name.includes('__MACOSX/') && !baseName(entry.name).startsWith('.'));
  const manifest = files.find(entry => baseName(entry.name).toLowerCase() === MANIFEST_NAME) || files.find(entry => /\.csv$/i.test(entry.name));
  if (!manifest) return { errors: [`找不到資源清單 ${MANIFEST_NAME}，請參考範例文檔`] };
  const rows = parseCsv(new TextDecoder().decode(manifest.data));
  if (rows.length < 2) return { errors: ['資源清單沒有任何資源，至少要有一筆'] };
  const header = rows[0].map(cell => cell.trim());
  const column = name => header.indexOf(name);
  const missingHeaders = ['cocos檔名', 'h5檔名', '簡中原文'].filter(name => column(name) < 0);
  if (missingHeaders.length) return { errors: [`資源清單缺少欄位：${missingHeaders.join('、')}`] };
  const images = new Map(files.filter(entry => IMAGE_EXT.test(entry.name)).map(entry => [baseName(entry.name).replace(IMAGE_EXT, '').toLowerCase(), entry]));
  const errors = [];
  const resourcesOut = [];
  const seenCocos = new Set();
  const seenH5 = new Set();
  for (let index = 1; index < rows.length; index += 1) {
    const cells = rows[index];
    const get = name => String(cells[column(name)] ?? '').trim();
    const line = `第 ${index + 1} 列`;
    const cocos = get('cocos檔名');
    const h5 = get('h5檔名');
    const zh = get('簡中原文');
    const type = /動畫|motion/i.test(get('類型')) ? 'motion' : 'static';
    if (!cocos || !h5) { errors.push(`${line}：cocos 檔名與 h5 檔名必填`); continue; }
    if (!zh) errors.push(`${line}（${cocos}）：簡中原文必填`);
    if (seenCocos.has(cocos)) errors.push(`${line}：cocos 檔名「${cocos}」在清單中重複`);
    if (seenH5.has(h5)) errors.push(`${line}：h5 檔名「${h5}」在清單中重複`);
    seenCocos.add(cocos);
    seenH5.add(h5);
    let source = null;
    if (type === 'static') {
      const image = images.get(cocos.toLowerCase());
      if (!image) { errors.push(`${line}（${cocos}）：找不到簡中原圖，需為 ${cocos}.png／.jpg／.webp`); continue; }
      const size = await imageSize(new Blob([image.data]));
      if (!size.width) { errors.push(`${line}（${cocos}）：簡中原圖無法讀取`); continue; }
      source = { name: baseName(image.name), width: size.width, height: size.height };
    }
    resourcesOut.push({
      type, cocos, h5, text: { zh, en: get('英文'), id: get('印尼文'), pt: get('葡萄牙文') }, note: get('製作備註'), leadNote: '',
      fixedWidth: type === 'static' && truthy(get('固定寬度')), fixedHeight: type === 'static' && truthy(get('固定高度')),
      rework: [], locked: false, review: { status: 'pending' }, reviewLog: [], path: '', motionFlag: '',
      assets: type === 'static' ? { zh: [{ id: `${cocos}-zh-v1-${Date.now()}-${index}`, no: 1, name: source.name, width: source.width, height: source.height, status: 'current', createdAt: nowText() }], en: [], id: [], pt: [] } : {}
    });
  }
  return errors.length ? { errors } : { resources: resourcesOut };
}

// 示範圖片與範例資源包
function demoCanvas(label, width, height, hue) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `hsl(${hue}, 70%, 35%)`);
  gradient.addColorStop(1, `hsl(${(hue + 40) % 360}, 70%, 55%)`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#ffffff';
  context.font = `bold ${Math.round(height / 6)}px sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, width / 2, height / 2);
  return canvas;
}

const canvasBytes = canvas => new Promise(resolve => canvas.toBlob(async blob => resolve(new Uint8Array(await blob.arrayBuffer())), 'image/png'));

function sampleRows(suffix = '') {
  return [
    ['title_banner' + suffix, 'title_banner_h5' + suffix, '靜態', '限时活动', 'Limited Event', 'Acara Terbatas', 'Evento limitado', '是', '否', '標題置中'],
    ['start_btn' + suffix, 'start_btn_h5' + suffix, '靜態', '开始', 'Start', 'Mulai', 'Começar', '否', '是', '按鈕文字不可換行'],
    ['win_anim' + suffix, 'win_anim_h5' + suffix, '動畫', '恭喜中奖', 'You Win', 'Kamu Menang', 'Você ganhou', '', '', 'Spine 動畫，路徑由美術填寫']
  ];
}

const csvText = rows => '﻿' + rows.map(row => row.map(cell => /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell).join(',')).join('\r\n');

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) { let c = n; for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; }
  return table;
})();
function crc32(bytes) { let c = 0xFFFFFFFF; for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }

function buildZip(files) {
  const encoder = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  files.forEach(file => {
    const name = encoder.encode(file.name);
    const crc = crc32(file.data);
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true);
    lv.setUint32(14, crc, true); lv.setUint32(18, file.data.length, true); lv.setUint32(22, file.data.length, true); lv.setUint16(26, name.length, true);
    local.set(name, 30);
    parts.push(local, file.data);
    const record = new Uint8Array(46 + name.length);
    const cv = new DataView(record.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, file.data.length, true); cv.setUint32(24, file.data.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true);
    record.set(name, 46);
    central.push(record);
    offset += local.length + file.data.length;
  });
  const size = central.reduce((sum, record) => sum + record.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true); ev.setUint32(12, size, true); ev.setUint32(16, offset, true);
  return new Blob([...parts, ...central, end], { type: 'application/zip' });
}

async function samplePackageEntries(suffix = '') {
  const rows = sampleRows(suffix);
  return [
    { name: MANIFEST_NAME, data: new TextEncoder().encode(csvText([MANIFEST_HEADERS, ...rows])) },
    { name: `${rows[0][0]}.png`, data: await canvasBytes(demoCanvas('限时活动', 728, 288, 210)) },
    { name: `${rows[1][0]}.png`, data: await canvasBytes(demoCanvas('开始', 320, 120, 30)) }
  ];
}

async function downloadSample() {
  const blob = buildZip(await samplePackageEntries());
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '資源包範例.zip';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('已下載範例資源包：resources.csv 清單＋簡中原圖；靜態原圖以 cocos 檔名命名');
}

async function filesFromDrop(dataTransfer) {
  const items = [...(dataTransfer.items || [])].map(item => item.webkitGetAsEntry?.()).filter(Boolean);
  if (!items.some(entry => entry.isDirectory)) return { files: [...dataTransfer.files] };
  const collected = [];
  const walk = entry => new Promise(resolve => {
    if (entry.isFile) { entry.file(file => { collected.push({ name: entry.fullPath.replace(/^\//, ''), file }); resolve(); }, () => resolve()); return; }
    const reader = entry.createReader();
    const readAll = () => reader.readEntries(async list => { if (!list.length) { resolve(); return; } await Promise.all(list.map(walk)); readAll(); }, () => resolve());
    readAll();
  });
  await Promise.all(items.map(walk));
  return { folder: items.find(entry => entry.isDirectory).name, entries: collected };
}

/** 介面＋資源包表單。projectId 為 null 時是新增專案。 */
function openScreenPackageModal(projectId) {
  const project = projectId ? projectById(projectId) : null;
  const isNew = !project;
  const layer = openModal({
    title: isNew ? '新增專案' : '新增介面',
    subtitle: isNew ? '每一組選擇平台並上傳介面圖與資源包；至少一組，資料夾名稱由專案名稱自動產生' : `${project.name} · 每一組選擇平台並上傳介面圖與資源包`,
    wide: true,
    body: `<form class="form" onsubmit="return false">${isNew ? '<label class="field"><span class="req">專案名稱</span><input name="projectName" class="input" maxlength="50" placeholder="例：幸運轉盤"></label>' : ''}
      <div class="pairs"></div>
      <div class="pair-add-row"><button type="button" class="round-add add-pair" aria-label="新增一組介面">＋</button></div>
      <p class="muted small">資源包內含 ${MANIFEST_NAME} 清單與靜態資源的簡中原圖（以 cocos 檔名命名）；動畫資源只填清單，路徑由美術或美術組長之後填寫。</p>
      <p class="field-error" role="alert"></p></form>`,
    actions: [{ label: '取消' }, { label: '確定', primary: true, id: 'confirmPairs' }]
  });
  const pairs = [newPair()];
  function newPair() { return { key: Math.random().toString(36).slice(2, 8), platform: 'cocos', image: null, screenName: '', pkg: null, busy: false }; }

  const render = () => {
    $('.pairs', layer).innerHTML = pairs.map((pair, index) => {
      const imageBox = pair.image
        ? `<div class="drop-box filled"><img src="${pair.image.url}" alt="介面圖 ${esc(pair.image.name)}"><label class="field small-field">介面名稱<input class="input pair-name" data-key="${pair.key}" maxlength="50" value="${esc(pair.screenName)}"></label><button type="button" class="link small clear-image" data-key="${pair.key}">重新選擇</button></div>`
        : `<label class="drop-box" data-drop="image" data-key="${pair.key}"><input type="file" class="sr-only pair-image" data-key="${pair.key}" accept=".png,.jpg,.jpeg,image/png,image/jpeg"><span class="drop-icon" aria-hidden="true">⇪</span><span>將<b class="accent">介面</b>拖曳到這裡上傳</span><small class="muted">支援：.png .jpg</small><button type="button" class="link small demo-image" data-key="${pair.key}">使用示範介面圖</button></label>`;
      const pkg = pair.pkg;
      const pkgBox = pair.busy
        ? '<div class="drop-box"><span class="muted">解析中…</span></div>'
        : pkg?.resources
          ? `<div class="drop-box filled"><span class="drop-icon ok" aria-hidden="true">✓</span><b class="ellipsis" title="${esc(pkg.name)}">${esc(pkg.name)}</b><small class="muted">${pkg.resources.length} 筆資源（靜態 ${pkg.resources.filter(r => r.type === 'static').length}、動畫 ${pkg.resources.filter(r => r.type === 'motion').length}）</small><button type="button" class="link small clear-pkg" data-key="${pair.key}">重新選擇</button></div>`
          : `<div class="drop-box ${pkg?.errors ? 'has-error' : ''}" data-drop="pkg" data-key="${pair.key}"><label class="drop-label"><input type="file" class="sr-only pair-pkg" data-key="${pair.key}" accept=".zip,.gzip,.gz,.tgz"><span class="drop-icon" aria-hidden="true">⇪</span><span>將<b class="accent">檔案／資料夾</b>拖曳到這裡上傳</span><small class="muted">支援副檔名：.zip .gzip .tgz</small></label><div class="drop-links"><label class="link small">選擇資料夾<input type="file" class="sr-only pair-folder" data-key="${pair.key}" webkitdirectory multiple></label><button type="button" class="link small demo-pkg" data-key="${pair.key}">使用示範資源包</button></div>${pkg?.errors ? `<ul class="pkg-errors">${pkg.errors.slice(0, 6).map(error => `<li>${esc(error)}</li>`).join('')}${pkg.errors.length > 6 ? `<li>…另有 ${pkg.errors.length - 6} 項</li>` : ''}</ul>` : ''}</div>`;
      return `<section class="pair" aria-label="第 ${index + 1} 組介面">
        <div class="pair-head"><b>第 ${index + 1} 組</b><label class="inline-field"><span class="req">平台</span><select class="input pair-platform" data-key="${pair.key}"><option value="cocos" ${pair.platform === 'cocos' ? 'selected' : ''}>cocos</option><option value="h5" ${pair.platform === 'h5' ? 'selected' : ''}>h5</option></select></label>${pairs.length > 1 ? `<button type="button" class="link danger small remove-pair" data-key="${pair.key}">移除此組</button>` : ''}</div>
        <div class="pair-grid">${imageBox}${pkgBox}</div>
        <div class="pair-foot"><button type="button" class="link small download-sample">下載範例文檔</button></div>
      </section>`;
    }).join('');
  };

  const find = key => pairs.find(pair => pair.key === key);
  const setImage = async (pair, file) => {
    if (!SCREEN_EXT.test(file.name)) { toast('介面圖僅支援 .png .jpg', 'error'); return; }
    const url = URL.createObjectURL(file);
    const size = await readImageDimensions(url);
    pair.image = { name: file.name, url, width: size.width, height: size.height };
    pair.screenName = file.name;
    render();
  };
  const setPackage = async (pair, name, loader) => {
    pair.busy = true;
    render();
    try {
      const result = await parsePackage(await loader());
      pair.pkg = { name, ...result };
    } catch (error) {
      pair.pkg = { name, errors: [`無法讀取資源包：${error.message || error}`] };
    }
    pair.busy = false;
    render();
  };
  const handlePackageFile = (pair, file) => {
    if (!PACKAGE_EXT.test(file.name)) { toast('資源包僅支援 .zip .gzip .tgz 或資料夾', 'error'); return; }
    setPackage(pair, file.name, () => entriesFromArchive(file));
  };
  const handleFolder = (pair, folderName, list) => setPackage(pair, `${folderName}/`, async () => Promise.all(list.map(async item => ({ name: item.name, data: new Uint8Array(await item.file.arrayBuffer()) }))));

  layer.addEventListener('change', event => {
    const target = event.target;
    const pair = find(target.dataset.key);
    if (!pair) return;
    if (target.classList.contains('pair-platform')) pair.platform = target.value;
    else if (target.classList.contains('pair-image') && target.files[0]) setImage(pair, target.files[0]);
    else if (target.classList.contains('pair-pkg') && target.files[0]) handlePackageFile(pair, target.files[0]);
    else if (target.classList.contains('pair-folder') && target.files.length) {
      const list = [...target.files].map(file => ({ name: file.webkitRelativePath || file.name, file }));
      handleFolder(pair, list[0].name.split('/')[0] || '資料夾', list);
    }
  });
  layer.addEventListener('input', event => {
    if (event.target.classList.contains('pair-name')) find(event.target.dataset.key).screenName = event.target.value;
  });
  layer.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button) return;
    const pair = find(button.dataset.key);
    if (button.classList.contains('add-pair')) { pairs.push(newPair()); render(); }
    else if (button.classList.contains('remove-pair')) { pairs.splice(pairs.indexOf(pair), 1); render(); }
    else if (button.classList.contains('download-sample')) downloadSample();
    else if (button.classList.contains('clear-image')) { pair.image = null; pair.screenName = ''; render(); }
    else if (button.classList.contains('clear-pkg')) { pair.pkg = null; render(); }
    else if (button.classList.contains('demo-image')) {
      event.preventDefault();
      demoSeq += 1;
      pair.image = { name: `示範介面${demoSeq}.png`, url: demoCanvas(`示範介面 ${demoSeq}`, 640, 360, 260).toDataURL('image/png'), width: 640, height: 360 };
      pair.screenName = pair.image.name;
      render();
    } else if (button.classList.contains('demo-pkg')) {
      demoSeq += 1;
      const suffix = `_${demoSeq}`;
      setPackage(pair, `示範資源包${suffix}.zip`, () => samplePackageEntries(suffix));
    }
  });
  layer.addEventListener('dragover', event => { const box = event.target.closest('[data-drop]'); if (box) { event.preventDefault(); box.classList.add('dragging'); } });
  layer.addEventListener('dragleave', event => { event.target.closest('[data-drop]')?.classList.remove('dragging'); });
  layer.addEventListener('drop', async event => {
    const box = event.target.closest('[data-drop]');
    if (!box) return;
    event.preventDefault();
    box.classList.remove('dragging');
    const pair = find(box.dataset.key);
    const dropped = await filesFromDrop(event.dataTransfer);
    if (box.dataset.drop === 'image') { if (dropped.files?.[0]) setImage(pair, dropped.files[0]); return; }
    if (dropped.entries) handleFolder(pair, dropped.folder, dropped.entries);
    else if (dropped.files?.[0]) handlePackageFile(pair, dropped.files[0]);
  });

  $('#confirmPairs', layer).onclick = () => {
    const error = $('.field-error', layer);
    error.textContent = '';
    const name = isNew ? $('input[name="projectName"]', layer).value.trim() : project.name;
    if (isNew && !name) { error.textContent = '請填寫專案名稱'; return; }
    if (isNew && projectNameTaken(name)) { error.textContent = '已有相同名稱的專案，請修改名稱'; return; }
    const problems = [];
    const usedScreens = new Set(project ? screensForProject(project.id).map(screen => `${screen.platform}|${screen.name}`) : []);
    const existing = project ? resourcesForProject(project.id) : [];
    const usedCocos = new Set(existing.map(resource => resource.cocos));
    const usedH5 = new Set(existing.map(resource => resource.h5));
    pairs.forEach((pair, index) => {
      const label = `第 ${index + 1} 組`;
      if (!pair.image) problems.push(`${label}：請上傳介面圖`);
      if (!pair.pkg?.resources) problems.push(`${label}：${pair.pkg?.errors ? '資源包有錯誤，請修正後重新上傳' : '請上傳資源包'}`);
      const screenName = pair.screenName.trim();
      if (pair.image && !screenName) problems.push(`${label}：介面名稱不可為空`);
      const screenKey = `${pair.platform}|${screenName}`;
      if (screenName && usedScreens.has(screenKey)) problems.push(`${label}：${pair.platform} 已有介面「${screenName}」`);
      usedScreens.add(screenKey);
      (pair.pkg?.resources || []).forEach(resource => {
        if (usedCocos.has(resource.cocos)) problems.push(`${label}：cocos 檔名「${resource.cocos}」與專案內其他資源重複`);
        if (usedH5.has(resource.h5)) problems.push(`${label}：h5 檔名「${resource.h5}」與專案內其他資源重複`);
        usedCocos.add(resource.cocos);
        usedH5.add(resource.h5);
      });
    });
    if (problems.length) { showErrorList(isNew ? '無法建立專案' : '無法新增介面', problems); return; }
    const target = project || { id: `p-${Date.now()}`, name, assignments: { static: [], motion: [] }, updatedAt: nowText(), updatedBy: me().account };
    if (isNew) projects.unshift(target);
    beginRequest('POST', isNew ? '/api/projects' : `/api/projects/${target.id}/screens`);
    let resourceCount = 0;
    pairs.forEach((pair, index) => {
      const screen = { id: `s-${Date.now()}-${index}`, projectId: target.id, name: pair.screenName.trim(), platform: pair.platform, image: pair.image.url, uploadedAt: nowText() };
      screens.push(screen);
      pair.pkg.resources.forEach((resource, order) => { resources.push({ ...resource, id: `r-${Date.now()}-${index}-${order}`, screenId: screen.id }); });
      resourceCount += pair.pkg.resources.length;
      addLog('新增', '介面', `${screen.name}（${screen.platform}）`, `匯入資源包 ${pair.pkg.name}，${pair.pkg.resources.length} 筆資源`, [{ field: '介面名稱', before: '無', after: screen.name }, { field: '匯入資源', before: '無', after: pair.pkg.resources.map(resource => resource.cocos).join('、') }]);
    });
    if (isNew) addLog('新增', '專案', name, `建立專案，含 ${pairs.length} 個介面、${resourceCount} 筆資源`, [{ field: '專案名稱', before: '無', after: name }]);
    else touchProject(target);
    closeModal(layer);
    renderPage();
    if (!isNew) renderDrawer();
    toast(isNew ? `專案已建立：${pairs.length} 個介面、${resourceCount} 筆資源，目前為待分配` : `已新增 ${pairs.length} 個介面、${resourceCount} 筆資源`);
  };
  render();
}

function openAddProject() {
  if (!isAdmin()) return;
  openScreenPackageModal(null);
}

function openAddScreen() {
  const project = currentProject();
  if (!project || !isAdmin() || project.archived) return;
  openScreenPackageModal(project.id);
}


// ───────────────────────── 匯出 ─────────────────────────
function findDuplicateFilenames(list) {
  const issues = [];
  ['cocos', 'h5'].forEach(platform => {
    const seen = new Map();
    list.forEach(resource => {
      const name = resource[platform];
      if (seen.has(name)) issues.push(`${platform} 檔名「${name}」重複（${seen.get(name)}、${resource.text.zh}），請由超管／企劃修改平台檔名`);
      else seen.set(name, resource.text.zh);
    });
  });
  return issues;
}

function openExport(projectId = currentProjectId) {
  const project = projectById(projectId);
  if (!project || !isAdmin()) return;
  const list = resourcesForProject(project.id);
  const issues = [];
  if (!list.length) issues.push('專案尚無資源，無法匯出');
  const unapproved = list.filter(resource => resourceState(resource) !== 'completed');
  if (unapproved.length) issues.push(`尚有 ${unapproved.length} 筆資源未通過組長審核：${unapproved.map(resource => `${resource.cocos}（${stateText[resourceState(resource)]}）`).join('、')}`);
  if (!unapproved.length) issues.push(...findDuplicateFilenames(list));
  const blocked = issues.length > 0;
  const layer = openModal({
    title: '匯出資源', subtitle: `${project.name}${project.archived ? ' · 已封存' : ''}`, wide: true,
    body: `<form class="form">${blocked ? `<div class="alert alert-error" role="alert"><b>無法匯出</b><ul>${issues.map(issue => `<li>${esc(issue)}</li>`).join('')}</ul></div>` : '<div class="alert alert-success">全部資源均已由美術組長審核通過。</div>'}
      <fieldset class="fieldset"><legend>匯出語系</legend><div class="check-grid">${allLocales.map(locale => `<label class="check-card"><input type="checkbox" name="locale" value="${locale}" checked ${blocked ? 'disabled' : ''}> ${localeMeta[locale].full} ${localeMeta[locale].code}</label>`).join('')}</div></fieldset>
      <fieldset class="fieldset"><legend>匯出平台</legend><div class="check-grid"><label class="check-card"><input type="checkbox" name="platform" value="cocos" checked ${blocked ? 'disabled' : ''}> cocos</label><label class="check-card"><input type="checkbox" name="platform" value="h5" checked ${blocked ? 'disabled' : ''}> h5</label></div></fieldset>
      <pre class="code-block">${esc(project.name)}/\n├── cocos/\n│   ├── {語系}/（以 cocos 檔名命名）\n│   └── motion_links.csv\n└── h5/\n    ├── {語系}/（以 h5 檔名命名）\n    └── motion_links.csv</pre>
      <p class="muted small">動畫不分語系，於各平台資料夾產生 motion_links.csv（平台檔名、內網路徑、審核時間）。系統不保存匯出批次紀錄。</p><p class="field-error" role="alert"></p></form>`,
    actions: [{ label: '關閉' }, { label: '匯出 ZIP', primary: true, id: 'confirmExport', disabled: blocked }]
  });
  $('#confirmExport', layer).onclick = () => {
    const locales = $$('input[name="locale"]:checked', layer).map(input => localeMeta[input.value].code);
    const platforms = $$('input[name="platform"]:checked', layer).map(input => input.value);
    if (!locales.length || !platforms.length) { $('.field-error', layer).textContent = '請至少選擇一個語系與一個平台'; return; }
    closeModal(layer);
    toast(`已建立 ${platforms.join('／')}：${locales.join('、')} 的 ZIP（原型示範，未實際下載）`);
  };
}

// ───────────────────────── 專案封存頁 ─────────────────────────
function renderArchive() {
  const keyword = $('#archiveKeyword').value.trim().toLowerCase();
  const from = $('#archiveFrom').value;
  const to = $('#archiveTo').value;
  const error = $('#archiveError');
  error.textContent = from && to && from > to ? '起始日期不可晚於結束日期' : '';
  const all = visibleProjects().filter(project => project.archived).sort((a, b) => parseTime(b.archivedAt) - parseTime(a.archivedAt));
  const list = error.textContent ? [] : all.filter(project => {
    const day = project.archivedAt.slice(0, 10);
    return (!keyword || project.name.toLowerCase().includes(keyword)) && (!from || day >= from) && (!to || day <= to);
  });
  $('#archiveRows').innerHTML = list.map(project => {
    const projectScreens = screensForProject(project.id);
    const actions = [`<button type="button" class="link open-project" data-project-id="${project.id}">查看</button>`];
    if (isAdmin()) actions.push(`<button type="button" class="link export-project" data-project-id="${project.id}">匯出</button>`, `<button type="button" class="link unarchive-project" data-project-id="${project.id}">取消封存</button>`);
    return `<tr><td><b>${esc(project.name)}</b></td><td><span class="dotted" title="${esc(projectScreens.map(screen => `${screen.platform} ${screen.name}`).join('、'))}">${projectScreens.length}</span></td><td>${assigneeHtml(project, 'static')}</td><td>${assigneeHtml(project, 'motion')}</td><td class="nowrap">${esc(project.archivedAt)}</td><td>${esc(project.archivedBy)}</td><td>${tag('已封存')}</td><td><div class="actions">${actions.join('')}</div></td></tr>`;
  }).join('');
  const filtered = keyword || from || to;
  $('#archiveEmpty').classList.toggle('hidden', list.length > 0);
  $('#archiveEmptyTitle').textContent = all.length && filtered ? '查無符合條件的專案' : '尚無已封存專案';
  $('#archiveEmptyHint').textContent = all.length && filtered ? '請調整條件或按重置' : '';
  $('#archiveSummary').textContent = `共 ${list.length} 筆`;
}

// ───────────────────────── 資料回收 ─────────────────────────
function purgeExpired() {
  for (let index = recycleBin.length - 1; index >= 0; index -= 1) {
    if (daysLeft(recycleBin[index]) <= 0) recycleBin.splice(index, 1);
  }
}
const daysLeft = item => RECYCLE_DAYS - Math.floor((Date.now() - parseTime(item.deletedAt)) / DAY);

function trashInfo(item) {
  if (item.entityType === 'project') {
    const project = projects.find(entry => entry.id === item.entityId);
    return { typeText: '專案', name: project.name, parent: '—', blockedBy: '' };
  }
  if (item.entityType === 'screen') {
    const screen = screens.find(entry => entry.id === item.entityId);
    const project = projects.find(entry => entry.id === screen.projectId);
    return { typeText: '介面', name: `${screen.name}（${screen.platform}）`, parent: project.name, blockedBy: project.deleted ? `所屬專案「${project.name}」仍在回收區，請先復原專案` : '' };
  }
  const resource = resources.find(entry => entry.id === item.entityId);
  const screen = screens.find(entry => entry.id === resource.screenId);
  const project = projects.find(entry => entry.id === screen.projectId);
  const blockedBy = project.deleted ? `所屬專案「${project.name}」仍在回收區，請先復原專案` : screen.deleted ? `所屬介面「${screen.name}」仍在回收區，請先復原介面` : '';
  return { typeText: '資源', name: resource.cocos, parent: `${project.name} · ${screen.platform} ${screen.name}`, blockedBy };
}

function renderRecycle() {
  purgeExpired();
  const keyword = $('#recycleKeyword').value.trim().toLowerCase();
  const type = $('#recycleType').value;
  const list = recycleBin.filter(item => (!type || item.entityType === type) && (!keyword || trashInfo(item).name.toLowerCase().includes(keyword)));
  $('#recycleRows').innerHTML = list.map(item => {
    const info = trashInfo(item);
    const left = daysLeft(item);
    const action = info.blockedBy
      ? `<span class="tooltip-wrap"><button type="button" class="link" disabled aria-describedby="tip-${item.id}">復原</button><span role="tooltip" id="tip-${item.id}" class="tooltip">${esc(info.blockedBy)}</span></span>`
      : `<button type="button" class="link restore-item" data-trash-id="${item.id}">復原</button>`;
    return `<tr><td>${tag(info.typeText, item.entityType === 'project' ? 'tag-blue' : item.entityType === 'screen' ? 'tag-purple' : 'tag-default')}</td><td><b>${esc(info.name)}</b></td><td class="muted">${esc(info.parent)}</td><td>${esc(item.deletedBy)}</td><td class="nowrap">${esc(item.deletedAt)}</td><td><span class="${left <= 3 ? 'text-danger strong' : ''}">${left} 天</span></td><td>${action}</td></tr>`;
  }).join('');
  $('#recycleEmpty').classList.toggle('hidden', list.length > 0);
  $('#recycleSummary').textContent = `共 ${list.length} 筆`;
}

function finishRestore(item, group, message, logEntity, logTarget) {
  [projects, screens, resources].forEach(collection => collection.forEach(entry => { if (entry.deleted && entry.deletedGroup === group) { entry.deleted = false; delete entry.deletedGroup; } }));
  recycleBin.splice(recycleBin.indexOf(item), 1);
  beginRequest('POST', `/api/recycle-bin/${item.entityType === 'project' ? 'projects' : item.entityType === 'screen' ? 'screens' : 'resources'}/${item.entityId}/restore`);
  addLog('復原', logEntity, logTarget, '自回收區復原', [{ field: '狀態', before: '回收區', after: '使用中' }]);
  renderAll();
  toast(message);
}

function openRestore(trashId) {
  const item = recycleBin.find(entry => entry.id === trashId);
  if (!item || !isAdmin()) return;
  const info = trashInfo(item);
  if (info.blockedBy) { showErrorList('無法復原', [info.blockedBy]); return; }
  if (item.entityType === 'project') {
    const project = projects.find(entry => entry.id === item.entityId);
    const conflict = projectNameTaken(project.name, project.id);
    const layer = openModal({
      title: '復原專案', subtitle: '一起刪除的介面與資源會一併復原',
      body: `<form class="form">${conflict ? '<div class="alert alert-error">已有相同名稱的專案，系統不會自動覆蓋，請先修改名稱。</div>' : ''}<label class="field"><span class="req">專案名稱</span><input name="name" class="input" maxlength="50" value="${esc(project.name)}"></label><p class="field-error" role="alert"></p></form>`,
      actions: [{ label: '取消' }, { label: '確認復原', primary: true, id: 'confirmRestore' }]
    });
    $('#confirmRestore', layer).onclick = () => {
      const name = $('input[name="name"]', layer).value.trim();
      if (!name) { $('.field-error', layer).textContent = '請填寫專案名稱'; return; }
      if (projectNameTaken(name, project.id)) { $('.field-error', layer).textContent = '名稱仍與現有專案重複，請修改後再復原'; return; }
      project.name = name;
      closeModal(layer);
      finishRestore(item, item.id, '專案與一起刪除的介面、資源已復原', '專案', name);
    };
    return;
  }
  if (item.entityType === 'screen') {
    const screen = screens.find(entry => entry.id === item.entityId);
    const conflict = screenNameTaken(screen.projectId, screen.platform, screen.name, screen.id);
    const together = resources.filter(resource => resource.deleted && resource.deletedGroup === item.id).length;
    const layer = openModal({
      title: '復原介面', subtitle: `只復原與此介面一起刪除的 ${together} 筆資源；先前單獨刪除的資源仍留在回收區`,
      body: `<form class="form">${conflict ? '<div class="alert alert-error">同一專案、同一平台已有相同介面名稱，請先修改名稱。</div>' : ''}<label class="field"><span class="req">介面名稱</span><input name="name" class="input" maxlength="50" value="${esc(screen.name)}"></label><p class="field-error" role="alert"></p></form>`,
      actions: [{ label: '取消' }, { label: '確認復原', primary: true, id: 'confirmRestore' }]
    });
    $('#confirmRestore', layer).onclick = () => {
      const name = $('input[name="name"]', layer).value.trim();
      if (!name) { $('.field-error', layer).textContent = '請填寫介面名稱'; return; }
      if (screenNameTaken(screen.projectId, screen.platform, name, screen.id)) { $('.field-error', layer).textContent = '同一專案、同一平台已有相同介面名稱'; return; }
      screen.name = name;
      closeModal(layer);
      finishRestore(item, item.id, `介面與一起刪除的 ${together} 筆資源已復原`, '介面', `${name}（${screen.platform}）`);
    };
    return;
  }
  const resource = resources.find(entry => entry.id === item.entityId);
  const project = projectOfResource(resource);
  const siblings = resourcesForProject(project.id);
  const conflictC = siblings.some(entry => entry.cocos === resource.cocos);
  const conflictH = siblings.some(entry => entry.h5 === resource.h5);
  const layer = openModal({
    title: '復原資源', subtitle: `${project.name} · 平台檔名在同一專案、同一平台內必須唯一`,
    body: `<form class="form">${conflictC || conflictH ? '<div class="alert alert-error">平台檔名與現有資源重複，系統不會自動覆蓋，請先修改。</div>' : ''}<label class="field"><span class="req">cocos 檔名</span><input name="cocos" class="input" maxlength="50" value="${esc(resource.cocos)}"></label><label class="field"><span class="req">h5 檔名</span><input name="h5" class="input" maxlength="50" value="${esc(resource.h5)}"></label><p class="field-error" role="alert"></p></form>`,
    actions: [{ label: '取消' }, { label: '確認復原', primary: true, id: 'confirmRestore' }]
  });
  $('#confirmRestore', layer).onclick = () => {
    const cocos = $('input[name="cocos"]', layer).value.trim();
    const h5 = $('input[name="h5"]', layer).value.trim();
    const error = $('.field-error', layer);
    if (!cocos || !h5) { error.textContent = '兩個平台檔名皆不可空白'; return; }
    if (siblings.some(entry => entry.cocos === cocos)) { error.textContent = `同一專案已有 cocos 檔名「${cocos}」`; return; }
    if (siblings.some(entry => entry.h5 === h5)) { error.textContent = `同一專案已有 h5 檔名「${h5}」`; return; }
    resource.cocos = cocos;
    resource.h5 = h5;
    closeModal(layer);
    finishRestore(item, item.id, '資源已復原', '資源', cocos);
  };
}

// ───────────────────────── 帳號管理 ─────────────────────────
const manageableRoles = () => isAdmin() ? ['planner', 'lead', 'qa'] : currentRole === 'lead' ? ['artist'] : [];
const passwordValid = value => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*._-]{8,16}$/.test(value);

function renderAccounts() {
  const scopeRoles = manageableRoles();
  const roleSelect = $('#accountRoleFilter');
  const previous = roleSelect.value;
  roleSelect.innerHTML = '<option value="">全部角色</option>' + scopeRoles.map(role => `<option value="${role}">${roleLabel[role]}</option>`).join('');
  roleSelect.value = scopeRoles.includes(previous) ? previous : '';
  $('#accountsHint').textContent = isAdmin() ? '管理企劃、美術組長與 QA 帳號；美術帳號由美術組長管理，超管帳號由後端管理。停用或重設密碼後既有登入立即失效。' : '管理全部美術帳號。停用或重設密碼後既有登入立即失效；重新啟用後須重新指派專案。';
  const query = $('#accountSearch').value.trim().toLowerCase();
  const stateFilter = $('#accountStateFilter').value;
  const list = accounts.filter(account => scopeRoles.includes(account.role)
    && (!roleSelect.value || account.role === roleSelect.value)
    && (!query || account.account.toLowerCase() === query || account.name.toLowerCase() === query)
    && (!stateFilter || (stateFilter === 'on') === account.active));
  $('#accountRows').innerHTML = list.map(account => `<tr><td>${tag(roleLabel[account.role])}</td><td><b>${esc(account.account)}</b></td><td>${esc(account.name)}</td><td class="nowrap">${esc(account.login)}</td><td>${tag(account.auth, account.auth === '已綁定' ? 'tag-green' : 'tag-orange')}</td><td>${account.active ? tag('啟用', 'tag-green') : tag('已停用', 'tag-red')}</td><td><div class="actions"><button type="button" class="link reset-password" data-account-id="${account.id}">重設密碼</button><button type="button" class="link ${account.active ? 'danger' : ''} toggle-account" data-account-id="${account.id}">${account.active ? '停用' : '重新啟用'}</button></div></td></tr>`).join('');
  $('#accountEmpty').classList.toggle('hidden', list.length > 0);
  $('#accountSummary').textContent = `共 ${list.length} 筆`;
}

function openAddAccount() {
  const scopeRoles = manageableRoles();
  if (!scopeRoles.length) return;
  const layer = openModal({
    title: '新增帳號', subtitle: '新帳號的登入驗證狀態為未綁定',
    body: `<form class="form"><label class="field"><span class="req">角色</span><select name="role" class="input">${scopeRoles.map(role => `<option value="${role}">${roleLabel[role]}</option>`).join('')}</select></label><label class="field"><span class="req">帳號</span><input name="account" class="input" maxlength="30" autocomplete="off"></label><label class="field"><span class="req">暱稱</span><input name="name" class="input" maxlength="30"></label><label class="field"><span class="req">初始密碼</span><input name="password" type="password" class="input" maxlength="16" autocomplete="new-password"><small class="muted">8–16 位，須包含字母與數字</small></label><p class="field-error" role="alert"></p></form>`,
    actions: [{ label: '取消' }, { label: '建立', primary: true, id: 'confirmAddAccount' }]
  });
  $('#confirmAddAccount', layer).onclick = () => {
    const role = $('select[name="role"]', layer).value;
    const account = $('input[name="account"]', layer).value.trim();
    const name = $('input[name="name"]', layer).value.trim();
    const password = $('input[name="password"]', layer).value;
    const error = $('.field-error', layer);
    if (!account || !name) { error.textContent = '請填寫帳號與暱稱'; return; }
    if (accounts.some(item => item.account.toLowerCase() === account.toLowerCase()) || Object.values(roles).some(item => item.account.toLowerCase() === account.toLowerCase())) { error.textContent = '此帳號已存在'; return; }
    if (!passwordValid(password)) { error.textContent = '密碼須為 8–16 位，並包含字母與數字'; return; }
    accounts.push({ id: `${role === 'artist' ? 'u' : 'a'}-${Date.now()}`, role, account, name, login: '—', auth: '未綁定', active: true });
    beginRequest('POST', '/api/users');
    addLog('新增帳號', '帳號', account, `新增${roleLabel[role]}帳號`, [{ field: '角色', before: '無', after: roleLabel[role] }, { field: '暱稱', before: '無', after: name }]);
    closeModal(layer);
    syncArtistFilter();
    renderAccounts();
    toast('帳號已建立');
  };
}

function toggleAccount(accountId) {
  const account = accountById(accountId);
  if (!account || !manageableRoles().includes(account.role)) return;
  if (account.active) {
    const owned = account.role === 'artist' ? projects.filter(project => !project.deleted && (project.assignments.static.includes(account.id) || project.assignments.motion.includes(account.id))) : [];
    const detail = owned.map(project => {
      const types = ['static', 'motion'].filter(type => project.assignments[type].includes(account.id));
      const unfinished = resourcesForProject(project.id).filter(resource => types.includes(resource.type === 'motion' ? 'motion' : 'static') && resourceState(resource) !== 'completed').length;
      return `${project.name}（未完成 ${unfinished} 筆）`;
    });
    confirmAction('停用帳號', `停用「${account.account}」後，該帳號所有既有登入立即失效，也不能再被指派。${detail.length ? `\n目前負責：${detail.join('、')}。停用後仍保留在原指派並標示已停用，但不計入負責人。` : ''}`, () => {
      account.active = false;
      beginRequest('PATCH', `/api/users/${account.id}/deactivate`);
      addLog('停用帳號', '帳號', account.account, '帳號停用，既有登入已失效', [{ field: '帳號狀態', before: '啟用', after: '已停用' }]);
      syncArtistFilter();
      renderAll();
      toast('帳號已停用，所有登入已失效');
    }, true);
    return;
  }
  const assigned = projects.filter(project => project.assignments.static.includes(account.id) || project.assignments.motion.includes(account.id));
  confirmAction('重新啟用帳號', `重新啟用「${account.account}」，沿用原帳號與角色。${account.role === 'artist' ? '停用前的指派不會恢復，須由美術組長重新指派。' : ''}`, () => {
    account.active = true;
    const changes = [{ field: '帳號狀態', before: '已停用', after: '啟用' }];
    assigned.forEach(project => {
      ['static', 'motion'].forEach(type => {
        if (!project.assignments[type].includes(account.id)) return;
        project.assignments[type] = project.assignments[type].filter(id => id !== account.id);
        changes.push({ field: `${project.name} ${type === 'static' ? '靜態' : '動態'}美術`, before: account.name, after: '已移除（須重新指派）' });
      });
    });
    beginRequest('PATCH', `/api/users/${account.id}/activate`);
    addLog('啟用帳號', '帳號', account.account, '帳號重新啟用', changes);
    syncArtistFilter();
    renderAll();
    toast(account.role === 'artist' ? '帳號已重新啟用；請到專案管理重新指派' : '帳號已重新啟用');
  });
}

function openResetPassword(accountId) {
  const account = accountById(accountId);
  if (!account || !manageableRoles().includes(account.role)) return;
  const layer = openModal({
    title: '重設密碼', subtitle: `${account.account} · 完成後該帳號所有既有登入立即失效`,
    body: `<form class="form"><label class="field"><span class="req">新密碼</span><input name="password" type="password" class="input" maxlength="16" autocomplete="new-password"><small class="muted">8–16 位，須包含字母與數字</small></label><p class="field-error" role="alert"></p></form>`,
    actions: [{ label: '取消' }, { label: '重設', primary: true, id: 'confirmReset' }]
  });
  $('#confirmReset', layer).onclick = () => {
    if (!passwordValid($('input[name="password"]', layer).value)) { $('.field-error', layer).textContent = '密碼須為 8–16 位，並包含字母與數字'; return; }
    beginRequest('POST', `/api/users/${account.id}/reset-password`);
    addLog('重設密碼', '帳號', account.account, '密碼已重設（不記錄內容）');
    closeModal(layer);
    renderPage();
    toast('密碼已重設，所有登入已失效');
  };
}

// ───────────────────────── 操作日誌 ─────────────────────────
function syncLogFilters() {
  const actor = $('#logActor');
  const action = $('#logAction');
  const actorValue = actor.value;
  const actionValue = action.value;
  const actors = [...new Set(logs.map(log => log.actor))].sort();
  const actions = [...new Set(logs.map(log => log.action))];
  actor.innerHTML = '<option value="">全部人員</option>' + actors.map(name => `<option>${esc(name)}</option>`).join('');
  action.innerHTML = '<option value="">全部類型</option>' + actions.map(name => `<option>${esc(name)}</option>`).join('');
  actor.value = actors.includes(actorValue) ? actorValue : '';
  action.value = actions.includes(actionValue) ? actionValue : '';
}

function filteredLogs() {
  const from = $('#logFrom').value;
  const to = $('#logTo').value;
  const actor = $('#logActor').value;
  const action = $('#logAction').value;
  const entity = $('#logEntity').value;
  const target = $('#logTarget').value.trim().toLowerCase();
  return logs.filter(log => {
    const day = log.at.slice(0, 10);
    return (!from || day >= from) && (!to || day <= to) && (!actor || log.actor === actor) && (!action || log.action === action) && (!entity || log.entity === entity) && (!target || log.target.toLowerCase().includes(target));
  }).sort((a, b) => parseTime(b.at) - parseTime(a.at) || Number(b.id.slice(4)) - Number(a.id.slice(4)));
}

function renderLogs() {
  syncLogFilters();
  const from = $('#logFrom').value;
  const to = $('#logTo').value;
  const invalid = from && to && from > to;
  $('#logError').textContent = invalid ? '起始日期不可晚於結束日期' : '';
  const list = invalid ? [] : filteredLogs();
  const pages = Math.max(1, Math.ceil(list.length / LOG_PAGE_SIZE));
  logPage = Math.min(logPage, pages);
  const page = list.slice((logPage - 1) * LOG_PAGE_SIZE, logPage * LOG_PAGE_SIZE);
  $('#logRows').innerHTML = page.map(log => `<tr><td class="nowrap">${esc(log.at)}</td><td>${esc(log.actor)}<br><small class="muted">${roleLabel[log.actorRole] || ''}</small></td><td>${tag(log.action)}</td><td>${esc(log.entity)}</td><td>${esc(log.target)}</td><td class="muted">${esc(log.summary)}</td><td><button type="button" class="link log-detail" data-log-id="${log.id}">查看</button></td></tr>`).join('');
  const filtered = from || to || $('#logActor').value || $('#logAction').value || $('#logEntity').value || $('#logTarget').value.trim();
  $('#logEmpty').classList.toggle('hidden', page.length > 0);
  $('#logEmptyTitle').textContent = logs.length && filtered ? '查無符合條件的操作紀錄' : '尚無操作紀錄';
  $('#logPager').innerHTML = `<span>共 ${list.length} 筆</span><div class="pager-buttons"><button type="button" class="btn small" data-log-page="${logPage - 1}" ${logPage <= 1 ? 'disabled' : ''} aria-label="上一頁">‹</button>${Array.from({ length: pages }, (_, index) => `<button type="button" class="btn small ${index + 1 === logPage ? 'current' : ''}" data-log-page="${index + 1}" ${index + 1 === logPage ? 'aria-current="page"' : ''}>${index + 1}</button>`).join('')}<button type="button" class="btn small" data-log-page="${logPage + 1}" ${logPage >= pages ? 'disabled' : ''} aria-label="下一頁">›</button></div>`;
}

function openLogDetail(logId) {
  const log = logs.find(entry => entry.id === logId);
  if (!log) return;
  const changes = log.changes.length
    ? `<table class="table compact"><thead><tr><th>欄位</th><th>異動前</th><th>異動後</th></tr></thead><tbody>${log.changes.map(change => `<tr><td>${esc(change.field)}</td><td>${esc(change.before || '無')}</td><td>${esc(change.after || '無')}</td></tr>`).join('')}</tbody></table>`
    : '<p class="muted">未記錄異動內容</p>';
  openModal({
    title: '日誌明細', subtitle: `${log.action} · ${log.target}`,
    body: `<dl class="desc"><dt>操作時間</dt><dd>${esc(log.at)}</dd><dt>操作人員</dt><dd>${esc(log.actor)}（${roleLabel[log.actorRole] || '—'}）</dd><dt>操作類型</dt><dd>${esc(log.action)}</dd><dt>目標資料</dt><dd>${esc(log.entity)} · ${esc(log.target)}</dd><dt>IP</dt><dd>${esc(log.ip)}</dd><dt>呼叫的 API</dt><dd>${log.apiPath ? `<code class="api-code"><span class="api-method ${esc(log.apiMethod.toLowerCase())}">${esc(log.apiMethod)}</span> ${esc(log.apiPath)}</code>` : '<span class="muted">未記錄</span>'}</dd><dt>請求編號</dt><dd>${log.requestId ? `<code class="api-code">${esc(log.requestId)}</code>` : '<span class="muted">未記錄</span>'}</dd></dl><h3 class="sub-title">異動內容</h3>${changes}`,
    actions: [{ label: '關閉', primary: true }]
  });
}

// ───────────────────────── 對話框 ─────────────────────────
function openModal({ title, subtitle = '', body = '', actions = [], wide = false, alert = false }) {
  const layer = document.createElement('div');
  layer.className = 'modal-layer';
  const titleId = `modal-title-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const actionHtml = actions.map(action => `<button type="button" class="btn ${action.primary ? 'primary' : ''} ${action.danger ? (action.primary ? 'danger' : 'danger-outline') : ''} ${action.id ? '' : 'modal-close'}" ${action.id ? `id="${action.id}"` : ''} ${action.disabled ? 'disabled' : ''}>${esc(action.label)}</button>`).join('');
  layer.innerHTML = `<div class="modal ${wide ? 'wide' : ''} ${alert ? 'alert-modal' : ''}" role="${alert ? 'alertdialog' : 'dialog'}" aria-modal="true" aria-labelledby="${titleId}"><header><div><h2 id="${titleId}">${esc(title)}</h2>${subtitle ? `<small class="muted">${esc(subtitle)}</small>` : ''}</div><button type="button" class="icon-btn modal-close" aria-label="關閉">✕</button></header><div class="modal-body">${body}</div><footer>${actionHtml}</footer></div>`;
  layer._returnFocus = document.activeElement;
  $('#modalHost').append(layer);
  $$('.modal-close', layer).forEach(button => button.onclick = () => closeModal(layer));
  layer.addEventListener('mousedown', event => { if (event.target === layer) closeModal(layer); });
  setTimeout(() => ($('input:not([type="checkbox"]):not([type="file"]):not(:disabled),select,textarea', layer) || $('footer .btn.primary:not(:disabled)', layer) || $('footer .btn', layer))?.focus(), 0);
  return layer;
}

function closeModal(layer) {
  if (!layer?.isConnected) return;
  const target = layer._returnFocus;
  layer.remove();
  if (target?.isConnected) target.focus();
}

function confirmAction(title, message, onConfirm, danger = false) {
  const layer = openModal({ title, body: `<p class="pre-line">${esc(message)}</p>`, actions: [{ label: '取消' }, { label: '確定', primary: true, danger, id: 'confirmActionButton' }] });
  $('#confirmActionButton', layer).onclick = () => { closeModal(layer); onConfirm(); };
}

function showErrorList(title, messages) {
  openModal({ title, alert: true, body: `<div class="alert alert-error"><ul>${messages.map(message => `<li>${esc(message)}</li>`).join('')}</ul></div>`, actions: [{ label: '知道了', primary: true }] });
}

function resetResourceFilters(render = true) {
  resourcePage = 1;
  $('#resourceState').value = 'all';
  $('#resourceScreen').value = '';
  ['#filenameSearch', '#translationSearch', '#remarkSearch'].forEach(selector => { $(selector).value = ''; });
  if (render) renderResources();
}

// ───────────────────────── 事件繫結 ─────────────────────────
document.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!event.target.closest('.user-switcher')) { $('#roleMenu').classList.add('hidden'); $('#userMenuButton').setAttribute('aria-expanded', 'false'); }
  if (!event.target.closest('.assign-menu,.assign-btn')) closeAssignDropdown();
  if (!target) return;
  const data = target.dataset;
  if (target.classList.contains('sort-btn') && target.closest('#projectHead')) toggleProjectSort(data.sort);
  else if (target.classList.contains('open-project')) openProject(data.projectId);
  else if (target.classList.contains('edit-name')) startRenameProject(data.projectId);
  else if (target.classList.contains('save-name')) saveRenameProject(data.projectId);
  else if (target.classList.contains('cancel-name')) cancelRenameProject();
  else if (target.classList.contains('delete-project')) deleteProject(data.projectId);
  else if (target.classList.contains('archive-project')) archiveProject(data.projectId);
  else if (target.classList.contains('unarchive-project')) unarchiveProject(data.projectId);
  else if (target.classList.contains('export-project')) openExport(data.projectId);
  else if (target.classList.contains('assign-btn')) { event.stopPropagation(); openAssignDropdown(target); }
  else if (target.classList.contains('screen-preview')) openScreenPreview(data.screenId);
  else if (target.classList.contains('rename-screen')) openRenameScreen(data.screenId);
  else if (target.classList.contains('delete-screen')) deleteScreen(data.screenId);
  else if (data.previewResource) previewAsset(data.previewResource, data.locale);
  else if (target.classList.contains('upload-asset')) openUpload(data.resourceId, data.locale);
  else if (target.classList.contains('motion-path')) openMotion(data.resourceId);
  else if (target.classList.contains('edit-limits')) openLimitEditor(data.resourceId);
  else if (target.classList.contains('approve')) openApprove(data.resourceId);
  else if (target.classList.contains('reject')) openReject(data.resourceId);
  else if (target.classList.contains('restore-item')) openRestore(data.trashId);
  else if (target.classList.contains('toggle-account')) toggleAccount(data.accountId);
  else if (target.classList.contains('reset-password')) openResetPassword(data.accountId);
  else if (target.classList.contains('log-detail')) openLogDetail(data.logId);
  else if (data.logPage) { logPage = Number(data.logPage); renderLogs(); }
});

document.addEventListener('keydown', event => {
  const input = event.target.closest?.('.rename-input');
  if (!input) return;
  if (event.key === 'Enter') { event.preventDefault(); saveRenameProject(input.dataset.projectId); }
  if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cancelRenameProject(); }
}, true);

document.addEventListener('focusin', event => {
  const cell = event.target.closest?.('.editable');
  if (cell && !cell.dataset.bound) { cell.dataset.bound = '1'; bindEditable(cell); cell.dataset.original = cell.textContent.trim(); }
});

$$('.menu-item').forEach(button => button.onclick = () => showPage(button.dataset.page));
$('.menu-toggle').onclick = event => {
  const open = $('#sider').classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', String(open));
};
$('#userMenuButton').onclick = event => {
  event.stopPropagation();
  const open = $('#roleMenu').classList.toggle('hidden') === false;
  event.currentTarget.setAttribute('aria-expanded', String(open));
};
$$('#roleMenu [data-role]').forEach(button => button.onclick = () => {
  currentRole = button.dataset.role;
  $('#roleMenu').classList.add('hidden');
  $('#userMenuButton').setAttribute('aria-expanded', 'false');
  applyRole();
  toast(`已切換為${me().name}身分`);
});

// Demo 登入：直接選角色登入（正式系統須改為帳號密碼或公司登入）
function login(role) {
  currentRole = role;
  document.body.classList.remove('logged-out');
  applyRole();
  toast(`已以${me().name}身分登入`);
}
function logout() {
  $('#roleMenu').classList.add('hidden');
  $('#userMenuButton').setAttribute('aria-expanded', 'false');
  $$('.modal-layer').forEach(closeModal);
  closeAssignDropdown();
  if ($('#drawer').classList.contains('open')) closeDrawer();
  document.body.classList.add('logged-out');
  $('.login-role')?.focus();
}
$$('.login-role').forEach(button => button.onclick = () => login(button.dataset.loginRole));
$('#logoutButton').onclick = logout;

$$('.tab[data-tab]').forEach(tab => tab.onclick = () => {
  $$('.tab[data-tab]').forEach(item => { item.classList.toggle('active', item === tab); item.setAttribute('aria-selected', String(item === tab)); });
  currentTab = tab.dataset.tab;
  renderProjects();
});
$('#projectFilters').onsubmit = event => { event.preventDefault(); renderProjects(); };
$('#projectFilters').onreset = () => setTimeout(renderProjects);
$('#addProjectBtn').onclick = openAddProject;

$('#archiveFilters').onsubmit = event => { event.preventDefault(); renderArchive(); };
$('#archiveFilters').onreset = () => setTimeout(renderArchive);
$('#recycleFilters').onsubmit = event => { event.preventDefault(); renderRecycle(); };
$('#recycleFilters').onreset = () => setTimeout(renderRecycle);
$('#accountFilters').onsubmit = event => { event.preventDefault(); renderAccounts(); };
$('#accountFilters').onreset = () => setTimeout(renderAccounts);
$('#addAccountBtn').onclick = openAddAccount;
$('#logFilters').onsubmit = event => { event.preventDefault(); logPage = 1; renderLogs(); };
$('#logFilters').onreset = () => setTimeout(() => { logPage = 1; renderLogs(); });

$('#closeDrawer').onclick = closeDrawer;
$('#drawerMask').onclick = closeDrawer;
$('#addScreenBtn').onclick = openAddScreen;
$('#addResourceBtn').onclick = openAddResource;
$('#exportBtn').onclick = () => openExport();
$$('.platforms input').forEach(input => input.onchange = () => { clearSelection('篩選條件已變更'); syncScreenFilter(); renderScreens(); renderResources(); });
['#resourceState', '#resourceScreen'].forEach(selector => { $(selector).onchange = () => { clearSelection('篩選條件已變更'); renderResources(); }; });
$('#resourceSearchBtn').onclick = () => { clearSelection('篩選條件已變更'); renderResources(); };
['#filenameSearch', '#translationSearch', '#remarkSearch'].forEach(selector => {
  $(selector).onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); clearSelection('篩選條件已變更'); renderResources(); } };
});
$('#resourceResetBtn').onclick = () => { clearSelection('篩選條件已變更'); resetResourceFilters(); };
$('#resourcePrev').onclick = () => { resourcePage -= 1; renderResources(); };
$('#resourceNext').onclick = () => { resourcePage += 1; renderResources(); };
$('#resourcePageSize').onchange = event => { resourcePageSize = Number(event.target.value); resourcePage = 1; renderResources(); };
$('.column-toggles').onclick = event => {
  const button = event.target.closest('[data-lang]');
  if (!button) return;
  button.classList.toggle('active');
  button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  applyLanguageColumns();
};
$('#resourceRows').addEventListener('change', event => {
  const input = event.target.closest('.resource-check');
  if (!input) return;
  if (input.checked) selectedResources.add(input.dataset.resourceId); else selectedResources.delete(input.dataset.resourceId);
  updateSelection();
});
$('#selectAllResources').onchange = event => {
  $$('.resource-check:not(:disabled)').forEach(input => {
    input.checked = event.target.checked;
    if (input.checked) selectedResources.add(input.dataset.resourceId); else selectedResources.delete(input.dataset.resourceId);
  });
  updateSelection();
};
$('#bulkUpdateLimits').onchange = event => { ['#bulkFixedWidth', '#bulkFixedHeight'].forEach(selector => { $(selector).disabled = !event.target.checked; }); };
$('#bulkApply').onclick = applyBulk;
$('#bulkCancel').onclick = () => { selectedResources.clear(); resetBulkEditor(); renderResources(); };
$('#bulkDelete').onclick = deleteSelected;

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (!$('#roleMenu').classList.contains('hidden')) { $('#roleMenu').classList.add('hidden'); $('#userMenuButton').focus(); return; }
  if ($('.assign-menu')) { closeAssignDropdown(); return; }
  const layers = $$('.modal-layer');
  if (layers.length) { closeModal(layers[layers.length - 1]); return; }
  if ($('#drawer').classList.contains('open')) closeDrawer();
});

// 示範資料的介面圖（實際系統為上傳的介面截圖）
screens.forEach((screen, index) => { if (!screen.image) screen.image = demoCanvas(screen.name.replace(/\.[^.]+$/, ''), 640, 360, (index * 47) % 360).toDataURL('image/png'); });
applyRole();
