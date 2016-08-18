var peoplesArr = [];
var ajaxIndex = 0;
var plan;
var daily_visit_limit;
var license_key;
var page_visits_count = 0;
var total_visits;

if(localStorage.getItem('visited_users')){
    var visited_users = JSON.parse(localStorage.getItem('visited_users')) ;
}
else {
    var visited_users = [];
}

if(localStorage.getItem('skipped_users_count')){

    var skipped_users_count = JSON.parse(localStorage.getItem('skipped_users_count'));
}
else{
    var skipped_users_count = 0;
}

// get Linkedin authenticated user_id
var profile_url = $('#account-nav').find('a.account-toggle').attr('href');
var str1 = profile_url.split('id=');
var str2 = str1[1].split('&');
var user_id = str2[0];

function show_modal(){
    // add modal into template
    $('body').append(
        '<div id="overlay">'+
            '<div class="modal">'+
                '<div class="modal_header">'+
                    '<p>Enter your license key</p>'+
                    '<span id="close_modal" class="close">x</span>'+
                '</div>'+
                '<div class="modal_content">'+
                    '<form id="license_key_form">' +
                    '<input type="text" class="form-control" name="key">'+
                    '</form>'+
                '</div>'+
                '<div class="modal_bottom">'+
                    '<button id="key_submit">Save</button>'+
                    '<button class="close">Close</button>'+
                '</div>'+
            '</div>'+
        '</div>'
    );

    // open modal
    modal_open();

    $(document).on('click', '.close', function(){
        modal_close();
    });

    // submit key
    $(document).on('click', '#key_submit', function(){

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
                    modal_close();
                    show_extension();
                    total_visits = 0;
                }
            },
            error: function(error){
                alert('error: '+error);
            }
        });
    })
}
function next_page(){
alert('visited : '+page_visits_count);
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

    var str1 = peoplesArr[ajaxIndex].split('id=');
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
            if(ajaxIndex < peoplesArr.length) {
                doRequests();
            }
            else{
                next_page();
            }
        }
        else{
            // visiting
            $("a[href='"+peoplesArr[ajaxIndex]+"']").after('<h3 class="status">Visiting</h3>');
            $(document).find("a[href='"+  peoplesArr[ajaxIndex] +"']").parent('li').css('backgroundColor', '#cccccc');
            setTimeout(function(){
                doVisit();
            }, 5000);
        }

    }
    else{
        // visiting
        $("a[href='"+peoplesArr[ajaxIndex]+"']").after('<h3 class="status">Visiting</h3>');
        $(document).find("a[href='"+  peoplesArr[ajaxIndex] +"']").parent('li').css('backgroundColor', '#cccccc');
        setTimeout(function(){
            doVisit();
        }, 5000);
    }
}

function visitsCount(){
    $.ajax({
        url : 'https://homestead.app/visitsCount',
        type : 'get',
        data : {
            license_key : license_key
        }
    })
}

function doVisit() {

    // get visiting user id
    var str1 = peoplesArr[ajaxIndex].split('id=');
    var str2 = str1[1].split('&');
    var user_id = str2[0];

    // view user profile
    $.ajax({
        url: peoplesArr[ajaxIndex],
        type: 'get',
        success: function(data){
            page_visits_count ++;
            visited_users.push(user_id);
            localStorage.setItem('visited_users', JSON.stringify(visited_users));

            var visits_count = (JSON.parse(localStorage.getItem('visited_users'))).length;
            $('#prof_vis').html(visits_count);

            $("a[href='"+peoplesArr[ajaxIndex]+"']").closest('li').css('backgroundColor', 'rgb(255, 249, 209)');
            $('.status').remove();
            $("a[href='"+peoplesArr[ajaxIndex]+"']").after('<h3>Visited</h3>');

            if((total_visits + page_visits_count) > daily_visit_limit)

            ajaxIndex++;
            if(ajaxIndex < peoplesArr.length) {
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

    peoplesArr = [];
    var peoples = $('#results').find('.people').children('a').slice(0, 2);

    $.each(peoples, function(index, value){
        var url = $(value).attr('href');
        peoplesArr.push(url);
    });
}

function add_cancel_btn(){
    $('.btns').html('<button id="cancel">Cancel</button>');
    $('#cancel').on('click', function(){
        var url = window.location.href;
        var d=url.split('&auto_visit');
        var f= d[0];
        window.location.href=f;
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
                '<span>some content</span></span></p>'+
                    
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
                                '<li >Profiles Skipped: <span id="prof_skip"></span> </li>'+
                                '<li>Profiles Visited: <span id="prof_vis"></span></li>'+
                                '<li id="daily_vis">Daily Visit Limit: '+daily_visit_limit+'</li>'+
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

    // fill data
    if(localStorage.getItem('visited_users')) {
        var visits_count = (JSON.parse(localStorage.getItem('visited_users'))).length;
        $('#prof_vis').html(visits_count);
    }
    else{
        $('#prof_vis').html(0);
    }

     $('#prof_skip').html(skipped_users_count);

    // add cancel button
    // var url=window.location.href;
    // var is_started = url.includes('auto_visit=yes');
    if(is_started()){
        add_cancel_btn();
    }

    //close extension
    $(document).on('click', '#ext_close', function(){
        $('.ext_tmp').remove();
        location.reload();
    });

    // start auto visits
    $(document).on('click', '#start_visits', function(){
        localStorage.removeItem('skipped_users_count');
        skipped_users_count = 0;
        create_visitable_urls();
        check_visited_users();
        add_cancel_btn();
        doRequests();
    });
}
function check_visited_users(){

    $.each(peoplesArr, function(index, value){
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

function modal_open() {
    el = document.getElementById("overlay");
    el.style.visibility = "visible";
}

function is_started(){
    var url = window.location.href;
    return url.includes('auto_visit=yes');
}

$(document).ready(function(){

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
                else
                if (data.response == 1) {
                    plan = data.plan;
                    license_key = data.license_key;
                    show_extension();

                    // continue auto visiting
                    var url = window.location.href;
                    // var is_started = url.includes('auto_visit=yes');
                    if (is_started()) {
                        create_visitable_urls();
                        $('#prof_skip').html(localStorage.getItem('skipped_users_count'));
                        doRequests();
                    }
                }
            },
            error: function (error) {
                console.log( error);
            }
        });

});


