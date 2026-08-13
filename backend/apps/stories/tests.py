from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Story

User = get_user_model()


class AnonymousStoryAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.author = User.objects.create_user(
            username="author1",
            email="author1@example.com",
            password="StrongPass123",
        )
        self.story = Story.objects.create(
            author=self.author,
            title="A sufficiently long test story title",
            content="This is test content that is definitely more than twenty characters long.",
            status=Story.StatusChoices.PUBLISHED,
        )

    def test_anonymous_user_can_list_stories(self):
        response = self.client.get("/api/stories/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        story_data = response.data["results"][0]
        self.assertFalse(story_data["is_liked"])
        self.assertFalse(story_data["is_saved"])
        self.assertFalse(story_data["is_following"])

    def test_anonymous_user_can_retrieve_single_story(self):
        response = self.client.get(f"/api/stories/{self.story.slug}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_liked"])