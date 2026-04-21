let bug_data, highlight, color_dict
const SHAREPOINT_URL = "https://activision.sharepoint.com/_layouts/15/sharepoint.aspx"
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log(message)
        switch(message.type) {
            case "read_bug_data":
                asyncExecuteScript(['./scripts/read_bug_data.js']).then((result) => {
                    sendResponse(result)
                })
                return true // 告知非同步回應
            case "read_color_code":
                asyncFetchData("../data/style_code.json").then((result) => {
                    sendResponse(result)
                })
                return true // 告知非同步回應
            case "highlight_color_code":
                asyncExecuteScript(['./scripts/highlight_color_code.js']).then((result) => {
                    sendResponse(result)
                })
                return true // 告知非同步回應
            case "highlight_source_difference":
                asyncExecuteScript(['./scripts/highlight_source_difference.js'])
                return true // 告知非同步回應
            case "highlight_translation_difference":
                asyncExecuteScript(['./scripts/highlight_translation_difference.js'])
                return true // 告知非同步回應
            case "detect_highlight":
                asyncExecuteScript(['./scripts/detect_highlight.js']).then((result) => {
                    sendResponse(result)
                })
                return true // 告知非同步回應
            case "download_file":
                chrome.downloads.download({ url: message.url, saveAs: false });
                break;
            default:
                console.error("Unrecognised message type: ", message.type);
        }
    }
)

// 讓Promise可以傳回pup up 因為onMessage加了async會無法傳訊息過去 參考https://stackoverflow.com/questions/53024819/sendresponse-not-waiting-for-async-function-or-promises-resolve
async function asyncExecuteScript(files) {
    const result = await chrome.scripting.executeScript({
        target: {tabId: await getCurrentTabId()},
        files: files
    })
    return result[0].result
}
// 無法在onMessage中使用fetch 所以使用async function 原理同上
async function asyncFetchData(path) {
    const result = await fetch(path).then(response => {
        if(response.ok) {return response.json()}
    })
    return result
}
// 取得目前tab ID
async function getCurrentTabId() {
    try {
        let queryOptions = { active: true, lastFocusedWindow: true };
        let [tab] = await chrome.tabs.query(queryOptions);
        return tab.id;
    }catch(err) {
        console.log(err)
    }
}