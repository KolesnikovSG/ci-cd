from django.db import models

class Todo(models.Model):
    title = models.CharField(max_length=255)
    is_completed = models.BooleanField()
   
    def __str__(self):
        return self.title
    