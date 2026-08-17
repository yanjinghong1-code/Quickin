var annoying_words = [" in-game", " in–game", "hard-coded", "hard–coded", "hard-code", "hard–code", "build-in", "build–in"]
async function retrieve_data() {
    // 取得bug內容
    const summaryElement = document.getElementById("summary-val")
    const keyElement = document.getElementById("key-val")
    if (!summaryElement || !keyElement) {
        throw new Error("Jira issue details are not ready")
    }
    let summary = summaryElement.textContent.replaceAll(/-/g, "–")// 把半形都換成全形
    // 移除阻礙字串解析的文字
    annoying_words.map(word => {
        if(summary.includes(word)) {
            summary = summary.replaceAll(word, "")
        }
    })
    const summary_items = summary.split(" – ")
    const department =  summary_items[0].split(":")[0].trim()
    const project =  summary_items[0].split(":")[1].trim()
    const platform =  summary_items[1].trim()
    // REX may include a platform form-factor segment (for example,
    // "SWITCH2 – HANDHELD"). Locate the language instead of assuming it is
    // always the third summary field.
    const languageTokens = ["EN", "FR", "IT", "DE", "ES", "RU", "PL", "AR", "ENAR", "PTBR", "MX", "KO", "ZHS", "ZHT", "JA", "TH", "FIGS", "EFIGS", "ML", "ALL"]
    const languageIndex = summary_items.findIndex((item, index) => {
        if(index < 2) return false
        return item.trim().toUpperCase().split("/").every(token => languageTokens.includes(token))
    })
    const fieldIndex = languageIndex >= 0 ? languageIndex : 2
    const language = (summary_items[fieldIndex] || "").trim()
    const bug_type_1 = (summary_items[fieldIndex + 1] || "").trim()
    // Some REX summaries have extra location segments (for example,
    // "Settings/Button Config").  Keep the first six structured fields and
    // join every remaining segment back into the title instead of rejecting
    // the whole issue.
    let bug_type_2 = ""
    let position = ""
    let title = ""
    const remainingItems = summary_items.slice(fieldIndex + 2)
    if(remainingItems.length >= 3) {
        bug_type_2 = remainingItems[0].trim()
        // Keep the filename convention used by the tool for this common type.
        if(bug_type_2.toUpperCase() == "OVERLAP") bug_type_2 = "Overlap"
        position = remainingItems[1].trim()
        title = remainingItems.slice(2).join(" – ").trim()
    }else if (remainingItems.length == 2) {
        bug_type_2 =  ""
        position = remainingItems[0].trim()
        title = remainingItems[1].trim()
    }
    const bug_id = keyElement.textContent
    // release/build field: support both Create screen (<input id=customfield_x>) and View screen (<div id=customfield_x-val>)
function getCustomFieldText(idBase) {
  const elInput = document.getElementById(idBase);
  if (elInput && typeof elInput.value === 'string') return elInput.value.trim();
  const elVal = document.getElementById(idBase + '-val');
  if (elVal && typeof elVal.textContent === 'string') return elVal.textContent.trim();
  return '';
}
function longestDigits(s) {
  const nums = (s || '').match(/\d+/g) || [];
  if (!nums.length) return (s || '').trim();
  return nums.reduce((a,b) => (b.length > a.length ? b : a), nums[0]);
}
 let release_id = (project == 'IW9' ? getCustomFieldText('customfield_10403') : getCustomFieldText('customfield_10307'));
 release_id = longestDigits(release_id);
// The Found CL is not always populated as a Jira field. Preserve the issue
// description so the popup can also read "Build number:" directly.
 const description = document.getElementById("description-val")?.innerText || document.getElementById("description-val")?.textContent || "";
    const bug_data = {
        "bug_id": bug_id,
        "release_id": release_id,
        "language": language,
        "bug_type_1": bug_type_1,
        "bug_type_2": bug_type_2,
        "description": description,
    }
    return bug_data
}
// 等個幾秒(default 2 sec)
async function waitASecond(ms = 2000) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

// Keep the parser callable from the service worker. The retry must await the
// async parser; otherwise a missing Jira DOM becomes an unhandled rejection.
globalThis.kakinRetrieveBugData = async function() {
    let lastError
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            return await retrieve_data()
        } catch (error) {
            lastError = error
            if (attempt === 0) await waitASecond(500)
        }
    }
    throw lastError
}
