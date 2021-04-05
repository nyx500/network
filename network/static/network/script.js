let counter = 0;

const quantity = 10;

document.addEventListener('DOMContentLoaded', function() {

    loadPosts('all', null);

    if (document.getElementById('user_username')) {
        window.user = JSON.parse(document.getElementById('user_username').textContent);
    } else {
        window.user = null;
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

    if (window.user != null) {

        document.querySelector('#username').addEventListener('click', () => {
            document.querySelector('body').style.backgroundColor = 'green';
            counter = 0;
            loadPosts('user', window.user);

        })

        document.querySelector('#follow-link').addEventListener('click', () => {
            document.querySelector('body').style.backgroundColor = 'orange';
            counter = 0;
            username = JSON.parse(document.getElementById('user_username').textContent);
            document.querySelector("#followers").style.display = 'none';
            document.querySelector("#follow-button-div").style.display = 'none';
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

    console.log(`Counter: ${counter}`);
    const start = counter;
    const end = start + quantity - 1;
    counter = end + 1;

    if (document.querySelector('#new-post')) {
        document.querySelector('#new-post').style.display = 'block';
    }

    if (document.querySelector('button')) {
        document.querySelector('button').remove();
    }

    if (page === 'all') {

        if (document.querySelector('#title') !== null) {
            document.querySelector('#title-text').innerHTML = 'All Posts';
            document.querySelector('#title').onclick = () => {
                counter = 0;
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
                console.log(`All posts: ${posts}`)
                console.log(`pages loaded: ${posts[1]["pages_loaded"]}`)
                console.log(`earlier: ${posts[2]["earlier"]}`)
                var actual_posts = posts[0]["posts"];
                actual_posts.forEach(post => {
                    printPost(post);
                })

                pagination(posts, 'all', username);
            })

    } else if (page === 'following') {

        if (document.querySelector('#new-post')) {
            document.querySelector('#new-post').style.display = 'none';
        }

        if (document.querySelector('#title') !== null) {
            document.querySelector('#title-text').innerHTML = 'Following';
            document.querySelector('#title').onclick = () => {
                counter = 0;
                loadPosts('following', username);
            }
        }

        fetch(`/view_posts/${page}?start=${start}&end=${end}`)
            .then(response => response.json())
            .then(posts => {
                while (document.querySelector('.individual-post')) {
                    document.querySelectorAll('.individual-post').forEach(post => {
                        post.remove();
                    })
                }
                console.log(`Followed posts: ${posts}`);
                posts[0]["posts"].forEach(post => {
                    printPost(post);
                })

                pagination(posts, 'following', username);
            })

    } else if (page === 'user') {

        document.querySelector("#followers").style.display = 'flex';
        document.querySelector("#follow-button-div").style.display = 'flex';

        if (document.querySelector('#new-post')) {
            document.querySelector('#new-post').style.display = 'none';
        }

        if (document.querySelector('#title') !== null) {
            document.querySelector('#title-text').innerHTML = `${username}`;
            document.querySelector('#title').onclick = () => {
                counter = 0;
                loadPosts('user', username);
            }
        }

        fetch(`/get_user/${username}`)
            .then(response => response.json())
            .then(response => {
                JSON.stringify(response);
                document.querySelector('#followers-text').innerHTML = `Followers: ${response[0]["followers"]}`;
                document.querySelector('#following-text').innerHTML = `Following: ${response[0]["following"]}`;
            })

        fetch(`/view_posts/${username}?start=${start}&end=${end}`)
            .then(response => response.json())
            .then(posts => {
                while (document.querySelector('.individual-post')) {
                    document.querySelectorAll('.individual-post').forEach(post => {
                        post.remove();
                    })
                }
                posts[0]["posts"].forEach(post => {
                    printPost(post);
                })
                pagination(posts, 'user', username);
            })

        if (window.user) {
            followButtons(window.user, username);
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
    postDiv.className = "individual-post";
    const userTimeDiv = document.createElement('div');
    userTimeDiv.style.display = 'flex';
    userTimeDiv.style.flexDirection = 'row';
    userTimeDiv.style.flexWrap = 'nowrap';
    userTimeDiv.style.justifyContent = 'space-between';
    userTimeDiv.style.order = '1';

    const username = document.createElement('h2');
    username.innerHTML = `${post.user}`;
    username.className = 'username-link';

    username.onclick = function() {
        counter = 0;
        loadPosts('user', post.user);
    }

    userTimeDiv.append(username);

    const timestamp = document.createElement('h5');
    timestamp.innerHTML = `${post.timestamp}`;
    timestamp.style.order = '2';
    timestamp.style.alignSelf = 'flex-end';
    userTimeDiv.append(timestamp);
    const post_body = document.createElement('h6');
    post_body.className = 'post-body'
    post_body.innerHTML = post.body;

    const likes_flex = document.createElement('div');
    likes_flex.className = 'likes-flex';
    const likes = document.createElement('h6');
    likes.innerHTML = `Likes: ${post.likes}`;
    likes.className = 'likes';
    likes_flex.append(likes);

    if (post.user === window.user) {
        edit_button = document.createElement('button');
        edit_button.className = 'edit-button btn btn-light';
        edit_button.innerHTML = "Edit";
        likes_flex.append(edit_button);
    }

    postDiv.append(userTimeDiv);
    postDiv.append(post_body);
    postDiv.append(likes_flex);

    if (document.querySelector('#all-posts') !== null) {
        document.querySelector('#all-posts').append(postDiv);
    }
}

function pagination(posts, page, username) {

    if (document.querySelector('.next-button')) {
        document.querySelector('.next-button').remove();
    }

    if (document.querySelector('.previous-button')) {
        document.querySelector('.previous-button').remove();
    }

    if (posts[2]["earlier"] === true) {
        const previous = document.createElement('button');
        previous.innerHTML = "Previous";
        previous.className = "previous-button btn btn-primary";
        previous.style.marginRight = '10px';
        document.querySelector('#all-posts').append(previous);
        previous.addEventListener('click', () => {
            if (counter - quantity >= 0) {
                counter -= quantity * 2;
            } else {
                counter = 0;
            }
            loadPosts(page, username);
        })
    } else {
        if (document.querySelector('.previous-button')) {
            document.querySelector('.previous-button').remove;
        }
    }

    if (posts[1]["pages_loaded"] == "more_posts") {
        const next = document.createElement('button');
        next.innerHTML = "Next";
        next.className = "next-button btn btn-primary";
        document.querySelector('#all-posts').append(next);
        next.addEventListener('click', () => {
            loadPosts(page, username);
        })
    }
}


// Toggles follow and unfollow buttons when user clicks on them and sends a put request to the server to update lists of followers for a user
function followButtons(main_user, viewed_user) {

    if (main_user !== viewed_user) {

        button = document.createElement('button');
        button.className = 'follow btn btn-primary';
        document.querySelector('#follow-button-div').append(button);

        fetch(`/follow/${viewed_user}`)
            .then(response => response.json())
            .then(response => {
                console.log(`Answer: ${response['answer']}`);
                if (response['answer'] === false) {

                    button.innerHTML = "Follow";

                    button.onclick = () => {

                        fetch(`/follow/${viewed_user}`, {
                                method: 'PUT',
                                body: JSON.stringify({
                                    follow: "yes"
                                })
                            })
                            .catch(err => console.log(err));

                        fetch(`/get_user/${viewed_user}`)
                            .then(response => response.json())
                            .then(response => {
                                document.querySelector('#followers-text').innerHTML = `Followers: ${response[0]["followers"]}`;
                                document.querySelector('#following-text').innerHTML = `Following: ${response[0]["following"]}`;
                            })

                        counter = 0;
                        loadPosts('user', viewed_user);

                    }
                } else {
                    button.innerHTML = "Unfollow";
                    button.onclick = () => {

                        fetch(`/follow/${viewed_user}`, {
                                method: 'PUT',
                                body: JSON.stringify({
                                    follow: "no"
                                })
                            })
                            .catch(err => console.log(err));

                        fetch(`/get_user/${viewed_user}`)
                            .then(response => response.json())
                            .then(response => {

                                document.querySelector('#followers-text').innerHTML = `Followers: ${response[0]["followers"]}`;
                                document.querySelector('#following-text').innerHTML = `Following: ${response[0]["following"]}`;

                                counter = 0;
                                loadPosts('user', viewed_user);

                            })

                    }
                }

            })
    }
}