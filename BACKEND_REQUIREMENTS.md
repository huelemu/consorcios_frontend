# 🔧 Requisitos del Backend para Sistema de Permisos

Este documento describe los cambios necesarios en el backend para que el sistema de roles, permisos y aprobación de usuarios funcione correctamente.

## 📋 Cambios en la Base de Datos

### 1. Agregar campo `aprobado` a la tabla `usuarios`

```sql
ALTER TABLE usuarios ADD COLUMN aprobado BOOLEAN DEFAULT false;
```

**Importante**: Después de agregar la columna, actualiza los usuarios existentes:

```sql
-- Aprobar automáticamente a todos los usuarios existentes
UPDATE usuarios SET aprobado = true WHERE aprobado IS NULL;

-- O si quieres revisar cada uno manualmente:
-- UPDATE usuarios SET aprobado = true WHERE id IN (1, 2, 3, ...);
```

---

## 🔌 Endpoints a Implementar

### 2. **GET /api/usuarios/pendientes**

Obtener usuarios pendientes de aprobación.

**Query Parameters**: Ninguno

**Response**:
```json
[
  {
    "id": 5,
    "persona_id": 10,
    "username": "nuevo_usuario",
    "email": "nuevo@example.com",
    "rol_global": "inquilino",
    "activo": true,
    "aprobado": false,
    "oauth_provider": "local",
    "email_verificado": false,
    "primer_login": true,
    "fecha_creacion": "2024-01-15T10:30:00Z",
    "persona": {
      "id": 10,
      "nombre": "Juan",
      "apellido": "Pérez",
      "documento": "12345678",
      "email": "nuevo@example.com",
      "telefono": "1234567890",
      "tipo_persona": "fisica"
    }
  }
]
```

**Implementación sugerida** (Node.js/Express):
```javascript
router.get('/pendientes', async (req, res) => {
  try {
    const usuariosPendientes = await db.usuarios.findAll({
      where: {
        aprobado: false,
        activo: true  // Solo usuarios activos
      },
      include: [
        {
          model: db.personas,
          as: 'persona'
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });

    res.json(usuariosPendientes);
  } catch (error) {
    console.error('Error obteniendo usuarios pendientes:', error);
    res.status(500).json({ error: 'Error al obtener usuarios pendientes' });
  }
});
```

---

### 3. **PATCH /api/usuarios/:id/aprobar**

Aprobar un usuario pendiente.

**URL Parameters**:
- `id` (number) - ID del usuario a aprobar

**Request Body**: Vacío `{}`

**Response**:
```json
{
  "id": 5,
  "persona_id": 10,
  "username": "nuevo_usuario",
  "email": "nuevo@example.com",
  "rol_global": "inquilino",
  "activo": true,
  "aprobado": true,  // ← Cambiado a true
  "oauth_provider": "local",
  "email_verificado": false,
  "primer_login": true,
  "fecha_creacion": "2024-01-15T10:30:00Z"
}
```

**Implementación sugerida**:
```javascript
router.patch('/:id/aprobar', async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await db.usuarios.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.aprobado) {
      return res.status(400).json({ error: 'Usuario ya está aprobado' });
    }

    // Actualizar aprobado a true
    await usuario.update({ aprobado: true });

    // OPCIONAL: Enviar email de notificación al usuario
    // await emailService.enviarAprobacion(usuario.email);

    res.json(usuario);
  } catch (error) {
    console.error('Error aprobando usuario:', error);
    res.status(500).json({ error: 'Error al aprobar usuario' });
  }
});
```

---

### 4. **PATCH /api/usuarios/:id/rechazar**

Rechazar un usuario pendiente.

**URL Parameters**:
- `id` (number) - ID del usuario a rechazar

**Request Body**:
```json
{
  "motivo": "No cumple con los requisitos" // Opcional
}
```

**Response**: Status 204 No Content o 200 con mensaje

```json
{
  "message": "Usuario rechazado exitosamente"
}
```

**Implementación sugerida**:
```javascript
router.patch('/:id/rechazar', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const usuario = await db.usuarios.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Opción 1: Desactivar el usuario
    await usuario.update({
      activo: false,
      aprobado: false
    });

    // Opción 2: Eliminar el usuario (soft delete)
    // await usuario.destroy();

    // OPCIONAL: Enviar email de notificación
    // await emailService.enviarRechazo(usuario.email, motivo);

    res.status(200).json({ message: 'Usuario rechazado exitosamente' });
  } catch (error) {
    console.error('Error rechazando usuario:', error);
    res.status(500).json({ error: 'Error al rechazar usuario' });
  }
});
```

---

### 5. **Modificar GET /api/usuarios** (Agregar filtro)

Agregar soporte para filtrar por `aprobado`.

**Query Parameters adicionales**:
- `aprobado` (boolean) - Filtrar por usuarios aprobados o pendientes

**Ejemplo Request**:
```
GET /api/usuarios?aprobado=false&activo=true
```

**Implementación sugerida**:
```javascript
router.get('/', async (req, res) => {
  try {
    const {
      search,
      rol_global,
      activo,
      aprobado,  // ← NUEVO
      oauth_provider,
      email_verificado,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } }
      ];
    }

    if (rol_global) where.rol_global = rol_global;
    if (activo !== undefined) where.activo = activo === 'true';
    if (aprobado !== undefined) where.aprobado = aprobado === 'true'; // ← NUEVO
    if (oauth_provider) where.oauth_provider = oauth_provider;
    if (email_verificado !== undefined) where.email_verificado = email_verificado === 'true';

    const { count, rows: usuarios } = await db.usuarios.findAndCountAll({
      where,
      include: [{ model: db.personas, as: 'persona' }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['fecha_creacion', 'DESC']]
    });

    res.json({
      usuarios,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});
```

---

## 🔐 Modificar Autenticación

### 6. **POST /api/auth/register**

Crear nuevos usuarios con `aprobado: false` por defecto.

**ANTES**:
```javascript
const nuevoUsuario = await db.usuarios.create({
  persona_id,
  email,
  username,
  password: hashedPassword,
  rol_global: 'inquilino',
  activo: true
  // ← aprobado no se estaba configurando
});
```

**DESPUÉS**:
```javascript
const nuevoUsuario = await db.usuarios.create({
  persona_id,
  email,
  username,
  password: hashedPassword,
  rol_global: 'inquilino',
  activo: true,
  aprobado: false  // ← NUEVO: Por defecto pendiente de aprobación
});
```

---

### 7. **POST /api/auth/login** y **GET /api/auth/profile**

Incluir los campos `aprobado` y `activo` en la respuesta.

**Response actualizada**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "persona_id": 10,
    "email": "nuevo@example.com",
    "username": "nuevo_usuario",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "inquilino",
    "picture": null,
    "primer_login": true,
    "aprobado": false,  // ← IMPORTANTE: Incluir en respuesta
    "activo": true      // ← IMPORTANTE: Incluir en respuesta
  }
}
```

**Implementación sugerida**:
```javascript
// En tu función de login/profile
const userResponse = {
  id: usuario.id,
  persona_id: usuario.persona_id,
  email: usuario.email,
  username: usuario.username,
  nombre: usuario.persona?.nombre || '',
  apellido: usuario.persona?.apellido || '',
  rol: usuario.rol_global,
  picture: usuario.picture,
  primer_login: usuario.primer_login,
  aprobado: usuario.aprobado,  // ← AGREGAR
  activo: usuario.activo        // ← AGREGAR
};
```

---

## 📊 Estadísticas de Usuarios (Opcional)

### 8. **GET /api/usuarios/stats**

Actualizar para incluir contadores de aprobados y pendientes.

**Response actualizada**:
```json
{
  "total": 150,
  "activos": 145,
  "inactivos": 5,
  "aprobados": 140,     // ← NUEVO
  "pendientes": 10,     // ← NUEVO
  "porRol": [
    { "rol": "admin_global", "cantidad": 5 },
    { "rol": "tenant_admin", "cantidad": 10 },
    { "rol": "propietario", "cantidad": 80 },
    { "rol": "inquilino", "cantidad": 55 }
  ],
  "porProvider": [
    { "provider": "local", "cantidad": 120 },
    { "provider": "google", "cantidad": 30 }
  ]
}
```

---

## ✅ Checklist de Implementación

- [ ] Agregar columna `aprobado` a tabla `usuarios`
- [ ] Aprobar usuarios existentes (opcional)
- [ ] Implementar `GET /api/usuarios/pendientes`
- [ ] Implementar `PATCH /api/usuarios/:id/aprobar`
- [ ] Implementar `PATCH /api/usuarios/:id/rechazar`
- [ ] Agregar filtro `aprobado` en `GET /api/usuarios`
- [ ] Modificar `POST /api/auth/register` para crear con `aprobado: false`
- [ ] Incluir `aprobado` y `activo` en respuesta de login/profile
- [ ] Actualizar estadísticas (opcional)
- [ ] Configurar emails de notificación (opcional)

---

## 🧪 Testing

Después de implementar, prueba lo siguiente:

1. **Crear un nuevo usuario**:
   ```bash
   POST /api/auth/register
   ```
   → Verificar que se crea con `aprobado: false`

2. **Listar usuarios pendientes**:
   ```bash
   GET /api/usuarios/pendientes
   ```
   → Debe aparecer el usuario recién creado

3. **Aprobar el usuario**:
   ```bash
   PATCH /api/usuarios/5/aprobar
   ```
   → Verificar que `aprobado` cambia a `true`

4. **Login con usuario aprobado**:
   ```bash
   POST /api/auth/login
   ```
   → Verificar que la respuesta incluye `aprobado: true` y `activo: true`

5. **Filtrar usuarios**:
   ```bash
   GET /api/usuarios?aprobado=false
   ```
   → Solo debe retornar usuarios pendientes

---

## 📧 Emails de Notificación (Opcional)

Si quieres enviar emails:

### Cuando un usuario se registra:
- **Para**: Todos los administradores
- **Asunto**: "Nuevo usuario pendiente de aprobación"
- **Contenido**: Información del usuario y link al panel de administración

### Cuando un usuario es aprobado:
- **Para**: El usuario aprobado
- **Asunto**: "¡Tu cuenta ha sido aprobada!"
- **Contenido**: Bienvenida y link para acceder al sistema

### Cuando un usuario es rechazado:
- **Para**: El usuario rechazado
- **Asunto**: "Actualización sobre tu solicitud"
- **Contenido**: Explicación del rechazo y datos de contacto

---

## 🔍 Debugging

Si tienes problemas:

1. **Verifica que la columna existe**:
   ```sql
   DESCRIBE usuarios;
   ```

2. **Verifica que los endpoints responden**:
   ```bash
   curl http://localhost:3000/api/usuarios/pendientes
   ```

3. **Revisa los logs del servidor** para errores

4. **Usa herramientas como Postman** para probar cada endpoint

---

¡Cualquier duda, revisa este documento o contacta al equipo de frontend! 🚀
