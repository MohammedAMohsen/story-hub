from django.apps import AppConfig


class StoriesConfig(AppConfig):
    name = 'apps.stories'
    def ready(self):
        import apps.stories.signals