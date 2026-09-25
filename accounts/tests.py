from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class AuthenticationAPITests(APITestCase):
    def setUp(self):
        self.password = 'StrongPass123!'
        self.user = User.objects.create_user(
            username='existing-user',
            email='existing@example.com',
            password=self.password,
        )

    def test_registration_creates_user_and_returns_tokens(self):
        response = self.client.post(reverse('register'), {
            'username': 'new-user',
            'email': 'new@example.com',
            'password': 'NewPass123!',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'new-user')

        created_user = User.objects.get(username='new-user')
        self.assertTrue(created_user.check_password('NewPass123!'))

    def test_login_returns_access_and_refresh_tokens(self):
        response = self.client.post(reverse('login'), {
            'username': self.user.username,
            'password': self.password,
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_authenticated_user_can_retrieve_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(reverse('profile'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.user.id)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['email'], self.user.email)

    def test_unauthenticated_profile_request_is_rejected(self):
        response = self.client.get(reverse('profile'))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
