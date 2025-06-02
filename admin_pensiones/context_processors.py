def user_name(request):
    nombre = request.session.get('nombre', '')
    return {'nombre': nombre}