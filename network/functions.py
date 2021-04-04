def paginate(start, end, count_posts, posts):
    data = []
    if count_posts > start:
        if count_posts > end:
            for i in range(start, end + 1):
                data.append(posts[i])
                is_more = "more_posts"
        else:
            for i in range(start, count_posts + 1):
                data.append(posts[i])
                is_more = "last_posts"
    else:
            number_posts = int(len(posts))
            modulo = len(posts) % 10
            if modulo == 0:
                modulo = 10
            for i in range((count_posts + 1 - modulo), count_posts + 1):
                data.append(posts[i])
            is_more = "reloading_last"
    
    if data[0] == posts[0]:
        is_earlier = False
    else:
        is_earlier = True 
    
    all_posts = [post.serialize() for post in data]
    all_data = []
    dict_posts = {"posts": all_posts}
    all_data.append(dict_posts)
    dict_status = {"pages_loaded": is_more}
    all_data.append(dict_status)
    dict_earlier = {"earlier": is_earlier}
    all_data.append(dict_earlier)

    return all_data
            
