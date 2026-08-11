from rest_framework.routers import DefaultRouter
from . import views


urlpatterns = []

router = DefaultRouter()
router.register('comments', views.CommentViewSet, basename='comments')
urlpatterns += router.urls