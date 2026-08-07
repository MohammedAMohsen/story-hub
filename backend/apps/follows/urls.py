from django.urls import path
from . import views


urlpatterns = [
    path('follows/', views.FollowAPIView.as_view(), name='follows'),
]
