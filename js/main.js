var img = [];
var index = 0;
var sub_index;
var comments = {};
var s_comments = {};
var cat_page;
if(localStorage.getItem('cat_page')){
    cat_page = localStorage.getItem('cat_page');
}
else{
    cat_page = 1;
}

var type_page;
if(localStorage.getItem('type_page')){
    type_page = localStorage.getItem('type_page');
}
else{
    type_page = 1;
}

var page;
if(localStorage.getItem('page')){
    page = localStorage.getItem('page');
}
else{
    page = 1;
}

var cur_page_restourants;
if(localStorage.getItem('cur_page_restourants')){
     cur_page_restourants = JSON.parse(localStorage.getItem('cur_page_restourants')) ;
}
else{
     cur_page_restourants = [];
}

var data;
if(localStorage.getItem('data')){
    data = JSON.parse(localStorage.getItem('data')) ;
}
else{
    data = null;
}

var ajaxIndex;
if(localStorage.getItem('ajaxIndex')){
    ajaxIndex = JSON.parse(localStorage.getItem('ajaxIndex')) ;
}
else{
    ajaxIndex = 0;
}

var base_url = 'https://restadviser.com/';
var current_city = 'Philadelphia';

function assign_type() {
    type_page++;
    localStorage.setItem('type_page', type_page);
    var url = decodeURIComponent(location.href);
    var arr = url.split("/");
    var count = arr.length;
    var last_el = arr[count-1];


    if(last_el.indexOf('?') !== -1 ){
        var formatted_last_el = (last_el.split("?"))[0];
        t = formatted_last_el;
    }
    else{
        t = last_el;
    }

    var type = t.split('-').join(' ');

    var restaurants = {};
    $.each($('.result-title'), function(index, value){
        restaurants[index] = {};
        restaurants[index].name = $.trim($(value)[0].innerHTML);
    });
    var data = {};
    data.restaurants = restaurants;
    data.type = type;
    console.log(data);
    var d = JSON.stringify(data);
    $.ajax({
        url: base_url+'/assign/type',
        data: {
            data: d
        },
        type: 'get',
        success: function(){
            if($('.next').hasClass('disabled')){
                localStorage.removeItem('type_url');
                localStorage.removeItem('type_page');
                alert('finished');
            }
            else{
                console.log(localStorage.getItem('type_url'));
                var url1 =  localStorage.getItem('type_url')+'?page='+type_page+'&type_start';
                
                window.location = url1;
            }
        }
    })
}
function assign_category(){
    cat_page++;
    localStorage.setItem('cat_page', cat_page);
    var url = location.href;
    var arr = url.split("/");
    var count = arr.length;
    var last_el = arr[count-1];


    if(last_el.indexOf('?') !== -1 ){
        var formatted_last_el = (last_el.split("?"))[0];
        cat = formatted_last_el;
    }
    else{
        cat = last_el;
    }

    var category = cat.split('-').join(' ');

    var restaurants = {};
    // $.each($('.result-title'), function(index, value){
    //     restaurants[index] = {};
    //     restaurants[index].name = $.trim($(value)[0].innerHTML);
    // });
    $.each($('#orig-search-list .search-snippet-card'), function(index, value){
        restaurants[index] = {};
        restaurants[index].name = $.trim(($(($(value).find('.result-title'))[0])[0]).innerHTML);
        restaurants[index].address = $.trim(($(($(value).find('.search-result-address'))[0])[0]).innerHTML);
    });
    var data = {};
    data.restaurants = restaurants;
    data.category = category;
    console.log(data);
    var d = JSON.stringify(data);
    $.ajax({
        url: base_url+'/assign/category',
        data: {
            data: d
        },
        type: 'get',
        success: function(){
            if($('.next').hasClass('disabled')){
                localStorage.removeItem('cat_url');
                localStorage.removeItem('cat_page');
                alert('finished');
            }
            else{
                window.location = localStorage.getItem('cat_url')+'?page='+cat_page+'&cat_start';
            }
        }
    })
}

function get_cuisines() {

    $('.show-more-cuisines-filter').click();
    setTimeout(function(){
        $('#modal-container .close').click();
        var c = $('#modal-container .c-sel-city>a>span');
        var cuisins = {};
        $.each(c, function(index, value){
            cuisins[index] = $(value)[0].innerHTML;
        });

        console.log(cuisins);
        var d = JSON.stringify(cuisins);
        $.ajax({
            url: base_url+'/fill/cuisines',
            data: {
                data: d
            },
            type: 'get',
            success: function(){
                // get_locations();
                doVisit();
            }
        })
    }, 2000);
}

function get_locations() {
    $('.search_filter.location.red_see_all').click();
    setTimeout(function(){
        $('#modal-container .close').click();
        //get locations
        var data  = {};
        var location = {};
        var loc = $('#modal-container .c-sel-con-area .row>a>span');
        $.each(loc, function(index, value){
            location[index] = $.trim($(value)[0].innerText);
        });

        data['location'] = {};

        data['location'] = location;
        var city = $.trim((($('.search_title')[0].innerHTML).split('Restaurants'))[0]);
        data.city = city;
        var d = JSON.stringify(data);
        $.ajax({
            url: base_url+'/fill/locations',
            data: {
                data: d
            },
            type: 'post',
            success: function(data){
                setTimeout(function(){
                    doVisit();
                }, 2000);
            }
        })
    }, 2000);


}

function create_visitable_urls(){

    cur_page_restourants = [];
    var objects = $('#orig-search-list').find('.result-title');

    $.each(objects, function(index, value){
        var url = $(value).attr('href');
        cur_page_restourants.push(url);
    });

}
//
function add_cancel_btn(){
    $('.btns').html('<button id="cancel">Cancel</button>');
}

function show_extension(){

    // add main template of extension
    $('#mainframe').before(
        '<div class="extension">'+
            '<div class="ext_content">'+
                '<div class="cont_right">'+
                        '<h2>Start getting data?</h2>'+
                        '<div class="btns">' +
                            '<button id="start" class="btn_yes">get places</button>'+
                            '<button id="ext_close" class="btn_no btn_yes">Clear Storage</button>'+
                            '<button id="assign_categories" class="btn_no btn_yes">categories</button>'+
                            '<button id="type" class="btn_no">Types</button>'+
                        '</div>'+
                '</div>'+
            '</div>'+
        '</div>'
    );
}

function doVisit() {
    //view restaurant profile
    $.ajax({
        url: cur_page_restourants[ajaxIndex],
        type: 'get',
        success: function(response){
            if(ajaxIndex < cur_page_restourants.length) {

                if(($(response).find('#location_input_sp')[0]).innerText!= current_city){
                    ajaxIndex++;
                    localStorage.setItem('ajaxIndex', JSON.stringify(ajaxIndex));
                    doVisit();
                }
                else{
                    // get all restaurant's names
                    var n = $(response).find('.res-name').text();
                    data = {};

                    data.name = $.trim(n);

                    // get phone numbers
                    var phone = $(response).find('#phoneNoString > span > span > span').text();
                    data.mobile = $.trim(phone);

                    // get address
                    var addr = $(response).find('.res-main-address>.resinfo-icon>span').text();
                    data.address = $.trim(addr);

                    //get working hours
                    var wrkhours = $(response).find('#res-week-timetable > table > tbody > tr');
                    var working_days = {};
                    $.each(wrkhours, function(index, value){

                        var day_obj = $(value)[0].firstChild;
                        var wk_day = $(day_obj)[0].innerHTML;

                        var hour_obj = $(value)[0].lastChild;
                        var hours = $(hour_obj)[0].innerHTML;

                        working_days[wk_day] = hours;
                    });

                    data.workinghours = working_days;

                    // get cuisines
                    var cuisines = {};
                    var cuis = $(response).find('.res-info-cuisines a');
                    $.each(cuis, function(index, value){

                        cuisines[index] = $(value)[0].innerHTML;
                    });

                    data.cuisines = cuisines;
                    // get cost
                    var cost = {};
                    var cost_arr = $(response).find('span[itemprop = "priceRange"] span');
                    $.each(cost_arr, function(index, value){
                        cost[index] = $(value)[0].innerHTML;
                    });

                    data.cost = cost;

                    //get location
                    var loc_cat_est_obj = $(response).find('.res-name').siblings('div.mb5');
                    data.location = $.trim($(loc_cat_est_obj).find('a')[0].innerHTML);

                    // get highlights

                    var highl = $(response).find('.res-info-feature-text');
                    var highlights = {};
                    $.each(highl, function(index, value){
                        highlights[index] = $(value)[0].innerHTML;
                    });

                    data.highlights = highlights;

                    ajaxIndex++;

                    localStorage.setItem('cur_page_restourants', JSON.stringify(cur_page_restourants));
                    localStorage.setItem('data', JSON.stringify(data));
                    localStorage.setItem('ajaxIndex', JSON.stringify(ajaxIndex));

                    // get images
                    window.location = cur_page_restourants[ajaxIndex-1]+'/photos';
                }
            }
            else{
                localStorage.removeItem('ajaxIndex');
                localStorage.removeItem('cur_page_restourants');
                localStorage.removeItem('data');

                if(page > 314){
                    localStorage.removeItem('url');
                    localStorage.removeItem('page');

                }
                else{
                    var url = localStorage.getItem('url');
                    page++;
                    localStorage.setItem('page', page);

                    window.location = url+'?page='+page+'&start'
                }


            }
        },
        error: function(error){
            console.log('error')
        }
    });
}

function get_menu() {

    if(($('.text-menu-cat')).length > 0){

        var menu_names = $('.text-menu-cat .category_name');
        var menus = $('.text-menu-cat');
        var menu_data = {};
        $.each(menus, function(index, value){

            var menu_name = menu_names[index].innerHTML;

            menu_data[menu_name] = {};

            var products = $(value).find('.tmi-name');
            var product = {};
            $.each(products, function(index, value){

                product[index] = {};

                product[index].title = $.trim($(value)[0].childNodes[0].data);
                var price = $(value).find('.tmi-price-txt');
                var desc = $(value).find('.tmi-desc-text');
                if(price.length > 0){
                    var p = $.trim((price)[0].innerHTML);

                    product[index].price = (p.split('$'))[1]
                }
                else{
                    product[index].price = null;
                }

                if(desc.length > 0){
                    product[index].description = $.trim(($(value).find('.tmi-desc-text'))[0].innerHTML);
                }
                else{
                    product[index].description = null;
                }

            });

            menu_data[menu_name] = product;

        });


        ajaxIndex = jQuery.parseJSON(localStorage.getItem('ajaxIndex'));
        cur_page_restourants = jQuery.parseJSON(localStorage.getItem('cur_page_restourants'));
        data = jQuery.parseJSON(localStorage.getItem('data'));

        data.menus = menu_data;
        localStorage.setItem('data', JSON.stringify(data));
    }
    else{
        data.menus = null;
        localStorage.setItem('data', JSON.stringify(data));
    }

    if(is_exist_menu('Reviews')) {
        window.location = cur_page_restourants[ajaxIndex - 1] + '/reviews';
    }
    else{
        data.comments = comments;
        console.log('finished');
        var d = JSON.stringify(data);
        console.log(d);
        $.ajax({
            url: base_url+'/fill/places',
            type: 'post',
            data: {
                data: d
            },
            success: function(){

                data = null;

                doVisit();
            }
        });
    }
}

function is_exist_menu(menu){
    var a = false;
    var menus = $('.respageMenuContainer a.item');
    for(var i=0; i < menus.length; i++){
        var str = menus[i].innerText;
        var text = (str.split(' '))[0];
        console.log(text);
        if(text == menu){
            a = true;
            i = menus.length;
        }
    };

    return a;
}

function load_comments() {
    $('.load-more').click();
    console.log('comments loaded');

    setTimeout(function(){
        if(($('.load-more')).length > 0){
            load_comments();
        }
        else{
            setTimeout(function(){
                get_comments();
            }, 1000);
        }
    }, 1000);
}


function get_comments() {

    var reviews = $(".res-reviews-container.res-reviews-area .res-review");

    if(reviews.length  > index){
        // setTimeout(function () {
            var section = reviews[index];
            comments[index] = {};

            //get author
            comments[index].author = $.trim(($(section).find(".ui.item>.item .content>.header a")[0]).innerHTML);

            // //get author avatar
            // var avatar_url = $($(section).find('img.avatar.image')[0]).attr('src');
            // var au = avatar_url.split('?');
            // var a = $("<a>").attr("href", au[0]).attr("download", "img").appendTo("body");
            // var image_name_array = au[0].split('/');
            // var length = image_name_array.length;
            // var image_name = image_name_array[length-1];
            // a[0].click();
            // a.remove();
            // comments[index].author_image = image_name;

            //get rate
            var rate_val = $(section).find(".rev-text > div").attr('aria-label');
            if(rate_val){
                var rate = (rate_val.split('Rated '))[1];
            }
            else{
                var rate = null;
            }

            comments[index].rate = rate;

            //get published date
            comments[index].date = $(section).find("time").attr('datetime');

            //get comment
            var str = $($(section).find(".rev-text"))[0].innerText;

            if(($(section).find(".rev-text>div.left")).length>0) {

                var com_text = str.substr(str.indexOf(' '));

                comments[index].text = com_text;
            }
            else{
                comments[index].text = $.trim($($(section).find(".rev-text"))[0].innerText);
            }

            // get sub comments
            var sub_comms = $(section).find('.review_comment_item');
            sub_index = 0;
            comments[index].sub_comments = {};
            if(sub_comms.length > 0){
                setTimeout(function(){
                    s_comments = {};
                    sub_index = 0;
                    sub_comments();
                }, 1000)
            }
            else{
                index++;
                console.log('next comment');
                get_comments();
            }
        // }, 1000);
    }
    else{
        data.comments = comments;
        console.log('finished');
        var d = JSON.stringify(data);
        console.log(d);
        $.ajax({
            url: base_url+'/fill/places',
            type: 'post',
            data: {
                data: d
            },
            success: function(){

                data = null;

                doVisit();
            }
        });
    }
}

function sub_comments() {

    var reviews = $(".res-reviews-container.res-reviews-area .res-review");
    var section = reviews[index];
    var sub_comms = $(section).find('.review_comment_item');

    if(sub_comms.length > sub_index){

        var comment = {};

        // var sub_avatar_url = $(sub_comms[sub_index]).find('img.round_avatar').attr('src');
        // var sau = sub_avatar_url.split('?');
        // var sa = $("<a>").attr("href", sau[0]).attr("download", "img").appendTo("body");
        // var sub_image_name_array = sau[0].split('/');
        // var sub_length = sub_image_name_array.length;
        // var sub_image_name = sub_image_name_array[sub_length-1];
        // sa[0].click();
        // sa.remove();
        // comment.author_image = sub_image_name;

        comment.author = $.trim(($(sub_comms[sub_index]).find('.author'))[0].innerText);

        comment.text = $.trim(($(sub_comms[sub_index]).find('.review_comment_text'))[0].innerText);
        s_comments[sub_index] = comment;

        sub_index++;

            sub_comments();

    }
    else{
        comments[index].sub_comments = s_comments;
        index++;
        console.log('next comment');
        get_comments()
    }
}

function load_photos(){
    console.log('click to load');
    $('.picLoadMore').click();

    setTimeout(function(){
        if(($('.picLoadMore')).length > 0){
            load_photos();
        }
        else{
            setTimeout(function(){
                get_photos();
            }, 2000);
        }
    }, 2000);

}

function  get_photos() {
    var images = $('.photos_container_load_more a img');

    if(images.length > index) {
        
        images[index].click();

        setTimeout(function () {
            index++;
            var bg = $('.heroImage').css('background-image');
            if(typeof bg != 'undefined') {
                var bi = bg.slice(4, -1).replace(/"/g, "");
                var bu = bi.split('?');

                var a = $("<a>").attr("href", bu[0]).attr("download", "img").appendTo("body");
                var image_name_array = bu[0].split('/');

                var length = image_name_array.length;
                var image_name = image_name_array[length - 1];

                if (img.indexOf(image_name) == -1) {
                    img.push(image_name);

                    a[0].click();
                    a.remove();
                    get_photos();
                }
                else {
                    a.remove();
                    index = images.length;
                    get_photos();
                }
            }
            else{
                index = images.length;
                get_photos();
            }
        }, 3000);
    }
        else{
        ajaxIndex = jQuery.parseJSON(localStorage.getItem('ajaxIndex'));
        cur_page_restourants = jQuery.parseJSON(localStorage.getItem('cur_page_restourants'));
        data = jQuery.parseJSON(localStorage.getItem('data'));

        data.images = img;
       // localStorage.setItem('cur_page_restourants', JSON.stringify(cur_page_restourants));
        localStorage.setItem('data', JSON.stringify(data));
       // localStorage.setItem('ajaxIndex', JSON.stringify(ajaxIndex));
        window.location = cur_page_restourants[ajaxIndex-1]+'/menu';

    }
}

function clear_local_storage() {
    localStorage.removeItem('cat_page');
    localStorage.removeItem('type_page');
    localStorage.removeItem('page');
    localStorage.removeItem('cur_page_restourants');
    localStorage.removeItem('data');
    localStorage.removeItem('ajaxIndex');
    localStorage.removeItem('url');
    localStorage.removeItem('cat_url');
    localStorage.removeItem('type_url');
}

$(document).ready(function(){
    show_extension();

    var url = window.location.href;
    var url_arr = url.split('&');
    if(url_arr.indexOf('cat_start') == 1){
        add_cancel_btn();
        assign_category();
    }

    if(url_arr.indexOf('type_start') == 1){
        add_cancel_btn();
        assign_type();
    }

    if(url_arr.indexOf('start') == 1){
        add_cancel_btn();
        create_visitable_urls();
        doVisit();

    }

    if(localStorage.getItem('cur_page_restourants')) {
        cur_page_restourants = jQuery.parseJSON(localStorage.getItem('cur_page_restourants'));
        ajaxIndex = jQuery.parseJSON(localStorage.getItem('ajaxIndex'));
        if (decodeURIComponent(window.location.href) == cur_page_restourants[ajaxIndex-1] + '/photos'){
            add_cancel_btn();
            if(($('.picLoadMore')).length > 0){
                load_photos();
            }
            else{
                setTimeout(function(){
                    get_photos();
                }, 2000);
            }
        }
    }

    if(localStorage.getItem('cur_page_restourants')) {
        cur_page_restourants = jQuery.parseJSON(localStorage.getItem('cur_page_restourants'));
        ajaxIndex = jQuery.parseJSON(localStorage.getItem('ajaxIndex'));
        if (decodeURIComponent(window.location.href) == cur_page_restourants[ajaxIndex-1] + '/reviews'){
            add_cancel_btn();
            setTimeout(function(){
                $('.everyone')[0].click();
            }, 1000);


            setTimeout(function(){
                //get_comments();
                if(($('.load-more')).length > 0){
                    load_comments();
                }
                else{
                    setTimeout(function(){
                        get_comments();
                    }, 1000);
                }
            }, 2000);


        }
    }

    if(localStorage.getItem('cur_page_restourants')) {
        cur_page_restourants = jQuery.parseJSON(localStorage.getItem('cur_page_restourants'));
        ajaxIndex = jQuery.parseJSON(localStorage.getItem('ajaxIndex'));
        if (decodeURIComponent(window.location.href) == cur_page_restourants[ajaxIndex-1] + '/menu'){
            add_cancel_btn();
            setTimeout(function(){
                get_menu();
            }, 2000);
        }
    }

    $(document).on('click', '#ext_close', function(){
        clear_local_storage()
    });

    // start
    $(document).on('click', '#start', function(){
        clear_local_storage();

        localStorage.setItem('url', window.location.href);
        create_visitable_urls();
        
        add_cancel_btn();
        get_cuisines();
    });

    $(document).on('click', '#cancel', function(){
        // localStorage.setItem('data', data);
        // var url = window.location.href;

        window.location.href=localStorage.getItem('url');

    });
    $(document).on('click', '#assign_categories', function(){
        clear_local_storage();

        localStorage.setItem('cat_url', window.location.href);
        localStorage.setItem('url', window.location.href);

        add_cancel_btn();

        assign_category();

    });
    $(document).on('click', '#type', function(){
        clear_local_storage();

        localStorage.setItem('type_url', decodeURIComponent(window.location.href));
        localStorage.setItem('url', decodeURIComponent(window.location.href));

        add_cancel_btn();

        assign_type();
    });
});


