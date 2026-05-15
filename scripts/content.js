// 等個幾秒(default 2 sec)
async function waitASecond(ms = 2000) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// 1. xloc.activision.com 逻辑
// ==========================================
if (window.location.host === "xloc.activision.com") {
    
    const topBtn = document.getElementById("ctl06_btnScroll");
    if (topBtn && topBtn.parentElement) topBtn.parentElement.style.display = "none";
 // icon flash style (Filename/Dvar single copy buttons only)
 if (!document.getElementById('xloc-icon-flash-style')) {
   const st = document.createElement('style');
   st.id = 'xloc-icon-flash-style';
   st.textContent = '.xloc-copy-icon.flash{animation:xlocIconFlash .25s ease-in-out 2;}@keyframes xlocIconFlash{0%{opacity:1;transform:scale(1);}50%{opacity:.25;transform:scale(1.25);}100%{opacity:1;transform:scale(1);}}';
   if(document.head) document.head.appendChild(st);
 }


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

        btnRid.onclick = () => { const data = Array.from(document.querySelectorAll(".xloc-batch-data")).map(el => el.dataset.rid).filter(Boolean); if(data.length) navigator.clipboard.writeText(data.join("\n")); };
        btnFn.onclick = () => { const data = Array.from(document.querySelectorAll(".xloc-batch-data")).map(el => el.dataset.filename).filter(Boolean); if(data.length) navigator.clipboard.writeText(data.join("\n")); };
        btnDvar.onclick = () => { const data = Array.from(document.querySelectorAll(".xloc-batch-data")).map(el => el.dataset.dvar).filter(Boolean); if(data.length) navigator.clipboard.writeText(data.join("\n")); };
    }

    function processRows() {
        const table = document.querySelector("table.rgMasterTable");
        if (!table) return;

        let headers = Array.from(table.querySelectorAll("th")).map(th => th.textContent.toLowerCase());
        let rid_idx = headers.findIndex(h => h.includes("resource id"));
        let notes_idx = headers.findIndex(h => h.includes("string notes"));

        let hasAnyFilename = false;

        table.querySelectorAll("tbody tr").forEach(tr => {
            let cells = tr.querySelectorAll("td");
            if (cells.length === 0) return;

            // 确保有隐藏数据承载对象
            let dataSpan = tr.querySelector(".xloc-batch-data") || document.createElement("span");
            if (!dataSpan.className) {
                dataSpan.className = "xloc-batch-data";
                dataSpan.style.display = "none";
                dataSpan.dataset.rid = (rid_idx !== -1 && cells[rid_idx]) ? cells[rid_idx].textContent.trim() : "";
                tr.appendChild(dataSpan);
            }

            if (notes_idx !== -1 && cells[notes_idx]) {
                let noteDiv = cells[notes_idx].querySelector("div.xloc_FormatForHTML");
                if (noteDiv && !noteDiv.querySelector(".xloc-copy-btn")) {
                    
                    // --- 移植 content1.js 的字典化解析逻辑 ---
                    let content = noteDiv.innerHTML;
                    content = content.replaceAll("<span class=\"table-highlight-string\">", "").replaceAll("</span>", "");
                    
                    if(content.includes("Filename")) {
                        const postfix_regex = /_[0-9]{2}/g;
                        let content_dict = content.split("<br>")
                            .filter(line => line.trim() !== "")
                            .reduce((acc, line) => {
                                const [key, value] = line.split(" - ").map(s => s.trim());
                                if(key && value) acc[key] = value;
                                return acc;
                            }, {});

                        let filename_full = content_dict["Filename"];
                        if (filename_full) {
                            hasAnyFilename = true;
                            let filename = filename_full.replace(".wav", "");
                            let parts = filename.split("_");
                            let dvar = "";

                            // 移植 content1.js 的 Dvar 生成规则
                            if(filename.includes("dx_br")){
                                dvar = "snd_start_alias " + filename.split("_").slice(0, 6).join("_");
                            } else if(filename.includes("dx_mp")) {
                                dvar = "snd_start_alias " + parts[0] + "_" + parts[1] + "_" + parts[3] + "_" + parts[5] + "_" + parts[4];
                            } else if(filename.includes("dx_zm")) {
                                dvar = "snd_start_alias " + filename.replace(postfix_regex, "");
                            } else if(filename.includes("dx_wc")) {
                                dvar = "snd_start_alias " + parts.slice(0, 6).join("_");
                            } else {
                                dvar = "snd_start_alias " + parts[0] + "_" + parts[1] + "_" + parts[3] + "_" + parts[5] + "_" + parts[4];
                            }
                            
                            dataSpan.dataset.filename = filename_full;
                            dataSpan.dataset.dvar = dvar;

                            const createSingleBtn = (label, content) => {
                                let btn = document.createElement("button");
                                btn.innerHTML = "<span class=\"xloc-copy-icon\">📄</span> " + label;
                                btn.className = "xloc-copy-btn";
                                btn.style.marginLeft = "5px";
                                btn.onclick = (e) => { e.preventDefault(); const icon = btn.querySelector(".xloc-copy-icon"); if(icon){ icon.classList.remove("flash"); void icon.offsetWidth; icon.classList.add("flash"); } navigator.clipboard.writeText(content); };
                                return btn;
                            };

                            noteDiv.appendChild(document.createElement("br"));
                            noteDiv.appendChild(createSingleBtn("Filename", filename_full));
                            noteDiv.appendChild(createSingleBtn("Dvar", dvar));
                        }
                    }

                } else if (noteDiv && noteDiv.querySelector(".xloc-copy-btn")) {
                    hasAnyFilename = true; 
                }
            }
        });

        const btnFn = document.getElementById("batch-copy-all-filenames");
        const btnDvar = document.getElementById("batch-copy-all-dvars");
        if (btnFn && btnDvar) {
            btnFn.style.display = hasAnyFilename ? "block" : "none";
            btnDvar.style.display = hasAnyFilename ? "block" : "none";
        }
    }

    const observer = new MutationObserver(() => {
        ensureBatchButtonsExist();
        processRows();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// ==========================================
// 2. Jira 逻辑 (保持不变)
// ==========================================
if(window.location.pathname == "/jira/secure/CreateIssueDetails!init.jspa") {
    // Jira 自动化逻辑保持原样
    chrome.storage.local.get("resource_ids_template").then((result) => {
        if(result.resource_ids_template) {
            const waitIframe = setInterval(() => {
                const iframeDoc = document.getElementById("mce_0_ifr")?.contentDocument;
                if (iframeDoc) {
                    const targetP = Array.from(iframeDoc.querySelectorAll("p")).find(p => p.textContent.trim() === "resource_ids");
                    if (targetP) { targetP.innerHTML = result.resource_ids_template.replaceAll("\n", "<br>"); clearInterval(waitIframe); }
                }
            }, 200);
            const ridInput = document.getElementById("customfield_12303");
            if (ridInput) ridInput.value = result.resource_ids_template;
            chrome.storage.local.set({"resource_ids_template": ""});
        }
    });

    (function autoFillAutomationUtilized() {
        const sel1 = document.getElementById("customfield_26302"), sel2 = document.getElementById("customfield_26302:1");
        if (!sel1 || !sel2) { setTimeout(autoFillAutomationUtilized, 300); return; }
        Array.from(sel1.options).find(o => o.text === "N/A") && (sel1.value = Array.from(sel1.options).find(o => o.text === "N/A").value);
        Array.from(sel2.options).find(o => o.text === "None") && (sel2.value = Array.from(sel2.options).find(o => o.text === "None").value);
    })();
}