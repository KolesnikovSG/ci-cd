from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

from .models import Todo

class TodoSerializer(serializers.ModelSerializer):
    title = serializers.CharField(allow_blank=True, required=False)

    def validate (self, attrs):
        if 'id' in self.initial_data.keys():
            raise serializers.ValidationError({'message': 'Request should not contain ID.'})
        if 'title' in attrs:
            initial_title= self.initial_data.get('title')
            if len(initial_title) >= 255:
                raise serializers.ValidationError({'message': 'Title should not contain more than 255 characters.'})
            if len(initial_title) == 0: 
                raise serializers.ValidationError({'message': 'Title cannot be empty.'})
        else: 
            raise serializers.ValidationError({'message': 'Request should contain a valid title.'})
        if 'is_completed' in attrs:
            initial_is_completed = self.initial_data.get('is_completed')
            if type (initial_is_completed) != bool:
                raise serializers.ValidationError({'message': 'Invalid task state.'})
        else: 
            raise serializers.ValidationError({'message': 'Request should contain a valid task state.'})
        return attrs
    
    class Meta:
        model = Todo
        fields = ('id', 'title', 'is_completed')
        validators = []
   
class TodoListUpdateSerializer(serializers.ModelSerializer):
    is_completed = serializers.BooleanField()

    class Meta:
        model = Todo
        fields = ('is_completed',)
