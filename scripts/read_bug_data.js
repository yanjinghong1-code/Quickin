annoying_words = [" in-game", " in–game", "hard-coded", "hard–coded", "hard-code", "hard–code", "build-in", "build–in"]
async function retrieve_data() {
    // 取得bug內容
    summary = document.getElementById("summary-val").textContent.replaceAll(/-/g, "–")// 把半形都換成全形
    // 移除阻礙字串解析的文字
    annoying_words.map(word => {
        if(summary.includes(word)) {
            summary = summary.replaceAll(word, "")
        }
    })
    summary_items = summary.split(" – ")
    department =  summary_items[0].split(":")[0].trim()
    project =  summary_items[0].split(":")[1].trim()
    platform =  summary_items[1].trim()
    language =  summary_items[2].trim()
    bug_type_1 =  summary_items[3].trim()
    if(summary_items.length == 7) {
        bug_type_2 =  summary_items[4].trim()
        position =  summary_items[5].trim()
        title =  summary_items[6].trim()
    }else if (summary_items.length == 6) {
        bug_type_2 =  ""
        position =  summary_items[4].trim()
        title =  summary_items[5].trim()
    }
    bug_id = document.getElementById("key-val").textContent
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
release_id = (project == 'IW9' ? getCustomFieldText('customfield_10403') : getCustomFieldText('customfield_10307'));
release_id = longestDigits(release_id);
    bug_data = {
        "bug_id": bug_id,
        "release_id": release_id,
        "language": language,
        "bug_type_1": bug_type_1,
        "bug_type_2": bug_type_2,
    }
    return bug_data
}
// 等個幾秒(default 2 sec)
async function waitASecond(ms = 2000) {
    await new Promise(resolve => setTimeout(resolve, ms));
}
try {
    retrieve_data()
}catch(err) {
    console.log("Retrieve Data from Page Fail, Retry in .5 second")
    waitASecond(500).then(() => {
        try{
            retrieve_data()
        }catch{
            console.log(err)
        }
    })
}