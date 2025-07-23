from rest_framework.test import APITestCase
from rest_framework import status
from todo.models import Todo

class TodoAPITests(APITestCase):

    def setUp(self):
        # Создаем несколько тестовых задач
        self.todo1 = Todo.objects.create(title="Task 1", is_completed=False)
        self.todo2 = Todo.objects.create(title="Task 2", is_completed=True)

        self.todo_list_url = "/api/todos/"  # Укажите URL для списка задач
        self.todo_detail_url = f"/api/todos/{self.todo1.id}/"  # URL для деталей задачи

    def test_get_todo_list(self):
        response = self.client.get(self.todo_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_post_todo_list(self):
        data = {"title": "New Task", "is_completed": False}
        response = self.client.post(self.todo_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Todo.objects.count(), 3)
        self.assertEqual(Todo.objects.last().title, "New Task")

    def test_post_todo_list_invalid_data(self):
        data = {"title": "", "is_completed": False}
        response = self.client.post(self.todo_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)

    def test_patch_todo_list(self):
        data = {"is_completed": True}
        response = self.client.patch(self.todo_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(all(todo.is_completed for todo in Todo.objects.all()))

    def test_delete_completed_todos(self):
        response = self.client.delete(self.todo_list_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Todo.objects.filter(is_completed=True).count(), 0)

    def test_get_todo_detail(self):
        response = self.client.get(self.todo_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.todo1.title)

    def test_put_todo_detail(self):
        data = {"title": "Updated Task", "is_completed": True}
        response = self.client.put(self.todo_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.todo1.refresh_from_db()
        self.assertEqual(self.todo1.title, "Updated Task")
        self.assertTrue(self.todo1.is_completed)

    def test_patch_todo_detail(self):
        data = {"is_completed": True}
        response = self.client.patch(self.todo_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.todo1.refresh_from_db()
        self.assertTrue(self.todo1.is_completed)

    def test_delete_todo_detail(self):
        response = self.client.delete(self.todo_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Todo.objects.filter(id=self.todo1.id).exists())
