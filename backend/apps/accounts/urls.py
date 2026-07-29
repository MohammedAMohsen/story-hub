from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


urlpatterns = []

router = DefaultRouter()
router.register('profile', views.ProfileViewSet, basename='profile')
urlpatterns += router.urls