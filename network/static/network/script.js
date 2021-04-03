let counter = 0;

const quantity = 10;

document.addEventListener('DOMContentLoaded', function() {

    loadPosts('all', null);

    if (document.getElementById('user_username')) {
        var logged_in_username = JSON.parse(document.getElementById('user_username').textContent);
    } else {
        var logged_in_username = null;
    }

    if (document.querySelector('#new-post-form') !== null) {
        document.querySelector('#new-post-form').onsubmit = function() {
            getCookie('csrftoken');
            newPost();
        }
    }

    document.querySelector('#network').addEventListener('click', () => {
        loadPosts('all', null);
    })

    document.querySelector('#all').addEventListener('click', () => {
        loadPosts('all', null);
    })

    if (logged_in_username != null) {

        document.querySelector('#username').addEventListener('click', () => {
            loadPosts('user', logged_in_username);
            document.querySelector('body').style.backgroundColor = 'green';
        })

        document.querySelector('#follow-link').addEventListener('click', () => {
            document.querySelector('body').style.backgroundColor = 'orange';
            username = JSON.parse(document.getElementById('user_username').textContent);
            loadPosts('following', username);
        })
    }


    while (document.querySelector('.individual-post')) {
        document.querySelectorAll('.individual-post').forEach(post => {
            post.remove();
        })
    }

});

function loadPosts(page, username) {

    if (document.querySelector('#new-post')) {
        document.querySelector('#new-post').style.display = 'block';
    }

    if (document.querySelector('button')) {
        document.querySelector('button').remove();
    }

    if (page === 'all') {

        console.log(`Counter: ${counter}`);

        const start = counter;
        const end = start + quantity - 1;
        counter = end + 1;


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

        fetch(`/view_posts/${page}?start=${start}&end=${end}`)
            .then(response => response.json())
            .then(posts => {

                while (document.querySelector('.individual-post')) {
                    document.querySelectorAll('.individual-post').forEach(post => {
                        post.remove();
                    })
                }

                var actual_posts = posts[0]["posts"];
                actual_posts.forEach(post => {
                    printPost(post);
                })

                if (posts[1]["pages_loaded"] == "more_posts") {
                    const next = document.createElement('button');
                    next.innerHTML = "Next";
                    next.className = "next-button btn btn-primary";
                    document.querySelector('#all-posts').append(next);
                    next.addEventListener('click', () => {
                        loadPosts('all', null);
                    })
                } else {
                    if (document.querySelector('.next-button')) {
                        document.querySelector('.next-button').remove();
                    }
                }

                if (posts[2]["earlier"] === true) {
                    const previous = document.createElement('button');
                    previous.innerHTML = "Previous";
                    previous.className = "previous-button btn btn-primary";
                    document.querySelector('#all-posts').append(previous);
                    previous.addEventListener('click', () => {
                        if (counter - quantity >= 0) {
                            counter -= quantity * 2;
                        } else {
                            counter = 0;
                        }
                        loadPosts('all', null);

                    })
                } else {
                    if (document.querySelector('.previous-button')) {
                        document.querySelector('.previous-button').remove;
                    }
                }

            })
    } else if (page === 'following') {


        if (document.querySelector('#new-post')) {
            document.querySelector('#new-post').style.display = 'none';
        }

        if (document.querySelector('#title') !== null) {
            document.querySelector('#title-text').innerHTML = 'Following';
        }

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
                    console.log(posts);
                    printPost(post);
                })
            })

    } else if (page === 'user') {


        if (document.querySelector('#new-post')) {
            document.querySelector('#new-post').style.display = 'none';
        }

        fetch(`/get_user/${username}`)
            .then(response => response.json())
            .then(response => {

                JSON.stringify(response);

                document.querySelector('#followers-text').innerHTML = '';
                document.querySelector('#followers-text').innerHTML = `Followers: ${response[0]["followers"]}`;
                document.querySelector('#following-text').innerHTML = '';
                document.querySelector('#following-text').innerHTML = `Following: ${response[0]["following"]}`;

                console.log(`THIS PAGE'S USER: ${JSON.stringify(response)}`);
            })

        console.log(`USERNAME: ${username}`);

        if (document.querySelector('#title') !== null) {
            document.querySelector('#title-text').innerHTML = `${username}`;
            document.querySelector('#title-text').onclick = function() {
                loadPosts('user', username);
            }
        }

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

        if (document.getElementById('user_username')) {

            console.log(`User which page this is: ${username}`);
            console.log(`Logged in user's username: ${JSON.parse(document.getElementById('user_username').textContent)}`);

            if (username !== `${JSON.parse(document.getElementById('user_username').textContent)}`) {
                var result = "different";
            } else {
                var result = "same";
            }

            console.log(`Status: ${result}`);

            if (result === "different") {

                document.querySelector('body').style.backgroundColor = 'grey';

                fetch(`/follow/${username}`)
                    .then(response => response.json())
                    .then(response => {

                        var answer = response['answer']

                        console.log(`Answer: ${answer}`);

                        button = document.createElement('button');
                        button.className = 'follow btn btn-primary';
                        button.style.order = '3';
                        button.style.alignSelf = 'flex-end';
                        button.style.marginLeft = '20px';
                        button.style.marginRight = '20px';

                        if (response['answer'] === false) {
                            button.innerHTML = "Follow";
                            document.querySelector('#followers').append(button);
                            console.log("Button follow");
                            button.onclick = function() {

                                fetch(`/follow/${username}`, {
                                        method: 'PUT',
                                        body: JSON.stringify({
                                            follow: "yes"
                                        })
                                    })
                                    .catch(err => console.log(err));

                                fetch(`/get_user/${username}`)
                                    .then(response => response.json())
                                    .then(response => {

                                        document.querySelector('#followers-text').innerHTML = '';
                                        document.querySelector('#followers-text').innerHTML = `Followers: ${response[0]["followers"]}`;
                                        document.querySelector('#following-text').innerHTML = '';
                                        document.querySelector('#following-text').innerHTML = `Following: ${response[0]["following"]}`;

                                        console.log(`THIS PAGE'S USER: ${JSON.stringify(response)}`);
                                    })


                                loadPosts('user', username);

                                console.log(`Followed ${username}`);
                            }
                        } else {
                            button.innerHTML = '';
                            button.innerHTML = "Unfollow";
                            document.querySelector('#followers').append(button);
                            console.log("Button unfollow");
                            button.onclick = function() {

                                fetch(`/follow/${username}`, {
                                        method: 'PUT',
                                        body: JSON.stringify({
                                            follow: "no"
                                        })
                                    })
                                    .catch(err => console.log(err));


                                fetch(`/get_user/${username}`)
                                    .then(response => response.json())
                                    .then(response => {

                                        document.querySelector('#followers-text').innerHTML = '';
                                        document.querySelector('#followers-text').innerHTML = `Followers: ${response[0]["followers"]}`;
                                        document.querySelector('#following-text').innerHTML = '';
                                        document.querySelector('#following-text').innerHTML = `Following: ${response[0]["following"]}`;

                                        console.log(`THIS PAGE'S USER: ${JSON.stringify(response)}`);
                                        loadPosts('user', username);
                                    })

                                console.log(`Unfollowed ${username}`);
                            }
                        }

                    })
            } else {
                document.querySelector('body').style.backgroundColor = 'magenta';
            }
        }
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