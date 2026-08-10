from django.apps import AppConfig


class LikesConfig(AppConfig):
    name = 'apps.likes'

    def ready(self):
        import apps.likes.signals