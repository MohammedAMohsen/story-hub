from django.urls import path
from . import views


urlpatterns = [
    path('like/', views.LikeAPIView.as_view(), name='like'),
]
