from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class User(AbstractUser):
    following = models.ManyToManyField('self', related_name='followers', symmetrical=False)

    def serialize(self):
         return {
            "id": self.id,
            "username": self.username,
            "following": self.following.all().count(),
            "followers": self.followers.all().count()
        }

class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes.all().count()
        }

class Like(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="likes")
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p")
        }


