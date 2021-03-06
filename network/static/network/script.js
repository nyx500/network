let counter = 0;

const quantity = 10;

document.addEventListener('DOMContentLoaded', function() {

    // Automatically loads all posts
    loadPosts('all', null);

    // Gets and stores the user's username from template if user is logged in
    if (document.getElementById('user_username')) {
        window.user = JSON.parse(document.getElementById('user_username').textContent);
    } else {
        window.user = null;
    }

    document.querySelector('#network').addEventListener('click', () => {
        loadPosts('all', null);
    })
    document.querySelector('#all').addEventListener('click', () => {
        loadPosts('all', null);
    })
    if (window.user != null) {
        document.querySelector('#username').addEventListener('click', () => {
            counter = 0;
            loadPosts('user', window.user);
        })
        document.querySelector('#follow-link').addEventListener('click', () => {
            counter = 0;
            document.querySelector("#followers").style.display = 'none';
            document.querySelector("#follow-button-div").style.display = 'none';
            loadPosts('following', window.user);
        })
    }
    // Clears posts when page loaded
    while (document.querySelector('.individual-post')) {
        document.querySelectorAll('.individual-post').forEach(post => {
            post.remove();
        })
    }
});

function loadPosts(page, username) {

    // Sets a counter for pagination purposes
    console.log(`Counter: ${counter}`);
    const start = counter;
    const end = start + quantity - 1;
    counter = end + 1;

    // Displays the new post form
    if (document.querySelector('#new-post')) {
        document.querySelector('#new-post').style.display = 'block';
    }

    if (document.querySelector('button')) {
        document.querySelector('button').remove();
    }

    if (page === 'all') {

        if (document.querySelector('#new-post')) {
            document.querySelector('#new-post').style.display = 'block';
            document.querySelector('#new-button').onclick = function() {
                newPost(page, username);
            }

        }

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

        fetchPostsFromDatabase(page, start, end, username);

    } else if (page === 'following') {

        // Hides new post form when on the Following page
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

        fetchPostsFromDatabase(page, start, end, username);

    } else if (page === 'user') {

        // Displays number of followers for that user
        document.querySelector("#followers").style.display = 'flex';
        document.querySelector("#follow-button-div").style.display = 'flex';

        // Displays new form only if user is same as the user who is logged in
        if (document.querySelector('#new-post')) {
            if (window.user !== username) {
                document.querySelector('#new-post').style.display = 'none';
            } else {
                document.querySelector('#new-post').style.display = 'block';
                document.querySelector('#new-post-input').value = '';
                document.querySelector('#new-button').onclick = function() {
                    newPost('user', username);
                }
            }
        }
        if (document.querySelector('#title') !== null) {
            document.querySelector('#title-text').innerHTML = `${username}`;
            document.querySelector('#title').onclick = () => {
                counter = 0;
                loadPosts('user', username);
            }
        }

        // Gets the user object from the database for the user's page to display data on following and followers
        fetch(`/get_user/${username}`)
            .then(response => response.json())
            .then(response => {
                JSON.stringify(response);
                document.querySelector('#followers-text').innerHTML = `Followers: ${response[0]["followers"]}`;
                document.querySelector('#following-text').innerHTML = `Following: ${response[0]["following"]}`;
            })

        fetchPostsFromDatabase(page, start, end, username);

        if (window.user) {
            followButtons(window.user, username);
        }
    }
}

// Creates a new post and updates the current page with the new post
function newPost(page, username) {

    let postObj = {
        body: `${document.querySelector('#new-post-input').value}`
    };

    fetch('/post', {
            method: 'POST',
            body: JSON.stringify(postObj)
        })
        .then(response => response.json())
        .then(result => {
            console.log(`New Post: ${result}`);
        })
        .then(() => {
            if (page === 'all') {
                counter = 0;
                loadPosts('all', username);
            } else if (page === 'user') {
                counter = 0;
                loadPosts('user', username);
            }
        })
        .catch(err => console.log(err));
}

// Creates a new post div for every post along with edit option if the post's user is the same user who is logged in
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

    // Allows like option only if the user is logged in
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

function fetchPostsFromDatabase(page, start, end, username) {

    if (document.querySelector('#no-posts')) {
        document.querySelector('#no-posts').remove();
    }

    if (page === 'user') {
        var url_input = username;
    } else {
        var url_input = page;
    }

    fetch(`/view_posts/${url_input}?start=${start}&end=${end}`)
        .then(response => response.json())
        .then(posts => {
            while (document.querySelector('.individual-post')) {
                document.querySelectorAll('.individual-post').forEach(post => {
                    post.remove();
                })
            }
            console.log(`Posts: ${posts[0]["posts"].length}`)
            if (posts[0]["posts"].length === 0 && page !== 'all') {
                const no_posts = document.createElement('div');
                no_posts.innerHTML = '<h5>There are no posts yet</h5>';
                no_posts.id = 'no-posts';
                document.querySelector('#index-container').append(no_posts);
            }
            var new_posts = posts[0]["posts"];
            new_posts.forEach(post => {
                printPost(page, username, post);
            })

            pagination(posts, page, username);
        })
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