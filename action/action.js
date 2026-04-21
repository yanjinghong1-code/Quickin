// COPY RIGHT XDD
var ivy = `%c
  __  __           _        ____          _____           
 |  \\/  |         | |      |  _ \\        |_   _|          
 | \\  / | __ _  __| | ___  | |_) |_   _    | |_   ___   _ 
 | |\\/| |/ _\` |/ _\` |/ _ \\ |  _ <| | | |   | \\ \\ / / | | |
 | |  | | (_| | (_| |  __/ | |_) | |_| |  _| |\\ V /| |_| |
 |_|  |_|\\__,_|\\__,_|\\___| |____/ \\__, | |_____\\_/  \\__, |
                                   __/ |             __/ |
                                  |___/             |___/ 
`
console.log(ivy, 'color:White; background-color:Black;')


////////////
// Global //
////////////

const TEXTCONTENT_MIN_HEIGHT = 300
const TEXTCONTENT_MAX_HEIGHT = 500
const SHEET_ID = "1SkzzoXR5ImJ7PxtjwK36NZdqmjPY4WqFevK5qMo-_os"
const API_KEY = "AIzaSyDjuspXXuiZs6NeNTW04D_hj5x-fNv0mGE"
const GOOGLE_SHEET_NAMES = ["Version", "Quick", "MP_Map", "MP_Mode", "ZM_Map", "ZM_Mode", "WZ_Map", "WZ_Mode"]
let GOOGLE_WORKBOOK = null // Singleton

// text area自動調整大小
textareaPaddingY = parseFloat($("textarea").css('padding-top')) + parseFloat($("textarea").css('padding-bottom'))
$('textarea').on('input', (event) => {
    $(event.target).css("height", "auto")
    $(event.target).css("height", (event.target.scrollHeight) + textareaPaddingY + "px")
})

// 從連結下載
function downloadURL(url) {
    chrome.runtime.sendMessage({type: "download_file", url: url});
}
// 取得google sheet資料
const fetchGoogleWorkbook = async() => {
    const ranges = GOOGLE_SHEET_NAMES.map(name => `ranges=${encodeURIComponent(name)}`).join("&")
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?${ranges}&key=${API_KEY}`
    console.log(url)
    const res = await fetch(url)
    const json = await res.json()
    
    const workbook = {};
    for (const range of json.valueRanges) {
        const sheetName = range.range.split("!")[0]
        workbook[sheetName] = range.values || []
    }
    return workbook
}

// 是否詢問更新
update_request = 1
chrome.storage.local.get("update_request").then((result) => {
    if(result["update_request"] != null){
        update_request = result["update_request"]
    }else{
        chrome.storage.local.set({"update_request": 1 }).then(() => {})
    }
})

// 讀取manifest.json中的版本
fetch("../manifest.json").then(response => {
    if(response.ok) {return response.json()}
}).then(data => {
    current_version = data.version
    $("#version").text("Version " + current_version)
    // 取得最新版版本
    fetchGoogleWorkbook().then(response => {
        GOOGLE_WORKBOOK = response
        version_sheet = GOOGLE_WORKBOOK["Version"]
        latest_version = version_sheet[1][0] // 版本號
        latest_file = version_sheet[1][1] // 下載連結
        update_note = version_sheet[1][2] // 更新內容
        // 如果版本不同
        if(current_version != latest_version){
            // 只提醒一次
            if(update_request){
                // 按確認
                if(confirm("Latest version available! Do you want to download now?" + "\n" + update_note) == true) {
                    downloadURL(latest_file)
                }
            }
            chrome.storage.local.set({"update_request": 0 }).then(() => {})
            $("#version").append(" <i title=\"Update Available\" class=\"fa fa-download\" style=\"cursor: pointer;\"></i>")
            $("#version>.fa-download").on("click", () => {
                downloadURL(latest_file)
                $("#version").html($("#version").html().replace("<i title=\"Update Available\" class=\"fa fa-download\" style=\"cursor: pointer;\"></i>", "<i class=\"fa-solid fa-check\"></i>"))
            })
        }else{
            // 開啟下次更新
            chrome.storage.local.set({"update_request": 1 }).then(() => {})
        }
        // 固定dropdown寬度並填入dvar options
        measureWhenHidden($("#dvar"))
    }).catch(err => {
        console.log("Error: ", err)
    })
}).catch(err => {
    console.log("Error while fetching manifest.json: ", err)
})

// 切換tab
$("#file_naming_tab").on("click", function() {
    openTab("file_naming")
    chrome.storage.local.set({"tab": "file_naming" }).then(() => {})
})
$("#xloc_tab").on("click", function() {
    openTab("xloc")
    resizeXlocTabLength()
    chrome.storage.local.set({"tab": "xloc" }).then(() => {})
})
$("#new_bug_tab").on("click", function() {
    openTab("new_bug")
    chrome.storage.local.set({"tab": "new_bug" }).then(() => {})
})
$("#dvar_tab").on("click", function() {
    openTab("dvar")
    chrome.storage.local.set({"tab": "dvar" }).then(() => {})
})
// 切換tab的function
function openTab(tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "selected"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" selected", "");
    }
  
    // Show the current tab, and add an "selected" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    $("#" + tabName + "_tab").addClass("selected")
    // 如果打開的頁面不是New Bug tab時 無法取得#resource_ids的滾動高度(因為display:none;) 所以每切換一次就讀一次
    $("#resource_ids").css("height", "1px") // textarea和input的預設大小是20px 看起來比較一致
    $("#resource_ids").css("height", ($("#resource_ids").prop('scrollHeight')) == 20 ? "93px" : ($("#resource_ids").prop('scrollHeight')) + 2 + "px") // 多+2是因為有padding
    $("#summary").css("height", "1px") // textarea和input的預設大小是20px 看起來比較一致
    $("#summary").css("height", ($("#summary").prop('scrollHeight')) == 20 ? "22px" : ($("#summary").prop('scrollHeight')) + 2 + "px") // 多+2是因為有padding
    // 當選擇new bug tab才顯示相關按鈕
    if(tabName == "new_bug") {
        $("#new_bug_action_button").css('display', 'flex')
        $("#resize").show()
    }else {
        $("#new_bug_action_button").hide()
        $("#resize").hide()
    }
}
// 決定目前要開啟的tab
chrome.storage.local.get("tab").then((result) => {
    if(result["tab"] != null){
        openTab(result["tab"])
    }else{
        openTab("new_bug")
    }
})

//////////
// FTUE //
//////////

// 第一次使用時顯示FTUE
chrome.storage.local.get("username_validation").then((result) => {
    if(result["username_validation"] != "true") {
        $("#ftue").show()
    }
})
// 關閉FTUE
$("#close_ftue").on("click", function() {
    $("#ftue").hide()
    chrome.storage.local.set({"username_validation": "true"})
    chrome.storage.local.get("initialize").then((result) => {
        if(result["initialize"] != "true") {
            // 初始化template tab裡面的選項
            reset_all()
            chrome.storage.local.set({"initialize": "true"})
        }
    })
    // 如果目前是開啟template tab, 調整回原本高度
    if($("#new_bug_tab").hasClass("selected")){
        chrome.storage.local.get("new_bug_height").then((result) => {
            if(result["new_bug_height"] != undefined){
                $("#new_bug.tabcontent").css("height", result["new_bug_height"])
            }
        })
    }
})
// 從localstorage讀profile username資料
let usernameRE = /\S+@\S+\.\S+/ // 檢查是否為email格式
chrome.storage.local.get("profile_username").then((result) => {
    $("#profile_username").val(result["profile_username"])
    // 當profile username一開始有錯誤格式時 不讓他離開FTUE
    if(!usernameRE.test($("#profile_username").val())) {
        $(".profile_username").addClass("format-error")
        $("#close_ftue").attr("disabled", true)
        chrome.storage.local.set({"username_validation": "false"})
        console.log("username format error")
    }
})
// 當profile username有修改時 上傳localstorage
$("#profile_username").on("input", function() {
    chrome.storage.local.set({"profile_username": $("#profile_username").val()})
    $(".profile_username").removeClass("format-error")
})
// 當profile username focusout時 檢查格式
$("#profile_username").on("focusout", function() {
    if(!usernameRE.test($("#profile_username").val()) && !$(".profile_username").hasClass("format-error")) {
        $(".profile_username").addClass("format-error")
        $("#close_ftue").attr("disabled", true)
        chrome.storage.local.set({"username_validation": "false"})
        console.log("username format error")
    }else if(usernameRE.test($("#profile_username").val()) && $(".profile_username").hasClass("format-error")) {
        $(".profile_username").removeClass("format-error")
        $("#close_ftue").attr("disabled", false)
        chrome.storage.local.set({"username_validation": "true"})
        console.log("usernameformat correct")
    }
})
// 當profile username輸入時 檢查格式
$("#profile_username").on("input", function() {
    if(!usernameRE.test($("#profile_username").val())) {
        $("#close_ftue").attr("disabled", true)
        console.log("username format error")
    }else if(usernameRE.test($("#profile_username").val())) {
        $(".profile_username").removeClass("format-error")
        $("#close_ftue").attr("disabled", false)
        chrome.storage.local.set({"username_validation": "true"})
        console.log("username format correct")
    }
})
// 從localstorage讀profile lng資料
chrome.storage.local.get("profile_lng").then((result) => {
    $("#" + result["profile_lng"]).attr('selected','selected')
})
// 當profile lng有修改時 上傳localstorage
$("#profile_lng").change(() => {
    chrome.storage.local.set({"profile_lng": $("#profile_lng option:selected").attr("id")})
})
// 從localstorage讀theme資料
chrome.storage.local.get("theme").then((result) => {
    $(".theme_btn").removeClass('selected')
    if(result["theme"] != null){
        $("#theme_" + result["theme"]).addClass('selected')
    }else{
        $("#theme_default").addClass('selected')
    }
    // 初始化布景主題
    applyTheme($(".theme_btn.selected").data("value"))
})
// 當profile lng有修改時 上傳localstorage並布景主題切換
$(".theme_btn").on("click", function() {
    $(".theme_btn").removeClass('selected')
    $(this).addClass('selected')
    chrome.storage.local.set({"theme": $(this).data("value")})
    applyTheme($(this).data("value"))
})
// 開啟jira profile頁
$("#check_username").on("click", function() {
    chrome.tabs.create({url: "https://dev.activision.com/jira/secure/ViewProfile.jspa"})
    return false
})
// 顯示ftue
$("#setting").on("click", function() {
    $("#new_bug.tabcontent").css("height", TEXTCONTENT_MIN_HEIGHT + "px")
    $("#ftue").show()
})
// icon hover效果
$("#setting").hover(
    function() {
        $(this).addClass("fa-spin")
    }, function() {
        $(this).removeClass( "fa-spin" )
    }
)
// report an issue(目前連結是我的slack profile，改成了链接延的SlackProfile)
$('button#report_issue_btn').on("click", function(){
  chrome.tabs.create({url: "https://abk.enterprise.slack.com/team/U096FF0KVQR"})
  return false
})
// 開啟manual guide(ZHT confluence page)
$('button#manual_guide_btn').on("click", function(){
    chrome.tabs.create({url: "https://dev.activision.com/wiki/pages/viewpage.action?pageId=724177651"})
    return false
})
let css_var = [
    "--general-background-color"
    , "--general-text-color"
    , "--tab-background-color"
    , "--decorate-text-color"
    , "--file-naming-label-color"
    , "--general-button-color"
    , "--general-button-selected-color"
    , "--general-button-border-color"
    , "--general-button-background-color"
    , "--general-button-selected-background-color"
    , "--tablinks-color"
    , "--tablinks-selected-background-color"
    , "--checkbox-fill-color"
]
// 應用佈景主題
function applyTheme(theme) {
    fetch("../data/theme_" + theme + ".json")
        .then(response => {
            if (response.ok) return response.json();
        })
        .then(data => {
            if (!data) return;

            for (key in data) {
                let tag = key.split("=>")[0];
                let style_name = key.split("=>")[1];
                let style = data[key];
                $(tag).css(style_name, style);
            }
        });

    // 彩蛋圖片切換（防呆：找不到就不顯示）
    $(".logo").hide();
    const $logo = $("#" + theme + "_logo");
    if ($logo.length) $logo.show();
}
/////////////////
// New Bug Tab //
/////////////////

let jira_labels = ""
let milestone_lock = false, founc_cl_lock = false

// 預先填入相關keywords 並上傳localstorage
function updateKeywords() {
    $("#keywords").val("") // 先清除
    let keywords = []
    $(".single_lng.selected").length == 1 ? keywords.push($(".single_lng.selected").text()) : "" // 填入language如果只有單語言的話
    keywords.push($(".game_mode.selected").text()) // 填入game mode
    keywords.push($(".issue_type_2.selected").text()) // 填入issue type 2
    keywords.push($("#location").val()) // 填入location
    $("#keywords").val(keywords.join(", "))
    chrome.storage.local.set({"keywords": $("#keywords").val()})
}
// 切換SP和COOP
function updateGameMode() {
    if(PROJECT == "CER") {
        $("#Loc_SP").show()
        $("#Loc_COOP").hide()
        if($("#Loc_COOP").hasClass("selected")) {
            $("#Loc_COOP").removeClass("selected")
            $("#Loc_SP").addClass("selected")
        }
    }else if(PROJECT == "CHI") {
        $("#Loc_SP").hide()
        $("#Loc_COOP").show()
        if($("#Loc_SP").hasClass("selected")) {
            $("#Loc_SP").removeClass("selected")
            $("#Loc_COOP").addClass("selected")
        }
    }
    $("#repro_step").val($("#repro_step").val().replace(/CHI|CER/, PROJECT))
}
// 從localstorage讀project資料
let PROJECT = "CHI"
chrome.storage.local.get("project").then((result) => {
    if(result["project"] != undefined){
        PROJECT = result["project"]
    }
    $("#" + PROJECT).attr('selected','selected')
    updateGameMode()
})
// 當project有修改時 上傳localstorage
$("#project_select").change(() => {
    PROJECT = $("#project_select option:selected").val()
    updateGameMode()
    chrome.storage.local.set({"project": PROJECT})
})
// 從localstorage讀Summary資料
chrome.storage.local.get("summary").then((result) => {
    if(result["summary"] != undefined){
        $("#summary").val(result["summary"])
        // 把textarea展開
        $("#summary").css("height", "1px") // textarea和input的預設大小是20px 看起來比較一致
        $("#summary").css("height", ($("#summary").prop('scrollHeight')) == 20 ? "22px" : ($("#summary").prop('scrollHeight')) + 2 + "px") // 多+2是因為有padding
    }
})
// 當Summary有修改時 上傳localstorage
$("#summary").on("input", function() {
    chrome.storage.local.set({"summary": $("#summary").val()})
})
// 從localstorage讀season資料
chrome.storage.local.get("milestone_select").then((result) => {
    if(result["milestone_select"] != undefined){
        $("#" + result["milestone_select"]).attr('selected','selected')
    }
    $("#milestone_select").prop('disabled', milestone_lock)
})
// 當season有修改時 上傳localstorage
$("#milestone_select").change(() => {
    chrome.storage.local.set({"milestone_select": $("#milestone_select option:selected").attr("id")})
})
// 從localstorage讀found CL資料
chrome.storage.local.get("found_cl").then((result) => {
    if(result["found_cl"] != undefined){
        $("#found_cl").val(result["found_cl"])
    }
})
// 當Found CL有修改時 上傳localstorage
$("#found_cl").change(() => {
    chrome.storage.local.set({"found_cl": $("#found_cl").val()})
})
// 從localstorage讀Found CL lock資料
chrome.storage.local.get("found_cl_lock").then((result) => {
    if(result["found_cl_lock"] != undefined){
        // true->鎖上
        if(result["found_cl_lock"]) {
            founc_cl_lock = true
            $("#found_cl_lock").removeClass("fa-lock-open").addClass("fa-lock")
            $("#found_cl").prop('disabled', founc_cl_lock)
        }
    }
})
// Found CL lock是否鎖定
$("#found_cl_lock").on("click", function() {
    founc_cl_lock = !founc_cl_lock
    founc_cl_lock ? $("#found_cl_lock").removeClass("fa-lock-open").addClass("fa-lock"):  $("#found_cl_lock").removeClass("fa-lock").addClass("fa-lock-open")
    $("#found_cl").prop('disabled', founc_cl_lock)
    // Found CL lock上傳localstorage
    chrome.storage.local.set({"found_cl_lock": !$("#found_cl_lock").hasClass("fa-lock-open")})
})
// 從localstorage讀Location資料
chrome.storage.local.get("location").then((result) => {
    if(result["location"] != undefined){
        $("#location").val(result["location"])
    }
})
// 當Location有修改時 上傳localstorage 順便更新keywords
$("#location").change(() => {
    chrome.storage.local.set({"location": $("#location").val()})
    updateKeywords()
})
// 從localstorage讀Label Select資料
chrome.storage.local.get("label_select").then((result) => {
    if(result["label_select"] != undefined){
        $("#label_select").val(result["label_select"])
    }
})
// 當Label Select有修改時 上傳localstorage
$("#label_select").change(() => {
    chrome.storage.local.set({"label_select": $("#label_select").val()})
})
// 從localstorage讀Milestone lock資料
chrome.storage.local.get("milestone_lock").then((result) => {
    if(result["milestone_lock"] != undefined){
        // true->鎖上
        if(result["milestone_lock"]) {
            milestone_lock = true
            $("#milestone_lock").removeClass("fa-lock-open").addClass("fa-lock")
            $("#milestone_select").prop('disabled', milestone_lock)
        }
    }
})
// Milestone lock是否鎖定
$("#milestone_lock").on("click", function() {
    milestone_lock = !milestone_lock
    milestone_lock ? $("#milestone_lock").removeClass("fa-lock-open").addClass("fa-lock") :  $("#milestone_lock").removeClass("fa-lock").addClass("fa-lock-open")
    $("#milestone_select").prop('disabled', milestone_lock)
    // Season lock上傳localstorage
    chrome.storage.local.set({"milestone_lock": !$("#milestone_lock").hasClass("fa-lock-open")})
})
// 從localstorage讀選擇的platform資料
chrome.storage.local.get("platform").then((result) => {
    if(result["platform"] != undefined){
        result["platform"].split(",").forEach((id) => {
            $("#" + id).addClass("selected")
        })
    }
})
// platform是否有被選擇
$(".add_platform").on("click", function() {
    let previous_selected = $(".add_platform.selected").map(function() {return $(this).text()}).get().join("/")
    if($(this).hasClass("selected")) {
        // 至少要選擇一個platform
        if($(".add_platform.selected").length > 1) {
            $(this).removeClass("selected")
        }
    }else {
        $(this).addClass("selected")
    }
    let current_selected = $(".add_platform.selected").map(function() {return $(this).text()}).get().join("/")
    // 當language選擇時 上傳localstorage
    let labels = $('.add_platform.selected').map(function () {
        return this.id;
    }).get().join()
    chrome.storage.local.set({"platform": labels})
    // 修改repro step的受影響platform 所以要順便更新repro step到localstorage
    $("#repro_step").val($("#repro_step").val().replace(previous_selected, current_selected))
    chrome.storage.local.set({"repro_step": $("#repro_step").val()})
})
// 從localstorage讀選擇的language資料
chrome.storage.local.get("language").then((result) => {
    if(result["language"] != undefined){
        result["language"].split(",").forEach((id) => {
            $("#" + id).addClass("selected")
            // All language 有EN無EN
            if(id == "lng_ML") {
                $("#lng_ML").show()
                $("#lng_ALL").hide()
            }else if(id == "lng_ALL") {
                $("#lng_ALL").show()
                $("#lng_ML").hide()
            }
        })
    }
    // 以下語言有自己特殊的bug type
    chrome.storage.local.get("language_specific_issue").then((result) => {
        if(result["language_specific_issue"] != "") {
            $(".language_specific").show()
            $("." + result["language_specific_issue"] + "_specific_issue").show()
        }else{
            $(".language_specific").hide()
        }
    })
})
// language是否有被選擇 順便更新keywords
$(".add_lng").on("click", function() {
    let previous_selected = ($(".add_lng.selected").length > 1 || $(".add_lng.selected").text() == "ML" || $(".add_lng.selected").text() == "All") ? 
        "affected LNG" : $(".add_lng.selected").text()
    if($(this).hasClass("selected")) {
        // lng_ALL可以切換(有EN/無EN)
        if($(this).attr('id') == "lng_ML") { // 如果選擇ML
            $(this).hide()
            $(this).removeClass("selected")
            $("#lng_ALL").show()
            $("#lng_ALL").addClass("selected")
            $(this).removeClass("selected")
        }else if($(this).attr('id') == "lng_ALL"){ // 如果選擇ALL
            $(this).hide()
            $(this).removeClass("selected")
            $("#lng_ML").show()
            $("#lng_ML").addClass("selected")
        }else if($(".add_lng.selected").length > 1) { // 多語言的話可直接移除
            $(this).removeClass("selected")
        }else if($(".add_lng.selected").length == 1) { // 如果一個語言都不選就是選擇Profile語言
            $(this).removeClass("selected")
            $(".add_lng#lng_" + $("#profile_lng option:selected").attr("id")).addClass("selected")
        }
    }else {
        if($(this).attr('id') == "lng_ML" || $(this).attr('id') == "lng_ALL") {
            $(".add_lng").removeClass("selected")
        }else{
            $("#lng_ML").removeClass("selected")
            $("#lng_ALL").removeClass("selected")
        }
        $(this).addClass("selected")
    }
    // 以下語言有自己特殊的bug type
    chrome.storage.local.set({"language_specific_issue": ""})
    if($(".add_lng.selected").length == 1) {
        if(["JA", "DE", "AR", "KO", "ZHS"].includes($(".add_lng.selected").text())) {
            $(".language_specific").show()
            $("." + $(".add_lng.selected").text() + "_specific_issue").show()
            chrome.storage.local.set({"language_specific_issue": $(".add_lng.selected").text()})
        }else{
            $(".language_specific").hide()
            $(".language_specific_issue").hide()
            $(".language_specific_issue").removeClass("selected")
        }
    }else{
        $(".language_specific").hide()
        $(".language_specific_issue").hide()
        $(".language_specific_issue").removeClass("selected")
    }
    // 當language選擇時 上傳localstorage
    let language = $('.add_lng.selected').map(function () {
        return this.id;
    }).get().join()
    chrome.storage.local.set({"language": language})
    // 因為language specific issue屬於add_label 所以要順便更新add_label的localstorage
    let labels = $('.add_label.selected').map(function () {
        return this.id;
    }).get().join()
    chrome.storage.local.set({"labels": labels})
    // 修改repro step的受影響語言 所以要順便更新repro step到localstorage
    if($(".add_lng.selected").length > 1 || $(".add_lng.selected").text() == "ML" || $(".add_lng.selected").text() == "All"){
        $("#repro_step").val($("#repro_step").val().replace(previous_selected, "affected LNG"))
    }else{
        $("#repro_step").val($("#repro_step").val().replace(previous_selected, $(".add_lng.selected").text()))
    }
    chrome.storage.local.set({"repro_step": $("#repro_step").val()})
    updateKeywords()
})
// 從localstorage讀選擇的label資料
chrome.storage.local.get("labels").then((result) => {
    if(result["labels"] != undefined){
        result["labels"].split(",").forEach((id) => {
            $("#" + id).addClass("selected")
        })
        $(".add_label.advanced_type.selected").each(function() {
            $("." + $(this).text() + "_specific").show()
        })
    }else{
        reset_all()
    }
})
// labels是否有被選擇 如果有改到issue type 2可順便更新keywords
$(".add_label").on("click", function() {
    if($(this).hasClass("game_mode")) { // game mode防呆
        $(".game_mode").removeClass("selected")
        $(this).addClass("selected")
    }else if($(this).hasClass("language_specific_issue")) { // language specific issue issue防呆
        if($(this).hasClass("selected")) {
            $(this).removeClass("selected")
        }else{
            if(document.getElementsByClassName($(this).prop("classList") + " selected").length > 0){
                $(".language_specific_issue").removeClass("selected")
            }
            $(this).addClass("selected")
        }
    }else if($(this).hasClass("issue_type_1")) { // issue type 1防呆
        $(".issue_type_1").removeClass("selected")
        $(this).addClass("selected")
        $(".issue_type_2").removeClass("selected")
    }else if($(this).hasClass("issue_type_2")) { // issue type 2防呆
        $(".issue_type_2").removeClass("selected")
        $(this).addClass("selected")
    }else if($(this).hasClass("selected")) {
        $(this).removeClass("selected")
    }else {
        $(this).addClass("selected")
    }
    // 當label選擇時 上傳localstorage
    let labels = $('.add_label.selected').map(function () {
        return this.id;
    }).get().join()
    chrome.storage.local.set({"labels": labels})
    updateKeywords()
})
// 打開衍伸的labels(Text, Audio, Subtitle, Telescope)
$("button.advanced_type").on("click", function() {
    let button_clicked = $(this)
    $(".specific_label").hide()
    $("button.advanced_type.selected").each(function() {
        $("." + $(this).val().split("_")[1] + "_specific").show()
        // Text, Subtitle, Audio相關的
        if(button_clicked.hasClass("issue_type_1")) {
            $("." + $(this).val().split("_")[1] + "_specific .issue_type_2").first().addClass("selected")
        }
    })
    // 用於非必填的(telescope)
    if(!button_clicked.hasClass("selected")) {
        $("." + $(this).val() + "_subtype").removeClass("selected")
    }
    updateKeywords()
    // 當label選擇時 上傳localstorage
    let labels = $('.add_label.selected').map(function () {
        return this.id;
    }).get().join()
    chrome.storage.local.set({"labels": labels})
})
// 從localstorage讀Resource IDs資料
chrome.storage.local.get("resource_ids").then((result) => {
    if(result["resource_ids"] != undefined){
        $("#resource_ids").val(result["resource_ids"])
        // 把textarea展開
        $("#resource_ids").css("height", "1px") // textarea和input的預設大小是20px 看起來比較一致
        $("#resource_ids").css("height", ($("#resource_ids").prop('scrollHeight')) == 20 ? "93px" : ($("#resource_ids").prop('scrollHeight')) + 2 + "px") // 多+2是因為有padding
    }
})
// 當Resource IDs有修改時 上傳localstorage
$("#resource_ids").change(() => {
    chrome.storage.local.set({"resource_ids": $("#resource_ids").val()})
})
// 從localstorage讀Repro step資料
chrome.storage.local.get("repro_step").then((result) => {
    if(result["repro_step"] != undefined){
        $("#repro_step").val(result["repro_step"])
        // 把textarea展開
        $("#repro_step").css("height", "1px") // textarea和input的預設大小是20px 看起來比較一致
        $("#repro_step").css("height", ($("#repro_step").prop('scrollHeight')) == 20 ? "93px" : ($("#repro_step").prop('scrollHeight')) + 2 + "px") // 多+2是因為有padding
    }else{
        // 如果沒讀到 就填入預設資料(基本上就是首次使用者)
        $("#repro_step").val(
            "1) Boot up " + PROJECT + " in " + $(".add_lng.selected").text() + " on " + 
            $(".add_platform.selected").map(function() {return $(this).text()}).get().join("/") + 
            "\n2)\n3) Observe the issue"
        )
    }
})
// 當Repro step有修改時 上傳localstorage
$("#repro_step").change(() => {
    chrome.storage.local.set({"repro_step": $("#repro_step").val()})
})
// 從localstorage讀Bug observe資料
chrome.storage.local.get("bug_observed").then((result) => {
    if(result["bug_observed"] != undefined){
        $("#bug_observed").val(result["bug_observed"])
        // 把textarea展開
        $("#bug_observed").css("height", "1px") // textarea和input的預設大小是20px 看起來比較一致
        $("#bug_observed").css("height", ($("#bug_observed").prop('scrollHeight')) == 20 ? "93px" : ($("#repro_step").prop('scrollHeight')) + 2 + "px") // 多+2是因為有padding
    }
})
// 當Bug observe有修改時 上傳localstorage
$("#bug_observed").change(() => {
    chrome.storage.local.set({"bug_observed": $("#bug_observed").val()})
})
// 從localstorage讀Keywords資料
chrome.storage.local.get("keywords").then((result) => {
    if(result["keywords"] != undefined){
        $("#keywords").val(result["keywords"])
    }
})
// 當keywords有修改時 上傳localstorage
$("#keywords").change(() => {
    chrome.storage.local.set({"keywords": $("#keywords").val()})
})
// 清除所有input並更新至local storage
function reset_all() {
    // 清除所有欄位
    $(".add_label").removeClass("selected")
    $(".specific_label").hide()
    $(".add_lng").removeClass("selected")
    $(".add_lng#lng_" + $("#profile_lng option:selected").attr("id")).addClass("selected")
    $(".add_platform").addClass("selected")
    $("#summary").val("")
    $("#location").val("")
    $("#repro_step").val(
        "1) Boot up " + PROJECT + " in " + $(".add_lng.selected").text() + " on " + 
        $(".add_platform.selected").map(function() {return $(this).text()}).get().join("/") + 
        "\n2)\n3) Observe the issue"
    )
    $("#bug_observed").val("")
    $("#resource_ids").val("")
    // 更新local storage
    chrome.storage.local.set({"summary": ""})
    chrome.storage.local.set({"location": ""})
    chrome.storage.local.set({
        "repro_step": "1) Boot up " + PROJECT + " in " + $(".add_lng.selected").text() + " on " + 
        $(".add_platform.selected").map(function() {return $(this).text()}).get().join("/") + 
        "\n2)\n3) Observe the issue"
    })
    chrome.storage.local.set({"bug_observed": ""})
    chrome.storage.local.set({"resource_ids": ""})
    chrome.storage.local.set({"platform": $('.add_platform.selected').map(function() {return this.id}).get().join()})
    chrome.storage.local.set({"language": "lng_" + $("#profile_lng option:selected").attr("id")})
    // 如果是JA DE AR, 特殊bug type要顯示
    if(["JA", "DE", "AR"].includes($("#profile_lng option:selected").attr("id"))) {
        $(".language_specific").show()
        $(".language_specific_issue").hide()
        $("." + $("#profile_lng option:selected").attr("id") + "_specific_issue").show()
        chrome.storage.local.set({"language_specific_issue": $("#profile_lng option:selected").attr("id")})
    }
    // 選擇預設選項
    $(".game_mode").first().addClass("selected")
    $(".issue_type_1").first().addClass("selected")
    $(".issue_type_2").first().addClass("selected")
    $(".specific_label").first().show()
    jira_labels = ""
    //檢查有無上鎖部分
    if($("#found_cl_lock").hasClass("fa-lock-open")) {
        $("#found_cl").val("")
        chrome.storage.local.set({"found_cl": ""})
    }
$("#label_select").val("")
chrome.storage.local.set({"label_select": ""})
    // 更新keywords
    updateKeywords()
    chrome.storage.local.set({"keywords": $("#keywords").val()})
    // 把預設label上傳localstorage
    let labels = $('.add_label.selected').map(function () {
        return this.id;
    }).get().join()
    chrome.storage.local.set({"labels": labels})
    // 重新渲染顏色
    applyTheme($(".theme_btn.selected").data("value"))
}
$("#reset_all").on("click", () => {
    reset_all()
})
// 開啟new bug頁
$("#create_bug").on("click", ()=> {
    $("button.add_label.selected").each(function() {
        let label = $(this).val()
        jira_labels = jira_labels + label + (label != "" ? " " : "")
    })
    jira_labels += $("#milestone_select").val()
let label_select_val = $("#label_select").val()
if(label_select_val) {
    jira_labels += " " + label_select_val
}
    let username = $("#profile_username").val()
    // 確認基本資料有填寫
    if(username == ""){
        alert("Please enter jira username in setting and Check if the loc language is correct!")
        return
    }
    let platform = $(".add_platform.selected").map(function() {return $(this).text()}).get().join("/")
    let platform_query = ""
    const platform_type = {
        "CHI": {"PC/PS5/PS4/XSX/X1": "37114", "PS4": "37115", "PS4 Pro": "37116", "PS5": "37117", "PS5 Pro": "37118", "XB3 Durango": "37119",
        "XB3 Edmonton": "37120", "XB3 Scorpio": "37121", "XB4 Scarlett": "37122", "XB4 Lockhart": "37123", "PC (BNet)": "37124",
        "PC (Steam)": "37125", "PC (MSStore)": "37126", "PC (UbiConnect)": "37127", "customfield": "10407"},
        "CER": {"PC/PS5/PS4/XSX/X1": "10416", "PS4": "10417", "PS4 Pro": "10418", "PS5": "10419", "PS5 Pro": "34800", "XB3 Durango": "10420",
        "XB3 Edmonton": "33700", "XB3 Scorpio": "10421", "XB4 Scarlett": "10422", "XB4 Lockhart": "33100", "PC (BNet)": "10423",
        "PC (Steam)": "17718", "PC (MSStore)": "30007", "PC (UbiConnect)": "32800", "customfield": "10319"}
    }
    if(platform == "PC/PS5/PS4/XSX/X1") {
        platform_query = "&customfield_" + platform_type[PROJECT]["customfield"] + "=" + platform_type[PROJECT]["PC/PS5/PS4/XSX/X1"]
    }else{
        let refine_platform = platform.replace("X1", "XB3").replace("XSX", "XB4")
        for(let type in platform_type[PROJECT]) {
            if(refine_platform.includes(type.split(" ")[0])) {
                platform_query = platform_query + "&customfield_" + platform_type[PROJECT]["customfield"] + "=" + platform_type[PROJECT][type]
            }
        }
        console.log(platform_query)
    }
    if($("#Loc_Audio_PP").hasClass("selected")) platform = "AUDIO REVIEW" // Prepro Summary的platform是AUDIO REVIEW

    const game_mode = {
        "CER": {
            "Global": "&customfield_10306=30237&customfield_10360=10814",
            "SP": "&customfield_10306=12518&customfield_10306:1=16515&customfield_10360=10809",
            "MP": "&customfield_10306=12521&customfield_10306:1=26409&customfield_10360=10810",
            "ZM": "&customfield_10306=12524&customfield_10306:1=26410&customfield_10360=18301",
            "WZ": "&customfield_10306=26100&customfield_10306:1=26038&customfield_10360=10812"
        },
        "CHI": {
            "Global": "&customfield_10306=39002&customfield_10306:1=39004&customfield_10360=10814",
            "COOP": "&customfield_10306=22105&customfield_10306:1=36203&customfield_10360=10811",
            "MP": "&customfield_10306=22106&customfield_10306:1=37177&customfield_10360=10810",
            "ZM": "&customfield_10306=22107&customfield_10306:1=37180&customfield_10360=18301",
            "WZ": "&customfield_10306=22108&customfield_10306:1=36207&customfield_10360=10812"
        }
    }
    let area = "Global", priority_query = "&priority=11103", location = $("#location").val() != "" ? $("#location").val() : "Location"
    if(jira_labels.includes("Loc_SP")){ area = "SP" }
    else if(jira_labels.includes("Loc_COOP")){ area = "COOP" }
    else if(jira_labels.includes("Loc_MP")){ area = "MP" }
    else if(jira_labels.includes("Loc_ZM")){ area = "ZM" }
    else if(jira_labels.includes("Loc_WZ")){ area = "WZ" }
    let level_query = game_mode[PROJECT][area]
    let high_priority_issue = [
        "Overlap", "Consisency", "Context", "Truncation", "Not_Translated", "Missing", "Mismatch", "Audio_Cut", "SFX", "Sync", "Glossary", "Safe"
    ]
    if(high_priority_issue.some(issue => jira_labels.includes(issue))){
        priority_query = "&priority=11102"
    }
    let repro_step = $("#repro_step").val()
    let bug_observed = $("#bug_observed").val()
    let keywords = $("#keywords").val().trim()
    let resource_ids = $("#resource_ids").val().trim()
    const project_fullname = {
        "CHI": "Chimera",
        "CER": "Cerberus"
    }
    let label_query = "&labels=Loc&labels=Loc_" + project_fullname[PROJECT] + jira_labels.trim().split(" ").map(label => "&labels=" + label).join("")
    let lng_selected = $('.add_lng.selected')
    let LNG = lng_selected.map(function() {return $(this).text()}).get().join("/")
    if(lng_selected.length == 1 && lng_selected[0].id != "lng_ML" && lng_selected[0].id != "lng_ALL") { // 單一語言才需要加該語言的label
        label_query += "&labels=Loc_" + lng_selected[0].textContent
    }else if(lng_selected[0].id == "lng_ML") {
        LNG = "FIGS/RU/PL/AR/PTBR/MX/KO/JA/ZHS/ZHT"
    }else if(lng_selected[0].id == "lng_ALL") {
        LNG = "EFIGS/RU/PL/AR/ENAR/PTBR/MX/KO/JA/ZHS/ZHT"
    }
    let atvi_type_query = jira_labels.includes("Audio") ? "&customfield_10364=11338" : "&customfield_10364=11351"
    let atvi_type = {
        "Loc_Text_Overlap": "11352", "Loc_Text_Truncation": "11353", "Loc_Text_Missing": "11354", "Loc_Text_Context": "11355",
        "Loc_Text_Graphic": "28445", "Loc_Text_Not_Translated": "28441", "Loc_Audio_Missing": "11356", "Loc_Audio_Context": "11357",
        "Loc_Audio_Text_Integration": "11358", "Loc_Audio_Cut": "28442", "Loc_Audio_Overlap": "28443", "Loc_Audio_Not_Translated": "28444",
        "Loc_Arabic_Safe": "28446", "Loc_German_Safe": "28446", "Loc_Japanese_Safe": "28446", "Loc_Korean_Safe": "28446", "Loc_Chinese_Safe": "28446", 
        "Loc_Functional": "11344", "Loc_Audio_Sync": "11338", "Loc_Audio_Delivery_Technical": "11338", "Loc_Audio_Delivery_Consistency": "11338", 
        "Loc_Audio_Delivery_Context": "11338", "Loc_Audio_Text_Mismatch": "11351", "Loc_Audio_Delivery_Acting": "11338"
    }
    Object.keys(atvi_type).forEach(type => {
        if(jira_labels.includes(type)){
            atvi_type_query = "&customfield_10364=" + atvi_type[type]
        }
    })
    let loc_lng = {
        "FR": "11396", "IT": "11397", "DE": "11398", "ES": "11399", "RU": "11400", "PL": "11401", "AR": "11409",
        "ENAR": "13164","PTBR": "11402", "MX": "11403", "KO": "11408", "ZHS": "11406", "ZHT": "11405", "JA": "11407",
        "FIGS/RU/PL/AR/PTBR/MX/KO/JA/ZHS/ZHT":
        "11396&customfield_10446=11397&customfield_10446=11398&customfield_10446=11399&customfield_10446=11400&customfield_10446=11401" +
        "&customfield_10446=11409&customfield_10446=11402&customfield_10446=11403&customfield_10446=11408&customfield_10446=11406" +
        "&customfield_10446=11405&customfield_10446=11407&customfield_10446=11394",
        "EFIGS/RU/PL/AR/ENAR/PTBR/MX/KO/JA/ZHS/ZHT":
        "11396&customfield_10446=11397&customfield_10446=11398&customfield_10446=11399&customfield_10446=11400&customfield_10446=11401" +
        "&customfield_10446=11409&customfield_10446=13164&customfield_10446=11402&customfield_10446=11403&customfield_10446=11408&customfield_10446=11406" +
        "&customfield_10446=11405&customfield_10446=11407&customfield_10446=11394&customfield_10446=13163&customfield_10446=11395"
    }
    let loc_lng_query = ""
    if(lng_selected.length > 1) {
        lng_selected.map(function() {
            loc_lng_query += "&customfield_10446=" + loc_lng[this.textContent]
        })
        loc_lng_query += "&customfield_10446=11394"
    }else {
        loc_lng_query = "&customfield_10446=" + loc_lng[LNG]
    }
    let loc_type_query = ""
    let loc_type = { // 越重要的label要放越後面 ex: safety
        "Loc_Arabic_Safe": "11434", "Loc_Audio_Consistency": "11425", "Loc_Audio_Context": "11424", "Loc_Audio_Cut": "11426",
        "Loc_Audio_Context": "16201", "Loc_Audio_Consistency": "16201", "Loc_Audio_Text_Integration": "11431", "Loc_Audio_Missing": "11422",
        "Loc_Audio_Delivery_Technical": "16202", "Loc_Audio_Delivery_Consistency": "16201", "Loc_Audio_Delivery_Context": "16201",
        "Loc_Audio_Text_Mismatch": "11421", "Loc_Audio_Delivery_Acting": "16200", "Loc_Audio_Not_Translated": "11423", "Loc_Audio_Overlap": "11427", 
        "Loc_Audio_SFX": "11429", "Loc_Audio_Sync": "11428", "Loc_Audio_Volume": "11430", "Loc_Subtitle_Amendment": "26069", "Loc_Subtitle_Consistency": "26068", 
        "Loc_Subtitle_Context": "26067", "Loc_Subtitle_Integration": "28701", "Loc_Subtitle_Mismatch": "11421", "Loc_Subtitle_Missing": "30501", 
        "Loc_Subtitle_Not_Translated": "30500", "Loc_Subtitle_Spelling_Grammar": "26070", "Loc_Text_Alignment": "11419", "Loc_Text_Amendment": "11415", 
        "Loc_Text_Consistency": "11414", "Loc_Text_Context": "11413", "Loc_Text_Font_Size": "11420", "Loc_Text_Graphic": "11418", "Loc_Text_Integration": "16205", 
        "Loc_Text_Missing": "11410", "Loc_Text_Not_Translated": "11411", "Loc_Text_Overlap": "11417", "Loc_Text_Spelling_Grammar": "11412", "Loc_Text_Truncation": "11416", 
        "Loc_Functional": "11441", "Loc_German_Safe": "11435", "Loc_Japanese_Safe": "11436", "Loc_Korean_Safe": "11437", "Loc_Chinese_Safe": "11439"
    }
    Object.keys(loc_type).forEach(type => {
        if(jira_labels.includes(type)){
            loc_type_query = "&customfield_10447=" + loc_type[type]
        }
    })
    // 移除影響query string的符號
    let summary_detail = $("#summary").val()
    let issue_type_1 = $(".issue_type_1.selected").text().toUpperCase()
    let issue_type_2 = $(".issue_type_2.selected").text().replace("_", "/").toUpperCase()
    
    if (issue_type_1 == "PREPRO") issue_type_1 = "AUDIO" // Prepro的issue_type_1是AUDIO
    let high_priority_type_2 = ["Loc_Arabic_Safe", "Loc_Arabic_Technical", "Loc_German_Safe", "Loc_Japanese_Safe", "Loc_Korean_Safe", "Loc_Chinese_Safe"]
    high_priority_type_2.forEach(type => {
        if(jira_labels.includes(type)){
            issue_type_2 = type.replace("Loc_", "").replace("_", " ").toUpperCase()
        }
    })
    let suffix = ""
    if(jira_labels.includes("TRG")) {suffix = " [TRG]"}
    else if(jira_labels.includes("Telescope")) {suffix = " [Telescope]"}
    const linebook = {
        "CER": "COD 2024 Linebooks | Cerberus",
        "CHI": "COD 2025 Linebooks | Chimera"
    }
    let summary = "LOC: " + PROJECT + " – " + platform + " – " + LNG + " – " + issue_type_1 + 
                  " – " + issue_type_2 + (issue_type_2 != "" ? " – ": "") + area + "/" + location + " – " + summary_detail + suffix
    let amend_in_xloc_type = ["Amendment", "Consistency", "Context", "Spelling_Grammar"]
    let project = jira_labels.includes("Subtitle") ? linebook[PROJECT]: "Call of Duty | Trunk"
    let action_required = amend_in_xloc_type.some(type => jira_labels.includes(type)) ?
                          "Please modify the translations as suggested in the Excel for " + project + "." : 
                          jira_labels.includes("Not_Translated") ?
                          "Please update the affected translations for " + project + "." :
                          "Please investigate and fix it."
    const branch_type = {
        "CER": {"trunk": "31905", "release": "31907", "cert": "31908", "etu": "35601"},
        "CHI": {"trunk": "40000", "release": "40001", "cert": "40002", "etu": "40004"}
    }
    let branch_found_cl = $("#found_cl").val().replaceAll(/\s+/g, "").split("_")
    let branch = found_cl = ""
    if(branch_found_cl.length == 2) {
        branch = branch_type[PROJECT][branch_found_cl[0].toLowerCase()]
        branch = branch ? branch : "" // 確保branch不是undefined
        found_cl = branch_found_cl[1]
    }else{
        found_cl = branch_found_cl[0]
    }

    let description =
    "Build number: *" + found_cl + "*\n\n" +
    "*REPRO STEPS*\n" +
    "----\n" +
    repro_step + "\n\n" +
    "*BUG OBSERVED*\n" +
    "----\n" +
    summary_detail + ".\n" + bug_observed + "\n\n" +
    "Please check the screenshot attached for further details.\n\n" +
    "*ACTION REQUIRED*\n" +
    "----\n" +
    action_required + " Thanks!\n\n" +
    "*RESOURCE ID*\n" +
    "----\n " + (resource_ids!= "" ? "resource_ids" : "N/A") + " \n\n" +
    "keywords: " + keywords

const query_string = {
    "CER": "https://dev.activision.com/jira/secure/CreateIssueDetails!init.jspa?issuetype=10203&pid=10201&components=26600" +
        "&customfield_10325=43600" + platform_query + "&customfield_10900=12800&reporter=" + username + "&customfield_10362=11096" +
        "&summary=" + encodeURIComponent(summary) +
        "&description=" + encodeURIComponent(description) +
        "&assignee=" + username + "&customfield_10307=" + found_cl + "&customfield_10604=" + branch + priority_query +
        label_query + level_query + "&reporter=" + username + atvi_type_query + loc_lng_query + loc_type_query,

    "CHI": "https://dev.activision.com/jira/secure/CreateIssueDetails!init.jspa?issuetype=10203&pid=13700" +
        "&customfield_10325=43600" + platform_query + "&customfield_10900=12800&reporter=" + username + "&customfield_10362=37144" +
        "&summary=" + encodeURIComponent(summary) +
        "&description=" + encodeURIComponent(description) +
        "&assignee=" + username + "&customfield_10307=" + found_cl + "&customfield_10604=" + branch + priority_query +
        label_query + level_query + "&reporter=" + username + atvi_type_query + loc_lng_query + loc_type_query + "&customfield_10102=key:CHI-95788"
}

    // 非常重要！！！ 現在把resource_ids存進localstorage 並在新分頁開啟Log Bug頁後才從content script填入欄位
    // 因為如果resource_ids太多 導致query string太長會被瀏覽器阻擋
    chrome.storage.local.set({"resource_ids_template": resource_ids}, () => {
        // 使用Query String在新分頁開啟Log Bug頁
        chrome.tabs.create({url: query_string[PROJECT]})
    })

    return false
})
// 讀取new bug tabcontent的高度
chrome.storage.local.get("new_bug_height").then((result) => {
    if(result["new_bug_height"] != undefined){
        $("#new_bug.tabcontent").css("height", result["new_bug_height"])
    }
    new_bug_tabcontent_height = $("#new_bug.tabcontent").height()
})
// 調整bug template長度
new_bug_tabcontent_height = $("#new_bug.tabcontent").height()
$("#resize").on("mousedown", (event) => {
    // 計算#resize中端與window頂的距離
    start_point = $("#resize").offset().top + $("#resize").outerHeight() / 2
    $(document).on("mousemove", (event) => {
        if(event.clientY - start_point != 0) {
            // 拖動距離
            delta_y = event.clientY - start_point
            // 新高度
            new_height = new_bug_tabcontent_height + delta_y
            // 限制tabcontent最低290最高500px
            if(new_height >= TEXTCONTENT_MIN_HEIGHT && new_height <= TEXTCONTENT_MAX_HEIGHT){
                $("#new_bug.tabcontent").css("height", new_height)
                new_bug_tabcontent_height = new_height // 更新目前tabcontent高度
                start_point = $("#resize").offset().top + $("#resize").outerHeight() / 2 // 更新#resize中端與window頂的距離
                // 有修改高度時 上傳localstorage
                chrome.storage.local.set({"new_bug_height": new_height})
            }
        }
    })
    // 解除綁定 避免造成資源浪費
    $(document).on("mouseup", () => {
        $(document).off("mousemove");
    });
})

//////////////////////
// File Naming page //
//////////////////////

// ===== HARD RESET: remove old handlers to avoid conflicts =====
$("#regression_lock").off("click");
$("#mode_namefile").off("click");  
$("#clean_pic").off("click");
$("#file_name_copy").off("click");
$("#bug_lng_select").off("change");
$("#release_id").off("input");
$(".postfix").off("click");

$(".comment").off("click");
$(".comment").off("contextmenu");
$(".comment").off("dblclick");

// Regression Lock上鎖資訊和目前的release ID 上傳localstorage
let current_release_id = "";
let regression_lock = false;

// ===== Mode state =====
// true=Name file, false=Comment
let namefile_mode = true;

// ===== Clean format toggle (WITH selected UI; 可反复点开/关) =====
let clean_pic_mode = false; // true: clean format, false: normal format

// ===== remember last selected comment button =====
let last_comment_btn = "VF"; // VF / VO / CNVR

// init saved states (mode + clean + last comment btn)
chrome.storage.local.get(["namefile_mode", "clean_pic_mode", "last_comment_btn"]).then((r) => {
    if (r["namefile_mode"] !== undefined) namefile_mode = r["namefile_mode"];
    if (r["clean_pic_mode"] !== undefined) clean_pic_mode = r["clean_pic_mode"];
    if (r["last_comment_btn"] !== undefined) last_comment_btn = r["last_comment_btn"];

    //  同步 Clean 按钮选中态
    $("#clean_pic").toggleClass("selected", !!clean_pic_mode);

    applyModeUI();

    if (namefile_mode) updateFileName();
    else updateComment();
});

// 统一：切模式时的 UI 处理
function applyModeUI() {
    if (namefile_mode) {
        $(".comment").removeClass("selected");
    } else {
        $(".comment").removeClass("selected");
        const $btn = $("#" + (last_comment_btn || "VF"));
        if ($btn.length) $btn.addClass("selected");
        if ($(".comment.selected").length === 0) $("#VF").addClass("selected");
    }
}

// ===== Regression Lock =====
chrome.storage.local.get("regression_lock").then((result) => {
    if (result["regression_lock"]) {
        regression_lock = true;
        $("#regression_lock").removeClass("fa-lock-open").addClass("fa-lock");
        $("#release_id").prop("disabled", true);
    }
});

$("#regression_lock").on("click", function (e) {
    e.preventDefault();

    regression_lock = !regression_lock;
    chrome.storage.local.set({ regression_lock });

    if (regression_lock) {
        chrome.storage.local.set({ release_id: $("#release_id").val() });
        $("#regression_lock").removeClass("fa-lock-open").addClass("fa-lock");
    } else {
        $("#release_id").val(current_release_id);
        $("#regression_lock").removeClass("fa-lock").addClass("fa-lock-open");
    }

    $("#release_id").prop("disabled", regression_lock);

    if (namefile_mode) updateFileName();
    else updateComment();
});

const full_name_lang = ["EN", "FR", "IT", "DE", "ES", "RU", "PL", "AR", "ENAR", "PTBR", "MX", "KO", "ZHS", "ZHT", "JA", "TH"];
const abbreviate_lang = { "E": "EN", "F": "FR", "I": "IT", "G": "DE", "S": "ES" };

// 取得jira上的bug資訊 填入file naming tab中!!!
async function read_bug_data() {
    let bug_data = await chrome.runtime.sendMessage({ type: "read_bug_data" });

    if (bug_data == null) {
        console.log("Cannot get bug data from service_worker.js");
        const prev = await chrome.storage.local.get("file_name");
        if (prev["file_name"] != undefined) bug_data = prev["file_name"];
        if (bug_data == null) return;
    }

    $("#current_bug").text("Currrent bug: " + bug_data.bug_id);
    $("#bug_id").val(bug_data.bug_id);
    $("#bug_type_1").val(bug_data.bug_type_1);
    $("#bug_type_2").val(bug_data.bug_type_2);

    $("#bug_lng_select").prop("disabled", false).empty();

    for (const language of bug_data.language.split("/")) {
        if (!full_name_lang.includes(language)) {
            for (const al of language.split("")) {
                $("#bug_lng_select").append(`<option value="${abbreviate_lang[al]}">${abbreviate_lang[al]}</option>`);
            }
        } else {
            $("#bug_lng_select").append(`<option value="${language}">${language}</option>`);
        }
    }

    const profile_lng = $("#profile_lng option:selected").attr("id");
    if ($("#bug_lng_select option").text().includes(profile_lng)) {
        $(`option[value="${profile_lng}"]`).prop("selected", true);
    } else {
        $("#bug_lng_select").append(`<option value="${profile_lng}" selected>${profile_lng}</option>`);
    }

    if (!$("#bug_lng_select option").text().includes("EN")) {
        $("#bug_lng_select").append(`<option value="EN">EN</option>`);
    }

    showLngWarning();

    if (!$("#regression_lock").hasClass("fa-lock-open")) {
        const rid = await chrome.storage.local.get("release_id");
        if (rid["release_id"] != undefined) $("#release_id").val(rid["release_id"]);
    } else {
        $("#release_id").val(bug_data.release_id);
    }

    current_release_id = bug_data.release_id;

    chrome.storage.local.set({
        file_name: {
            bug_id: $("#bug_id").val(),
            bug_type_1: $("#bug_type_1").val(),
            bug_type_2: $("#bug_type_2").val(),
            language: bug_data.language,
            release_id: $("#release_id").val()
        }
    });

    applyModeUI();

    if (namefile_mode) updateFileName();
    else updateComment();
}
read_bug_data();

// 如果不是自己語言的話 設個提醒
function showLngWarning() {
    if ($("#bug_lng_select option:selected").text() == $("#profile_lng option:selected").attr("id")) {
        $("#lng_warning").hide();
    } else {
        $("#lng_warning").show();
    }
}

// ===== File name rendering =====
function updateFileName() {
    const bugId = $("#bug_id").val();
    const lng = $("#bug_lng_select option:selected").text();
    const type1 = $("#bug_type_1").val();
    const type2 = $("#bug_type_2").val();

    const ridRaw = ($("#release_id").val() || "").trim();
    const rid = ridRaw.split("_").length > 1 ? ridRaw.split("_")[1] : ridRaw;

    if (clean_pic_mode) {
        $("#file_name").val(
            (bugId + "_" + lng + "_" + type2)
                .replaceAll(" ", "_")
                .replace("/", "_")
                .trim()
        );
    } else {
        $("#file_name").val(
            (bugId + "_" + lng + "_" + type1 + "_" + type2.replace("/", "_") + "_" + rid)
                .replace("__", "_")
                .replaceAll(" ", "_")
                .trim()
        );
    }
}

// 語言切換
$("#bug_lng_select").on("change", () => {
    if (namefile_mode) updateFileName();
    else updateComment();
    showLngWarning();
});

// release_id 输入
$("#release_id").on("input", function () {
    $("#release_id").val($("#release_id").val().replaceAll(" ", ""));
    if (namefile_mode) updateFileName();
    else updateComment();
});

// filename 複製
$("#file_name_copy").on("click", async () => {
    navigator.clipboard.writeText($("#file_name").val()).then(async () => {
        $("#file_name_copy").removeClass("fa-copy").addClass("fa-check");
        await new Promise(r => setTimeout(r, 1000));
        $("#file_name_copy").removeClass("fa-check").addClass("fa-copy");
    });
});

// postfix（现在不会触发）
$(".postfix").on("click", (event) => {
    const reg = new RegExp("_[0-9]$");
    const tag = $(event.target).text();
    const str = $("#file_name").val();
    if (reg.test(str)) {
        if (str.substring(str.length - 2) == tag) {
            $("#file_name").val(str.substring(0, str.length - 2));
            $(".postfix").removeClass("selected");
        } else {
            $("#file_name").val(str.substring(0, str.length - 2) + tag);
            $(".postfix").removeClass("selected");
            $(event.target).addClass("selected");
        }
    } else {
        $("#file_name").val(str + tag);
        $(event.target).addClass("selected");
    }
});

// ===== Name file button =====
// 想回去：点 Name file → 回到文件名模式
$("#mode_namefile").on("click", function (e) {   // 
    e.preventDefault();
    e.stopPropagation();

    namefile_mode = true;
    chrome.storage.local.set({ namefile_mode: true });

    applyModeUI();
    updateFileName();
});

// ===== Clean：只在 Name file 模式生效（可反复切换）=====
$("#clean_pic").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (!namefile_mode) return;

    clean_pic_mode = !clean_pic_mode;
    chrome.storage.local.set({ clean_pic_mode });

    // 切换选中态
    $("#clean_pic").toggleClass("selected", !!clean_pic_mode);

    updateFileName();
});

// ===== Bug Category =====
function getBugCategory() {
    const raw = ($("#bug_type_1").val() || "").trim().toUpperCase();
    if (raw.includes("PREPRO")) return "AUDIO";
    if (raw.includes("AUDIO")) return "AUDIO";
    if (raw.includes("SUB")) return "SUBTITLE";
    return "TEXT";
}

const comment_platform = ["PC", "PS5", "XSX", "PS4", "X1", "Xloc"];
let platform_index = 0;

chrome.storage.local.get("platform_index").then((result) => {
    if (result["platform_index"] != undefined) platform_index = result["platform_index"];
});

// ===== Template pools =====
const comment_templates = {
    AUDIO: {
        VF: [
            (platform, lng, build) => `${platform}: VF for ${lng} on build ${build}. Thanks! Audio is in with SFX.`
        ],
        VO: [
            (platform, lng, build) => `${platform}: VO for ${lng} on build ${build}. Audio has been implemented in current build but SFX is missing.`,
            (platform, lng, build) => `${platform}: VO for ${lng} on build ${build}. The issue remains the same, still old lines in-game.`,
            (platform, lng, build) => `${platform}: VO for ${lng} on build ${build}. Audio is fixed in P4V but not integrated in current build yet, please verify in higher build.`
        ],
        CNVR: [
            (platform, lng, build) => `${platform}: CNV for ${lng} on build ${build}. After multiple attempts, the audio could not be triggered on this build. Please check on a newer build.`
        ]
    },
    TEXT: {
        VF: [
            (platform, lng, build) => `${platform}: VF for ${lng} on build ${build}. Thanks!`
        ],
        VO: [
            (platform, lng, build) => `${platform}: VO for ${lng} on build ${build}. Strings have been updated in Xloc since  but not implemented in-game yet. New SS attached.`,
            (platform, lng, build) => `${platform}: VO for ${lng} on build ${build}. The issue remains the same.`
        ],
        CNVR: [
            (platform, lng, build) => `${platform}: CNV for ${lng} on build ${build}. Strings have been updated in Xloc since  but not available on this build.`
        ]
    },
    SUBTITLE: {
        VF: [
            (platform, lng, build) => `${platform}: VF for ${lng} on build ${build}. Thanks!`
        ],
        VO: [
            (platform, lng, build) => `${platform}: VO for ${lng} on build ${build}. Subtitle strings have been updated in Xloc since (,,・ω・,,) but not implemented in-game yet, new SS attached.`
        ],
        CNVR: [
            (platform, lng, build) => `${platform}: CNV for ${lng} on build ${build}. Subtitle strings have been updated in Xloc since (,,・ω・,,) but not available on this build.`,
            (platform, lng, build) => `${platform}: CNV for ${lng} on build ${build}. Subtitle could not be triggered on this build. Please check on a newer build.`
        ]
    }
};

// ===== Index memory（按 category + button 分开记忆）=====
let comment_template_index = {
    AUDIO: { VF: 0, VO: 0, CNVR: 0 },
    TEXT: { VF: 0, VO: 0, CNVR: 0 },
    SUBTITLE: { VF: 0, VO: 0, CNVR: 0 }
};

chrome.storage.local.get("comment_template_index").then((result) => {
    const saved = result["comment_template_index"];
    if (saved && typeof saved === "object") {
        if (saved.VF !== undefined || saved.VO !== undefined || saved.CNVR !== undefined) {
            comment_template_index.AUDIO = { ...comment_template_index.AUDIO, ...saved };
        } else {
            comment_template_index = { ...comment_template_index, ...saved };
        }
    } else {
        chrome.storage.local.set({ comment_template_index });
    }
});

function getSelectedCommentId() {
    return $(".comment.selected").prop("id"); // VF / VO / CNVR
}

function updateComment() {
    const id = getSelectedCommentId();
    if (!id) return;

    const category = getBugCategory();
    const platform = comment_platform[platform_index];
    const lng = $("#bug_lng_select option:selected").text();
    const build = $("#release_id").val();

    const pool = comment_templates?.[category]?.[id];
    if (!pool || pool.length === 0) return;

    let idx = comment_template_index?.[category]?.[id] ?? 0;
    idx = ((idx % pool.length) + pool.length) % pool.length;
    comment_template_index[category][id] = idx;

    $("#file_name").val(pool[idx](platform, lng, build));
}

// ===== Comment buttons behavior =====
// 单击：进入 Comment 模式 + 选择按钮 + 下一条模板
$(".comment").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    namefile_mode = false;
    chrome.storage.local.set({ namefile_mode: false });

    $(".comment").removeClass("selected");
    $(this).addClass("selected");

    last_comment_btn = $(this).prop("id") || "VF";
    chrome.storage.local.set({ last_comment_btn });

    applyModeUI();

    const id = getSelectedCommentId();
    const category = getBugCategory();
    const pool = comment_templates?.[category]?.[id];
    if (!pool || pool.length === 0) return;

    const cur = comment_template_index?.[category]?.[id] ?? 0;
    comment_template_index[category][id] = (cur + 1) % pool.length;
    chrome.storage.local.set({ comment_template_index });

    updateComment();
});

// 右键：切平台（只在 Comment 模式）
$(".comment").on("contextmenu", function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (namefile_mode) return false;

    if ($(this).hasClass("selected")) {
        platform_index = (platform_index + 1) % comment_platform.length;
        chrome.storage.local.set({ platform_index });
        updateComment();
    }
    return false;
});

// 双击：吞掉避免选中文字
$(".comment").on("dblclick", function (e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
});

///////////////
// Xloc Page //
///////////////
let emoji_dict, emoji_codes = null
let style_dict, style_codes = null

// 從emoji_code.json讀取資料
fetch("../data/emoji_code.json").then(response => {
    if(response.ok) {return response.json()}
}).then(data => {
    emoji_dict = data
    emoji_codes = Object.keys(emoji_dict)
    chrome.storage.local.set({"emoji_dict": emoji_dict})
}).catch(err => {
    console.log("Error while fetching emoji_code.json: ", err)
})
// 從style_code.json讀取資料
fetch("../data/style_code.json").then(response => {
    if(response.ok) {return response.json()}
}).then(data => {
    style_dict = data
    style_codes = Object.keys(style_dict)
    chrome.storage.local.set({"style_dict": style_dict})
}).catch(err => {
    console.log("Error while fetching style_code.json: ", err)
})

tabContentPaddingY = parseFloat($("#xloc.tabcontent").css('padding-top')) + parseFloat($("#xloc.tabcontent").css('padding-bottom'))
// 重新調整xloc tab的長度
function resizeXlocTabLength() {
    let el = $("#xloc.tabcontent")[0];
    $("#xloc.tabcontent").height(300 - tabContentPaddingY)
    if($("#xloc.tabcontent").prop('scrollHeight') <= TEXTCONTENT_MAX_HEIGHT - tabContentPaddingY){
        $("#xloc.tabcontent").height($("#xloc.tabcontent").prop('scrollHeight') - tabContentPaddingY)
    }else{
        $("#xloc.tabcontent").height(TEXTCONTENT_MAX_HEIGHT - tabContentPaddingY)
    }
}
// 從localstorage讀color code string資料
chrome.storage.local.get("color_code_string").then((result) => {
    if(result["color_code_string"] != undefined && result["color_code_string"] != ""){
        $("#color_code_string").val(result["color_code_string"])
        // 把textarea展開
        $("#color_code_string").css("height", "1px") // textarea和input的預設大小是20px 看起來比較一致
        $("#color_code_string").css("height", ($("#color_code_string").prop('scrollHeight')) == 20 ? "93px" : ($("#color_code_string").prop('scrollHeight')) + 2 + "px") // 多+2是因為有padding
        chrome.storage.local.get("style_dict").then((result) => {
            style_dict = result["style_dict"]
            style_codes = Object.keys(style_dict)
            chrome.storage.local.get("emoji_dict").then((result) => {
                emoji_dict = result["emoji_dict"]
                emoji_codes = Object.keys(emoji_dict)
                convert_to_colored_string()
                resizeXlocTabLength()
            })
        })
    }
})
// 當color code string有修改時 上傳localstorage
$("#color_code_string").change(() => {
    chrome.storage.local.set({"color_code_string": $("#color_code_string").val()})
})
// color code字串輸入監聽
$("#color_code_string").on("input", function() {
    convert_to_colored_string()
    // 如果color code string輸入使內容大於tabcontent的高度，則自動調整tabcontent的高度
    resizeXlocTabLength()
})
// color code淺色背景
$("#light-background").on("click", function(){
    $("#colored_string").css("background-color", "#fff")
})
$("#dark-background").on("click", function(){
    $("#colored_string").css("background-color", "#333333")
})
// 將符合的字元轉成跳脫字元
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
// 將color code轉成顏色
function convert_to_colored_string() {
    let color_code_string = $("#color_code_string").val()
    
    // 把style code逐一檢查
    let style_regex = style_codes.map(code => escapeRegExp(code)).join("|")
    let buffer = [], release_buffer = false
    color_code_string.replace(new RegExp(style_regex, "g"), (element) => {
        let replace_element = style_dict[element]
        if(release_buffer) {
            while(buffer.length > 0){
                replace_element = buffer.pop() + replace_element
            }
            release_buffer = false
        }
        // 當下一個抓到的不是token的話
        if(color_code_string.charAt(color_code_string.search(new RegExp(escapeRegExp(element))) + element.length) != "^"){
            release_buffer = true
        }
        buffer.push("</span>")
        color_code_string = color_code_string.replace(element, replace_element)
    })    
    while(buffer.length > 0){// 把最後少加的</span>加回去
        color_code_string = color_code_string + buffer.pop()
    }
    // emoji code逐一檢查
    emoji_codes.map(function(element) {
        if(color_code_string.includes(element)) {
            color_code_string = color_code_string.replaceAll(element, emoji_dict[element])
        }
    })
    $("#colored_string").empty()
    $("#colored_string").append(color_code_string)
}
// 檢查目前是否有強調(highlight) 有的話對應的按鈕要變色
chrome.runtime.sendMessage({type: "detect_highlight", value: true}).then((result) => {
    Object.keys(result).forEach((key) => {
        if(result[key]) {
            $("#" + key).addClass("selected")
        }
    })
})
// 將xlox上的source與上一次source做比較並強調 如果目前有強調顏色碼會先把顏色碼的強調去除
$("#compare_source").on("click", () => {
    // 釋放衝突按鈕
    if($("#highlight_color_code").hasClass("selected")) {
        chrome.runtime.sendMessage({type: "highlight_color_code", value: true})
        $("#highlight_color_code").removeClass("selected")
    }
    // 比較source
    if($("#compare_source").hasClass("selected")){
        chrome.runtime.sendMessage({type: "highlight_source_difference", value: true})
        $("#compare_source").removeClass("selected")
    }else{
        chrome.runtime.sendMessage({type: "highlight_source_difference", value: true})
        $("#compare_source").addClass("selected")
    }
})
// 將xlox上的翻譯與上一次翻譯做比較並強調 如果目前有強調顏色碼會先把顏色碼的強調去除
$("#compare_translation").on("click", () => {
    // 釋放衝突按鈕
    if($("#highlight_color_code").hasClass("selected")) {
        chrome.runtime.sendMessage({type: "highlight_color_code", value: true})
        $("#highlight_color_code").removeClass("selected")
    }
    // 比較translation
    if($("#compare_translation").hasClass("selected")){
        chrome.runtime.sendMessage({type: "highlight_translation_difference", value: true})
        $("#compare_translation").removeClass("selected")
    }else{
        chrome.runtime.sendMessage({type: "highlight_translation_difference", value: true})
        $("#compare_translation").addClass("selected")
    }
})
// 將xloc上的顏色碼強調出來 如果目前有強調翻譯會先把翻譯的強調去除
$("#highlight_color_code").on("click", () => {
    // 釋放衝突按鈕
    if($("#compare_source").hasClass("selected")) {
        chrome.runtime.sendMessage({type: "highlight_source_difference", value: true})
        $("#compare_source").removeClass("selected")
    }
    if($("#compare_translation").hasClass("selected")) {
        chrome.runtime.sendMessage({type: "highlight_translation_difference", value: true})
        $("#compare_translation").removeClass("selected")
    }
    // 強調顏色碼
    if($("#highlight_color_code").hasClass("selected")){
        chrome.runtime.sendMessage({type: "highlight_color_code", value: true})
        $("#highlight_color_code").removeClass("selected")
    }else{
        chrome.runtime.sendMessage({type: "highlight_color_code", value: true})
        $("#highlight_color_code").addClass("selected")
    }
})

///////////////
// Dvar Page //
///////////////
let current_quick_dvar = "", current_mp_map = "", current_mp_mode = "", current_zm_map = "", current_zm_mode = "", 
    current_wz_map = "", current_wz_mode = "", current_total_dvar = "";
let current_timewarp = "+set online_timewarp_offset 0"
let launcher_mode = true;
let local_dvar_select = []

// 讀取目前選擇的dvar
chrome.storage.local.get("dvar_select").then((result) => {
    if(result["dvar_select"] != null) {
        local_dvar_select = result["dvar_select"]
    }
})
chrome.storage.local.get("add_dvar").then((result) => {
    if(result["add_dvar"] != null) {
        result["add_dvar"].forEach((isChecked, index) => {
            if(isChecked) {
                $($(".add_dvar")[index]).prop('checked', true)
            }
        })
    }
})
// 填入timewarp時間
chrome.storage.local.get("timewarp").then((result) => {
    if(result["timewarp"] != null) {
        $("#timewarp_dvar").val(result["timewarp"])
    }
})
// 從localstorage讀dvar mode資料
chrome.storage.local.get("dvar_launcher_mode").then((result) => {
    if(result["dvar_launcher_mode"] != null) {
        launcher_mode = result["dvar_launcher_mode"]
        $("#dvar_switcher").removeClass()
        if(launcher_mode == true) {
            $("#dvar_switcher").addClass("fa-solid fa-rocket").attr('title', "launcher dvar")
        }else {
            $("#dvar_switcher").addClass("fa-solid fa-gamepad").attr('title', "in-game dvar")
        }
    }
})
// 將dvar填入textarea
chrome.storage.local.get(["current_quick_dvar", "current_mp_map", "current_mp_mode", "current_zm_map", "current_zm_mode", 
    "current_wz_map", "current_wz_mode", "current_timewarp", "current_total_dvar"]).then((result) => {
    current_quick_dvar = result["current_quick_dvar"] == null ? "" : result["current_quick_dvar"]
    current_mp_map = result["current_mp_map"] == null ? "" : result["current_mp_map"]
    current_mp_mode = result["current_mp_mode"] == null ? "" : result["current_mp_mode"]
    current_zm_map = result["current_zm_map"] == null ? "" : result["current_zm_map"]
    current_zm_mode = result["current_zm_mode"] == null ? "" : result["current_zm_mode"]
    current_wz_map = result["current_wz_map"] == null ? "" : result["current_wz_map"]
    current_wz_mode = result["current_wz_mode"] == null ? "" : result["current_wz_mode"]
    current_timewarp = result["current_timewarp"] == null ? "" : result["current_timewarp"]
    current_total_dvar = result["current_total_dvar"] == null ? "" : result["current_total_dvar"]
})

// 顯示dvar同時轉換成launcher/ingame模式 並存入localstorage
function convertDvar() {
    $("#dvar_switcher").removeClass()
    if(launcher_mode == true) {
        $("#result_dvar").val(current_total_dvar)
        $("#dvar_switcher").addClass("fa-solid fa-rocket").attr('title', "launcher dvar")

    }else {
        $("#result_dvar").val(current_total_dvar.replaceAll(/\s?\+set\s?/g, ";").replaceAll(/\s?\+\s?/g, ";").replace(";", ""))
        $("#dvar_switcher").addClass("fa-solid fa-gamepad").attr('title', "in-game dvar")
    }
    // 把目前勾選資訊存到localstorage
    add_dvar = []
    dvar_select = []
    $(".add_dvar").each(function() {
        $(this).is(":checked") ? add_dvar.push(true) : add_dvar.push(false)
    })
    $(".dvar_select").each(function() {
        $(this).val() == null ? dvar_select.push(null): dvar_select.push($("#" + $(this).attr('id') + " option:selected").attr("id"))
    })
    chrome.storage.local.set({"add_dvar": add_dvar})
    chrome.storage.local.set({"dvar_select": dvar_select})
    chrome.storage.local.set({"timewarp": $("#timewarp_dvar").val()})
    chrome.storage.local.set({
            "current_quick_dvar": current_quick_dvar,
            "current_mp_map": current_mp_map,
            "current_mp_mode": current_mp_mode,
            "current_zm_map": current_zm_map,
            "current_zm_mode": current_zm_mode,
            "current_wz_map": current_wz_map,
            "current_wz_mode": current_wz_mode,
            "current_timewarp": current_timewarp,
            "current_total_dvar": current_total_dvar
    })
}
// 設定dvar launcher/ingame模式
$("#dvar_switcher").on("click", () => {
    if(launcher_mode == true) {
        launcher_mode = false
    }else {
        launcher_mode = true
    }
    convertDvar()
    chrome.storage.local.set({"dvar_launcher_mode": launcher_mode})
})
// 監聽quick dvar下拉選單和checkbox
$("#quick_dvar_select").change(() => {
    $("#add_quick_dvar").prop("disabled", false)
    if($("#add_quick_dvar").is(":checked")){
        current_total_dvar = current_total_dvar.replace(current_quick_dvar, $("#quick_dvar_select option:selected").val())
    }else{
        $("#add_quick_dvar").prop('checked', true)
        current_total_dvar = (current_total_dvar + " " + $("#quick_dvar_select option:selected").val()).trim()
    }
    current_quick_dvar = $("#quick_dvar_select option:selected").val()
    convertDvar()
})
$("#add_quick_dvar").change(async () => {
    if($("#add_quick_dvar").is(":checked")) {
        if($("#quick_dvar_select").val() == null) {
            $("#add_quick_dvar").prop("checked", false)
            $("#quick_dvar_select").css('border-color', 'red')
            $("#quick_dvar_select_tooltip").addClass("format-error")
            await new Promise(r => setTimeout(r, 1000))
            $("#quick_dvar_select").css('border-color', 'inherit')
            $("#quick_dvar_select_tooltip").removeClass("format-error")
        }else{
            current_total_dvar = (current_total_dvar + " " + $("#quick_dvar_select option:selected").val()).trim()
        }
    }else{
        current_total_dvar = current_total_dvar.replace(current_quick_dvar, "").trim()
    }
    convertDvar()
})
// 監聽mp map下拉選單和checkbox
$("#mp_map_select").change(() => {
    $("#add_mp_map").prop("disabled", false)
    if($("#add_mp_map").is(":checked")){
        current_total_dvar = current_total_dvar.replace(current_mp_map, $("#mp_map_select option:selected").val())
    }else{
        $("#add_mp_map").prop('checked', true)
        current_total_dvar = (current_total_dvar + " " + $("#mp_map_select option:selected").val()).trim()
    }
    current_mp_map = $("#mp_map_select option:selected").val()
    convertDvar()
})
$("#add_mp_map").change(async () => {
    if($("#add_mp_map").is(":checked")) {
        if($("#mp_map_select").val() == null) {
            $("#add_mp_map").prop("checked", false)
            $("#mp_map_select").css('border-color', 'red')
            $("#mp_map_select_tooltip").addClass("format-error")
            await new Promise(r => setTimeout(r, 1000))
            $("#mp_map_select").css('border-color', 'inherit')
            $("#mp_map_select_tooltip").removeClass("format-error")
        }else{
            current_total_dvar = (current_total_dvar + " " + $("#mp_map_select option:selected").val()).trim()
        }
    }else{
        current_total_dvar = current_total_dvar.replace(current_mp_map, "").trim()
    }
    convertDvar()
})
// 監聽mp mode下拉選單和checkbox
$("#mp_mode_select").change(() => {
    $("#add_mp_mode").prop("disabled", false)
    if($("#add_mp_mode").is(":checked")){
        current_total_dvar = current_total_dvar.replace(current_mp_mode, $("#mp_mode_select option:selected").val())
    }else{
        $("#add_mp_mode").prop('checked', true)
        current_total_dvar = (current_total_dvar + " " + $("#mp_mode_select option:selected").val()).trim()
    }
    current_mp_mode = $("#mp_mode_select option:selected").val()
    convertDvar()
})
$("#add_mp_mode").change(async () => {
    if($("#add_mp_mode").is(":checked")) {
        if($("#mp_mode_select").val() == null) {
            $("#add_mp_mode").prop("checked", false)
            $("#mp_mode_select").css('border-color', 'red')
            $("#mp_mode_select_tooltip").addClass("format-error")
            await new Promise(r => setTimeout(r, 1000))
            $("#mp_mode_select").css('border-color', 'inherit')
            $("#mp_mode_select_tooltip").removeClass("format-error")
        }else{
            current_total_dvar = (current_total_dvar + " " + $("#mp_mode_select option:selected").val()).trim()
        }
    }else{
        current_total_dvar = current_total_dvar.replace(current_mp_mode, "").trim()
    }
    convertDvar()
})
// 監聽zm map下拉選單和checkbox
$("#zm_map_select").change(() => {
    $("#add_zm_map").prop("disabled", false)
    if($("#add_zm_map").is(":checked")){
        current_total_dvar = current_total_dvar.replace(current_zm_map, $("#zm_map_select option:selected").val())
    }else{
        $("#add_zm_map").prop('checked', true)
        current_total_dvar = (current_total_dvar + " " + $("#zm_map_select option:selected").val()).trim()
    }
    current_zm_map = $("#zm_map_select option:selected").val()
    convertDvar()
})
$("#add_zm_map").change(async () => {
    if($("#add_zm_map").is(":checked")) {
        if($("#zm_map_select").val() == null) {
            $("#add_zm_map").prop("checked", false)
            $("#zm_map_select").css('border-color', 'red')
            $("#zm_map_select_tooltip").addClass("format-error")
            await new Promise(r => setTimeout(r, 1000))
            $("#zm_map_select").css('border-color', 'inherit')
            $("#zm_map_select_tooltip").removeClass("format-error")
        }else{
            current_total_dvar = (current_total_dvar + " " + $("#zm_map_select option:selected").val()).trim()
        }
    }else{
        current_total_dvar = current_total_dvar.replace(current_zm_map, "").trim()
    }
    convertDvar()
})
// 監聽zm mode下拉選單和checkbox
$("#zm_mode_select").change(() => {
    $("#add_zm_mode").prop("disabled", false)
    if($("#add_zm_mode").is(":checked")){
        current_total_dvar = current_total_dvar.replace(current_zm_mode, $("#zm_mode_select option:selected").val())
    }else{
        $("#add_zm_mode").prop('checked', true)
        current_total_dvar = (current_total_dvar + " " + $("#zm_mode_select option:selected").val()).trim()
    }
    current_zm_mode = $("#zm_mode_select option:selected").val()
    convertDvar()
})
$("#add_zm_mode").change(async () => {
    if($("#add_zm_mode").is(":checked")) {
        if($("#zm_mode_select").val() == null) {
            $("#add_zm_mode").prop("checked", false)
            $("#zm_mode_select").css('border-color', 'red')
            $("#zm_mode_select_tooltip").addClass("format-error")
            await new Promise(r => setTimeout(r, 1000))
            $("#zm_mode_select").css('border-color', 'inherit')
            $("#zm_mode_select_tooltip").removeClass("format-error")
        }else{
            current_total_dvar = (current_total_dvar + " " + $("#zm_mode_select option:selected").val()).trim()
        }
    }else{
        current_total_dvar = current_total_dvar.replace(current_zm_mode, "").trim()
    }
    convertDvar()
})
// 監聽wz map下拉選單和checkbox
$("#wz_map_select").change(() => {
    $("#add_wz_map").prop("disabled", false)
    if($("#add_wz_map").is(":checked")){
        current_total_dvar = current_total_dvar.replace(current_wz_map, $("#wz_map_select option:selected").val())
    }else{
        $("#add_wz_map").prop('checked', true)
        current_total_dvar = (current_total_dvar + " " + $("#wz_map_select option:selected").val()).trim()
    }
    current_wz_map = $("#wz_map_select option:selected").val()
    convertDvar()
})
$("#add_wz_map").change(async () => {
    if($("#add_wz_map").is(":checked")) {
        if($("#wz_map_select").val() == null) {
            $("#add_wz_map").prop("checked", false)
            $("#wz_map_select").css('border-color', 'red')
            $("#wz_map_select_tooltip").addClass("format-error")
            await new Promise(r => setTimeout(r, 1000))
            $("#wz_map_select").css('border-color', 'inherit')
            $("#wz_map_select_tooltip").removeClass("format-error")
        }else{
            current_total_dvar = (current_total_dvar + " " + $("#wz_map_select option:selected").val()).trim()
        }
    }else{
        current_total_dvar = current_total_dvar.replace(current_wz_map, "").trim()
    }
    convertDvar()
})
// 監聽wz mode下拉選單和checkbox
$("#wz_mode_select").change(() => {
    $("#add_wz_mode").prop("disabled", false)
    if($("#add_wz_mode").is(":checked")){
        current_total_dvar = current_total_dvar.replace(current_wz_mode, $("#wz_mode_select option:selected").val())
    }else{
        $("#add_wz_mode").prop('checked', true)
        current_total_dvar = (current_total_dvar + " " + $("#wz_mode_select option:selected").val()).trim()
    }
    current_wz_mode = $("#wz_mode_select option:selected").val()
    convertDvar()
})
$("#add_wz_mode").change(async () => {
    if($("#add_wz_mode").is(":checked")) {
        if($("#wz_mode_select").val() == null) {
            $("#add_wz_mode").prop("checked", false)
            $("#wz_mode_select").css('border-color', 'red')
            $("#wz_mode_select_tooltip").addClass("format-error")
            await new Promise(r => setTimeout(r, 1000))
            $("#wz_mode_select").css('border-color', 'inherit')
            $("#wz_mode_select_tooltip").removeClass("format-error")
        }else{
            current_total_dvar = (current_total_dvar + " " + $("#wz_mode_select option:selected").val()).trim()
        }
    }else{
        current_total_dvar = current_total_dvar.replace(current_wz_mode, "").trim()
    }
    convertDvar()
})
// Datetime轉Local
function formatDateToDatetimeLocal(date) {
  const pad = (n) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // 月份是從 0 開始
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
// Local轉Datetime
function parseDatetimeLocalString(str) {
  // str 是像 "2025-06-19T14:30"
  if (!str || !str.includes("T")) return null;

  const [datePart, timePart] = str.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  // 月份記得 -1（JavaScript 的月份從 0 開始）
  return new Date(year, month - 1, day, hours, minutes);
}
// 設定timewarp預設目前日期
let time_diff_sec = 0
$("#timewarp_dvar").attr("value", formatDateToDatetimeLocal(new Date()))
$("#timewarp_dvar").change(() => {
    time_diff_sec = Math.floor((parseDatetimeLocalString($("#timewarp_dvar").val()) - (new Date())) / 1000)
    current_total_dvar = current_total_dvar.replace(current_timewarp, "+set online_timewarp_offset " + time_diff_sec)
    current_timewarp = "+set online_timewarp_offset " + time_diff_sec
    $("#add_timewarp_dvar").prop('checked', true)
    convertDvar()
})
$("#add_timewarp_dvar").change(() => {
    if($("#add_timewarp_dvar").is(":checked")) {
        current_total_dvar = (current_total_dvar + " " + current_timewarp).trim()
    }else{
        current_total_dvar = current_total_dvar.replace(current_timewarp, "").trim()
    }
    convertDvar()
})
// 重設dvar回初始
$("#dvar_reset").on("click", function() {
    // 清除所有勾選和選擇項目
    $(".add_dvar").prop('checked', false)
    // 把有選擇的都拿掉 .prop("selected", false)無效
    $(".dvar_select").prop('selectedIndex',0)
    current_quick_dvar = "", current_mp_map = "", current_mp_mode = "", current_zm_map = "", current_zm_mode = "", 
    current_wz_map = "", current_wz_mode = "",current_timewarp = "", time_diff_sec = 0, current_total_dvar = "";
    // 時間回到目前
    let now = new Date()
    let localISOTime = now.toISOString().slice(0, 16) // 轉成 YYYY-MM-DDTHH:mm 格式
    $("input[type='datetime-local']").val(localISOTime)
    // 更新到textarea並上傳localstorage
    convertDvar()
})
// 如果開啟extension時不是dvar tab的話 會讀不到寬度 所以要特別測量
function measureWhenHidden($el) {
    // 如果元素是隱藏的
    const wasHidden = $el.css("display") === "none";

    if (wasHidden) {
        // 保存原本 style（以便還原）
        const originalStyle = {
            position: $el.css("position"),
            visibility: $el.css("visibility"),
            display: $el.css("display")
        };

        // 強制讓它能被量測
        $el.css({
            position: "absolute",
            visibility: "hidden",
            display: "block"
        });

        // 執行量測邏輯並填入options
        readAllDvarFromExcel();

        // 還原原本的狀態
        $el.css(originalStyle);
    } else {
        // 如果本來就是顯示的就直接執行
        readAllDvarFromExcel();
    }
}
// 從excel中讀取dvar並放進下拉選單
function readAllDvarFromExcel() {
    // 固定selection寬度避免動態新增option後被撐大
    $(".dvar_select").each(function () {
        const width = $(this).outerWidth()
        $(this).css({width: width + 'px', 'flex-shrink': 0})
    })
    readQuickDvar()
    readMPDevmap()
    readMPGameMode()
    readZMDevmap()
    readZMGameMode()
    readWZDevmap()
    readWZGameMode()
    convertDvar()
}
function readQuickDvar() {
    const sheet = GOOGLE_WORKBOOK["Quick"]
    for(let i = 1; i < sheet.length; i++) {
        let isSelected = ""
        if(local_dvar_select.includes("quick" + i)) {isSelected = "selected"}
        $("#quick_dvar_select").append("<option id=\"quick" + i + "\" value=\"" + sheet[i][1] + "\" " + isSelected + ">" + sheet[i][0] + "</option>")
    }
}
function readMPDevmap() {
    const sheet = GOOGLE_WORKBOOK["MP_Map"]
    for(let i = 1; i < sheet.length; i++) {
        let isSelected = ""
        if(local_dvar_select.includes("mp_map" + i)) {isSelected = "selected"}
        $("#mp_map_select").append("<option id=\"mp_map" + i + "\" value=\"" + sheet[i][1] + "\" " + isSelected + ">" + sheet[i][0] + "</option>")
    }
}
function readMPGameMode() {
    const sheet = GOOGLE_WORKBOOK["MP_Mode"]
    for(let i = 1; i < sheet.length; i++) {
        let isSelected = ""
        if(local_dvar_select.includes("mp_mode" + i)) {isSelected = "selected"}
        $("#mp_mode_select").append("<option id=\"mp_mode" + i + "\" value=\"" + sheet[i][1] + "\" " + isSelected + ">" + sheet[i][0] + "</option>")
    }
}
function readZMDevmap() {
    const sheet = GOOGLE_WORKBOOK["ZM_Map"]
    for(let i = 1; i < sheet.length; i++) {
        let isSelected = ""
        if(local_dvar_select.includes("zm_map" + i)) {isSelected = "selected"}
        $("#zm_map_select").append("<option id=\"zm_map" + i + "\" value=\"" + sheet[i][1] + "\" " + isSelected + ">" + sheet[i][0] + "</option>")
    }
}
function readZMGameMode() {
    const sheet = GOOGLE_WORKBOOK["ZM_Mode"]
    for(let i = 1; i < sheet.length; i++) {
        let isSelected = ""
        if(local_dvar_select.includes("zm_mode" + i)) {isSelected = "selected"}
        $("#zm_mode_select").append("<option id=\"zm_mode" + i + "\" value=\"" + sheet[i][1] + "\" " + isSelected + ">" + sheet[i][0] + "</option>")
    }
}
function readWZDevmap() {
    const sheet = GOOGLE_WORKBOOK["WZ_Map"]
    for(let i = 1; i < sheet.length; i++) {
        let isSelected = ""
        if(local_dvar_select.includes("wz_map" + i)) {isSelected = "selected"}
        $("#wz_map_select").append("<option id=\"wz_map" + i + "\" value=\"" + sheet[i][1] + "\" " + isSelected + ">" + sheet[i][0] + "</option>")
    }
}
function readWZGameMode() {
    const sheet = GOOGLE_WORKBOOK["WZ_Mode"]
    for(let i = 1; i < sheet.length; i++) {
        let isSelected = ""
        if(local_dvar_select.includes("wz_mode" + i)) {isSelected = "selected"}
        $("#wz_mode_select").append("<option id=\"wz_mode" + i + "\" value=\"" + sheet[i][1] + "\" " + isSelected + ">" + sheet[i][0] + "</option>")
    }
}
// 按下dvar複製
$("#dvar_copy").on("click", async () => {
    navigator.clipboard.writeText($("#result_dvar").val()).then(async () => {
        console.log('Async: Copying to clipboard was successful!')
        $("#dvar_copy").removeClass("fa-copy").addClass("fa-check")
        await new Promise(r => setTimeout(r, 1000))
        $("#dvar_copy").removeClass("fa-check").addClass("fa-copy")
    }, function(err) {
        alert('Async: Could not copy text: ', err);
    });
})

