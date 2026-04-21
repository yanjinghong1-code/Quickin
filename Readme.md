>[!IMPORTANT]
>
>**We are currently in Beta Test**

Copyright&copy; 2024, Ivy Ho
# 2025-01-26 by Yan
1. Finish 3 new themes
2. Adding new feature: 3 template pools for regression comments
3. Report an issue direct to Yan's slack
4. Tooltips: Double click to switch comments
# 2025-01-26 by Jinghong
1. Adding more templates for regression
# 2025-01-23 by Yan
1. Adding more templates for regression
2. Add three themes (Cinnamoroll, Strawberry and Chimera)
3. Autofill Automation ultlized filed in Jira when creating template
# 2025-01-06
1. Improve download process
# 2025-12-19🎄
1. Improve user experience when select label in template
# 2025-11-28
1. Update customfield_10325 value to 43600 as the value has been chenge in JIRA
# 2025-11-12
1. After change xloc page, the dvar and unrevised highlight will still apply
# 2025-10-22
1. Fix single select label bug
2. Memorize dvar selection and add a reset button
# 2025-09-11
1. Fix Found CL cause file name error
2. Fix jira bug template branch section undefined error
3. Fix xloc string note garbled characters bug
# 2025-08-25
1. Update Xloc new address
2. Highlight unrevised translation modified date
# 2025-08-12
1. Fix profile language duplicate in dropdown menu at file name tab and add EN if not in selection
2. Add new color code
# 2025-07-21
1. Switch project between Cerberus and Chimera
2. Add Korean and Chinese Safe
# 2025-06-23
1. Finish Dvar tab content
2. Memorize the filename
3. Warn user if the name file selected language is not their own language
# 2025-06-16
1. Add new tab: Dvar
2. If fetch SharePoint fail, try again in 1 sec
# 2025-06-06
1. Split file name with (space)－(space) instead of －
2. Read data from Microsoft SharePoint
3. Remove "Top" button from xloc page because it blocks the next page button
# 2025-05-29
1. Transfer data from Google drive to Microsoft SharePoint
# 2025-05-27
1. Fix xloc copy *undefined* string
2. Fix error message present for blank fix version
3. Add new color code
# 2025-05-19
1. Fix CNV comment typo
2. Fix xloc tab height issue
# 2025-04-28
1. Memorize the color code string in xloc tab
2. Add comment button to generate regression comment, and right click to switch platform
3. Improve highlighting performance in xloc page
4. When unselect all languages in bug template tab, the profile language will be selected
# 2025-04-25
1. Fix unable to cancel select language specific bug
2. Add more color code
# 2025-04-24
1. The Xloc tab will grow with the content until it reach the max height(500px)
2. Add the build number in the beginning of description in the bug template
# 2025-04-16
1. Fix highlight translation different bug
2. The setting is set to fixed height
3. Add Loc_UI label when logging Overlap and Truncation bug
4. Add compare source button in xloc tab
5. Fix resource ids fail integrated in template
# 2025-04-07
1. Fix Xloc sort column and the dvar dissappear bug
2. Add copy dvar button after audio dvar and filename
3. Fix clean picture naming bug
4. Show all default repro step in text area
5. Fix showing url encode text in bug template
# 2025-04-03
1. Add clean pic button in file naming tab
2. When user open jira customize filter page(current user create bug during today), it will copy the bug id and summary(for our DSR 4.3.1 project)
3. Fix audio dvar convert in xloc
4. Update Xloc database name (COD 2024 -> Call of Duty | Trunk)
# 2025-03-20
1. Fix compare translation bug
2. Integrate color code into style code
3. Template tab is resizable, min 290px, max 500px(#new_bug.tabcontent)
# 2025-03-10
1. Fix audio dvar bug(Warzone audio)
2. Use `encodeURIComponent()` to convert string into URI encoded string instead of manually convert
3. Add tooltips for locks in Template tab
4. Extract basic keywords from user input
# 2025-03-09
1. To fix the query string too long, we paste the resource ids after open the bug template.
2. Add platform and language selections, repro steps, bug observed, and keywords textarea so that when users create the template, all required fields are already filled in.
3. Replace setting page into FTUE page but still contain settings
4. If user don't input username in correct format, user will stuck in FTUE page.
# 2025-03-04
1. Fix audio dvar bug(MP & ZM audio)
# 2025-02-26
1. In xloc search, if the column contains "String Notes" and the string notes contains "File Name", add audio dvar at the bottom
2. Set content script run after page fully loaded(in manifest.json)
# 2025-02-25
1. Add color code
2. Add functional bug type in bug template
3. Remove all space in found cl
# 2025-02-05
1. Compare translation and Highlight color code can switch smoothly now
2. The compare translation and highlight color code button also added css color
# 2025-02-01
1. Separate Diff Match Patch module from highlight_translation_difference.js
# 2025-01-31
1. Add additional label for text overlap and truncation
2. Add tooltip for buttons and textarea for xloc tab
3. Fix typo(source ID -> resource ID)
4. Color code converter can convert styles other than color code
# 2025-01-26
1. Change the way applying theme
# 2025-01-23
1. Show tooltip when user enter username in wrong format
2. Fix first install UI error
# 2025-01-16
1. Auto detect branch and fill in template
# 2025-01-05
1. Add fix version in new bug tab
2. Summary text area will grow if user input more than 1 line
3. Remove profile tab, add a setting button on the bottom left corner instead
4. Add note in 
5. Update UI
# 2024-12-22
1. Fix blank label bug
# 2024-12-21
1. Mistake-proofing for ALL label in new bug tab
2. Save label information in localstorage and selected labels won't be disappeared if the extension window closed
# 2024-12-15
1. Fix translation contrast in xloc tab when user search translaion and xloc will autimatically highlight the text, I remove it to keep translation contrast work
2. If user enter whole build number in found cl, it will only extract the number part
3. Add theme logo picture for some theme
# 2024-12-14
1. Mistake-proofing for label(issue type 2) in new bug tab
2. What's new only show when user need to update
# 2024-12-13
1. Finish taco theme
2. Make the selection or dropdown same length in profile tab
# 2024-12-06
1. Fix Translation Contrast unhighlight bug
2. Add click copy button feedback
# 2024-12-05
1. Add what's new in profile tab
2. Fix button border and border-radius will change after click
3. If #color_code_string doesn't contain color code, it will notice user but still present the string
4. Emoji code now has a separate json file as color code
# 2024-12-04
1. Expand the text area in xloc tab
2. Update tab order to New bug > Naming > XLOC > Profile
3. Fix typo (Grammer -> Grammar) and use "/" instead of "-" in summary if but type 2 is Spelling&Grammar
4. Remove "All" in Loc Language if logging a multi-language bug
5. Remove all front and end space for found CL in new bug tab
6. Fix Regression Lock issue
7. read_bug_data.js won't return filename now.
# 2024-11-29
1. Fix translation contrast bug(Create a pointer to prevent finding wrong text to highlight)
2. Add regression lock at file naming tab
# 2024-11-28
1. Implement new way to retrieve bug data without delay
2. Bug description title set to bold
# 2024-11-27
1. Use promise instead of recursive callback to improve readability and prevent callback hell
# 2024-11-26
1. Fix New bug tab Resource IDs default 0px height issue
2. Add light background selection for xloc color code translation
3. Fix New bug tab WZ level error(typo)
4. If user already up to date, reopen the update notice
# 2024-11-21
1. Add Location and Resource IDs textarea in New Bug tab
2. Set all textarea max-height to 250 px
3. Specific xloc type (Linebooks or Non-Linebooks) in bug description
# 2024-11-20
1. If user didn't select any Game Mode label, the default type would be **General**
2. The extension will now check the update itself
# 2024-11-14
1. Add multilanguage check box and corresponding features
2. Remove summary input history
3. Add color code and icon
# 2024-11-11
1. Fix type (email -> username)
# 2024-11-10
1. Implement different action required base on issue type
2. Safety issus now be consider as issue type 2, and if safety issue and other issue are selected at the same time, the issue type 2 will be the safety issue(higher priority)
3. File name in File Naming tab will default select your Loc Language(if applicable)
# 2024-11-08
1. Fix bug (Seasonal label is always Loc_S1)
2. Edit action required section in New Bug tab
# 2024-11-07
1. Rename **Label** tab to **New Bug** tab
2. Add safety issue label in New Bug tab
3. New Bug tab can generate a jira query string to create new bug
4. Add profile tab which can let user input their language and jira username
5. Remove fontawesome to reduce extension size
6. Remove Regression Tab
# 2024-11-05 🎂
1. Remove comment tab
2. Change Translation contrast highlight color to Light/Dark Green
3. Fix label typo and incorrect issue type
4. Add Text/Subtitle_Missing, Subtitle_Mismatch, Loc_Language, Loc_Cerberus and telescope specific labels
# 2024-11-04
1. Add translation contrast button in Xloc tab
2. If read_bug_data.js cannot read bug data, it will automatically retry in .5 second
3. Add **Loc_Text_Spelling_Grammer** label in label tab
4. Replace "/" to space in file name textarea
# 2024-10-25
1. When user click click Loc_Text or Loc_Subtitle or Loc_Audio, the corresponding tags will show up
2. Add "CLEAR Selected Tags" button
# 2024-10-22
1. Add Report Error link, which will redirect to Ivy's slack profile
2. Adjust pop up width (Enlarge)
# 2024-10-20
New evolution of the codes but the UI become more ugly :painsmile:
1. Stop keep calling content script every 1 sec, all action will be taken when the pop up window open
2. Add tag tab for adding tags when logging a bug
3. Add more color code, especially from Jupiter color code
4. Enlarge the File name text area in File Naming tab
5. Add more platform and LNG in Comment tab

## Note
local storage snapshot `chrome.storage.local.get(console.log)`  
clear local storage `chrome.storage.sync.clear()`
## Useful links
[Chrome for Developer](https://developer.chrome.com/)
## Meme

![](./data/m2.webp) ![](./data/Why.webp)





