contrast_strings = document.querySelectorAll(".ivy_add_translation_diff")
d_m_p = new diff_match_patch()
translation_col = 0, prev_translation_col = 0
table_head = document.querySelectorAll("table.rgMasterTable th")
table_data = document.querySelectorAll("table.rgMasterTable tbody td")
total_record = parseInt(document.getElementById("ctl06_RadGrid1_ctl00_ctl02_ctl00_lblTotalsTop").innerHTML.split(":")[1])
total_col = table_head.length
table_head.forEach((col, i) => {
    if(col.textContent == "Translation") {
        translation_col = i
    }else if(col.textContent == "Previous Translation") {
        prev_translation_col = i
    }
})
if(contrast_strings.length == 0){
    for(let i = 0; i < total_record; i++) {
        curr = table_data[total_col*i + translation_col].textContent.trim()
        prev = table_data[total_col*i + prev_translation_col].textContent.trim()
        highlight_curr = ""
        highlight_prev = ""
        d_m_p.diff_main(curr, prev).forEach(item => {
            replacement = "<span class=\"ivy_add_translation_diff\" style=\"background:LightGreen; color:DarkGreen\">" + item[1] + "</span>"
            if(item[0] === -1) {
                highlight_curr += replacement
            }else if(item[0] === 1) {
                highlight_prev += replacement
            }else if(item[0] === 0) {
                highlight_curr += item[1]
                highlight_prev += item[1]
            }
        })
        table_data[total_col*i + translation_col].querySelector("div.xloc_FormatForHTML").innerHTML = highlight_curr
        table_data[total_col*i + prev_translation_col].querySelector("div.xloc_FormatForHTML").innerHTML = highlight_prev
    }
}else {
    for(let i = 0; i < total_record; i++) {
        curr = table_data[total_col*i + translation_col].textContent.trim()
        prev = table_data[total_col*i + prev_translation_col].textContent.trim()
        d_m_p.diff_main(curr, prev).forEach(item => {
            replacement = "<span class=\"ivy_add_translation_diff\" style=\"background:LightGreen; color:DarkGreen\">" + item[1] + "</span>"
            if(item[0] === -1) {
                table_data[total_col*i + translation_col].innerHTML = htmlDecode(table_data[total_col*i + translation_col].innerHTML).replace(replacement, item[1])
            }else if(item[0] === 1) {
                table_data[total_col*i + prev_translation_col].innerHTML = htmlDecode(table_data[total_col*i + prev_translation_col].innerHTML).replace(replacement, item[1])
            }
        })
    }
}

// 避免特定符號被escape
function htmlDecode(input) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = input;
    return textarea.value;
}