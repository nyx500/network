document.addEventListener('DOMContentLoaded', function() {

    loadPosts('all');

    document.querySelector('#new-post-form').onsubmit = function() {
        getCookie('csrftoken');
        newPost();
    }
});

function loadPosts(page) {

    if (page === 'all') {

        document.querySelector('#title').innerHTML = 'All Posts';
        document.querySelector('#index-container').style.display = 'grid';
        document.querySelector('body').style.backgroundColor = 'red';

        fetch(`/view_posts/${page}`)
            .then(response => response.json())
            .then(posts => {
                console.log(posts);
                posts.forEach(post => {
                    const postDiv = document.createElement('div');
                    postDiv.style.border = '1.6px solid black';
                    postDiv.style.padding = '5px';
                    postDiv.style.borderRadius = '6px';
                    const post_body = document.createElement('p');
                    post_body.innerHTML = post.body;
                    const username = document.createElement('h5');
                    username.innerHTML = post.user;
                    const time = document.createElement('h6');
                    time.innerHTML = post.timestamp;
                    postDiv.append(post_body);
                    postDiv.append(username);
                    postDiv.append(time);
                    document.querySelector('#all-posts').append(postDiv);
                })
            })
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
}