function detect_highlight() {
    colored_strings = document.querySelectorAll(".ivy_add_color_code")
    contrast_translation_strings = document.querySelectorAll(".ivy_add_translation_diff")
    contrast_source_strings = document.querySelectorAll(".ivy_add_source_diff")
    let result = {
        "highlight_color_code": colored_strings.length > 0,
        "compare_translation": contrast_translation_strings.length > 0,
        "compare_source": contrast_source_strings.length > 0
    }
    return result    
}

detect_highlight()