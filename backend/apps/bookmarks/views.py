from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView 
from apps.stories.models import Story
from apps.likes.models import Like
from django.db.models import Prefetch, Count, Exists, OuterRef
from rest_framework.pagination import PageNumberPagination
from .serializers import BookmarkSerializer, BookmarkCreateSerializer
from .models import Bookmark


class BookmarkAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        stories = (
            Story.objects
            .select_related("author__profile", "category")
            .prefetch_related("tags")
            .annotate(
                comments_count=Count("comments", distinct=True),
                likes_count=Count("likes", distinct=True),
                is_liked=Exists(Like.objects.filter(user=self.request.user, story=OuterRef('pk'))),
                is_saved=Exists(Bookmark.objects.filter(user=self.request.user, story=OuterRef('pk')))
            )
        )
        bookmarks = (
            Bookmark.objects
            .filter(user=self.request.user, story__status=Story.StatusChoices.PUBLISHED)
            .order_by('-saved_at')
            .prefetch_related(Prefetch("story", queryset=stories))
        )

        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'size'
        paginator.max_page_size = 10
        page = paginator.paginate_queryset(bookmarks, request)
        if page is not None:
            serializer = BookmarkSerializer(page, context={"request": request}, many=True)
            return paginator.get_paginated_response(serializer.data)
        serializer = BookmarkSerializer(bookmarks, context={"request": request},many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = BookmarkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        story_slug = serializer.validated_data['story_slug']
        story = get_object_or_404(Story, slug=story_slug, status=Story.StatusChoices.PUBLISHED)
        bookmark, created = Bookmark.objects.get_or_create(user=request.user, story=story)
        if created:
            saved = True
        else:
            bookmark.delete()
            saved = False
        return Response({"saved": saved})