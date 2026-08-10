from django.shortcuts import render
from rest_framework.viewsets import generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationCountAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        notification_count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({
            "count": notification_count,
        })

class NotificationListAPIView(generics.ListAPIView):
    queryset = Notification.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return super().get_queryset().filter(recipient=self.request.user).select_related("actor__profile", "content_type")

    def mark_as_read(self, notifications):
        Notification.objects.filter(
            id__in=[notification.id for notification in notifications],
            recipient=self.request.user,
            is_read = False
        ).update(is_read=True)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            self.mark_as_read(page)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        self.mark_as_read(queryset)
        return Response(serializer.data)