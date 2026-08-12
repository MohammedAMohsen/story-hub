from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


urlpatterns = [
    path('google/', views.GoogleAuthAPIView.as_view(), name='google-auth'),
]

router = DefaultRouter()
router.register('profile', views.ProfileViewSet, basename='profile')
urlpatterns += router.urls