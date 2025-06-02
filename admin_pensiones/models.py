# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Ciudades(models.Model):
    id_ciudad = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=250)
    id_departamento = models.ForeignKey('Departamentos', models.DO_NOTHING, db_column='id_departamento')

    class Meta:
        managed = False
        db_table = 'ciudades'


class Departamentos(models.Model):
    id_departamento = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=250)

    class Meta:
        managed = False
        db_table = 'departamentos'


class EstadosPago(models.Model):
    id_estado_pago = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=50)

    class Meta:
        managed = False
        db_table = 'estados_pago'


class HabitacionServicio(models.Model):
    pk = models.CompositePrimaryKey('id_habitacion', 'id_servicio')
    id_habitacion = models.ForeignKey('Habitaciones', models.DO_NOTHING, db_column='id_habitacion')
    id_servicio = models.ForeignKey('Servicios', models.DO_NOTHING, db_column='id_servicio')

    class Meta:
        managed = False
        db_table = 'habitacion_servicio'
        unique_together = (('id_habitacion', 'id_servicio'),)


class Habitaciones(models.Model):
    id_habitacion = models.AutoField(primary_key=True)
    id_pension = models.ForeignKey('Pensiones', models.DO_NOTHING, db_column='id_pension')
    descripcion = models.TextField(blank=True, null=True)
    capacidad = models.IntegerField(blank=True, null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    estado_habitacion = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'habitaciones'


class Imagenes(models.Model):
    id_imagen = models.AutoField(primary_key=True)
    id_pension = models.ForeignKey('Pensiones', models.DO_NOTHING, db_column='id_pension', blank=True, null=True)
    id_habitacion = models.ForeignKey(Habitaciones, models.DO_NOTHING, db_column='id_habitacion', blank=True, null=True)
    url = models.CharField(max_length=255)
    descripcion = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'imagenes'


class MetodosPago(models.Model):
    id_metodo_pago = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=50)

    class Meta:
        managed = False
        db_table = 'metodos_pago'


class Pagos(models.Model):
    id_pago = models.AutoField(primary_key=True)
    id_reserva = models.ForeignKey('Reservas', models.DO_NOTHING, db_column='id_reserva')
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_pago = models.DateTimeField(blank=True, null=True)
    id_metodo_pago = models.ForeignKey(MetodosPago, models.DO_NOTHING, db_column='id_metodo_pago')
    id_estado_pago = models.ForeignKey(EstadosPago, models.DO_NOTHING, db_column='id_estado_pago')

    class Meta:
        managed = False
        db_table = 'pagos'


class PensionServicio(models.Model):
    pk = models.CompositePrimaryKey('id_pension', 'id_servicio')
    id_pension = models.ForeignKey('Pensiones', models.DO_NOTHING, db_column='id_pension')
    id_servicio = models.ForeignKey('Servicios', models.DO_NOTHING, db_column='id_servicio')

    class Meta:
        managed = False
        db_table = 'pension_servicio'
        unique_together = (('id_pension', 'id_servicio'),)


class Pensiones(models.Model):
    id_pension = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True)
    direccion = models.CharField(max_length=255)
    precio_mensual = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    reglas = models.TextField(blank=True, null=True)
    estado_pension = models.IntegerField()
    id_propietario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_propietario')
    id_ciudad = models.ForeignKey(Ciudades, models.DO_NOTHING, db_column='id_ciudad')
    fecha_creacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pensiones'


class Resenas(models.Model):
    id_resena = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    id_pension = models.ForeignKey(Pensiones, models.DO_NOTHING, db_column='id_pension')
    calificacion = models.IntegerField(blank=True, null=True)
    comentario = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'resenas'


class Reservas(models.Model):
    id_reserva = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    id_habitacion = models.ForeignKey(Habitaciones, models.DO_NOTHING, db_column='id_habitacion')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado_reserva = models.IntegerField()
    fecha_reserva = models.DateTimeField(blank=True, null=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'reservas'


class Servicios(models.Model):
    id_servicio = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = 'servicios'


class Usuarios(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.CharField(unique=True, max_length=150)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    contrasenna = models.CharField(max_length=255)
    rol = models.IntegerField()
    estado_usuario = models.IntegerField()
    fecha_registro = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuarios'
