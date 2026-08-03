from rest_framework import serializers


class LikeSerializers(serializers.Serializer):
    type = serializers.ChoiceField(
        choices=[
            ("story", "Story"),
            ("comment", "Comment"),
        ]
    )
    object_id = serializers.CharField()