document.addEventListener('DOMContentLoaded', function() {
    // Definición de variables de ELEMENTOS DOM (se mantiene igual)
    const countryModal = document.getElementById('country-modal');
    const paymentModal = document.getElementById('payment-modal');
    const methodsModal = document.getElementById('methods-modal'); 
    const rechargeHistoryList = document.getElementById('recharge-history-list'); 

    const payButton = document.getElementById('pay-button');
    const confirmPaymentButton = document.getElementById('confirm-payment-button'); 
    const goBackPaymentButton = document.getElementById('go-back-payment'); 
    const copyAllButton = document.getElementById('copy-all-methods');
    const countryCards = document.querySelectorAll('.country-card');
    
    const usdAmountInput = document.getElementById('usd-amount');
    const paymentError = document.getElementById('payment-validation-error');
    
    // Variables de estado (se mantiene igual)
    let isFirstPayment = JSON.parse(localStorage.getItem('isFirstPayment')) !== false; 
    const MIN_FIRST_PAYMENT = 5;
    const MIN_SUBSEQUENT_PAYMENT = 3;
    let selectedCountryRate = null;
    let fullTextToCopy = ''; 
    let currentRechargeData = {}; 
    
    // Historial (Simulación de DB con LocalStorage) (se mantiene igual)
    let RECHARGE_HISTORY = JSON.parse(localStorage.getItem('rechargeHistory')) || []; 

    // --- DATOS DE CONVERSIÓN Y CLASES DE BANDERA (se mantiene igual) ---
    const exchangeRates = [
        { name: "Argentina", code: "ARS", rate: 52000, flagClass: "argentina" },
        { name: "Bolivia", code: "BOB", rate: 16, flagClass: "bolivia" }, 
        { name: "Brasil", code: "BRL", rate: 5.2, flagClass: "brasil" },
        { name: "Chile", code: "CLP", rate: 950, flagClass: "chile" },
        { name: "Colombia", code: "COP", rate: 4200, flagClass: "colombia" },
        { name: "Rep. Dominicana", code: "DOP", rate: 68.00, flagClass: "republica-dominicana" },
        { name: "Ecuador", code: "USD", rate: 1, flagClass: "ecuador" },
        { name: "Estados Unidos", code: "USD", rate: 1, flagClass: "estados-unidos" },
        { name: "Guatemala", code: "GTQ", rate: 7.8, flagClass: "guatemala" },
        { name: "Honduras", code: "HNL", rate: 25.00, flagClass: "honduras" },
        { name: "México", code: "MXN", rate: 20.00, flagClass: "mexico" },
        { name: "Nicaragua", code: "NIO", rate: 36.5, flagClass: "nicaragua" },
        { name: "Panamá", code: "USD", rate: 1, flagClass: "panama" },
        { name: "Paraguay", code: "PYG", rate: 7300, flagClass: "paraguay" },
        { name: "Perú", code: "PEN", rate: 3.8, flagClass: "peru" },
        { name: "Venezuela", code: "VES", rate: 279, flagClass: "venezuela" }
    ];

    // --- PLANTILLAS DE PAGO (se mantiene igual) ---
    const paymentTemplates = { 
        "Argentina": `💰 *DATOS DE PAGO*
🌍 *País:* Argentina
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🔵 *Uala* (🏦 TRANSFERENCIA)
📋 CVU: 0000007900203350273548 | Alias: C.CORREA1315.UALA
💡 Transferencia UALA (Dólar a 52000)
⚠️ *IMPORTANTE:*
• Envía exactamente ARS (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Bolivia": `💰 *DATOS DE PAGO*
🌍 *País:* Bolivia
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
💜 *Yape* (💵 EFECTIVO)
📋 N° Cuenta: 62656932
💡 Banca Electrónica Yape (Dólar a 16 Bs)
---
📱 *Yape QR* (💵 EFECTIVO)
📋 Código QR disponible en el link.
https://i.postimg.cc/YCg1rRGF/qrbolivia.jpg
💡 Escanea el código QR de Yape (Dólar a 16 Bs)
---
🔷 *BCP* (🏦 TRANSFERENCIA)
📋 N° Cuenta: 20152008832355
💡 Cuenta Ahorros BCP (Dólar a 16 Bs)
⚠️ *IMPORTANTE:*
• Envía exactamente BOB (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Brasil": `💰 *DATOS DE PAGO*
🌍 *País:* Brasil
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🟢 *PIX* (🏦 TRANSFERENCIA)
📋 Chave PIX: 91991076791
💡 Transferência instantânea PIX
⚠️ *IMPORTANTE:*
• Envía exactamente BRL (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Chile": `💰 *DATOS DE PAGO*
🌍 *País:* Chile
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🏪 *Banco Estado (Caja Vecina)* (💵 EFECTIVO)
📋 Titular: XAVIER FUENZALIDA | RUT: 23.710.151-0 | CuentaRUT: 23710151
💡 CAJA VECINA - Depósito en efectivo
---
🟢 *Banco Estado (Transferencia)* (🏦 TRANSFERENCIA)
📋 Titular: XAVIER FUENZALIDA | RUT: 23.710.151-0 | CuentaRUT: 23710151
💡 TRANSFERENCIA BANCARIA
⚠️ *IMPORTANTE:*
• Envía exactamente CLP (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Colombia": `💰 *DATOS DE PAGO*
🌍 *País:* Colombia
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🟡 *Bancolombia* (🏦 TRANSFERENCIA)
📋 N° Cuenta: 76900007797
💡 Transferencia Ahorros Bancolombia
---
🔵 *Nequi* (💵 EFECTIVO)
📋 Nequi: 3016043120
💡 Envía dinero por Nequi
---
🟣 *Nu Bank* (🏦 TRANSFERENCIA)
📋 Llave Nu: @PMG3555
💡 Transferencia Nu Bank
⚠️ *IMPORTANTE:*
• Envía exactamente COP (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Rep. Dominicana": `💰 *DATOS DE PAGO*
🌍 *País:* República Dominicana
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🟦 *Banreservas* (🏦 TRANSFERENCIA)
📋 N° Cuenta: 9601546622
💡 Transferencia Cuenta Ahorro Banreservas
---
🔴 *Banco Popular* (🏦 TRANSFERENCIA)
📋 N° Cuenta: 837147719
💡 Transferencia Cuenta Ahorro Popular
---
🟨 *BHD León* (🏦 TRANSFERENCIA)
📋 N° Cuenta: 34478720012
💡 Transferencia BHD León
---
🟢 *Qik* (💵 EFECTIVO)
📋 N° Cuenta: 1002173707
💡 Pago móvil Qik
⚠️ *IMPORTANTE:*
• Envía exactamente DOP (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Ecuador": `💰 *DATOS DE PAGO*
🌍 *País:* Ecuador
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🟨 *Banco Pichincha* (🏦 TRANSFERENCIA)
📋 N° Cuenta: 2207195565
💡 Transferencia Cuenta Ahorro Pichincha
⚠️ *IMPORTANTE:*
• Envía exactamente USD (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Estados Unidos": `💰 *DATOS DE PAGO*
🌍 *País:* Estados Unidos
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
💎 *Zelle Tickets DAVID* (💵 EFECTIVO)
📋 Número: +1 (754) 317-1482
💡 Banca Electrónica Zelle
⚠️ *IMPORTANTE:*
• Envía exactamente USD (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Guatemala": `💰 *DATOS DE PAGO*
🌍 *País:* Guatemala
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🟩 *Banrural* (🏦 TRANSFERENCIA)
📋 N° Cuenta: 4431164091
💡 Transferencia Banrural
⚠️ *IMPORTANTE:*
• Envía exactamente GTQ (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Honduras": `💰 *DATOS DE PAGO*
🌍 *País:* Honduras
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🔵 *Bampais* (🏦 TRANSFERENCIA)
📋 N° Cuenta: 216400100524
💡 Transferencia Cuenta Ahorros Bampais
⚠️ *IMPORTANTE:*
• Envía exactamente HNL (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "México": `💰 *DATOS DE PAGO*
🌍 *País:* México
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🏦 *Albo* (🏦 TRANSFERENCIA)
📋 N° Cuenta: 721180100042683432
💡 SOLO TRANSFERENCIAS (Dólar a 20MX)
---
🏪 *Nu México (OXXO)* (💵 EFECTIVO)
📋 5101 2506 8691 9389
💡 SOLO DEPOSITOS OXXO (Dólar a 20MX)
⚠️ *IMPORTANTE:*
• Envía exactamente MXN (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Nicaragua": `💰 *DATOS DE PAGO*
🌍 *País:* Nicaragua
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🏦 *BAC Nicaragua* (🏦 TRANSFERENCIA)
📋 N° Cuenta: 371674409 | IBAN: NI37BAMC00000000000371674409
💡 Transferencia Bancaria BAC (Tasa P2P Binance)
⚠️ *IMPORTANTE:*
• Envía exactamente NIO (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Panamá": `💰 *DATOS DE PAGO*
🌍 *País:* Panamá
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🟠 *Punto Pago Wally* (💵 EFECTIVO)
📋 N° Cuenta: +584128975265
💡 Banca Electrónica Punto Pago Wally
---
🟣 *Zinli* (💵 EFECTIVO)
📋 N° Cuenta: chauran2001@gmail.com
💡 Banca Electrónica Zinli
⚠️ *IMPORTANTE:*
• Envía exactamente USD (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Paraguay": `💰 *DATOS DE PAGO*
🌍 *País:* Paraguay
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🏦 *Banco Itau* (🏦 TRANSFERENCIA)
📋 N° Cuenta: 300406285 | Titular: DIEGO ARMANDO LEIVA ROA
💡 Transferencia Bancaria Itau
---
💳 *Billetera Personal* (💵 EFECTIVO)
📋 Billetera Personal 0993363424
💡 Transferencia a Billetera Personal
⚠️ *IMPORTANTE:*
• Envía exactamente PYG (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Perú": `💰 *DATOS DE PAGO*
🌍 *País:* Perú
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🟣 *Yape* (💵 EFECTIVO)
📋 N° Cuenta: 954302258
💡 Banca Electrónica Yape
---
🔵 *Plin* (💵 EFECTIVO)
📋 N° Cuenta: 954302258
💡 Banca Electrónica Plin
⚠️ *IMPORTANTE:*
• Envía exactamente PEN (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`,
        "Venezuela": `💰 *DATOS DE PAGO*
🌍 *País:* Venezuela
💸 *Monto a pagar:* (precios segun el balance)
💳 *MÉTODOS DE PAGO DISPONIBLES:*
---
🟡 *Pago Móvil* (💵 EFECTIVO)
📋 Pago móvil: 01020412897526531303430
💡 Pago móvil interbancario (Dólar a 279 Bs)
⚠️ *IMPORTANTE:*
• Envía exactamente VES (precios segun el balance)
• Guarda el comprobante de pago
• Envía el comprobante para confirmar el pago
✅ *Una vez realizado el pago, será procesado automáticamente.*`
    };

    // --- FUNCIONES DE UTILIDAD (se mantiene igual) ---
    function toggleModal(modal, show) {
        modal.style.display = show ? 'flex' : 'none';
        document.body.style.overflow = show ? 'hidden' : 'auto';
    }

    function calculateConversion() {
        if (!selectedCountryRate) return;

        let usdAmount = parseFloat(usdAmountInput.value);
        const minAmount = parseFloat(usdAmountInput.min);

        paymentError.style.display = 'none';
        
        if (isNaN(usdAmount) || usdAmount < minAmount) {
            usdAmount = isNaN(usdAmount) ? 0 : usdAmount;
            paymentError.textContent = `El monto mínimo requerido es $${minAmount} USD.`;
            paymentError.style.display = 'block';
        }
        
        const convertedAmount = usdAmount * selectedCountryRate.rate;
        const usdInputDisplay = document.getElementById('usd-input-display');
        const paymentConvertedAmount = document.getElementById('payment-converted-amount');
        
        usdInputDisplay.textContent = `${usdAmount.toFixed(2)} USD`;
        
        const displayAmount = convertedAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
        
        paymentConvertedAmount.textContent = displayAmount;
        return { 
            displayAmount: displayAmount, 
            usdAmount: usdAmount.toFixed(2),
            localAmountRaw: convertedAmount.toFixed(2)
        }; 
    }

    function displayPaymentMethods(convertedAmountText) {
        if (!selectedCountryRate) return;

        const countryName = selectedCountryRate.name;
        let template = paymentTemplates[countryName];
        
        if (!template) {
            document.getElementById('payment-methods-content').innerHTML = `<p style="color:#E74C3C;">No se encontraron métodos de pago para ${countryName}.</p>`;
            copyAllButton.style.display = 'none'; 
            fullTextToCopy = ''; 
            return;
        }

        // 1. Reemplazar el monto en la plantilla maestra y GUARDARLA EN fullTextToCopy
        fullTextToCopy = template.replace(/\(precios segun el balance\)/g, convertedAmountText);
        
        // 2. Proceso de Parsing para generar el HTML (muestra solo los métodos) (se mantiene igual)
        let masterContent = fullTextToCopy; 
        const sections = masterContent.split('---');
        let notesSection = sections[sections.length - 1];
        let methodsArray = sections.slice(1, sections.length - 1); 
        
        if (sections.length === 2) {
            methodsArray = [sections[1]];
            notesSection = ''; 
        }

        let methodsHtml = '';
        methodsArray.forEach(methodText => {
            if (!methodText.trim()) return;

            const lines = methodText.trim().split('\n');
            let methodTitle = 'Método de Pago';
            let detailsHtml = '';

            lines.forEach(line => {
                const trimmedLine = line.trim();
                
                if (trimmedLine.match(/^[^\w\s]+\s*\*(.*?)\s*\((.*?)\)/)) {
                    const match = trimmedLine.match(/^[^\w\s]+\s*\*(.*?)\s*\((.*?)\)/);
                    if (match) {
                        methodTitle = `${trimmedLine.split('*')[0].trim()} <strong>${match[1].trim()}</strong> (${match[2].trim()})`;
                    }
                } 
                else if (trimmedLine.includes('📋')) {
                    const cleanLine = trimmedLine.replace('📋', '').trim();
                    detailsHtml += `<p class="account-data">📋 ${cleanLine.replace(/\|/g, ' | ').replace(':', ': <strong>') + '</strong>'}</p>`;
                } 
                else if (trimmedLine.includes('💡')) {
                     detailsHtml += `<p style="font-size:0.8em; color:#7F8C8D;">💡 ${trimmedLine.replace('💡', '').trim()}</p>`;
                }
            });

            methodsHtml += `
                <div class="method-card">
                    <div class="method-title">${methodTitle}</div>
                    <div class="method-details">
                        ${detailsHtml}
                    </div>
                </div>
            `;
        });

        const totalAmountHtml = `<div id="payment-amount-display">
            Monto total a enviar en ${selectedCountryRate.code}: ${convertedAmountText}
        </div>`;

        let finalNotesHtml = '';
        if (notesSection.trim()) {
             finalNotesHtml = `<div class="important-notes">
                ${notesSection
                    .replace('⚠️ *IMPORTANTE:*', '<strong>⚠️ IMPORTANTE:</strong>')
                    .replace('✅ *Una vez realizado el pago, será procesado automáticamente.*', '<span class="success">✅ Una vez realizado el pago, será procesado automáticamente.</span>')
                    .replace(/\*/g, '')
                    .replace(/•/g, '<br>•')}
            </div>`;
        }
        
        document.getElementById('payment-methods-content').innerHTML = totalAmountHtml + methodsHtml + finalNotesHtml;
        copyAllButton.style.display = 'block';
    }


    // --- MANEJO DEL HISTORIAL (se mantiene igual) ---

    function saveRecharge() {
        if (!currentRechargeData.usdAmount) return;

        // Buscar la clase de la bandera para guardarla
        const countryData = exchangeRates.find(r => r.name === selectedCountryRate.name);
        
        const newId = RECHARGE_HISTORY.length + 1;
        const now = new Date();
        const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

        const newRecharge = {
            id: newId,
            date: formattedDate,
            country: selectedCountryRate.name,
            usdAmount: currentRechargeData.usdAmount,
            localAmount: currentRechargeData.displayAmount, 
            localCurrency: selectedCountryRate.code,
            fullOrderText: fullTextToCopy, 
            status: 'Pendiente',
            flagClass: countryData ? countryData.flagClass : '' 
        };

        RECHARGE_HISTORY.unshift(newRecharge); 
        localStorage.setItem('rechargeHistory', JSON.stringify(RECHARGE_HISTORY));
        renderHistory(); 
    }

    function renderHistory() {
        if (RECHARGE_HISTORY.length === 0) {
            rechargeHistoryList.innerHTML = '<p class="empty-history-message">Aún no has creado ninguna recarga.</p>';
            return;
        }

        let historyHtml = '';
        RECHARGE_HISTORY.forEach((recharge) => {
            const statusClass = recharge.status === 'Pendiente' ? 'status-pending' : 'status-completed';
            const leftBorder = recharge.status === 'Pendiente' ? '#F39C12' : '#2ECC71';
            
            const flagHtml = `<div class="flag-placeholder history-flag ${recharge.flagClass}"></div>`;

            historyHtml += `
                <div class="recharge-card" style="border-left-color: ${leftBorder};">
                    <div class="card-header">
                        <span class="order-id">
                            ${flagHtml} 
                            #${recharge.id} - ${recharge.country}
                        </span>
                        <span class="order-status ${statusClass}">${recharge.status}</span>
                    </div>
                    <div class="card-details">
                        <p><strong>Monto USD:</strong> $${recharge.usdAmount}</p>
                        <p><strong>Monto Local:</strong> ${recharge.localAmount} ${recharge.localCurrency}</p>
                        <p style="font-size: 0.8em; color: #7F8C8D;">Creado: ${recharge.date}</p>
                    </div>
                    <div class="card-actions">
                        <button class="history-button btn-copy" data-order-id="${recharge.id}">
                            Copiar Orden
                        </button>
                        <button class="history-button btn-upload" data-order-id="${recharge.id}">
                            Subir Comprobante
                        </button>
                    </div>
                </div>
            `;
        });

        rechargeHistoryList.innerHTML = historyHtml;
        setupHistoryActions(); 
    }

    function setupHistoryActions() {
        document.querySelectorAll('.btn-copy').forEach(button => {
            button.addEventListener('click', function() {
                const orderId = parseInt(this.getAttribute('data-order-id'));
                const order = RECHARGE_HISTORY.find(r => r.id === orderId);
                if (order) {
                    // Esta función copia la orden completa del historial
                    
                    // Usamos la misma función de copiado para el historial para asegurar consistencia
                    copyToClipboard(order.fullOrderText, this, 'Copiar Orden', '¡Copiado!');
                }
            });
        });

        document.querySelectorAll('.btn-upload').forEach(button => {
            button.addEventListener('click', function() {
                const orderId = this.getAttribute('data-order-id');
                // Simulación de acción
                alert(`Simulación: Abrir función para Subir Comprobante para el Pedido #${orderId}.`);
            });
        });
    }
    
    // --- FUNCIÓN DE COPIADO MEJORADA CON FALLBACK ---
    /**
     * Intenta copiar el texto usando la API moderna, y si falla, usa execCommand (fallback).
     */
    function copyToClipboard(textToCopy, element, defaultText, successText) {
        // Opción 1: API moderna (requiere HTTPS o localhost)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    element.textContent = successText;
                    element.classList.add('copied');
                    setTimeout(() => {
                        element.textContent = defaultText;
                        element.classList.remove('copied');
                    }, 3000);
                })
                .catch(() => {
                    // Si falla por seguridad/permisos, vamos al Fallback
                    copyFallback(textToCopy, element, defaultText, successText);
                });
        } else {
            // Opción 2: Fallback (para navegadores viejos o entornos sin permisos)
            copyFallback(textToCopy, element, defaultText, successText);
        }
    }

    /**
     * Fallback de copiado usando el API obsoleto execCommand.
     */
    function copyFallback(textToCopy, element, defaultText, successText) {
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = textToCopy;
        // Evitar que aparezca en pantalla o afecte el scroll
        tempTextarea.style.position = 'fixed';
        tempTextarea.style.top = '-9999px';
        tempTextarea.style.left = '-9999px';
        document.body.appendChild(tempTextarea);
        
        // Seleccionar y copiar
        tempTextarea.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                element.textContent = successText;
                element.classList.add('copied');
                setTimeout(() => {
                    element.textContent = defaultText;
                    element.classList.remove('copied');
                }, 3000);
            } else {
                element.textContent = 'Copiado manual necesario.';
                setTimeout(() => element.textContent = defaultText, 3000);
            }
        } catch (err) {
            element.textContent = 'Error de copiado.';
            setTimeout(() => element.textContent = defaultText, 3000);
        }
        document.body.removeChild(tempTextarea);
    }
    // --- FIN FUNCIÓN DE COPIADO MEJORADA CON FALLBACK ---


    // --- MANEJO DE EVENTOS (se mantiene igual, excepto por la llamada a la nueva función) ---
    
    // Setup de Cierre/Apertura de Modales
    document.querySelectorAll('.close-button').forEach(btn => {
        btn.addEventListener('click', () => toggleModal(btn.closest('.modal'), false));
    });
    
    payButton.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(countryModal, true);
    });

    goBackPaymentButton.addEventListener('click', () => {
        toggleModal(methodsModal, false);
        toggleModal(paymentModal, true);
    });

    // Selección de País
    countryCards.forEach(card => {
        card.addEventListener('click', function() {
            const countryName = card.querySelector('.country-name').textContent;
            selectedCountryRate = exchangeRates.find(rate => rate.name === countryName);
            
            if (selectedCountryRate) {
                toggleModal(countryModal, false);
                
                const minAmount = isFirstPayment ? MIN_FIRST_PAYMENT : MIN_SUBSEQUENT_PAYMENT;
                
                usdAmountInput.min = minAmount; 
                usdAmountInput.placeholder = `Ej: ${minAmount.toFixed(2)}`;
                usdAmountInput.value = minAmount.toFixed(2); 

                document.getElementById('payment-country-title').textContent = `Realizar Pago a ${countryName}`;
                document.getElementById('payment-currency-code').textContent = selectedCountryRate.code;
                document.querySelector('.payment-rule-hint').textContent = isFirstPayment 
                    ? `Recuerda: $${MIN_FIRST_PAYMENT} USD mínimo para tu primer pago.`
                    : `Mínimo de pago: $${MIN_SUBSEQUENT_PAYMENT} USD.`;
                
                calculateConversion(); 
                toggleModal(paymentModal, true);
            }
        });
    });

    // Conversión en tiempo real
    usdAmountInput.addEventListener('input', calculateConversion);

    // Confirmar Monto -> Abre Métodos y Guarda el Pedido 
    confirmPaymentButton.addEventListener('click', () => {
        const usdAmount = parseFloat(usdAmountInput.value);
        const minAmount = parseFloat(usdAmountInput.min);

        if (isNaN(usdAmount) || usdAmount < minAmount) {
            calculateConversion(); 
            return;
        }

        const conversionResult = calculateConversion();
        
        currentRechargeData = conversionResult;

        // 1. Genera la plantilla de métodos y la guarda en fullTextToCopy
        displayPaymentMethods(conversionResult.displayAmount);
        
        // 2. GUARDA LA ORDEN EN EL HISTORIAL y RENDERIZA EL BOX
        saveRecharge(); 

        // 3. Cambia de modal
        toggleModal(paymentModal, false);
        toggleModal(methodsModal, true);

        // 4. Actualiza el estado de primer pago
        isFirstPayment = false;
        localStorage.setItem('isFirstPayment', false);
    });
    
    // ** CORRECCIÓN DEL BOTÓN DE COPIADO GLOBAL **
    copyAllButton.addEventListener('click', function() {
        if (!fullTextToCopy) {
             this.textContent = '¡Error! No hay orden para copiar.';
             setTimeout(() => this.textContent = 'Copiar TODOS los Métodos de Pago', 3000);
             return;
        }

        // Llamamos a la función de copiado universal
        copyToClipboard(fullTextToCopy, this, 'Copiar TODOS los Métodos de Pago', '¡Todo Copiado! Listo para compartir.');
    });
    // ** FIN CORRECCIÓN DEL BOTÓN DE COPIADO GLOBAL **

    // Inicializar el historial al cargar la página
    renderHistory();
});
