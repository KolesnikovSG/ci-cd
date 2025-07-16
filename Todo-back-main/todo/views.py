from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status

from .models import Todo
from .serializers import TodoSerializer, TodoListUpdateSerializer

class TodoList(APIView):
    def get(self, request, format=None):
        queryset = Todo.objects.all().order_by('id')
        serializer = TodoSerializer(queryset, many=True)  
        return Response(serializer.data)
    
    def post(self, request):
        serializer = TodoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def patch(self, request):
        serializer = TodoListUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        update_data = serializer.data.get('is_completed')
        Todo.objects.exclude(is_completed = update_data).update(is_completed=update_data)
        return Response('Changed successfully', status=status.HTTP_200_OK) 
    
    def delete(self, request):
        Todo.objects.filter(is_completed__exact=True).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
class TodoDetail(APIView):
        
    def get(self, request, pk, format=None):
        task = get_object_or_404(Todo, pk=pk)
        serializer = TodoSerializer(task)
        return Response(serializer.data)
    
    def put(self, request, pk, format=None):
        task = get_object_or_404(Todo, pk=pk)
        serializer = TodoSerializer(task, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
        
    def patch(self, request, pk, format=None):
        task = get_object_or_404(Todo, pk=pk)
        serializer = TodoListUpdateSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk, format=None):
        task = get_object_or_404(Todo, pk=pk)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
class CompleteAll(APIView):
    def patch(self, request):
        Todo.objects.all().update(is_completed=request.data.get('is_completed', False))
        return Response(status=status.HTTP_200_OK)
