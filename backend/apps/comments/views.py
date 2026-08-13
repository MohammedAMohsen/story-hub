from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Count
from .permissions import IsOwner
from .models import Story, Comment
from .serializers import CommentWriteSerializer, CommentSerializer



class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related("user__profile").annotate(replies_count=Count("replies"))
    serializer_class = CommentWriteSerializer

    @property
    def get_story_slug(self):
        return self.request.query_params.get("story")

    def get_queryset(self):
        story_slug = self.get_story_slug
        queryset = super().get_queryset()
        if not story_slug and self.action == 'list':
            raise ValidationError(detail="Story parameter is required.")
        if self.action == 'list':
            return queryset.filter(story__slug=story_slug, parent__isnull=True)
        return queryset

    def get_serializer_class(self):
        if self.action in ["list", "retrieve", 'replies']:
            return CommentSerializer
        return super().get_serializer_class()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        story_slug = self.get_story_slug
        if story_slug:
            context['story'] = get_object_or_404(Story, slug=story_slug)
        return context

    def perform_create(self, serializer):
        story = get_object_or_404(Story, slug=self.get_story_slug, status=Story.StatusChoices.PUBLISHED)
        return serializer.save(user=self.request.user, story=story)

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'replies']:
            permission_classes = [AllowAny]
        elif self.action in ['create']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsOwner]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['GET'], url_path='replies')
    def replies(self, request, pk=None):
        comment = self.get_object()
        replies = comment.replies.all()
        page = self.paginate_queryset(replies)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(replies, many=True)
        return Response(serializer.data)

