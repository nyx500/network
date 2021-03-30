posts.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.style.border = '1.6px solid black';
            postDiv.style.padding = '5px';
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