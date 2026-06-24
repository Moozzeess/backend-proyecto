import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoAdmin } from '../../administrador.component';
import { GeneradorDocumentosService } from '../../../../core/services/generador-documentos.service';

/**
 * Componente: EmpleadosComponent
 * Intención: Administrar el directorio de empleados, roles y estatus.
 * Parámetros:
 *   - listaEmpleados: EmpleadoAdmin[] - Lista de empleados.
 */
@Component({
  selector: 'app-admin-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.component.html'
})
export class EmpleadosComponent {
  private generadorDocumentos = inject(GeneradorDocumentosService);

  @Input() listaEmpleados: EmpleadoAdmin[] = [];

  @Output() guardar = new EventEmitter<EmpleadoAdmin>();
  @Output() conmutarEstado = new EventEmitter<number>();
  @Output() errorAlerta = new EventEmitter<string>();
  @Output() exitoAlerta = new EventEmitter<string>();

  empleadoSeleccionado: EmpleadoAdmin = this.valoresPorDefectoEmpleado();
  esEdicionEmpleado: boolean = false;
  mostrarModalEmpleado: boolean = false;

  private valoresPorDefectoEmpleado(): EmpleadoAdmin {
    return { id: 0, nombre: '', puesto: 'Chef Pizzero', sucursal: 'Sucursal Centro', salario: 0, estado: 'Activo', correo: '', contrasena: '' };
  }

  abrirAgregarEmpleado(): void {
    this.empleadoSeleccionado = this.valoresPorDefectoEmpleado();
    this.esEdicionEmpleado = false;
    this.mostrarModalEmpleado = true;
  }

  abrirEditarEmpleado(empleado: EmpleadoAdmin): void {
    this.empleadoSeleccionado = { ...empleado };
    this.esEdicionEmpleado = true;
    this.mostrarModalEmpleado = true;
  }

  guardarEmpleado(): void {
    if (!this.empleadoSeleccionado.nombre.trim() || !this.empleadoSeleccionado.puesto.trim() || this.empleadoSeleccionado.salario <= 0) {
      this.errorAlerta.emit('Por favor complete todos los datos del empleado.');
      return;
    }
    if (!this.esEdicionEmpleado && (!this.empleadoSeleccionado.correo?.trim() || !this.empleadoSeleccionado.contrasena?.trim())) {
      this.errorAlerta.emit('Es obligatorio proveer un correo y contraseña para crear la cuenta de acceso del empleado.');
      return;
    }
    this.guardar.emit(this.empleadoSeleccionado);
    this.mostrarModalEmpleado = false;
  }

  cambiarEstado(empleadoId: number): void {
    this.conmutarEstado.emit(empleadoId);
  }

  /**
   * Intención: Descargar en PDF el estado de cuenta laboral del empleado.
   */
  descargarEstadoCuentaPDF(empleado: EmpleadoAdmin): void {
    this.generadorDocumentos.descargarEstadoCuentaPDF(empleado);
    this.exitoAlerta.emit(`Estado de cuenta en PDF descargado para ${empleado.nombre}.`);
  }

  /**
   * Intención: Descargar en XML el estado de cuenta laboral del empleado.
   */
  descargarEstadoCuentaXML(empleado: EmpleadoAdmin): void {
    this.generadorDocumentos.descargarEstadoCuentaXML(empleado);
    this.exitoAlerta.emit(`Estado de cuenta en XML descargado para ${empleado.nombre}.`);
  }
}
