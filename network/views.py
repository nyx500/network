import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import *
from .functions import paginate


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

@csrf_exempt
@login_required
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

        all_data = paginate(start, end, all_posts)
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
                
            all_data = paginate(start, end, followed_posts)
            return JsonResponse(all_data, safe=False)
        else:
            return render(request, "network/login.html")
    else:
        if User.objects.filter(username=posts).exists():
            select_user = User.objects.get(username=posts)
            user_posts = select_user.posts.all().order_by('-timestamp')

            all_data = paginate(start, end, user_posts)
            return JsonResponse(all_data, safe=False)
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

    user = User.objects.get(username=username)

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
        "Error": "GET or PUT request required."
    }, status=400)

@csrf_exempt
@login_required
def edit(request, id):
    if request.method != "POST":
        return JsonResponse({"Error": "Only POST request is allowed."}, status=400)
    else:
        post = Post.objects.get(id=id)
        if post.user == request.user:
            data = json.loads(request.body)
            text = data.get("body", "")
            post.body = text
            post.save()
            return JsonResponse(text, safe=False)
        else:
            return JsonResponse({"Error": "You are not the user who created this post!!"}, status=400)

@csrf_exempt
@login_required
def like(request, post_id):
    if request.method == "GET":
        post = Post.objects.get(id=post_id)
        queryset = Like.objects.filter(user=request.user).filter(post=post)
        if len(queryset) == 1:
            response = {"action": "unlike"}
        elif len(queryset) == 0:
            response = {"action": "like"}
        else:
            response = {"action": "error"}
        return JsonResponse(response)
    elif request.method == "POST":
        post = Post.objects.get(id=post_id)
        data = json.loads(request.body)
        if data.get("body", "") == 'like':
            new_like = Like(
                user = request.user,
                post = post
            )
            new_like.save()
            return JsonResponse({"Success": "You liked this post"})
        elif data.get("body", "") == 'unlike':
            queryset = Like.objects.filter(user=request.user).filter(post=post)
            queryset[0].delete()
            return JsonResponse({"Success": "You unliked this post"})
        else:
            return JsonResponse({"Error": "You unliked this post"})
    else:
        JsonResponse({"Error": "Request method must be GET or POST"}, status=400)
    
   