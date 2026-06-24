-- =============================================
-- ACTUALIZACIÓN DE BASE DE DATOS PARA ADMINISTRACIÓN
-- =============================================

USE pizzeria_db;

-- 1. Modificar tabla Empleado para soportar la columna de estado
ALTER TABLE Empleado ADD COLUMN estado VARCHAR(15) NOT NULL DEFAULT 'Activo';

-- 2. Tabla: Ingrediente
CREATE TABLE IF NOT EXISTS Ingrediente (
    idIngrediente INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    stockActual INT NOT NULL DEFAULT 0 CHECK (stockActual >= 0),
    stockMinimo INT NOT NULL DEFAULT 0 CHECK (stockMinimo >= 0),
    unidad VARCHAR(15) NOT NULL,
    PRIMARY KEY (idIngrediente)
);

-- 3. Tabla: Factura
CREATE TABLE IF NOT EXISTS Factura (
    idFactura VARCHAR(30) NOT NULL,
    fechaHora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pedidoId INT NOT NULL,
    rfc VARCHAR(15) NOT NULL,
    razonSocial VARCHAR(150) NOT NULL,
    usoCfdi VARCHAR(50) NOT NULL,
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    estado VARCHAR(15) NOT NULL DEFAULT 'Emitida',
    PRIMARY KEY (idFactura),
    FOREIGN KEY (pedidoId)
        REFERENCES Pedido(idPedido)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- 4. Tabla: CorteCaja
CREATE TABLE IF NOT EXISTS CorteCaja (
    idCorte VARCHAR(30) NOT NULL,
    fecha DATE NOT NULL,
    idEmpleado INT NOT NULL,
    totalVentas DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (totalVentas >= 0),
    cantidadPedidos INT NOT NULL DEFAULT 0 CHECK (cantidadPedidos >= 0),
    observaciones TEXT,
    estado VARCHAR(15) NOT NULL DEFAULT 'Pendiente',
    PRIMARY KEY (idCorte),
    FOREIGN KEY (idEmpleado)
        REFERENCES Empleado(idEmpleado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =============================================
-- INSERCIÓN DE DATOS SEMILLA (SEEDS)
-- =============================================

-- Ingredientes
INSERT INTO Ingrediente (nombre, stockActual, stockMinimo, unidad) VALUES
('Queso Mozzarella', 45, 15, 'kg'),
('Pepperoni', 18, 8, 'kg'),
('Jamón York', 12, 10, 'kg'),
('Piña Caramelizada', 25, 5, 'kg'),
('Champiñones', 14, 6, 'kg'),
('Chorizo', 15, 8, 'kg'),
('Jalapeños', 10, 5, 'kg')
ON DUPLICATE KEY UPDATE stockActual = VALUES(stockActual);

-- Facturas (Necesitamos que exista el Pedido idPedido = 1, insertado de forma previa en database_prueba.sql. Si no existe, este insert fallará, por lo que agregamos validación o lo asociamos al primer pedido)
INSERT INTO Factura (idFactura, fechaHora, pedidoId, rfc, razonSocial, usoCfdi, total, estado)
SELECT 'FAC-8921', '2026-06-10 11:24:00', idPedido, 'GOMA850212XYZ', 'Alejandra Gómez Martinez', 'G03 - Gastos en general', total, 'Emitida'
FROM Pedido LIMIT 1;

-- Cortes de Caja (Requiere que exista el Empleado idEmpleado = 1)
INSERT INTO CorteCaja (idCorte, fecha, idEmpleado, totalVentas, cantidadPedidos, observaciones, estado)
SELECT '#C-8921', '2026-06-10', idEmpleado, 1250.00, 5, 'Todo cuadra correctamente en caja.', 'Aprobado'
FROM Empleado LIMIT 1;
