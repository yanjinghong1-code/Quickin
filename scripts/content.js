// 等個幾秒(default 2 sec)
async function waitASecond(ms = 2000) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

// 只在 xloc.activision.com 執行
if (window.location.host === "xloc.activision.com") {
    
    // 移除遮挡按钮的干扰项
    const topBtn = document.getElementById("ctl06_btnScroll");
    if (topBtn) topBtn.style.display = "none";

    // 1. 创建批量操作按钮
    function ensureBatchButtonsExist() {
        if (document.getElementById("batch-btn-container")) return;
        const table = document.querySelector("table.rgMasterTable");
        if (!table) return;

        const container = document.createElement("div");
        container.id = "batch-btn-container";
        container.style = "margin-bottom: 10px; display: flex; gap: 10px; padding: 5px;";

        const btnStyle = "cursor:pointer; padding: 6px 12px; background: #00acc1; color: white; border: none; border-radius: 3px; font-weight: bold;";
        
        const createBtn = (id, text) => {
            const btn = document.createElement("button");
            btn.id = id;
            btn.textContent = text;
            btn.style.cssText = btnStyle;
            return btn;
        };

        const btnRid = createBtn("batch-copy-all-rids", "Copy All Resource IDs");
        const btnFn = createBtn("batch-copy-all-filenames", "Copy All Filenames");
        const btnDvar = createBtn("batch-copy-all-dvars", "Copy All Dvars");

        container.append(btnRid, btnFn, btnDvar);
        table.parentNode.insertBefore(container, table);

        // 批量复制逻辑
        btnRid.onclick = () => {
            const data = Array.from(document.querySelectorAll(".xloc-batch-data")).map(el => el.dataset.rid).filter(Boolean);
            if(data.length) { navigator.clipboard.writeText(data.join("\n")); alert(`Copied ${data.length} Resource IDs`); }
        };
        btnFn.onclick = () => {
            const data = Array.from(document.querySelectorAll(".xloc-batch-data")).map(el => el.dataset.filename).filter(Boolean);
            if(data.length) { navigator.clipboard.writeText(data.join("\n")); alert(`Copied ${data.length} Filenames`); }
        };
        btnDvar.onclick = () => {
            const data = Array.from(document.querySelectorAll(".xloc-batch-data")).map(el => el.dataset.dvar).filter(Boolean);
            if(data.length) { navigator.clipboard.writeText(data.join("\n")); alert(`Copied ${data.length} Dvars`); }
        };
    }

    // 2. 处理行数据与生成单个复制按钮，并同步更新批量按钮可见性
    function processRows() {
        const table = document.querySelector("table.rgMasterTable");
        if (!table) return;

        let headers = Array.from(table.querySelectorAll("th")).map(th => th.textContent.toLowerCase());
        let rid_idx = headers.findIndex(h => h.includes("resource id"));
        let notes_idx = headers.findIndex(h => h.includes("string notes"));

        let hasAnyFilename = false;

        table.querySelectorAll("tbody tr").forEach(tr => {
            if (tr.querySelector(".xloc-batch-data")) {
                // 如果已经处理过，直接检查是否含有 filename 数据
                if (tr.querySelector(".xloc-batch-data").dataset.filename) hasAnyFilename = true;
                return; 
            }
            
            let cells = tr.querySelectorAll("td");
            if (cells.length === 0) return;

            let rid_val = (rid_idx !== -1 && cells[rid_idx]) ? cells[rid_idx].textContent.trim() : "";
            let dataSpan = document.createElement("span");
            dataSpan.className = "xloc-batch-data";
            dataSpan.style.display = "none";
            dataSpan.dataset.rid = rid_val;

            if (notes_idx !== -1 && cells[notes_idx]) {
                let container = cells[notes_idx].querySelector("div.xloc_FormatForHTML");
                if (container) {
                    let text = container.textContent;
                    let fnMatch = text.match(/Filename - ([\w\.]+)/);
                    if (fnMatch) {
                        let fn = fnMatch[1];
                        hasAnyFilename = true; // 发现 Filename
                        let dvar = "snd_start_alias " + fn.replace(".wav", "").split("_").slice(0, 5).join("_");
                        
                        dataSpan.dataset.filename = fn;
                        dataSpan.dataset.dvar = dvar;

                        // 辅助创建单个复制按钮
                        const createSingleBtn = (label, contentToCopy) => {
                            let btn = document.createElement("button");
                            btn.textContent = "📄 " + label;
                            btn.style.marginLeft = "5px";
                            btn.style.cursor = "pointer";
                            btn.onclick = (e) => { 
                                e.preventDefault(); 
                                navigator.clipboard.writeText(contentToCopy); 
                                btn.textContent = "✔️";
                                setTimeout(() => btn.textContent = "📄 " + label, 1000);
                            };
                            return btn;
                        };

                        container.appendChild(document.createElement("br"));
                        container.appendChild(createSingleBtn("Filename", fn));
                        container.appendChild(createSingleBtn("Dvar", dvar));
                    }
                }
            }
            tr.appendChild(dataSpan);
        });

        // 3. 根据是否有 Filename 决定批量按钮的显示
        const btnFn = document.getElementById("batch-copy-all-filenames");
        const btnDvar = document.getElementById("batch-copy-all-dvars");
        if (btnFn && btnDvar) {
            const display = hasAnyFilename ? "" : "none";
            btnFn.style.display = display;
            btnDvar.style.display = display;
        }
    }

    // 实时监听
    const observer = new MutationObserver(() => {
        ensureBatchButtonsExist();
        processRows();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Jira 逻辑...
if (window.location.pathname == "/jira/secure/CreateIssueDetails!init.jspa") {
    // ... 原有逻辑保持不变
}