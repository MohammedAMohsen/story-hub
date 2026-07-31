from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:60]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=30, unique=True)
    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Story(models.Model):
    class StatusChoices(models.TextChoices):
        DRAFT = 'Draft'
        PUBLISHED = 'Published'
        ARCHIVED = 'Archived'
    
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='stories')
    title = models.CharField(max_length=100, blank=False)
    content = models.TextField(blank=False)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    category = models.ForeignKey(Category, related_name='stories', blank=True, null=True, on_delete=models.SET_NULL)
    tags = models.ManyToManyField(Tag, related_name='stories', blank=True)
    status = models.CharField(max_length=10, choices=StatusChoices.choices, default=StatusChoices.PUBLISHED)
    cover = models.ImageField(upload_to='story/cover/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Story"
        verbose_name_plural = "Stories"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)[:100]
            slug = base_slug
            counter = 1
            while Story.objects.filter(slug=slug):
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
