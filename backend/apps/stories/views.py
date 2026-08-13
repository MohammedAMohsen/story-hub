from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Exists, OuterRef, Value, BooleanField
from rest_framework import filters
from django.core.cache import cache
from apps.bookmarks.models import Bookmark
from apps.likes.models import Like
from apps.follows.models import Follow
from .permissions import IsAuthor
from .models import Story, Category
from .serializers import StoryWriteSerializer, StorySerializer, CategorySerializer


class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.all()
    serializer_class = StoryWriteSerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'

    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    filterset_fields = ['category__name', 'tags__name']
    ordering_fields = ['created_at']
    search_fields = [
        "^author__username",
        "^author__first_name",
        "^author__last_name",
        "title", "content",
    ]

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'author_stories']:
            permission_classes = [AllowAny]
        elif self.action in ['create', 'me_stories', 'following_stories']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsAuthor]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action in ['list', 'me_stories', 'retrieve', 'author_stories', 'following_stories']:
            return StorySerializer
        return super().get_serializer_class()

    def perform_create(self, serializer):
        return serializer.save(author=self.request.user)

    def get_queryset(self):
        if self.request.user.is_authenticated:
            is_liked = Exists(Like.objects.filter(user=self.request.user, story=OuterRef("pk")))
            is_saved = Exists(Bookmark.objects.filter(user=self.request.user, story=OuterRef("pk")))
            is_following = Exists(Follow.objects.filter(follower=self.request.user, following=OuterRef('author')))
        else:
            is_liked = Value(False, output_field=BooleanField())
            is_saved = Value(False, output_field=BooleanField())
            is_following = Value(False, output_field=BooleanField())
        queryset = (
            super()
            .get_queryset()
            .order_by('-created_at')
            .select_related('author__profile', 'category')
            .prefetch_related('tags')
            .annotate(
                comments_count=Count("comments", distinct=True),
                likes_count=Count('likes', distinct=True),
                is_liked = is_liked,
                is_saved = is_saved,
                is_following = is_following,
            )
        )
        condition=Q()
        if self.action == 'list':
            return queryset.filter(status=Story.StatusChoices.PUBLISHED)
        if self.action == 'retrieve':
            condition = Q(status=Story.StatusChoices.PUBLISHED) 
            if self.request.user.is_authenticated:
                condition |= Q(author=self.request.user)
        return queryset.filter(condition)

    def serialize_queryset(self, queryset):
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'], url_path="me")
    def me_stories(self, request):
        queryset = self.get_queryset().filter(author=request.user)
        status = request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
        return self.serialize_queryset(queryset)

    @action(detail=False, methods=['GET'], url_path=r'author/(?P<username>[a-zA-Z0-9_.-]+)')
    def author_stories(self, request, username=None):
        queryset = self.get_queryset().filter(author__username=username,status=Story.StatusChoices.PUBLISHED)
        return self.serialize_queryset(queryset)

    @action(detail=False, methods=['GET'], url_path='following')
    def following_stories(self, request):
        queryset = self.get_queryset().filter(author__follower_relationships__follower=request.user,status=Story.StatusChoices.PUBLISHED)
        return self.serialize_queryset(queryset)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None
    
    def list(self, request, *args, **kwargs):
        cached_response = cache.get('categories')
        if cached_response is not None:
            return Response(cached_response)
        response = super().list(request, *args, **kwargs)
        cache.set('categories', response.data, timeout=604800) # timeout: 1 week 
        return response