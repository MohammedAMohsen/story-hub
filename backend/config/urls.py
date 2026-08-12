from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from apps.accounts.views import CustomUserViewSet
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView


router = DefaultRouter()
router.register("users", CustomUserViewSet, basename="user")

urlpatterns = [
    path('admin/', admin.site.urls),
    path("auth/", include(router.urls)),
    path('auth/', include('djoser.urls.jwt')),
    path("api/", include('apps.accounts.urls')),
    path("api/", include('apps.stories.urls')),
    path("api/", include('apps.comments.urls')),
    path("api/", include('apps.likes.urls')),
    path("api/", include('apps.bookmarks.urls')),
    path("api/", include('apps.follows.urls')),
    path("api/", include('apps.notifications.urls')),
    
    # Silk-Profiling & Inspection
    path('silk/', include('silk.urls', namespace='silk')),
    
    # DRF-Documentation > OpenAPI > Spectacular
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
