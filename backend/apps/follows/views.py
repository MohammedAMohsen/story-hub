from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db.models import Exists, OuterRef, Subquery, Count, Q
from apps.accounts.models import User
from rest_framework.pagination import PageNumberPagination
from .models import Follow
from .serializers import FollowCreateSerializer, UserFollowSerializer



class FollowAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        relationship = request.query_params.get("show")
        author = request.query_params.get("author")
        if author:
            user = get_object_or_404(User, username=author)
        else:
            user = request.user

        is_following=Exists(Follow.objects.filter(follower=request.user, following=OuterRef('pk')))
        
        if relationship == 'followers':
            users = (
                User.objects
                .filter(following_relationships__following=user)
                .select_related('profile')
                .order_by('-created_at')
                .annotate(is_following=is_following)
            )
        elif relationship == 'following':
            users = (
                User.objects
                .filter(follower_relationships__follower=user)
                .select_related('profile')
                .annotate(
                    is_following=is_following,
                    story_count=Count('stories', distinct=True, filter=Q(stories__status='Published'),),
                    # followers_count=Count("follower_relationships", distinct=True), 
                    # Use a subquery to calculate followers independently and avoid JOIN-related count errors.
                    followers_count=Subquery(Follow.objects.filter(following=OuterRef('pk')).values('following').annotate(count=Count('pk')).values('count')),
                )
                .order_by('-created_at')
            )
        else:
            raise ValidationError({"show": "Expected 'followers' or 'following'."})
        paginator = PageNumberPagination()
        paginator.page_size = 20
        page = paginator.paginate_queryset(users, request)
        if page:
            serializer = UserFollowSerializer(page, many=True, context={"request": request})
            return paginator.get_paginated_response(serializer.data)
        serializer = UserFollowSerializer(users, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        serializer = FollowCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        user = get_object_or_404(User, username=username)
        if user == request.user:
            raise ValidationError('detail: The user cannot follow himself')
        follow, created = Follow.objects.get_or_create(follower=request.user, following=user)
        if created:
            is_following=True
        else:
            follow.delete()
            is_following=False
        return Response({
            'username': user.username,
            'follow': is_following
        })