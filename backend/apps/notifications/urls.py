from django.urls import path
from . import views


urlpatterns = [
    path('notifications-count/', views.NotificationCountAPIView.as_view(), name='notifications-count'),
    path('notifications/', views.NotificationListAPIView.as_view(), name='notifications'),
]
