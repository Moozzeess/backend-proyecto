import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoAdmin } from '../../administrador.component';

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
  @Input() listaEmpleados: EmpleadoAdmin[] = [];

  @Output() guardar = new EventEmitter<EmpleadoAdmin>();
  @Output() conmutarEstado = new EventEmitter<number>();
  @Output() errorAlerta = new EventEmitter<string>();
  @Output() exitoAlerta = new EventEmitter<string>();

  empleadoSeleccionado: EmpleadoAdmin = this.valoresPorDefectoEmpleado();
  esEdicionEmpleado: boolean = false;
  mostrarModalEmpleado: boolean = false;

  private valoresPorDefectoEmpleado(): EmpleadoAdmin {
    return { id: 0, nombre: '', puesto: '', sucursal: 'Sucursal Centro', salario: 0, estado: 'Activo' };
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
    this.guardar.emit(this.empleadoSeleccionado);
    this.mostrarModalEmpleado = false;
  }

  cambiarEstado(empleadoId: number): void {
    this.conmutarEstado.emit(empleadoId);
  }
}
