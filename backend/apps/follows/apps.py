from django.apps import AppConfig


class FollowsConfig(AppConfig):
    name = 'apps.follows'

    def ready(self):
        import apps.follows.signals