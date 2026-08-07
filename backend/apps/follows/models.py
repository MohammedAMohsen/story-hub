from django.db import models
from django.db.models import Q, F
from django.conf import settings


class Follow(models.Model):
    follower = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='following_relationships')
    following = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='follower_relationships')
    # Things that can be added later:
    # created_at = ...
    # notifications_enabled = ...
    # favorite = ...
    # muted = ...

    class Meta:
        constraints = [
            models.UniqueConstraint(    
                fields=['follower', 'following'], 
                name='unique_user_Follow'
            ),
            models.CheckConstraint(
                condition=~Q(follower=F('following')),
                name='prevent_self_follow'
            )
        ]

    def __str__(self):
        return f"{self.follower} --> {self.following}"