-- =============================================
-- SISTEMA DE GESTIÓN PARA PIZZERÍA
-- Script de Creación de Base de Datos
-- =============================================

CREATE DATABASE IF NOT EXISTS pizzeria_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_spanish_ci;

USE pizzeria_db;

-- Tabla: Sucursal
CREATE TABLE Sucursal (
    idSucursal INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    horario VARCHAR(100) NOT NULL,
    PRIMARY KEY (idSucursal)
);

-- Tabla: Usuario (Para autenticación y control de roles)
CREATE TABLE Usuario (
    idUsuario INT NOT NULL AUTO_INCREMENT,
    correo VARCHAR(120) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL, -- Almacena el hash encriptado (Bcrypt)
    rol VARCHAR(30) NOT NULL DEFAULT 'cliente', -- 'cliente', 'empleado', 'administrador'
    fechaRegistro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (idUsuario)
);

-- Tabla: Empleado
CREATE TABLE Empleado (
    idEmpleado INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    puesto VARCHAR(50) NOT NULL,
    salario DECIMAL(10,2) NOT NULL CHECK (salario >= 0),
    idSucursal INT NOT NULL,
    idUsuario INT UNIQUE, -- Asociación con sus credenciales de acceso
    PRIMARY KEY (idEmpleado),
    FOREIGN KEY (idSucursal)
        REFERENCES Sucursal(idSucursal)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- Tabla: Cliente
CREATE TABLE Cliente (
    idCliente INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    telefono VARCHAR(150) NOT NULL UNIQUE,
    direccion VARCHAR(200),
    idUsuario INT UNIQUE, -- Asociación con sus credenciales de acceso (evita duplicar el correo)
    PRIMARY KEY (idCliente),
    FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Tabla: Producto
CREATE TABLE Producto (
    idProducto INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    categoria VARCHAR(50) NOT NULL,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (idProducto)
);

-- Tabla: Pedido
CREATE TABLE Pedido (
    idPedido INT NOT NULL AUTO_INCREMENT,
    fechaPedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    idCliente INT NOT NULL,
    idSucursal INT NOT NULL,
    PRIMARY KEY (idPedido),
    FOREIGN KEY (idCliente)
        REFERENCES Cliente(idCliente)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (idSucursal)
        REFERENCES Sucursal(idSucursal)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- Tabla: DetallePedido
CREATE TABLE DetallePedido (
    idDetalle INT NOT NULL AUTO_INCREMENT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precioUnitario DECIMAL(10,2) NOT NULL CHECK (precioUnitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    idPedido INT NOT NULL,
    idProducto INT NOT NULL,
    PRIMARY KEY (idDetalle),
    FOREIGN KEY (idPedido)
        REFERENCES Pedido(idPedido)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (idProducto)
        REFERENCES Producto(idProducto)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =============================================
-- INSERCIÓN DE DATOS SEMILLA (SEEDS)
-- =============================================

-- 1. Sucursales
INSERT INTO Sucursal (idSucursal, nombre, direccion, telefono, horario) VALUES
(1, 'Sucursal Centro', 'Av. Juárez #102, Col. Centro', '5512345678', '11:00 AM - 10:00 PM'),
(2, 'Sucursal Norte', 'Blvd. Diaz Ordaz #405, Col. Las Torres', '5587654321', '11:00 AM - 11:00 PM'),
(3, 'Sucursal Sur', 'Calzada Tlalpan #2030, Col. Portales', '5598765432', '12:00 PM - 10:00 PM');

-- 5. Productos
INSERT INTO Producto (idProducto, nombre, descripcion, precio, categoria, disponible) VALUES
(1, 'Pepperoni Supreme', 'Pizza clásica con pepperoni premium y champiñones frescos.', 185.00, 'pizza', TRUE),
(2, 'Hawaiana Real', 'Combinación dulce de jamón York y piña caramelizada.', 175.00, 'pizza', TRUE),
(3, 'Mexicana Premium', 'Sabor mexicano con frijoles, chorizo y jalapeños.', 195.00, 'pizza', TRUE),
(4, 'Tiramisú Casero', 'Postre de café expreso con queso mascarpone.', 65.00, 'postre', TRUE),
(5, 'Cerveza Artesanal Porter', 'Cerveza oscura artesanal malteada nacional.', 45.00, 'bebida', TRUE);