from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework import filters
from .permissions import IsAuthor
from .serializers import StoryWriteSerializer, StorySerializer, CategorySerializer
from .models import Story, Category


class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.select_related('author__profile', 'category').prefetch_related('tags')
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
        elif self.action in ['create', 'me']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsAuthor]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve', 'me', 'author_stories']:
            return StorySerializer
        return super().get_serializer_class()

    def perform_create(self, serializer):
        return serializer.save(author=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
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

    @action(detail=False, methods=['GET'],  url_path="me")
    def me(self, request):
        queryset = self.get_queryset().filter(author=request.user)
        return self.serialize_queryset(queryset)

    @action(detail=False, methods=['GET'], url_path=r'author/(?P<username>[a-zA-Z0-9_.-]+)')
    def author_stories(self, request, username=None):
        queryset = self.get_queryset().filter(author__username=username,status=Story.StatusChoices.PUBLISHED)
        return self.serialize_queryset(queryset)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None