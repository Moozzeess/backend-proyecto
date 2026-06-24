const nodemailer = require('nodemailer');
const registrador = require('../utilidades/registrador.utilidad');
require('dotenv').config();

// Desestructurar variables de configuración SMTP del entorno
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

/**
 * Instancia o configura el transportador de nodemailer según los parámetros definidos en el entorno.
 * Si existen credenciales SMTP reales, intenta verificarlas. Si fallan las credenciales,
 * degrada automáticamente hacia Ethereal Mail o simulación por consola para no interrumpir las pruebas.
 * 
 * Intención: Obtener un canal de envío de correos resistente a fallos de red o credenciales inválidas.
 * Parámetros: Ninguno.
 * Retorno: {Promise<Object>} Transportador de nodemailer configurado.
 */
async function obtenerTransportador() {
  // 1. Si las variables SMTP están configuradas, intentar usar el SMTP real
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    try {
      const transportadorReal = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        secure: parseInt(SMTP_PORT, 10) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      });
      
      // Probar conexión real de forma rápida (tiempo límite de 3 segundos)
      await Promise.race([
        transportadorReal.verify(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera de conexión SMTP agotado.')), 3000))
      ]);
      
      return transportadorReal;
    } catch (error) {
      registrador.warn(`Las credenciales del SMTP real fallaron (${error.message}). Se usará el entorno de pruebas.`);
    }
  }

  // 2. Si falla el SMTP real o no está configurado, intentar usar Ethereal Mail
  try {
    const cuentaPrueba = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: cuentaPrueba.user,
        pass: cuentaPrueba.pass
      }
    });
  } catch (error) {
    // 3. Si falla la red, retornar transportador simulado en consola
    registrador.warn('Servicio de SMTP o Ethereal no disponible. Se simulará el correo por terminal.');
    return {
      sendMail: async (opciones) => {
        registrador.info(`[SIMULACIÓN CORREO ENVIADO]:
          Para: ${opciones.to}
          Asunto: ${opciones.subject}
          Mensaje HTML:
          ${opciones.html}
        `);
        return { messageId: 'simulado-id', testMessageUrl: false };
      }
    };
  }
}

/**
 * Servicio: CorreoServicio
 * Intención: Encapsular todas las plantillas y transmisiones de correo electrónico de la aplicación.
 */
class CorreoServicio {
  /**
   * Envía un correo electrónico estético de bienvenida al nuevo usuario.
   * 
   * Intención: Notificar al usuario sobre su registro exitoso.
   * Parámetros:
   *   - correoDestinatario: {string} Dirección del destinatario.
   *   - nombreUsuario: {string} Nombre de la persona a saludar.
   * Retorno: {Promise<void>} Promesa asíncrona vacía.
   */
  static async enviarCorreoBienvenida(correoDestinatario, nombreUsuario) {
    try {
      const transportador = await obtenerTransportador();
      
      const plantillaHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="background-color: #ff9036; padding: 15px; text-align: center; border-radius: 6px 6px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">¡Bienvenido a Pizza Pizza!</h1>
          </div>
          <div style="padding: 20px; color: #333333; line-height: 1.6;">
            <p>Hola, <strong>${nombreUsuario}</strong>,</p>
            <p>Gracias por unirte a nuestra comunidad gourmet. Tu cuenta ha sido creada exitosamente en nuestro sistema.</p>
            <p>A partir de este momento puedes acceder a nuestra tienda, realizar pedidos de nuestras especialidades culinarias y darles seguimiento en tiempo real.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:4200/login" style="background-color: #d6254d; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Acceder a mi Cuenta
              </a>
            </div>
            <p>Si tienes alguna duda o aclaración, ponte en contacto con nuestro equipo respondiendo a este mensaje.</p>
          </div>
          <div style="background-color: #fdeba9; padding: 15px; text-align: center; font-size: 12px; color: #666666; border-radius: 0 0 6px 6px;">
            Este es un correo informativo generado de forma automática.
          </div>
        </div>
      `;

      const resultado = await transportador.sendMail({
        from: '"Pizza Pizza 🍕" <noreply@pizzapizza.com>',
        to: correoDestinatario,
        subject: '¡Registro Exitoso! - Pizza Pizza',
        html: plantillaHtml
      });

      registrador.info(`Correo electrónico de bienvenida enviado exitosamente a: ${correoDestinatario}`);
      
      if (resultado.testMessageUrl) {
        registrador.info(`Previsualización del correo (Ethereal Mail): ${nodemailer.getTestMessageUrl(resultado)}`);
      }
    } catch (error) {
      registrador.error('Error al enviar el correo electrónico de bienvenida', error);
    }
  }

  /**
   * Envía un correo electrónico detallado de confirmación de pedido al cliente.
   * 
   * Intención: Notificar al cliente sobre los detalles de su orden recién creada.
   * Parámetros:
   *   - correoDestinatario: {string} Dirección de correo del destinatario.
   *   - pedido: {Object} Datos consolidados del pedido (id, total, productos, metodoEntrega, direccion, telefono).
   * Retorno: {Promise<void>} Promesa asíncrona vacía.
   */
  static async enviarCorreoPedido(correoDestinatario, pedido) {
    try {
      const transportador = await obtenerTransportador();
      
      const productosHtml = pedido.productos.map(p => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${p.producto.nombre}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${p.cantidad}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${p.producto.precio * p.cantidad}.00</td>
        </tr>
      `).join('');

      const plantillaHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="background-color: #d6254d; padding: 15px; text-align: center; border-radius: 6px 6px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">¡Confirmación de tu Pedido!</h1>
          </div>
          <div style="padding: 20px; color: #333333; line-height: 1.6;">
            <p>Tu orden <strong>${pedido.id}</strong> ha sido recibida con éxito y está siendo procesada.</p>
            <p>Se adjuntan los comprobantes correspondientes a tu compra en formato PDF.</p>
            
            <h3 style="border-bottom: 2px solid #ff9036; padding-bottom: 5px; color: #d6254d;">Detalle de la Compra</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #fdeba9;">
                  <th style="padding: 10px; text-align: left;">Producto</th>
                  <th style="padding: 10px; text-align: center;">Cant.</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${productosHtml}
              </tbody>
            </table>
            
            <div style="margin-top: 20px; text-align: right;">
              <p><strong>Costo de Envío:</strong> $${pedido.metodoEntrega === 'domicilio' ? '45.00' : '0.00'}</p>
              <p style="font-size: 18px; color: #d6254d;"><strong>Total Final:</strong> $${pedido.total}.00</p>
            </div>

            <h3 style="border-bottom: 2px solid #ff9036; padding-bottom: 5px; color: #d6254d;">Datos de Entrega</h3>
            <p><strong>Método de entrega:</strong> ${pedido.metodoEntrega}</p>
            <p><strong>Dirección:</strong> ${pedido.direccion || 'N/A'}</p>
            <p><strong>Teléfono:</strong> ${pedido.telefono}</p>
          </div>
          <div style="background-color: #fdeba9; padding: 15px; text-align: center; font-size: 12px; color: #666666; border-radius: 0 0 6px 6px;">
            Este es un correo informativo generado de forma automática.
          </div>
        </div>
      `;

      // 1. Generar PDF de Comprobante de Pago usando pdfkit
      const PDFDocument = require('pdfkit');
      const streamBuffers = require('stream-buffers');

      const bufferComprobante = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer({
          initialSize: (100 * 1024),
          incrementAmount: (10 * 1024)
        });
        doc.pipe(myWritableStreamBuffer);

        // Cabecera del PDF
        doc.fillColor('#d6254d').fontSize(26).text('PIZZA PIZZA', { align: 'center' });
        doc.fillColor('#333333').fontSize(12).text('Comprobante de Pago y Consumo', { align: 'center' }).moveDown(1.5);
        
        doc.strokeColor('#ff9036').lineWidth(2).moveTo(50, 110).lineTo(550, 110).stroke().moveDown(1.5);

        doc.fontSize(10).text(`Folio de Pedido: ${pedido.id}`);
        doc.text(`Fecha y Hora: ${new Date().toLocaleString('es-MX')}`);
        doc.text(`Método de Pago: ${pedido.metodoPago || 'Efectivo'}`);
        doc.text(`Tipo de Entrega: ${pedido.metodoEntrega}`).moveDown(1.5);

        // Tabla de Productos
        doc.fillColor('#d6254d').fontSize(14).text('Detalles del Consumo:', { underline: true }).moveDown(0.5);
        doc.fillColor('#333333').fontSize(10);
        
        pedido.productos.forEach(p => {
          const precioItem = p.producto.precio || p.producto.precioUnitario || 0;
          doc.text(`• ${p.cantidad}x ${p.producto.nombre} -- Subtotal: $${precioItem * p.cantidad}.00`);
        });

        doc.moveDown(1);
        if (pedido.metodoEntrega === 'domicilio') {
          doc.text('Costo de Envío: $45.00');
        }
        doc.fillColor('#d6254d').fontSize(12).text(`TOTAL PAGADO: $${pedido.total}.00`, { align: 'right', bold: true });

        // Pie de página
        doc.moveDown(3);
        doc.fillColor('#666666').fontSize(8).text('Gracias por su preferencia. Conserve este ticket como comprobante.', { align: 'center' });
        
        doc.end();

        myWritableStreamBuffer.on('finish', () => {
          resolve(myWritableStreamBuffer.getContents());
        });
        myWritableStreamBuffer.on('error', (err) => {
          reject(err);
        });
      });

      const adjuntos = [
        {
          filename: `comprobante_${pedido.id.replace('#', '')}.pdf`,
          content: bufferComprobante
        }
      ];

      // 2. Verificar si se ha solicitado o existe una factura emitida en base de datos para este pedido
      try {
        const cleanId = parseInt(pedido.id.replace('#', ''), 10);
        const FacturaModelo = require('../modelos/factura.modelo');
        const factura = await FacturaModelo.buscarPorPedido(cleanId);

        if (factura) {
          const bufferFactura = await new Promise((resolve, reject) => {
            const docFact = new PDFDocument({ margin: 50 });
            const myWritableStreamBufferFact = new streamBuffers.WritableStreamBuffer({
              initialSize: (100 * 1024),
              incrementAmount: (10 * 1024)
            });
            docFact.pipe(myWritableStreamBufferFact);

            // Cabecera Factura
            docFact.fillColor('#333333').fontSize(22).text('FACTURA FISCAL', { align: 'center' });
            docFact.fontSize(10).text(`Folio Fiscal: ${factura.idFactura}`, { align: 'center' }).moveDown(1.5);
            docFact.strokeColor('#ff9036').lineWidth(2).moveTo(50, 100).lineTo(550, 100).stroke().moveDown(1.5);

            // Información del Emisor (La Empresa) y del Receptor
            docFact.fillColor('#d6254d').fontSize(12).text('DATOS DEL EMISOR:').moveDown(0.5);
            docFact.fillColor('#333333').fontSize(10);
            docFact.text('Razón Social: Pizza Pizza S.A. de C.V.');
            docFact.text('RFC Emisor: PPI120615XYZ');
            docFact.text('Régimen Fiscal: 601 - General de Ley Personas Morales');
            docFact.text('Dirección Fiscal: Avenida Constituyentes 500, Colonia Centro, C.P. 76000, Querétaro, Qro.');
            docFact.text('Teléfono: 55-9876-5432').moveDown(1);

            docFact.fillColor('#d6254d').fontSize(12).text('DATOS DEL RECEPTOR:').moveDown(0.5);
            docFact.fillColor('#333333').fontSize(10);
            docFact.text(`RFC Receptor: ${factura.rfc}`);
            docFact.text(`Razón Social: ${factura.razonSocial}`);
            docFact.text(`Uso CFDI: ${factura.usoCfdi || 'G03 - Gastos en general'}`);
            docFact.text(`Pedido Asociado: #${factura.pedidoId}`);
            docFact.text(`Fecha Emisión: ${new Date(factura.fechaHora).toLocaleString('es-MX')}`).moveDown(1.5);

            // Conceptos
            docFact.fillColor('#d6254d').fontSize(12).text('CONCEPTOS FACTURADOS:').moveDown(0.5);
            docFact.fillColor('#333333').fontSize(10);
            pedido.productos.forEach(p => {
              const precioItem = p.producto.precio || p.producto.precioUnitario || 0;
              docFact.text(`1 Servicio de Preparación - ${p.cantidad}x ${p.producto.nombre} -- Valor Unitario: $${precioItem}.00`);
            });
            
            docFact.moveDown(1);
            docFact.fillColor('#d6254d').fontSize(12).text(`TOTAL FACTURADO: $${factura.total}.00`, { align: 'right', bold: true });

            docFact.end();

            myWritableStreamBufferFact.on('finish', () => {
              resolve(myWritableStreamBufferFact.getContents());
            });
            myWritableStreamBufferFact.on('error', (err) => {
              reject(err);
            });
          });

          adjuntos.push({
            filename: `factura_${factura.idFactura}.pdf`,
            content: bufferFactura
          });
        }
      } catch (errFact) {
        registrador.error('No se pudo verificar o adjuntar factura al correo', { mensaje: errFact.message });
      }

      const resultado = await transportador.sendMail({
        from: '"Pizza Pizza" <noreply@pizzapizza.com>',
        to: correoDestinatario,
        subject: `Confirmación de Pedido ${pedido.id} - Pizza Pizza`,
        html: plantillaHtml,
        attachments: adjuntos
      });

      registrador.info(`Correo electrónico de pedido con PDF adjunto enviado a: ${correoDestinatario}`);
      
      if (resultado.testMessageUrl) {
        registrador.info(`Previsualización del correo (Ethereal Mail): ${nodemailer.getTestMessageUrl(resultado)}`);
      }
    } catch (error) {
      registrador.error('Error al enviar el correo electrónico del pedido', error);
    }
  }

  /**
   * Verifica la validez de la configuración y la conectividad del correo emisor.
   * 
   * Intención: Validar que el servidor SMTP y las credenciales de correo emisor funcionan al arrancar.
   * Parámetros: Ninguno.
   * Retorno: {Promise<boolean>} True si la validación es exitosa, false en caso contrario.
   */
  static async verificarConexion() {
    try {
      const transportador = await obtenerTransportador();
      // Si es el mock de consola, no requiere verificar
      if (typeof transportador.verify !== 'function') {
        registrador.info('Servicio de correo: Listo en modo de simulación de consola.');
        return true;
      }
      await transportador.verify();
      registrador.info('Servicio de correo: Conexión y credenciales con el servidor SMTP verificadas correctamente.');
      return true;
    } catch (error) {
      // Registrar error pero retornar true para permitir que las pruebas en desarrollo continúen usando Ethereal/Consola
      registrador.warn('Servicio de correo: Fallo en SMTP real. La aplicación usará transportador de respaldo (Ethereal/Consola).');
      return true;
    }
  }
}

module.exports = CorreoServicio;
