# 作品集連結頁｜維護交接

## 系統用途

這是個靜態入口頁，將公開 GitHub Pages 網址導向外部作品集。無會員、資料儲存或後端 API。

## 技術架構與資料夾

原生 HTML 與少量 CSS／JavaScript；沒有資料庫或套件。根目錄 `index.html` 定義跳轉與分享 metadata，`cover.jpg` 是預覽封面；`README.md` 和本檔是說明。

## 從 clone 到畫面與測試

```bash
git clone https://github.com/crimsonhsu-PM/portfolio.git
cd portfolio
python3 -m http.server 8000
```

瀏覽 http://localhost:8000 。目前無自動化測試；手動確認跳轉、備援連結、封面與手機版。跳轉目的地在 `index.html`，改動時需同步 meta 與腳本。

## 部署與搬遷

預期 Demo：https://crimsonhsu-pm.github.io/portfolio/ ，GitHub Pages；需此 repo 寫入權並在 GitHub Pages 設定 main 根目錄發布。可直接搬到 Cloudflare Pages 或普通靜態空間，不需要建置、D1/R2/Prisma 或伺服器；若網域改變，更新 `index.html` 的 `og:url`、`og:image`。外部作品集目的地在 Claude Artifact，該服務與連結仍須可用。

## 資料模型、業務規則與重置

沒有資料表或帳號，也沒有示範資料。唯一規則是 `index.html` 中的自動跳轉與備援連結；無重置流程。

## 已知事項

此頁依賴外部 Claude Artifact；目的地失效時需替換連結。GitHub Pages 發布設定需在 GitHub 帳號中確認，單純 push 不保證 Pages 已啟用。
