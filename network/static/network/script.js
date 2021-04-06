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
                console.log(posts)
                var actual_posts = posts[0]["posts"];
                actual_posts.forEach(post => {
                    printPost('all', username, post);
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
                console.log(posts);
                posts[0]["posts"].forEach(post => {
                    printPost('following', username, post);
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
                    printPost('user', username, post);
                })
                pagination(posts, 'user', username);
            })

        if (window.user) {
            followButtons(window.user, username);
        }
    }
}

function newPost() {

    let postObj = {
        body: `${document.querySelector('#new-post-input').value}`
    };

    fetch('/post', {
            method: 'POST',
            body: JSON.stringify(postObj)
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));

}

function printPost(page, username, post) {

    const postDiv = document.createElement('div');
    postDiv.className = "individual-post";
    const userTimeDiv = document.createElement('div');
    userTimeDiv.style.display = 'flex';
    userTimeDiv.style.flexDirection = 'row';
    userTimeDiv.style.flexWrap = 'nowrap';
    userTimeDiv.style.justifyContent = 'space-between';
    userTimeDiv.style.order = '1';

    const username_heading = document.createElement('h2');
    username_heading.innerHTML = `${post.user}`;
    username_heading.className = 'username-link';

    username_heading.onclick = function() {
        counter = 0;
        loadPosts('user', post.user);
    }

    userTimeDiv.append(username_heading);

    const timestamp = document.createElement('h5');
    timestamp.innerHTML = `${post.timestamp}`;
    timestamp.style.order = '2';
    timestamp.style.alignSelf = 'flex-end';
    userTimeDiv.append(timestamp);
    const post_container = document.createElement('div');
    post_container.className = 'post-container';
    const post_body = document.createElement('h6');
    post_body.className = 'post-body'
    post_body.innerHTML = post.body;
    post_container.append(post_body);
    const input_container = document.createElement('div');
    input_container.className = 'input-container';
    const text_input = document.createElement('textarea');
    text_input.id = 'textInput';
    text_input.className = 'text-input';
    text_input.cols = "144";
    text_input.rows = "3";
    text_input.style.display = 'none';
    input_container.append(text_input);
    const submit = document.createElement('button');
    submit.id = 'submit';
    submit.className = 'submit-button btn btn-primary';
    submit.innerHTML = "Save";
    submit.style.display = 'none';
    input_container.append(submit);
    post_container.append(input_container);

    const likes_flex = document.createElement('div');
    likes_flex.className = 'likes-flex';
    const likes = document.createElement('h6');
    likes.innerHTML = `Likes: ${post.likes}`;
    likes.className = 'likes';
    likes_flex.append(likes);
    const like_div = document.createElement('div');
    like_div.className = "like-div";
    likes_flex.append(like_div);

    if (window.user !== null) {
        fetch(`/like/${post.id}`)
            .then(response => response.json())
            .then(response => {
                if (response["action"] === "like") {
                    const heart = document.createElement('img');
                    heart.src = "static/network/blackheart.png";
                    heart.id = 'heart';
                    like_div.append(heart);
                    like_div.onclick = () => {
                        fetch(`/like/${post.id}`, {
                                method: 'POST',
                                body: JSON.stringify({
                                    body: 'like'
                                })
                            })
                            .then(response => response.json())
                            .then(response => {
                                counter -= quantity;
                                if (page === 'all') {
                                    loadPosts('all', null);
                                } else if (page === 'user') {
                                    loadPosts('user', username);
                                } else if (page === 'following') {
                                    loadPosts('following', username);
                                }
                            })
                            .catch(err => console.log(err));
                    }
                } else if (response["action"] === "unlike") {
                    const heart = document.createElement('img');
                    heart.src = "static/network/heart.png";
                    heart.id = 'heart';
                    like_div.append(heart);
                    like_div.onclick = () => {
                        fetch(`/like/${post.id}`, {
                                method: 'POST',
                                body: JSON.stringify({
                                    body: 'unlike'
                                })
                            })
                            .then(response => response.json())
                            .then(response => {
                                counter -= quantity;
                                if (page === 'all') {
                                    loadPosts('all', null);
                                } else if (page === 'user') {
                                    loadPosts('user', username);
                                } else if (page === 'following') {
                                    loadPosts('following', username);
                                }
                            })
                            .catch(err => console.log(err));
                    }
                } else {}
            })
            .catch(err => console.log(err));
    }

    if (post.user === window.user) {
        edit_button = document.createElement('button');
        edit_button.className = 'edit-button btn btn-light';
        edit_button.innerHTML = "Edit";
        likes_flex.append(edit_button);

        edit_button.onclick = () => {
            post_body.style.display = 'none';
            likes_flex.remove();
            text_input.style.display = 'block';
            submit.style.display = 'block';
            text_input.innerHTML = post.body;
            submit.addEventListener("click", (event) => {
                event.preventDefault();
                let input_text = text_input.value;
                let newTextObj = {
                    body: `${input_text}`
                };
                fetch(`/edit/${post.id}`, {
                        method: 'POST',
                        body: JSON.stringify(newTextObj)
                    })
                    .then(response => response.json())
                    .then(result => {
                        counter -= quantity;
                        if (page === 'all') {
                            loadPosts('all', null);
                        } else if (page === 'user') {
                            loadPosts('user', username);
                        }
                    })
                    .catch(err => console.log(err));

            })
        }
    }

    postDiv.append(userTimeDiv);
    postDiv.append(post_container);
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
        if (document.querySelector('#all-posts')) {
            document.querySelector('#all-posts').append(next);
            next.addEventListener('click', () => {
                loadPosts(page, username);
            })
        }
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