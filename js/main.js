var objectArr = [];
var ajaxIndex = 0;
var plan;
var daily_visit_limit;
var page_visits_count = 0;
var total_visits;
var license_key;

if(localStorage.getItem('visited_users')){
    var visited_users = JSON.parse(localStorage.getItem('visited_users')) ;
}
else {
    var visited_users = [];
}

if(localStorage.getItem('current_visits_count')){
    var current_visits_count = localStorage.getItem('current_visits_count')
}
else{
    var current_visits_count = 0;
}

if(localStorage.getItem('skipped_users_count')){

    var skipped_users_count = localStorage.getItem('skipped_users_count');
}
else{
    var skipped_users_count = 0;
}

// get Linkedin authenticated user_id
var profile_url = $('#account-nav').find('a.account-toggle').attr('href');
var str1 = profile_url.split('id=');
var str2 = str1[1].split('&');
var user_id = str2[0];

function show_modal() {
    // add modal into template
    $('body').append(
        '<div id="overlay">' +
        '<div class="modal">' +
        '<div class="modal_header">' +
        '<p>Enter your license key</p>' +
        '<span id="close_modal" class="close">x</span>' +
        '</div>' +
        '<div class="modal_content">' +
        '<form id="license_key_form">' +
        '<input type="text" class="form-control" name="key">' +
        '</form>' +
        '</div>' +
        '<div class="modal_bottom">' +
        '<button id="key_submit">Save</button>' +
        '<button class="close">Close</button>' +
        '</div>' +
        '</div>' +
        '</div>'
    );

    // open modal
    modal_open("overlay");

    $(document).on('click', '.close', function () {
        modal_close();
    });

    $(document).on('click', '#key_submit', function(){
        submit_key();
    });
}

function submit_key() {
    //get license key
    var key = $('#license_key_form').find('input[name="key"]').val();

    //enter license key
    $.ajax({
        url: 'https://homestead.app/enter_key',
        type: 'get',
        data: {
            key: key,
            user_id: user_id
        },
        dataType: 'json',
        success: function(data){
            if(data.response == 0){
                alert('key does not exist')
            }
            else if(data.response == 1){
                alert('key already in use');
            }
            else if(data.response == 2){
                plan = data.plan;
                license_key = data.license_key;
                modal_close();
                localStorage.removeItem('pages_loaded');
                pages_loaded = 1;
                localStorage.setItem('pages_loaded', 1);
                localStorage.removeItem('skipped_users_count');
                localStorage.removeItem('current_visits_count');
                current_visits_count = 0;
                localStorage.removeItem('visited_users');
                show_extension();
                total_visits = 0;
            }
        },
        error: function(error){
            alert('error: '+error);
        }
    });
}

function next_page(){

    $.ajax({
        url : 'https://homestead.app/update_visits_count',
        type : 'get',
        data : {
            license_key : license_key,
            visits_count : page_visits_count
        },
        success : function(data){
            if(data.success){
                //get next page url
                var nex_pg_url = $('a[rel="next"]').attr('href');
                nex_pg_url = 'https://www.linkedin.com'+nex_pg_url+'&auto_visit=yes';
                window.location.href = nex_pg_url;
            }
        }
    });
}


function doRequests() {

    var str1 = objectArr[ajaxIndex].split('id=');
    var str2 = str1[1].split('&');
    var user_id = str2[0];

    // get visited users
    var visitedUsers = localStorage.getItem('visited_users');
    if(visitedUsers) {
        var visites = JSON.parse(visitedUsers);

        // skip profile
        if (jQuery.inArray( user_id, visites ) != -1) {
            skipped_users_count++;
            localStorage.setItem('skipped_users_count', skipped_users_count);
           $('#prof_skip').html(skipped_users_count);

            ajaxIndex++;
            if(ajaxIndex < objectArr.length) {
                doRequests();
            }
            else{
                next_page();
            }
        }
        else{
            // visiting
            $("a[href='"+objectArr[ajaxIndex]+"']").after('<h3 class="status">Visiting</h3>');
            $(document).find("a[href='"+  objectArr[ajaxIndex] +"']").parent('li').css('backgroundColor', '#cccccc');
            setTimeout(function(){
                doVisit();
            }, 5000);
        }

    }
    else{
        // visiting
        $("a[href='"+objectArr[ajaxIndex]+"']").after('<h3 class="status">Visiting</h3>');
        $(document).find("a[href='"+  objectArr[ajaxIndex] +"']").parent('li').css('backgroundColor', '#cccccc');
        setTimeout(function(){
            doVisit();
        }, 5000);
    }
}

function doVisit() {

    // get visiting user id
    var str1 = objectArr[ajaxIndex].split('id=');
    var str2 = str1[1].split('&');
    var user_id = str2[0];

    // view user profile
    $.ajax({
        url: objectArr[ajaxIndex],
        type: 'get',
        success: function(data){
            page_visits_count ++;
            current_visits_count++;
            localStorage.setItem('current_visits_count', current_visits_count);
            visited_users.push(user_id);
            localStorage.setItem('visited_users', JSON.stringify(visited_users));

            var visits_count = (JSON.parse(localStorage.getItem('visited_users'))).length;
            $('#prof_vis').html(current_visits_count);

            $("a[href='"+objectArr[ajaxIndex]+"']").closest('li').css('backgroundColor', 'rgb(255, 249, 209)');
            $('.status').remove();
            $("a[href='"+objectArr[ajaxIndex]+"']").after('<h3>Visited</h3>');

            ajaxIndex++;
            if(ajaxIndex < objectArr.length) {
                doRequests();
            }
            else{

                next_page();
            }
        },
        error: function(error){
            console.log('error')
        }
    });
}

function create_visitable_urls(){

    objectArr = [];
    var objects = $('#results').find('.people').children('a');

    $.each(objects, function(index, value){
        var url = $(value).attr('href');
        objectArr.push(url);
    });
}

function add_cancel_btn(){
    $('.btns').html('<button id="cancel">Cancel</button>');
    $('#cancel').on('click', function(){
        $.ajax({
            url : 'https://homestead.app/update_visits_count',
            type : 'get',
            data : {
                license_key : license_key,
                visits_count : page_visits_count
            },
            success : function(data){
                if(data.success){
                    var url = window.location.href;
                    var d=url.split('&auto_visit');
                    var f= d[0];
                    window.location.href=f;
                }
            }
        });
    });
}

function show_extension(){

    switch (plan)
    {
        case 0:
            daily_visit_limit = 400;
            break;

        case 1:
            daily_visit_limit = 800;
            break;

        case 2:
            daily_visit_limit = 1500;
            break;
        default :
            daily_visit_limit = 0;

    }

    // add main template of extension
    $('#srp_main_').before(
        '<div class="extension">'+
            '<div class="ext_header">' +
                '<p>ProspectLink and HNW Technologies are not affiliated with LinkedIn. The LinkedIn Corporation does not condone the use of the ProspectLink tool.</p>'+
            '</div>'+
            '<div class="ext_content">'+
                '<div class="cont_left">'+
                '<h1>ProspectLink</h1>'+
                '<p class="ext_version">Free Trial</p>'+
                '<p class="st">Stats <span class="state"><img src="'+chrome.extension.getURL("question-icon.png")+'" class="cust_icon">'+
                '<span class="report" >' +
                    
                        '<span class="rep_el"><span id="daily_visits"></span> -  Daily visits count</span>'+
                        '<span class="rep_el" ></span>'+

                '</span>' +
                '</span></p>'+
                    
                '</div>'+
                '<div class="cont_right">'+
                    '<div class="right_content"> '+
                        '<h2>Auto-visit this profiles?</h2>'+
                        '<div class="btns">' +
                            '<button id="start_visits" class="btn_yes">Yes</button>'+
                            '<button id="ext_close" class="btn_no">No</button>'+
                        '</div>'+
                        '<div class="src_result">'+
                            '<ul>'+
                                '<li >Profiles Skipped: <span id="prof_skip">'+skipped_users_count+'</span> </li>'+
                                '<li>Profiles Visited: <span id="prof_vis">'+current_visits_count+'</span></li>'+
                                '<li id="daily_vis">Daily Visit Limit: '+daily_visit_limit+'</li>'+
                            '</ul>'+
                            '<ul>'+
                                '<li id="pages_loaded">Pages Loaded: '+pages_loaded+'</li>'+
                            '</ul>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<div class="ext_bottom">'+
                '<ul>' +
                    '<li><a href="#">Download Profiles</a></li>'+
                    '<li><a href="#">Get Help</a></li>'+
                    '<li><a href="/wvmx/profile">Who is viewed your profile</a></li>'+
                    '<li><a href="/wvmx/profile/rankings">How you rank</a></li>'+
                '</ul>'+
            '</div>'+
        '</div>'
    );
    
    if(is_started()){
        add_cancel_btn();
    }

    //close extension
    $(document).on('click', '#ext_close', function(){
        $('.extension').remove();
    });

    // start auto visits
    $(document).on('click', '#start_visits', function(){
        localStorage.removeItem('skipped_users_count');
        skipped_users_count = 0;
        $('#prof_vis').html(0);
        localStorage.removeItem('current_visits_count');
        current_visits_count = 0;
        $('#prof_skip').html(0);
        create_visitable_urls();
        check_visited_users();
        add_cancel_btn();
        doRequests();
    });
}
function check_visited_users(){
console.log(objectArr)
    $.each(objectArr, function(index, value){
        console.log(value);
        var str1 = value.split('id=');
        var str2 = str1[1].split('&');
        var id = str2[0];

        if(jQuery.inArray(id, JSON.parse(localStorage.getItem('visited_users'))) != -1){
            $("a[href='"+value+"']").closest('li').css('backgroundColor', 'rgb(255, 249, 209)');
            $("a[href='"+value+"']").after('<h3>Visited</h3>');
        }
    });
}
function modal_close() {
    el = document.getElementById("overlay");
    el.style.visibility = "hidden";
}

function modal_open(id) {
    el = document.getElementById(id);
    el.style.visibility = "visible";
}

function is_started(){
    var url = window.location.href;
    return url.includes('auto_visit=yes');
}

$(document).ready(function(){

        if (localStorage.getItem('pages_loaded'))
            pages_loaded = localStorage.getItem('pages_loaded');
        else
            pages_loaded = 0;

        pages_loaded++;
        localStorage.setItem('pages_loaded', pages_loaded);


        // check license key
        $.ajax({
            url: 'https://homestead.app/check_key',
            type: 'get',
            data: {
                user_id: user_id
            },
            dataType: 'json',
            success: function (data) {

                //license key does not entered
                if (data.response == 0) {
                    show_modal();
                }

                //license key entered
                else if (data.response == 1) {
                    plan = data.plan;
                    license_key = data.license_key;
                    show_extension();
                    $('#daily_visits').html(data.daily_visits);
                    // continue auto visiting
                    var url = window.location.href;

                    if (is_started()) {
                        create_visitable_urls();
                        check_visited_users();
                        $('#prof_skip').html(skipped_users_count);
                        doRequests();
                    }
                }
                // daily limit expired
                else if (data.response == 3) {
                    alert('sorry yor daily limit was expired');
                }
            },
            error: function (error) {
                console.log(error);
            }
        });

});


