# 作品集網頁原始檔（軟體專案管理／系統分析作品集）

正式網址（Claude Artifact）：https://claude.ai/artifact/VZH3SkqZUspkARtfTcoc1b
GitHub Pages 鏡像：https://crimsonhsu-pm.github.io/portfolio/source/dist/

## 資料夾
- `fragments/`：組成頁面的片段（主體 `body3.html`、樣式 `*.css`、各段落 HTML、SA 頁 `sa/`）
- `build.py`：把片段組成完整頁面，輸出到 `dist/index.html`
- `dist/`：組好的網站（`index.html`＋`css/`＋`img/`），發佈時整包上傳

## 更新流程
1. 修改 `fragments/` 裡的檔案（版號在 `body3.html` 頁尾）
2. 執行 `python3 build.py`
3. 把 `dist/` 發佈到 Claude Artifact（index.html 與有變動的圖片）
4. commit 並 push 到這個 repo

## 履歷 PDF
`../resume/` 內是從 104 下載、已遮掉年齡、就業狀態與路名的公開版。
