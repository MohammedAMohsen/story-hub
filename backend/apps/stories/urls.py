from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


urlpatterns = []

router = DefaultRouter()
router.register('stories', views.StoryViewSet, basename='stories')
router.register('category', views.CategoryViewSet, basename='category')
urlpatterns += router.urls