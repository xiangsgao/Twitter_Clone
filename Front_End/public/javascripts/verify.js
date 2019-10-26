document.addEventListener('DOMContentLoaded', main);

function main() {
    $('#verify_form')[0].addEventListener('submit', submit_form);
}


async function submit_form(event){
    event.preventDefault();
    let email = $('#email')[0].value;
    let token = $('#token')[0].value;
    try{
        const response = await postData('/verify', {email: email, key: token});
        if(response.status === 'error') throw new Error(response.error);
        $(location).attr('href', '/login');
    }catch (err) {
        alert(`Got this error: ${err.message}`);
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