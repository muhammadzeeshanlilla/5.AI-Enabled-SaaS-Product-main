from django.urls import path
from .views import FileUploadView, FileListView, FileDataView, PredictionView

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='upload'),
    path('files/', FileListView.as_view(), name='file-list'),
    path('files/<int:file_id>/', FileDataView.as_view(), name='file-data'),
    path('files/<int:file_id>/predict/', PredictionView.as_view(), name='predict'),
]