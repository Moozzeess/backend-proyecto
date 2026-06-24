import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

/**
 * Servicio: GeneradorDocumentosService
 * Intención: Proveer métodos reutilizables para compilar y descargar documentos PDF (usando jsPDF)
 *            y XML (usando plantillas de strings y Blobs) de pedidos, facturas, cortes de caja y estados de cuenta.
 */
@Injectable({
  providedIn: 'root'
})
export class GeneradorDocumentosService {

  /**
   * Genera y descarga el PDF de un pedido.
   * Intención: Obtener una representación imprimible y formal de una orden de compra.
   * Parámetros:
   *   - pedido (any): Datos consolidados del pedido.
   * Retorno: void.
   * Casos límite (edge cases):
   *   - Si faltan datos clave, se colocan textos de respaldo por defecto para no romper el layout.
   */
  descargarPedidoPDF(pedido: any): void {
    const doc = new jsPDF();
    
    // Encabezado Corporativo
    doc.setFillColor(214, 37, 77); // #d6254d
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('PIZZA PIZZA', 15, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('CONFIRMACIÓN DE PEDIDO', 155, 25);

    // Detalles del pedido
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Pedido ID: ${pedido.id || 'N/A'}`, 15, 55);
    doc.text(`Fecha/Hora: ${pedido.fechaHora || new Date().toLocaleString()}`, 15, 62);
    doc.text(`Método Entrega: ${pedido.metodoEntrega || 'A domicilio'}`, 15, 69);
    
    doc.text('Datos de Envío:', 120, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`Teléfono: ${pedido.telefono || 'N/A'}`, 120, 62);
    doc.text(`Dirección: ${pedido.direccion || 'Sucursal Principal'}`, 120, 69, { maxWidth: 80 });

    // Tabla de Productos
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 85, 195, 85);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Producto', 15, 92);
    doc.text('Cant.', 120, 92);
    doc.text('Precio Unit.', 150, 92);
    doc.text('Subtotal', 175, 92);
    
    doc.line(15, 95, 195, 95);
    doc.setFont('helvetica', 'normal');

    let y = 102;
    const productos = pedido.productos || [];
    productos.forEach((item: any) => {
      const nombre = item.producto?.nombre || 'Pizza Especialidad';
      const cant = item.cantidad || 1;
      const precio = item.producto?.precio || 0;
      const subt = cant * precio;

      doc.text(nombre, 15, y);
      doc.text(cant.toString(), 120, y);
      doc.text(`$${precio}.00`, 150, y);
      doc.text(`$${subt}.00`, 175, y);
      y += 8;
    });

    doc.line(15, y, 195, y);
    
    // Totales
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Costo de Envío:', 140, y);
    doc.setFont('helvetica', 'normal');
    const envio = pedido.metodoEntrega === 'a domicilio' || pedido.metodoEntrega === 'domicilio' ? 45 : 0;
    doc.text(`$${envio}.00`, 180, y);

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(214, 37, 77);
    doc.text('Total Final:', 140, y);
    doc.text(`$${pedido.total || 0}.00`, 180, y);

    // Pie de página
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Gracias por preferir Pizza Pizza. Este documento es un comprobante de tu compra.', 15, 280);

    doc.save(`pedido_${pedido.id.replace('#', '')}.pdf`);
  }

  /**
   * Genera y descarga el XML de un pedido.
   * Intención: Facilitar un archivo estructurado y legible por software para la orden de compra.
   * Parámetros:
   *   - pedido (any): Datos del pedido.
   * Retorno: void.
   */
  descargarPedidoXML(pedido: any): void {
    const productosXml = (pedido.productos || []).map((item: any) => `
    <Producto>
      <Nombre>${item.producto?.nombre || ''}</Nombre>
      <Cantidad>${item.cantidad}</Cantidad>
      <PrecioUnitario>${item.producto?.precio}</PrecioUnitario>
      <Subtotal>${item.cantidad * item.producto?.precio}</Subtotal>
    </Producto>`).join('');

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Pedido>
  <ID>${pedido.id || ''}</ID>
  <FechaHora>${pedido.fechaHora || ''}</FechaHora>
  <MetodoEntrega>${pedido.metodoEntrega || ''}</MetodoEntrega>
  <Telefono>${pedido.telefono || ''}</Telefono>
  <Direccion>${pedido.direccion || 'Sucursal Principal'}</Direccion>
  <Productos>${productosXml}
  </Productos>
  <CostoEnvio>${pedido.metodoEntrega === 'domicilio' ? 45 : 0}</CostoEnvio>
  <Total>${pedido.total}</Total>
</Pedido>`;

    this.descargarArchivo(xmlContent, `pedido_${pedido.id.replace('#', '')}.xml`, 'application/xml');
  }

  /**
   * Genera y descarga el PDF de una factura.
   * Intención: Descargar la representación digital estructurada de un CFDI fiscal.
   * Parámetros:
   *   - factura (any): Datos de la factura.
   * Retorno: void.
   */
  descargarFacturaPDF(factura: any): void {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFillColor(255, 144, 54); // #ff9036
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('FACTURA FISCAL (CFDI)', 15, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('COMPROBANTE EMITIDO', 155, 25);

    // Emisor y Receptor
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('EMISOR:', 15, 55);
    doc.setFont('helvetica', 'normal');
    doc.text('PIZZA PIZZA S.A. DE C.V.', 15, 61);
    doc.text('RFC: PPI960412XYZ', 15, 67);
    doc.text('Regimen Fiscal: 601 - General de Ley Personas Morales', 15, 73);

    doc.setFont('helvetica', 'bold');
    doc.text('RECEPTOR:', 110, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`Razón Social: ${factura.razonSocial}`, 110, 61);
    doc.text(`RFC: ${factura.rfc}`, 110, 67);
    doc.text(`C.P. Fiscal: ${factura.codigoPostal}`, 110, 73);
    doc.text(`Uso CFDI: ${factura.usoCfdi}`, 110, 79);

    doc.line(15, 87, 195, 87);

    // Datos del CFDI
    doc.setFont('helvetica', 'bold');
    doc.text(`Folio Interno: ${factura.id}`, 15, 95);
    doc.text(`Pedido Asociado: ${factura.pedidoId}`, 15, 101);
    doc.text(`Fecha Emisión: ${factura.fechaHora}`, 110, 95);
    doc.text(`UUID: ${factura.uuid}`, 110, 101, { maxWidth: 85 });

    doc.line(15, 110, 195, 110);

    // Conceptos
    doc.setFont('helvetica', 'bold');
    doc.text('Concepto', 15, 118);
    doc.text('Importe', 170, 118);
    
    doc.line(15, 122, 195, 122);
    doc.setFont('helvetica', 'normal');
    doc.text('Consumo de Alimentos (Seguimiento de orden de pizzería)', 15, 130);
    doc.text(`$${factura.total}.00`, 170, 130);

    doc.line(15, 140, 195, 140);

    // Totales
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 140, 150);
    doc.text(`$${factura.total}.00 MXN`, 170, 150);

    // Sello Digital
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Sello Digital del CFDI:', 15, 175);
    doc.text('y2H9h1K98sJlQpLmNopQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz=', 15, 180, { maxWidth: 180 });
    doc.text('Cadena Original del Timbre:', 15, 190);
    doc.text('||1.1|' + factura.uuid + '|' + factura.fechaHora + '|y2H9h1K98sJlQpLmNopQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz=||', 15, 195, { maxWidth: 180 });

    doc.save(`factura_${factura.id}.pdf`);
  }

  /**
   * Genera y descarga el XML de una factura.
   * Intención: Descargar la representación XML formal de una factura compatible con normativas fiscales.
   * Parámetros:
   *   - factura (any): Datos de la factura.
   * Retorno: void.
   */
  descargarFacturaXML(factura: any): void {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Comprobante xmlns="http://www.sat.gob.mx/cfd/4" Version="4.0" Folio="${factura.id}" Fecha="${factura.fechaHora}" SubTotal="${factura.total}" Total="${factura.total}" Moneda="MXN" TipoDeComprobante="I" UUID="${factura.uuid}">
  <Emisor Rfc="PPI960412XYZ" Nombre="PIZZA PIZZA S.A. DE C.V." RegimenFiscal="601"/>
  <Receptor Rfc="${factura.rfc}" Nombre="${factura.razonSocial}" DomicilioFiscalReceptor="${factura.codigoPostal}" RegimenFiscalReceptor="605" UsoCFDI="${factura.usoCfdi.substring(0, 3)}"/>
  <Conceptos>
    <Concepto ClaveProdServ="90101503" Cantidad="1" ClaveUnidad="ACT" Descripcion="Consumo de Alimentos en Pizzería" ValorUnitario="${factura.total}" Importe="${factura.total}"/>
  </Conceptos>
</Comprobante>`;

    this.descargarArchivo(xmlContent, `factura_${factura.id}.xml`, 'application/xml');
  }

  /**
   * Genera y descarga el PDF de un corte de caja.
   * Intención: Descargar el acta de cierre financiero diario de los empleados en caja.
   * Parámetros:
   *   - corte (any): Datos consolidadores del cierre de caja.
   * Retorno: void.
   */
  descargarCortePDF(corte: any): void {
    const doc = new jsPDF();

    // Encabezado
    doc.setFillColor(150, 150, 150);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('REPORTE: CIERRE DE CAJA', 15, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('CORTE OPERATIVO', 155, 25);

    // Detalles del Corte
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Folio de Cierre: ${corte.id}`, 15, 55);
    doc.text(`Fecha: ${corte.fecha}`, 15, 62);
    doc.text(`Empleado Responsable: ${corte.empleado}`, 15, 69);
    doc.text(`Estado del Corte: ${corte.estado}`, 15, 76);

    doc.line(15, 85, 195, 85);

    // Resumen Financiero
    doc.text('RESUMEN DE OPERACIONES', 15, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cantidad de Pedidos Entregados: ${corte.cantidadPedidos}`, 15, 105);
    doc.text(`Monto Total de Ventas Declaradas: $${corte.totalVentas}.00 MXN`, 15, 112);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones y Notas de Turno:', 15, 125);
    doc.setFont('helvetica', 'normal');
    doc.text(corte.observaciones || 'Sin observaciones.', 15, 132, { maxWidth: 180 });

    doc.line(15, 160, 195, 160);

    // Firmas
    doc.text('Firma del Cajero Responsable', 40, 185);
    doc.line(30, 180, 90, 180);

    doc.text('Firma del Administrador (Receptor)', 130, 185);
    doc.line(120, 180, 180, 180);

    doc.save(`cierre_caja_${corte.id.replace('#', '')}.pdf`);
  }

  /**
   * Genera y descarga el XML de un corte de caja.
   * Intención: Descargar la representación estructurada XML del cierre de caja diario.
   * Parámetros:
   *   - corte (any): Datos consolidadores del cierre de caja.
   * Retorno: void.
   */
  descargarCorteXML(corte: any): void {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<CierreCaja>
  <ID>${corte.id || ''}</ID>
  <Fecha>${corte.fecha || ''}</Fecha>
  <Empleado>${corte.empleado || ''}</Empleado>
  <CantidadPedidos>${corte.cantidadPedidos}</CantidadPedidos>
  <TotalVentas>${corte.totalVentas}</TotalVentas>
  <Observaciones>${corte.observaciones || ''}</Observaciones>
  <Estado>${corte.estado}</Estado>
</CierreCaja>`;

    this.descargarArchivo(xmlContent, `cierre_caja_${corte.id.replace('#', '')}.xml`, 'application/xml');
  }

  /**
   * Genera y descarga el PDF de un estado de cuenta de un empleado.
   * Intención: Proveer un documento detallando el puesto, salario y estatus administrativo del colaborador.
   * Parámetros:
   *   - empleado (any): Datos del empleado administrativo.
   * Retorno: void.
   */
  descargarEstadoCuentaPDF(empleado: any): void {
    const doc = new jsPDF();

    // Encabezado
    doc.setFillColor(214, 37, 77); // #d6254d
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('ESTADO DE CUENTA LABORAL', 15, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('EXPEDIENTE PERSONAL', 150, 25);

    // Datos del Empleado
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Colaborador: ${empleado.nombre}`, 15, 55);
    doc.text(`ID Interno: #EMP-${empleado.id}`, 15, 62);
    doc.text(`Puesto / Cargo: ${empleado.puesto}`, 15, 69);
    doc.text(`Sucursal Asignada: ${empleado.sucursal}`, 15, 76);
    doc.text(`Estatus Actual: ${empleado.estado}`, 15, 83);

    doc.line(15, 92, 195, 92);

    // Detalle de Ingresos / Retenciones Ficticias de Nómina
    doc.text('DETALLE MENSUAL DE NÓMINA (ESTADO DE CUENTA)', 15, 102);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Salario Mensual Bruto: $${empleado.salario.toLocaleString('es-MX')}.00 MXN`, 15, 112);
    const retencionIsr = Math.round(empleado.salario * 0.16);
    const aportacionImss = Math.round(empleado.salario * 0.04);
    const neto = empleado.salario - retencionIsr - aportacionImss;

    doc.text(`Retención de Impuestos (ISR 16%): -$${retencionIsr.toLocaleString('es-MX')}.00 MXN`, 15, 120);
    doc.text(`Aportaciones Seguridad Social (IMSS 4%): -$${aportacionImss.toLocaleString('es-MX')}.00 MXN`, 15, 128);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(214, 37, 77);
    doc.text(`Salario Mensual Neto Recibido: $${neto.toLocaleString('es-MX')}.00 MXN`, 15, 140);

    doc.line(15, 150, 195, 150);

    // Pie
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Este es un documento emitido con fines informativos del historial salarial del colaborador.', 15, 275);

    doc.save(`estado_cuenta_${empleado.nombre.replace(/\s+/g, '_')}.pdf`);
  }

  /**
   * Genera y descarga el XML de un estado de cuenta.
   * Intención: Descargar la representación XML del expediente salarial mensual del empleado.
   * Parámetros:
   *   - empleado (any): Datos del empleado.
   * Retorno: void.
   */
  descargarEstadoCuentaXML(empleado: any): void {
    const retencionIsr = Math.round(empleado.salario * 0.16);
    const aportacionImss = Math.round(empleado.salario * 0.04);
    const neto = empleado.salario - retencionIsr - aportacionImss;

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<EstadoCuentaLaboral>
  <Empleado>
    <ID>${empleado.id}</ID>
    <Nombre>${empleado.nombre}</Nombre>
    <Puesto>${empleado.puesto}</Puesto>
    <Sucursal>${empleado.sucursal}</Sucursal>
    <Estatus>${empleado.estado}</Estatus>
  </Empleado>
  <Finanzas>
    <SalarioBruto>${empleado.salario}</SalarioBruto>
    <Retenciones>
      <ISR>${retencionIsr}</ISR>
      <IMSS>${aportacionImss}</IMSS>
    </Retenciones>
    <SalarioNeto>${neto}</SalarioNeto>
  </Finanzas>
</EstadoCuentaLaboral>`;

    this.descargarArchivo(xmlContent, `estado_cuenta_${empleado.nombre.replace(/\s+/g, '_')}.xml`, 'application/xml');
  }

  /**
   * Helper privado para descargar datos textuales como archivos a través de un Blob.
   */
  private descargarArchivo(contenido: string, nombreArchivo: string, mimeType: string): void {
    const blob = new Blob([contenido], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
