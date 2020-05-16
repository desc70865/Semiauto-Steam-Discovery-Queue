// ==UserScript==
// @name         Semiauto Steam Discovery Queue
// @namespace    https://github.com/desc70865/Semiauto-Steam-Discovery-Queue
// @icon         https://store.steampowered.com/favicon.ico
// @version      0.1.3
// @description  something aid to accelerate steam discovery queue
// @author       desc_inno
// @match        https://store.steampowered.com/app/*
// @match        https://store.steampowered.com/explore/*
// @match        https://store.steampowered.com/agecheck/*
// @require      https://cdn.staticfile.org/jquery/1.12.4/jquery.min.js
// ==/UserScript==

// set https://store.steampowered.com/account/languagepreferences both simplified & traditional chinese before use

(function() {
    'use strict';
    window.onload = semiauto();
})();

function semiauto(){
    if((/Failed to load queue|502 Bad Gateway/g).test(document.getElementsByTagName('html')[0].outerHTML)){ // may refresh can work better
        window.location.reload(); // if error, refresh the page
    }

    var path = window.location.pathname.split('/'),
        href = "https://store.steampowered.com/explore/",
        reg_appid = /(?<=app\/)(\d+)/g,
        flag_inqueue = (typeof($('.next_in_queue_content')[0]) != "undefined");

    switch(path[1]) { // switch by path name
        case 'explore':
            var queue_length = $("div#discovery_queue")[0].childNodes.length; // rest items in queue
            if(queue_length > 0){
                var button = createButton();
                button.addEventListener('click', function(){
                    var appid = document.getElementById("discovery_queue_start_link").href.match(/(?<=app\/)(\d+)/g,).toString();
                    nextAppInQueue(appid, href);
                    // annotate after 0.1.2, consider of some Q have continuous demos
                    /*if(queue_length > 1){ // if any game behind exist
                        var next_appid = $("div#discovery_queue")[0].childNodes[1].outerHTML.match(/(?<=apps\/)\d+/g),
                            next_url = "https://store.steampowered.com/app/" + next_appid + "/";
                        nextAppInQueue(appid, next_url);
                    }
                    else{ // if at the end of queue
                        nextAppInQueue(appid, href);
                    };*/
                });
            }
            else{
                var tmp = $("div.discover_queue_empty_refresh_btn")[0].getElementsByTagName("span")[0].click();
                var t4 = setTimeout(window.location.reload(),3000)
            };
            break;
        case 'app':
            var flag_tmp = titleMark();
            if(flag_inqueue){ // current game in explore queue
                if(flag_tmp){ // semiauto process
                    try{
                        $("#es_new_queue")[0].click();
                    }
                    catch(e){
                        $("div.btn_next_in_queue_trigger")[0].click();
                    };
                }
            }
            else{ // or not
                // var t2 = setTimeout(backToExplore, 5000); // back to main page in 5 seconds
            }
            break;
        case 'agecheck': // readability
        default:
            var t3 = setTimeout(backToExplore, 1000);
            break;
    };
};

function titleMark(){ // add prefix & suffix to title if u need
    var trade_card = 0, // if has trade cards
        chinese_support = 0, // if supports simplified chinese or traditional chinese
        rate_panel = $("div.user_reviews_summary_row"), // get reviews panel
        length = rate_panel.length, // if there is recent reviews, it should be 2, or just 1
        total = 1, //divisor cant be 0
        reviews_rate = 100, // default value 100 for positive percentage
        release_year = document.getElementsByClassName('date')[0].innerHTML.match(/\d{4}/g).toString(), // ~
        tags = $("div.popular_tags")[0].childNodes, // get tags
        reg_tag_include = /免费/g, // tags you are interested in
        reg_tag_exclude = /色情内容|虚拟现实/g, // tags you dont want
        flag_tag_in = tagTest(tags, reg_tag_include),// if it has sth you need
        flag_tag_ex = tagTest(tags, reg_tag_exclude), // or just the opposite
        flag_schinese = $('.game_language_options')[0].innerText.match(/不支持/g) == null,
        flag_tchinese = $('.game_language_options')[0].innerText.match(/繁体中文/g) != null,
        flag_card = document.body.innerText.match(/Steam 集换式卡牌/g) != null,
        title = $('.apphub_AppName'); // title of game name to add fix

    if((/%/g).test(rate_panel[0].dataset.tooltipHtml)){ // sometimes there wont be enough reviews
        reviews_rate = rate_panel[length-1].dataset.tooltipHtml.match(/\d+(?=%)/g), // overall percentage
        total = rate_panel[length - 1].dataset.tooltipHtml.match(/\d+(?= 篇)/g); // a space here / sum of reviews
        title[0].innerHTML = title[0].innerText + " => ("+ parseInt(reviews_rate * total / 100) + "/" + total + ") = " + reviews_rate + "%☆"; // add rate to suffix
    }
    if(flag_card == true){
        title[0].innerHTML = "📇 " + title[0].innerText; // add emoji to prefix
        trade_card = 1;
    }
    if(flag_schinese == true || flag_tchinese == true){
        title[0].innerHTML = "🀄️ " + title[0].innerText; // add emoji to prefix
        chinese_support = 1;
    }
    if(((trade_card + chinese_support) < 1 || reviews_rate < 60 || release_year < 2010 /*|| flag_tag_ex*/) && !flag_tag_in && (release_year < 2020)){ // some rules by costomize
        return true;
    }
    else{
        return false;
    };
};

function tagTest(tags, reg){ // tag detector
    for(var i = 1; i < 6 && i < tags.length; i++){ // search in top 5 tags
        if(reg.test(tags[i].innerText)){
            return true;
        }
    }
    return false;
}

function backToExplore(){ // return if error
    window.location.href = "https://store.steampowered.com/explore/";
};

function nextAppInQueue(appid, target){ // core
    $J.post('/app/'+appid, {sessionid: g_sessionID, appid_to_clear_from_queue: appid}).done(location.href = target);
};

function createButton() { // create button for nextAppInQueue at "https://store.steampowered.com/explore/"
    var buttonContainerDiv = document.createElement('div');
    var buttonSpan = document.createElement('span');

    buttonSpan.innerHTML = '移除当前游戏';
    buttonSpan.setAttribute('style', 'padding: 0 15% 0 15%; font-size: 15px; line-height: 64px; color: #ffcc6a; font-family: "Motiva Sans", Sans-serif; font-weight: 300;')

    buttonContainerDiv.setAttribute('id', 'remove_button');
    buttonContainerDiv.setAttribute('class', 'next_in_queue_content');
    buttonContainerDiv.setAttribute('style', 'background: url(/public/images/v6/app/queue_next_btn.png) top left no-repeat; width: 144px; height: 64px; cursor: pointer; background-size: 100% 200%; margin-bottom: -26px; margin-right: 0px; margin-top: -9px; float: right;');

    buttonContainerDiv.appendChild(buttonSpan);
    document.getElementsByClassName('discovery_queue_apps')[0].getElementsByClassName('discovery_queue_static')[0].insertAdjacentHTML('afterend', buttonContainerDiv.outerHTML);

    return buttonContainerDiv;
};
