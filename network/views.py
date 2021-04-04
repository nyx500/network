import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.views.generic import ListView
from .models import *
import time
import math


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def post(request):

    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    data = json.loads(request.body)

    post = data.get("body", "")

    new_post = Post(
        user = request.user,
        body = post
    )
    new_post.save()

    return JsonResponse({"message": "Post submitted successfully"}, status=201)


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def view_posts(request, posts): 

    start = int(request.GET.get("start") or 0)
    end = int(request.GET.get("end") or (start + 9))

    if posts == 'all':

        all_posts = Post.objects.all().order_by('-timestamp')

        data = []

        amount = len(all_posts) - 1

        if amount > start:
            if amount > end:
                for i in range(start, end + 1):
                    data.append(all_posts[i])
                    is_more = "more_posts"
            else:
                for i in range(start, amount + 1):
                    data.append(all_posts[i])
                    is_more = "last_posts"
        else:
            number_posts = int(len(all_posts))
            modulo = len(all_posts) % 10
            if modulo == 0:
                modulo = 10
            multiples_10 = math.floor(amount/10)
            for i in range((amount + 1 - modulo), amount + 1):
                data.append(all_posts[i])
            is_more = "reloading_last"
        
        if data[0] == all_posts[0]:
            is_earlier = False
        else:
            is_earlier = True 

        posts = [post.serialize() for post in data]
        all_data = []
        dict_posts = {"posts": posts}
        all_data.append(dict_posts)
        dict_status = {"pages_loaded": is_more}
        all_data.append(dict_status)
        dict_earlier = {"earlier": is_earlier}
        all_data.append(dict_earlier)

        return JsonResponse(all_data, safe=False)

    elif posts == 'following':
            if request.user.is_authenticated:
                user = request.user
                followed_users = user.following.all()
                followed_posts = []
                all_posts = Post.objects.all().order_by('-timestamp')
                for post in all_posts:
                    if post.user in followed_users:
                        followed_posts.append(post)
                return JsonResponse([post.serialize() for post in followed_posts], safe=False)
            else:
                return JsonResponse({"ERROR": "Please log in"})
    else:
        if User.objects.filter(username=posts).exists():
            select_user = User.objects.get(username=posts)
            user_posts = select_user.posts.all().order_by('-timestamp')
            return JsonResponse([post.serialize() for post in user_posts], safe=False)
        else:
            return JsonResponse({"Error": "No such user/page"})

def get_user(request, username):
    if User.objects.filter(username=username).exists():
        users = User.objects.filter(username=username)
    else:
        return JsonResponse({"ERROR": "No such user exists"})
    return JsonResponse([user.serialize() for user in users], safe=False)

@csrf_exempt
@login_required
def follow(request, username):

    username1 = username
    user = User.objects.get(username=username1)

    if request.method == "GET":
        followers = user.followers.all()
        if request.user in followers:
            return JsonResponse({'answer': True})
        else:
            return JsonResponse({'answer': False})

    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("follow") is not None:
            if data["follow"] == "yes":
                request.user.following.add(user)
            else:
                request.user.following.remove(user)
            request.user.save()
        return HttpResponse(status=204)

    
    
    else:
        return JsonResponse({
        "error": "GET or PUT request required."
    }, status=400)