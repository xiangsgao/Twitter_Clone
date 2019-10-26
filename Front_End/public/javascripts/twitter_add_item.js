document.addEventListener('DOMContentLoaded', main);

let dummy;
let userName ='';

function main() {
    let sign_up = $('#sign_up')[0];
    let login = $('#login')[0];

    if(!sign_up.innerHTML.includes('Sign Up')){
        sign_up.href = '#';
        userName = sign_up.innerHTML.substring(56);
    }

    login.addEventListener('click', login_link_on_click);
    dummy = $('#dummy');
    dummy.detach();
    $('#model_Add_button')[0].addEventListener('click', modal_add_handler);
    populate_time_line();
}

async function modal_add_handler(event){
    try{
        let new_content = $('#new_tweet_content')[0].value;
        let response = await postData('/additem', {content:new_content});
        if(response.status === 'error') throw new Error(`Server responded with ${response.error}`);
        let tweet = await fetch(`/item/${response.id}`);
        let tweet_json = await tweet.json();
        append_to_time_line(tweet_json.item);
        $('#new_tweet_model').modal('toggle');
    }catch (err) {
        alert(`Caught this error when adding item: ${err.message}`);
    }
}

async function populate_time_line(){
    try{
        let response = await postData('/search', {username:userName});
        let items = response.items;
        items.forEach((element, index) =>{
            append_to_time_line(element);
        });
    }catch (err) {
        alert(`Page encountered this error when loading: ${err.message}`);
    }
}

function append_to_time_line(element){
    let new_tweet = dummy.clone();
    new_tweet.attr('id', `${element.id}`);
    let label = new_tweet.find('#tweet_title');
    label.attr('id', `title-${element.id}`)
    let content = new_tweet.find('#tweet_content');
    content.attr('id', `content-${element.id}`)
    let properties = new_tweet.find('#tweet_properties');
    properties.attr('id', `properties-${element.id}`)
    let date = new Date(element.timestamp);
    label[0].innerHTML = `<p>${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()} ${element.username} said:</p>`;
    content[0].innerHTML = element.content;
    properties[0].innerHTML = `likes: ${element.property.likes} retweeted:${element.retweeted} id:${element.id}`;
    $('#time_line').append(new_tweet);
}

async function login_link_on_click(event){
    try{
        event.preventDefault();
        let response = await postData('/logout');
        if(response.status === 'error'){
            $(location).attr('href', '/login');
        }
        else{
            $(location).attr('href', '/main');
        }
    }
    catch (err) {
        alert(`Encounter Error: ${err.message}`);
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
