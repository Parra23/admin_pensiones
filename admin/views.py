from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from admin_pensiones.models import Usuarios  # Ajusta el import según tu modelo
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import hashlib

# Utilidad para hashear contraseñas con SHA256
def sha256_hash(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def login_view(request):
    error = None
    if request.method == 'POST':
        correo = request.POST['correo']
        password = request.POST['password']

        usuario_qs = Usuarios.objects.filter(email=correo)
        if not usuario_qs.exists():
            error = "El correo no está registrado."
        else:
            usuario = usuario_qs.first()
            # Compara usando SHA256
            if usuario.contrasenna != sha256_hash(password):
                error = "La contraseña es incorrecta."
            elif usuario.rol != 1:
                error = "No tienes permisos de administrador."
            else:
                request.session['usuario_id'] = usuario.id_usuario
                request.session['usuario_nombre'] = usuario.nombre
                request.session['usuario_rol'] = usuario.rol
                return redirect('home')

    return render(request, 'login.html', {'error': error})

def logout_view(request):
    request.session.flush()
    return redirect('login')

def home(request):
    if 'usuario_id' not in request.session:
        return redirect('login')
    return render(request, 'home.html', {
        'nombre': request.session['usuario_nombre']
    })
def tabla_general_view(request):
    if 'usuario_id' not in request.session:
        return redirect('login')
    return render(request, 'tabla_modelo.html')

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            email = data.get('email')
            contrasenna = data.get('contrasenna')
            rol = data.get('rol')  # Opcional

            if not email or not contrasenna:
                return JsonResponse({'success': False, 'error': 'Faltan datos'}, status=400)

            filtro = {'email': email, 'contrasenna': sha256_hash(contrasenna)}
            if rol is not None:
                filtro['rol'] = rol

            user = Usuarios.objects.get(**filtro)
            request.session['usuario_id'] = user.id_usuario
            request.session['usuario_nombre'] = user.nombre
            return JsonResponse({
                'success': True,
                'id_usuario': user.id_usuario,
                'nombre': user.nombre,
                'rol': user.rol
            })
        except Usuarios.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Credenciales inválidas'}, status=401)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)

# admin_pensiones/context_processors.py
def user_name(request):
    nombre = request.session.get('nombre', '')  # O donde guardes el nombre
    return {'nombre': nombre}
