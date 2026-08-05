from django.urls import path
from . import views


urlpatterns = [
    path('bookmarks/', views.BookmarkAPIView.as_view(), name='bookmarks'),
]
