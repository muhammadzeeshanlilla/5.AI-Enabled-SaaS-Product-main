from io import BytesIO

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from openpyxl import Workbook
from rest_framework import status
from rest_framework.test import APITestCase

from .models import DataRow, PredictionResult, UploadedFile


class DashboardAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='dashboard-user',
            password='StrongPass123!',
        )
        self.other_user = User.objects.create_user(
            username='other-user',
            password='OtherPass123!',
        )

    def authenticate(self):
        self.client.force_authenticate(user=self.user)

    def upload_csv(self, name='sales.csv'):
        csv_file = SimpleUploadedFile(
            name,
            b'Month,Sales,Revenue\nJanuary,1200,45000\nFebruary,1350,52000\nMarch,1500,58000\n',
            content_type='text/csv',
        )
        return self.client.post(reverse('upload'), {'file': csv_file}, format='multipart')

    def create_dataset(self, user=None, numeric=True):
        uploaded = UploadedFile.objects.create(
            user=user or self.user,
            file_name='dataset.csv',
            row_count=3,
            columns=['Month', 'Sales'] if numeric else ['Name', 'Category'],
        )
        if numeric:
            values = [100, 125, 150]
            rows = [
                DataRow(
                    uploaded_file=uploaded,
                    row_index=index,
                    row_data={'Month': f'Month {index + 1}', 'Sales': value},
                )
                for index, value in enumerate(values)
            ]
        else:
            rows = [
                DataRow(
                    uploaded_file=uploaded,
                    row_index=index,
                    row_data={'Name': name, 'Category': category},
                )
                for index, (name, category) in enumerate([
                    ('Alpha', 'A'),
                    ('Beta', 'B'),
                    ('Gamma', 'C'),
                ])
            ]
        DataRow.objects.bulk_create(rows)
        return uploaded

    def test_authenticated_user_can_upload_csv(self):
        self.authenticate()

        response = self.upload_csv()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['file_name'], 'sales.csv')
        self.assertEqual(response.data['row_count'], 3)
        self.assertEqual(response.data['columns'], ['Month', 'Sales', 'Revenue'])
        self.assertEqual(UploadedFile.objects.filter(user=self.user).count(), 1)
        self.assertEqual(DataRow.objects.count(), 3)

    def test_unauthenticated_upload_is_rejected(self):
        response = self.upload_csv()

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(UploadedFile.objects.count(), 0)

    def test_dataset_list_only_contains_current_users_files(self):
        own_file = self.create_dataset()
        self.create_dataset(user=self.other_user)
        self.authenticate()

        response = self.client.get(reverse('file-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], own_file.id)

    def test_dataset_detail_returns_stored_rows(self):
        uploaded = self.create_dataset()
        self.authenticate()

        response = self.client.get(reverse('file-data', kwargs={'file_id': uploaded.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['file_name'], uploaded.file_name)
        self.assertEqual(response.data['columns'], ['Month', 'Sales'])
        self.assertEqual(len(response.data['rows']), 3)

    def test_user_cannot_retrieve_another_users_dataset(self):
        uploaded = self.create_dataset(user=self.other_user)
        self.authenticate()

        response = self.client.get(reverse('file-data', kwargs={'file_id': uploaded.id}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_prediction_returns_forecast_and_insight(self):
        uploaded = self.create_dataset()
        self.authenticate()

        response = self.client.post(reverse('predict', kwargs={'file_id': uploaded.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['column_analyzed'], 'Sales')
        self.assertEqual(len(response.data['forecast_next_3']), 3)
        self.assertIn(response.data['trend'], ['increasing', 'decreasing'])
        self.assertIsInstance(response.data['confidence'], float)
        self.assertTrue(response.data['insight'])
        self.assertEqual(PredictionResult.objects.filter(uploaded_file=uploaded).count(), 1)

    def test_prediction_returns_error_when_no_numeric_column_exists(self):
        uploaded = self.create_dataset(numeric=False)
        self.authenticate()

        response = self.client.post(reverse('predict', kwargs={'file_id': uploaded.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['error'], 'No numeric column found for prediction')

    def test_authenticated_user_can_upload_excel(self):
        workbook = Workbook()
        worksheet = workbook.active
        worksheet.append(['Month', 'Sales'])
        worksheet.append(['January', 1200])
        worksheet.append(['February', 1350])
        stream = BytesIO()
        workbook.save(stream)
        stream.seek(0)
        excel_file = SimpleUploadedFile(
            'sales.xlsx',
            stream.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        self.authenticate()

        response = self.client.post(reverse('upload'), {'file': excel_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['file_name'], 'sales.xlsx')
        self.assertEqual(response.data['row_count'], 2)
        self.assertEqual(response.data['columns'], ['Month', 'Sales'])
