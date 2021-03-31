document.addEventListener('DOMContentLoaded', function() {

    loadPosts('all', null);

    if (document.querySelector('#new-post-form') !== null) {
        document.querySelector('#new-post-form').onsubmit = function() {
            getCookie('csrftoken');
            newPost();
        }
    }


    document.querySelector('#username').addEventListener('click', () => {
        username = JSON.parse(document.getElementById('user_username').textContent);
        loadPosts('user', username);
        document.querySelector('body').style.backgroundColor = 'green';
    })

    while (document.querySelector('.individual-post')) {
        document.querySelectorAll('.individual-post').forEach(post => {
            post.remove();
        })
    }

});

function loadPosts(page, username) {

    console.log(page, );


    if (page === 'all') {

        if (document.querySelector('#title') !== null) {
            document.querySelector('#title-text').innerHTML = 'All Posts';
            document.querySelector('#title-text').onclick = function() {
                loadPosts('all', null);
            }
        }
        if (document.querySelector('#index-container') !== null) {
            document.querySelector('#index-container').style.display = 'grid';
        }

        document.querySelector('body').style.backgroundColor = 'red';

        fetch(`/view_posts/${page}`)
            .then(response => response.json())
            .then(posts => {
                console.log(posts);

                while (document.querySelector('.individual-post')) {
                    document.querySelectorAll('.individual-post').forEach(post => {
                        post.remove();
                    })
                }

                posts.forEach(post => {
                    printPost(post);
                })
            })
    }

    if (page === 'user') {

        if (document.querySelector('#new-post')) {
            document.querySelector('#new-post').style.display = 'none';
        }
        console.log(`USERNAME: ${username}`);

        if (document.querySelector('#title') !== null) {
            document.querySelector('#title-text').innerHTML = `${username}`;
            document.querySelector('#title-text').onclick = function() {
                loadPosts('user', username);
            }
        }

        fetch(`/get_user/${username}`)
            .then(response => response.json())
            .then(response => {
                JSON.stringify(response);
                document.querySelector('#followers-text').innerHTML = `Followers: ${response[0].followers}`;
                document.querySelector('#following-text').innerHTML = `Following: ${response[0].following}`;
                console.log(`USER: ${JSON.stringify(response)}`);
                if (document.getElementById('user_username')) {
                    console.log(`User Response: ${response[0].username}`);
                    console.log(`User username: ${JSON.parse(document.getElementById('user_username').textContent)}`);
                    if (response[0].username === JSON.parse(document.getElementById('user_username').textContent)) {
                        document.querySelector('body').style.backgroundColor = 'grey';
                    }
                }


            })


        fetch(`/view_posts/${username}`)
            .then(response => response.json())
            .then(posts => {
                console.log(posts);

                while (document.querySelector('.individual-post')) {
                    document.querySelectorAll('.individual-post').forEach(post => {
                        post.remove();
                    })
                }

                posts.forEach(post => {
                    printPost(post);
                })
            })
    }

}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function newPost() {

    let csrftoken = getCookie('csrftoken');

    let postObj = {
        body: `${document.querySelector('#new-post-input').value}`,
        csrfmiddlewaretoken: csrftoken,
    };

    fetch('/post', {
            method: 'POST',
            body: JSON.stringify(postObj),
            headers: { "X-CSRFToken": csrftoken },
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));

}

function printPost(post) {

    const postDiv = document.createElement('div');
    const individual_post = "individual-post";
    var arr1 = postDiv.className.split(" ");
    if (arr1.indexOf(individual_post) == -1) {
        postDiv.className += " " + individual_post;
    }

    postDiv.style.border = '1.6px solid black';
    postDiv.style.padding = '5px';
    postDiv.style.borderRadius = '6px';
    postDiv.style.marginBottom = '10px';
    postDiv.style.display = 'flex';
    postDiv.style.flexDirection = 'column';
    postDiv.style.flexWrap = 'wrap';
    const userTimeDiv = document.createElement('div');
    userTimeDiv.style.display = 'flex';
    userTimeDiv.style.flexDirection = 'row';
    userTimeDiv.style.flexWrap = 'nowrap';
    userTimeDiv.style.justifyContent = 'space-between';
    userTimeDiv.style.order = '1';

    const username = document.createElement('h2');
    username.innerHTML = `${post.user}`;
    username.style.order = '1';
    username.style.alignSelf = 'flex-start';

    username.onclick = function() {
        loadPosts('user', post.user);
    }

    const username_link = "username-link";
    var arr2 = username.className.split(" ");
    if (arr2.indexOf(username_link) == -1) {
        username.className += " " + username_link;
    }

    userTimeDiv.append(username);

    const timestamp = document.createElement('h5');
    timestamp.innerHTML = `${post.timestamp}`;
    timestamp.style.order = '2';
    timestamp.style.alignSelf = 'flex-end';
    userTimeDiv.append(timestamp);
    const post_body = document.createElement('h6');
    post_body.innerHTML = post.body;
    post_body.style.order = '2';
    post_body.style.alignSelf = 'stretch';
    const likes = document.createElement('h6');
    likes.innerHTML = `Likes: ${post.likes}`;
    likes.style.order = '3';
    likes.style.alignSelf = 'flex-start';
    postDiv.append(userTimeDiv);
    postDiv.append(post_body);
    postDiv.append(likes);
    if (document.querySelector('#all-posts') !== null) {
        document.querySelector('#all-posts').append(postDiv);
    }
}