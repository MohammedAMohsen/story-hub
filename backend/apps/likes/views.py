from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.contenttypes.models import ContentType
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.stories.models import Story, Comment
from .serializers import LikeSerializers
from .models import Like


class LikeAPIView(APIView):
    permission_classes = [IsAuthenticated]
    MODEL_MAP = {
        "story": (Story, "slug"),
        "comment": (Comment, "id"),
    }

    def toggle_like(self, model, object_id):
        content_type = ContentType.objects.get_for_model(model)
        like = Like.objects.filter(
            user=self.request.user,
            content_type=content_type,
            object_id=str(object_id))
        if like.exists():
            like.delete()
            return False
        Like.objects.create(
            user=self.request.user,
            content_type=content_type,
            object_id=str(object_id))
        return True

    def post(self, request):
        serializer = LikeSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        model_name = serializer.validated_data["type"]
        lookup_value = serializer.validated_data["object_id"]
        model, lookup_field = self.MODEL_MAP[model_name]
        obj = get_object_or_404(model, **{lookup_field: lookup_value}) # this -> **{"slug": "django-rest"} == slug="django-rest"
        is_liked = self.toggle_like(model, obj.pk)
        likes_count = obj.likes.count()
        return Response({
            "liked": is_liked,
            "likes_count": likes_count
        })