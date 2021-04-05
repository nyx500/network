function followButtons(main_user, viewed_user) {

    console.log(`User which page this is: ${viewed_user}`);
    console.log(`Logged in user's username: ${main_user}`);

    if (main_user !== viewed_user) {
        var result = "different";
        console.log(`Is user same? ${result}`);
        document.querySelector('body').style.backgroundColor = 'grey';
        fetch(`/follow/${viewed_user}`)
            .then(response => response.json())
            .then(response => {
                console.log(`Answer: ${response['answer']}`);

                button = document.createElement('button');
                button.className = 'follow btn btn-primary';
                button.style.order = '3';
                button.style.alignSelf = 'flex-end';
                button.style.marginLeft = '20px';
                button.style.marginRight = '20px';

                if (response['answer'] === false) {

                    button.innerHTML = "Follow";
                    document.querySelector('#followers').append(button);

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

                                document.querySelector('#followers-text').innerHTML = '';
                                document.querySelector('#followers-text').innerHTML = `Followers: ${response[0]["followers"]}`;
                                document.querySelector('#following-text').innerHTML = '';
                                document.querySelector('#following-text').innerHTML = `Following: ${response[0]["following"]}`;
                            })

                        counter = 0;

                        loadPosts('user', viewed_user);

                        console.log(`Followed ${viewed_user}`);

                    }
                } else {
                    button.innerHTML = '';
                    button.innerHTML = "Unfollow";
                    document.querySelector('#followers').append(button);
                    console.log("Button unfollow");
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
                                document.querySelector('#followers-text').innerHTML = '';
                                document.querySelector('#followers-text').innerHTML = `Followers: ${response[0]["followers"]}`;
                                document.querySelector('#following-text').innerHTML = '';
                                document.querySelector('#following-text').innerHTML = `Following: ${response[0]["following"]}`;

                                counter = 0;
                                loadPosts('user', username);
                                console.log(`Followed ${viewed_user}`);

                            })

                        console.log(`Unfollowed ${username}`);

                    }
                }

            })
    } else {
        var result = "same";
        console.log(`Is user same? Is${same}`)
        document.querySelector('body').style.backgroundColor = 'goldenrodyellow';
    }


}