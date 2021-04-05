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