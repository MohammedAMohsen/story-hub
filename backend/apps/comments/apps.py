from django.apps import AppConfig


class CommentsConfig(AppConfig):
    name = 'apps.comments'
    def ready(self):
        import apps.comments.signals