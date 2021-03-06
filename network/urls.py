
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.post, name="post"),
    path("view_posts/<str:posts>", views.view_posts, name="posts"),
    path("get_user/<str:username>", views.get_user, name="get_user"),
    path("follow/<str:username>", views.follow, name="follow"),
    path("edit/<int:id>", views.edit, name="edit"),
    path("like/<int:post_id>", views.like, name="like"),
]
