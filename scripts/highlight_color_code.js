color_code_strings = document.getElementsByClassName("xloc_FormatForHTML")
colored_strings = document.getElementsByClassName("ivy_add_color_code")
async function highlight_color_code() {
    // 從color_code.json讀取資料
    if(color_code_strings.length > 0) {
        if(colored_strings.length == 0) {
            chrome.runtime.sendMessage({type: "read_color_code"}, function(color_dict) {
                let color_codes = Object.keys(color_dict)
                for(str_dom of color_code_strings) {
                    for(element of color_codes){
                        if(str_dom.innerHTML.includes(element) && !color_dict[element].includes("font")) {
                            str_dom.innerHTML = str_dom.innerHTML.replaceAll(element, "<span class=\"ivy_add_color_code\">" + color_dict[element] + element + "</span></span>")
                        }
                    }
                }
            })
        }else{
            let color_dict = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ type: "read_color_code" }, resolve);
            })
            color_codes = Object.keys(color_dict)
            for(str_dom of color_code_strings) {
                for(element of color_codes){
                    if(str_dom.innerHTML.includes(element) && !color_dict[element].includes("font")) {
                        str_dom.innerHTML = str_dom.innerHTML.replaceAll("<span class=\"ivy_add_color_code\">" + color_dict[element] + element + "</span></span>", element)
                    }
                }
            }
        }
    }
}

highlight_color_code()