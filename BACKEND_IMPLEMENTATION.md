# 📋 Guía de Implementación del Backend - Módulo Proveedores

## 🎯 Resumen

El frontend ahora está preparado para gestionar un modelo relacional de proveedores con:
- **Personas vinculadas** con roles específicos (N:N)
- **Cuentas bancarias** múltiples (1:N)
- Información ampliada del proveedor (ubicación, fiscal, contacto)

---

## 1️⃣ Migraciones SQL

### 1.1 Ampliar tabla `proveedores`

```sql
ALTER TABLE proveedores
  ADD COLUMN tipo_entidad ENUM('fisica', 'juridica') DEFAULT 'fisica' AFTER razon_social,
  ADD COLUMN email_general VARCHAR(150) AFTER rubro,
  ADD COLUMN telefono VARCHAR(50) AFTER email_general,
  ADD COLUMN domicilio VARCHAR(200) AFTER telefono,
  ADD COLUMN localidad VARCHAR(100) AFTER domicilio,
  ADD COLUMN provincia VARCHAR(100) AFTER localidad,
  ADD COLUMN cod_postal VARCHAR(20) AFTER provincia,
  ADD COLUMN condicion_iva ENUM('responsable_inscripto', 'monotributo', 'exento', 'no_categorizado') AFTER cod_postal;
```

### 1.2 Crear tabla `proveedor_personas`

```sql
CREATE TABLE proveedor_personas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proveedor_id INT NOT NULL,
  persona_id INT NOT NULL,
  rol ENUM('titular', 'responsable_tecnico', 'administrativo', 'contacto_comercial', 'otro') NOT NULL DEFAULT 'titular',
  desde DATE NOT NULL,
  hasta DATE NULL,
  es_principal BOOLEAN DEFAULT FALSE,

  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE,
  FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE,

  INDEX idx_proveedor_personas_proveedor (proveedor_id),
  INDEX idx_proveedor_personas_persona (persona_id),
  INDEX idx_proveedor_personas_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.3 Crear tabla `proveedor_cuentas_bancarias`

```sql
CREATE TABLE proveedor_cuentas_bancarias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proveedor_id INT NOT NULL,
  banco VARCHAR(100),
  titular VARCHAR(200) NOT NULL,
  cuit_titular VARCHAR(20) NOT NULL,
  cbu VARCHAR(22) NOT NULL,
  alias VARCHAR(100),
  tipo_cuenta ENUM('corriente', 'caja_ahorro') DEFAULT 'caja_ahorro',
  moneda ENUM('ARS', 'USD') DEFAULT 'ARS',
  predeterminada BOOLEAN DEFAULT FALSE,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE,

  INDEX idx_cuentas_proveedor (proveedor_id),
  INDEX idx_cuentas_predeterminada (predeterminada),
  INDEX idx_cuentas_activa (activa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.4 Migrar datos existentes (opcional)

```sql
-- Migrar persona_id actual a proveedor_personas con rol 'titular'
INSERT INTO proveedor_personas (proveedor_id, persona_id, rol, desde, es_principal)
SELECT
  id AS proveedor_id,
  persona_id,
  'titular' AS rol,
  CURRENT_DATE AS desde,
  TRUE AS es_principal
FROM proveedores
WHERE persona_id IS NOT NULL;
```

---

## 2️⃣ Modelos Sequelize

### 2.1 Actualizar `src/models/proveedor.js`

```javascript
export const Proveedor = sequelize.define('Proveedor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  razon_social: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tipo_entidad: {
    type: DataTypes.ENUM('fisica', 'juridica'),
    defaultValue: 'fisica'
  },
  cuit: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  rubro: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  email_general: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  domicilio: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  localidad: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  provincia: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cod_postal: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  condicion_iva: {
    type: DataTypes.ENUM('responsable_inscripto', 'monotributo', 'exento', 'no_categorizado'),
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Mantener persona_id por compatibilidad
  persona_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'proveedores',
  timestamps: false
});
```

### 2.2 Crear `src/models/proveedorPersona.js`

```javascript
import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export const ProveedorPersona = sequelize.define('ProveedorPersona', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  proveedor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  persona_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('titular', 'responsable_tecnico', 'administrativo', 'contacto_comercial', 'otro'),
    defaultValue: 'titular'
  },
  desde: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hasta: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  es_principal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'proveedor_personas',
  timestamps: false
});
```

### 2.3 Crear `src/models/proveedorCuentaBancaria.js`

```javascript
import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export const ProveedorCuentaBancaria = sequelize.define('ProveedorCuentaBancaria', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  proveedor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  banco: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  titular: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  cuit_titular: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  cbu: {
    type: DataTypes.STRING(22),
    allowNull: false
  },
  alias: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tipo_cuenta: {
    type: DataTypes.ENUM('corriente', 'caja_ahorro'),
    defaultValue: 'caja_ahorro'
  },
  moneda: {
    type: DataTypes.ENUM('ARS', 'USD'),
    defaultValue: 'ARS'
  },
  predeterminada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  activa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'proveedor_cuentas_bancarias',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});
```

### 2.4 Agregar relaciones en `src/models/index.js`

```javascript
import { ProveedorPersona } from './proveedorPersona.js';
import { ProveedorCuentaBancaria } from './proveedorCuentaBancaria.js';

// ... (imports existentes)

// Proveedor ↔ ProveedorPersona (1:N)
Proveedor.hasMany(ProveedorPersona, {
  foreignKey: 'proveedor_id',
  as: 'personas'
});
ProveedorPersona.belongsTo(Proveedor, {
  foreignKey: 'proveedor_id',
  as: 'proveedor'
});

// ProveedorPersona ↔ Persona (N:1)
ProveedorPersona.belongsTo(Persona, {
  foreignKey: 'persona_id',
  as: 'persona'
});

// Proveedor ↔ ProveedorCuentaBancaria (1:N)
Proveedor.hasMany(ProveedorCuentaBancaria, {
  foreignKey: 'proveedor_id',
  as: 'cuentas_bancarias'
});
ProveedorCuentaBancaria.belongsTo(Proveedor, {
  foreignKey: 'proveedor_id',
  as: 'proveedor'
});

export {
  // ... (exports existentes)
  ProveedorPersona,
  ProveedorCuentaBancaria
};
```

---

## 3️⃣ Controladores

### 3.1 Actualizar `src/controllers/proveedoresController.js`

Agregar los siguientes métodos:

```javascript
import { ProveedorPersona, ProveedorCuentaBancaria } from '../models/index.js';

// ========================================
// Personas Vinculadas
// ========================================

export const getPersonasVinculadas = async (req, res) => {
  try {
    const { id } = req.params;
    const personas = await ProveedorPersona.findAll({
      where: { proveedor_id: id },
      include: [{ model: Persona, as: 'persona' }],
      order: [['es_principal', 'DESC'], ['desde', 'DESC']]
    });
    res.json(personas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const vincularPersona = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body, proveedor_id: id };

    // Si se marca como principal, desmarcar las demás
    if (data.es_principal) {
      await ProveedorPersona.update(
        { es_principal: false },
        { where: { proveedor_id: id } }
      );
    }

    const persona = await ProveedorPersona.create(data);
    const personaCompleta = await ProveedorPersona.findByPk(persona.id, {
      include: [{ model: Persona, as: 'persona' }]
    });

    res.status(201).json(personaCompleta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePersonaVinculada = async (req, res) => {
  try {
    const { id, personaId } = req.params;
    const persona = await ProveedorPersona.findOne({
      where: { id: personaId, proveedor_id: id }
    });

    if (!persona) {
      return res.status(404).json({ message: 'Vinculación no encontrada' });
    }

    // Si se marca como principal, desmarcar las demás
    if (req.body.es_principal) {
      await ProveedorPersona.update(
        { es_principal: false },
        { where: { proveedor_id: id, id: { [Op.ne]: personaId } } }
      );
    }

    await persona.update(req.body);
    const personaCompleta = await ProveedorPersona.findByPk(personaId, {
      include: [{ model: Persona, as: 'persona' }]
    });

    res.json(personaCompleta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const desvincularPersona = async (req, res) => {
  try {
    const { id, personaId } = req.params;
    const deleted = await ProveedorPersona.destroy({
      where: { id: personaId, proveedor_id: id }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Vinculación no encontrada' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const marcarPersonaPrincipal = async (req, res) => {
  try {
    const { id, personaId } = req.params;

    // Desmarcar todas las personas del proveedor
    await ProveedorPersona.update(
      { es_principal: false },
      { where: { proveedor_id: id } }
    );

    // Marcar la seleccionada
    const [updated] = await ProveedorPersona.update(
      { es_principal: true },
      { where: { id: personaId, proveedor_id: id } }
    );

    if (updated === 0) {
      return res.status(404).json({ message: 'Vinculación no encontrada' });
    }

    const personaCompleta = await ProveedorPersona.findByPk(personaId, {
      include: [{ model: Persona, as: 'persona' }]
    });

    res.json(personaCompleta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========================================
// Cuentas Bancarias
// ========================================

export const getCuentasBancarias = async (req, res) => {
  try {
    const { id } = req.params;
    const cuentas = await ProveedorCuentaBancaria.findAll({
      where: { proveedor_id: id },
      order: [['predeterminada', 'DESC'], ['created_at', 'DESC']]
    });
    res.json(cuentas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const agregarCuentaBancaria = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body, proveedor_id: id };

    // Si se marca como predeterminada, desmarcar las demás
    if (data.predeterminada) {
      await ProveedorCuentaBancaria.update(
        { predeterminada: false },
        { where: { proveedor_id: id } }
      );
    }

    const cuenta = await ProveedorCuentaBancaria.create(data);
    res.status(201).json(cuenta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCuentaBancaria = async (req, res) => {
  try {
    const { id, cuentaId } = req.params;
    const cuenta = await ProveedorCuentaBancaria.findOne({
      where: { id: cuentaId, proveedor_id: id }
    });

    if (!cuenta) {
      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }

    // Si se marca como predeterminada, desmarcar las demás
    if (req.body.predeterminada) {
      await ProveedorCuentaBancaria.update(
        { predeterminada: false },
        { where: { proveedor_id: id, id: { [Op.ne]: cuentaId } } }
      );
    }

    await cuenta.update(req.body);
    res.json(cuenta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCuentaBancaria = async (req, res) => {
  try {
    const { id, cuentaId } = req.params;
    const deleted = await ProveedorCuentaBancaria.destroy({
      where: { id: cuentaId, proveedor_id: id }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const marcarCuentaPredeterminada = async (req, res) => {
  try {
    const { id, cuentaId } = req.params;

    // Desmarcar todas las cuentas del proveedor
    await ProveedorCuentaBancaria.update(
      { predeterminada: false },
      { where: { proveedor_id: id } }
    );

    // Marcar la seleccionada
    const [updated] = await ProveedorCuentaBancaria.update(
      { predeterminada: true },
      { where: { id: cuentaId, proveedor_id: id } }
    );

    if (updated === 0) {
      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }

    const cuenta = await ProveedorCuentaBancaria.findByPk(cuentaId);
    res.json(cuenta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleCuentaActiva = async (req, res) => {
  try {
    const { id, cuentaId } = req.params;
    const cuenta = await ProveedorCuentaBancaria.findOne({
      where: { id: cuentaId, proveedor_id: id }
    });

    if (!cuenta) {
      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }

    await cuenta.update({ activa: !cuenta.activa });
    res.json(cuenta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 3.2 Actualizar método `getProveedorById`

```javascript
export const getProveedorById = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id, {
      include: [
        { model: Persona, as: 'persona' },
        { model: ConsorcioProveedor, as: 'consorcios_rel' },
        {
          model: ProveedorPersona,
          as: 'personas',
          include: [{ model: Persona, as: 'persona' }]
        },
        { model: ProveedorCuentaBancaria, as: 'cuentas_bancarias' }
      ]
    });

    if (!proveedor) return res.status(404).json({ message: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## 4️⃣ Rutas

### 4.1 Actualizar `src/routes/proveedores.js`

```javascript
import express from 'express';
import {
  getProveedores,
  getProveedorById,
  getProveedoresStats,
  // Personas
  getPersonasVinculadas,
  vincularPersona,
  updatePersonaVinculada,
  desvincularPersona,
  marcarPersonaPrincipal,
  // Cuentas
  getCuentasBancarias,
  agregarCuentaBancaria,
  updateCuentaBancaria,
  deleteCuentaBancaria,
  marcarCuentaPredeterminada,
  toggleCuentaActiva
} from '../controllers/proveedoresController.js';

const router = express.Router();

// Rutas básicas
router.get('/', getProveedores);
router.get('/stats', getProveedoresStats);
router.get('/:id', getProveedorById);

// Rutas de personas vinculadas
router.get('/:id/personas', getPersonasVinculadas);
router.post('/:id/personas', vincularPersona);
router.put('/:id/personas/:personaId', updatePersonaVinculada);
router.delete('/:id/personas/:personaId', desvincularPersona);
router.patch('/:id/personas/:personaId/principal', marcarPersonaPrincipal);

// Rutas de cuentas bancarias
router.get('/:id/cuentas', getCuentasBancarias);
router.post('/:id/cuentas', agregarCuentaBancaria);
router.put('/:id/cuentas/:cuentaId', updateCuentaBancaria);
router.delete('/:id/cuentas/:cuentaId', deleteCuentaBancaria);
router.patch('/:id/cuentas/:cuentaId/predeterminada', marcarCuentaPredeterminada);
router.patch('/:id/cuentas/:cuentaId/toggle-activa', toggleCuentaActiva);

export default router;
```

---

## 5️⃣ Validaciones Recomendadas

### 5.1 Validación de CBU (backend)

```javascript
function validarCBU(cbu) {
  const regex = /^\d{22}$/;
  return regex.test(cbu.replace(/\s/g, ''));
}
```

### 5.2 Validación de CUIT

```javascript
function validarCUIT(cuit) {
  const regex = /^\d{2}-?\d{8}-?\d{1}$/;
  return regex.test(cuit.replace(/\s/g, ''));
}
```

### 5.3 Middleware de validación

Agregar validaciones en los controladores antes de crear/actualizar:

```javascript
if (req.body.cbu && !validarCBU(req.body.cbu)) {
  return res.status(400).json({
    message: 'El CBU debe tener 22 dígitos'
  });
}
```

---

## 6️⃣ Testing Endpoints

### Personas Vinculadas

```bash
# Listar personas vinculadas
GET /proveedores/1/personas

# Vincular persona
POST /proveedores/1/personas
{
  "persona_id": 5,
  "rol": "responsable_tecnico",
  "desde": "2025-01-01",
  "es_principal": false
}

# Actualizar rol
PUT /proveedores/1/personas/1
{
  "rol": "titular",
  "es_principal": true
}

# Marcar como principal
PATCH /proveedores/1/personas/1/principal

# Desvincular
DELETE /proveedores/1/personas/1
```

### Cuentas Bancarias

```bash
# Listar cuentas
GET /proveedores/1/cuentas

# Agregar cuenta
POST /proveedores/1/cuentas
{
  "banco": "Banco Galicia",
  "titular": "ACME Corporation",
  "cuit_titular": "30-12345678-9",
  "cbu": "0070123456789012345678",
  "alias": "empresa.pago.galicia",
  "tipo_cuenta": "corriente",
  "moneda": "ARS",
  "predeterminada": true
}

# Actualizar cuenta
PUT /proveedores/1/cuentas/1
{
  "banco": "Banco Nación"
}

# Marcar como predeterminada
PATCH /proveedores/1/cuentas/1/predeterminada

# Toggle activa/inactiva
PATCH /proveedores/1/cuentas/1/toggle-activa

# Eliminar
DELETE /proveedores/1/cuentas/1
```

---

## 7️⃣ Índices para Performance

```sql
-- Índices recomendados
CREATE INDEX idx_proveedor_tipo_entidad ON proveedores(tipo_entidad);
CREATE INDEX idx_proveedor_localidad ON proveedores(localidad);
CREATE INDEX idx_proveedor_provincia ON proveedores(provincia);

-- Índices compuestos
CREATE INDEX idx_proveedor_personas_activos
  ON proveedor_personas(proveedor_id, hasta, es_principal);

CREATE INDEX idx_cuentas_predeterminadas
  ON proveedor_cuentas_bancarias(proveedor_id, predeterminada, activa);
```

---

## 8️⃣ Checklist de Implementación

- [ ] Ejecutar migraciones SQL (3 ALTER/CREATE TABLE)
- [ ] Crear modelos ProveedorPersona y ProveedorCuentaBancaria
- [ ] Actualizar modelo Proveedor con nuevos campos
- [ ] Agregar relaciones en index.js
- [ ] Implementar controladores para personas vinculadas (5 métodos)
- [ ] Implementar controladores para cuentas bancarias (6 métodos)
- [ ] Actualizar getProveedorById con includes
- [ ] Agregar rutas en proveedores.js
- [ ] Agregar validaciones (CBU, CUIT)
- [ ] Migrar datos existentes (persona_id → proveedor_personas)
- [ ] Crear índices para performance
- [ ] Testing de todos los endpoints

---

## 📝 Notas Importantes

1. **Migración de datos**: El campo `persona_id` se mantiene por compatibilidad. Los proveedores existentes deberían migrarse a `proveedor_personas` con rol 'titular'.

2. **Lógica de principal/predeterminada**: Al marcar una persona como principal o una cuenta como predeterminada, automáticamente se desmarcan las demás del mismo proveedor.

3. **Soft delete**: Se usa el campo `hasta` en personas para no eliminar registros históricos. Las cuentas pueden inactivarse con el flag `activa`.

4. **Performance**: Los include se deben usar con cuidado. Considerar lazy loading para grandes datasets.

---

## 🔗 Recursos

- Frontend implementado en: `/src/app/features/proveedores/`
- Branch: `claude/advance-providers-module-011CV47e4jemv1A28wGRph5q`
- Commit: d775189

---

**¿Dudas?** Contactá al equipo de desarrollo frontend para coordinar la integración.
