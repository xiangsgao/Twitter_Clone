jQuery(document).ready(main);

let current_row = null;
let dummy_col = null;
let userName = '';

function main() {
    let sign_up = $('#sign_up')[0];
    let login = $('#login')[0];

    if(!sign_up.innerHTML.includes('Sign Up')){
        sign_up.href = '#';
        userName = sign_up.innerHTML.substring(56);
    }
    dummy_col = $('#dummy_col');
    current_row = dummy_col.parent();
    dummy_col.detach();
    login.addEventListener('click', login_link_on_click);
    build_ui();
}

async function build_ui(){
    try{
        let response = await fetch('/all_users_json');
        let responseJson = await response.json();
        responseJson.users.forEach((element => append_new_user(element)));
    }catch (err) {
        alert(`Can't load users, got this error: ${err.message}`);
    }
}

function append_new_user(user){
    if(current_row.children().size() === 4){
        let container = current_row.parent();
        container.append("<div class=\"row\"></div>>");
        current_row = container.children().eq(container.children.size() -1);
    }
    let new_card_col = dummy_col.clone();
    new_card_col.find('h5').html(user.username);
    new_card_col.find('.card-body').children().eq(1).html(`Email: ${user.email}`); // 2nd child of the card-body class div
    new_card_col.attr("id", user.username);

    let followers_count = new_card_col.find('#dummy_followers_count');
    followers_count.html(`Followers: ${user.followers_count}`);
    followers_count.attr("id", `followers_count-${user.username}`);
    let followers = new_card_col.find('#dummy_followers');
    followers.html(user.followers.join(', '));
    followers.attr("id", `followers-${user.username}`);

    let following_count = new_card_col.find('#dummy_following_count');
    following_count.html(`Following: ${user.following_count}`);
    following_count.attr("id", `following_count-${user.username}`)
    let following = new_card_col.find('#dummy_following');
    following.html(user.following.join(', '));
    following.attr("id", `following-${user.username}`);

    let link = new_card_col.find('a');
    link.attr("href", `/search_item/${user.username}`);

    let follow_btn = new_card_col.find('#dummy_follow_button');
    follow_btn.attr('id', `follow_btn-${user.username}`);
    if(userName === '' || user.username === userName){
        follow_btn.hide();
        current_row[0].appendChild(new_card_col[0]);
        return;
    }

    if(user.followers.includes(userName)){
        follow_btn.html("unfollow");
        follow_btn.removeClass("btn-primary");
        follow_btn.addClass("btn-secondary");
    }else{
        follow_btn.html("follow");
    }
    follow_btn.click(follow_button_handler);
    current_row[0].appendChild(new_card_col[0]);
}

async function login_link_on_click(event) {
    try {
        event.preventDefault();
        let response = await postData('/logout');
        if (response.status === 'error') {
            $(location).attr('href', '/login');
        } else {
            $(location).attr('href', '/main');
        }
    } catch (err) {
        alert(`Encounter Error: ${err.message}`);
    }
}

function update_user_follow_profile(target_user, follow){
    if(follow){
        let following_count = $(`#following_count-${userName}`);
        let temp = parseInt(following_count[0].innerHTML.substring(10)) + 1;
        following_count[0].innerHTML = `Following: ${temp}`;
        let following = $(`#following-${userName}`);
        let following_array = following[0].innerHTML.split(', ');
        following_array.push(target_user);
        following[0].innerHTML = (following_array.length > 1) ? following_array.join(', ') : following_array;
        let followers_count = $(`#followers_count-${target_user}`);
        temp = parseInt(followers_count[0].innerHTML.substring(10)) + 1;
        followers_count[0].innerHTML = `followers: ${temp}`;
        let followers = $(`#followers-${target_user}`);
        let followers_array = followers[0].innerHTML.split(', ');
        followers_array.push(userName);
        followers[0].innerHTML = (following_array.length > 1) ? followers_array.join(', ') : followers_array;
    }else{
        let following_count = $(`#following_count-${userName}`);
        let temp = parseInt(following_count[0].innerHTML.substring(10)) - 1;
        following_count[0].innerHTML = `Following: ${temp}`;
        let following = $(`#following-${userName}`);
        let following_array = following[0].innerHTML.split(', ');
        following_array.pop(target_user);
        following[0].innerHTML = (following_array.length > 1) ? following_array.join(', ') : following_array;
        let followers_count = $(`#followers_count-${target_user}`);
        temp = parseInt(followers_count[0].innerHTML.substring(10)) - 1;
        followers_count[0].innerHTML = `followers: ${temp}`;
        let followers = $(`#followers-${target_user}`);
        let followers_array = followers[0].innerHTML.split(', ');
        followers_array.pop(userName);
        followers[0].innerHTML = (following_array.length > 1) ? followers_array.join(', ') : followers_array;
    }
}

async function follow_button_handler(event){
    try{
        let button = event.currentTarget;
        let follow = (button.innerHTML === 'follow') ? true : false;
        let username = button.id.substring(11);
        let response = await postData('/follow', {username : username, follow : follow});
        if(response.status === 'error') throw new Error(`Server responded with ${response.error}`);
        if(follow){
            button.innerHTML = 'unfollow';
            button.classList.remove("btn-primary");
            button.classList.add("btn-secondary");
        }else {
            button.innerHTML = 'follow';
            button.classList.remove("btn-secondary");
            button.classList.add("btn-primary");
        }
        update_user_follow_profile(username, follow);
    }
    catch (err) {
        alert(`Got the following error message when button clicked: ${err.message}`);
    }
}


async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
}