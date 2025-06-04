from django.contrib import admin
from django.urls import path
from django.shortcuts import redirect
from admin import views
from admin.views import home, login_view

def register_view(request):
    from django.shortcuts import render
    return render(request, 'registro.html')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', lambda request: redirect('login'), name='root'),
    path('home/', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('register/', register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('tablas/', views.tabla_general_view, name='tabla_general'),
  
]