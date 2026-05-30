import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Calculator, 
  CheckCircle, 
  AlertCircle, 
  ShieldAlert, 
  Coins, 
  TrendingUp,
  FileText,
  UserCheck,
  Building,
  Printer,
  Download,
  Copy,
  Briefcase,
  Layers,
  FileSignature,
  FileCheck
} from 'lucide-react';

interface ProfessionalPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InvoiceRow {
  id: string;
  client: string;
  ncfType: string;
  ncfNumber: string;
  baseAmount: number;
  itbisRate: number; // 0.18, 0.16, 0.0
}

export default function ProfessionalPortal({ isOpen, onClose }: ProfessionalPortalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'itbis-ncf' | 'contratos-trabajo' | 'exportacion-reportes' | 'retenciones-recargos'>('itbis-ncf');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // ==========================================
  // --- TAB 1: FACTURAS MULTI-LÍNEA / ITBIS ---
  // ==========================================
  const [invoices, setInvoices] = useState<InvoiceRow[]>([
    { id: '1', client: 'Acme Comercial SRL', ncfType: 'Crédito Fiscal (B01)', ncfNumber: 'B0100000412', baseAmount: 25000, itbisRate: 0.18 },
    { id: '2', client: 'Constructora RD', ncfType: 'Consumo (B02)', ncfNumber: 'B0200000851', baseAmount: 12000, itbisRate: 0.18 },
    { id: '3', client: 'Restaurante Santo Domingo', ncfType: 'Gubernamentales (B15)', ncfNumber: 'B1500000104', baseAmount: 4500, itbisRate: 0.18 },
    { id: '4', client: 'Zonas Francas Santiago', ncfType: 'Zonas Francas (B16)', ncfNumber: 'B1600000012', baseAmount: 50000, itbisRate: 0.0 },
  ]);

  const [newClient, setNewClient] = useState('');
  const [newNcfType, setNewNcfType] = useState('Crédito Fiscal (B01)');
  const [newNcfNumber, setNewNcfNumber] = useState('');
  const [newBaseAmount, setNewBaseAmount] = useState<number | ''>('');
  const [newItbisRate, setNewItbisRate] = useState<number>(0.18);

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient || !newBaseAmount) {
      alert('Por favor, introduzca el nombre de cliente y el monto base.');
      return;
    }

    const randomSeq = Math.floor(100000000 + Math.random() * 900000000).toString();
    const typeCode = newNcfType.match(/\(([^)]+)\)/)?.[1] || 'B01';
    const computedNcf = newNcfNumber || `${typeCode}${randomSeq.substring(0, 8)}`;

    const newRow: InvoiceRow = {
      id: Date.now().toString(),
      client: newClient,
      ncfType: newNcfType,
      ncfNumber: computedNcf,
      baseAmount: Number(newBaseAmount),
      itbisRate: Number(newItbisRate)
    };

    setInvoices([...invoices, newRow]);
    setNewClient('');
    setNewNcfNumber('');
    setNewBaseAmount('');
    showToast('Factura agregada con éxito al lote fiscal.');
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
    showToast('Factura eliminada del lote.');
  };

  const tab1Totals = invoices.reduce((acc, inv) => {
    const itbisAmount = inv.baseAmount * inv.itbisRate;
    const total = inv.baseAmount + itbisAmount;
    return {
      base: acc.base + inv.baseAmount,
      itbis: acc.itbis + itbisAmount,
      total: acc.total + total
    };
  }, { base: 0, itbis: 0, total: 0 });

  const handleExport607 = () => {
    // CSV format for DGII Form 607
    const headers = 'RNC o Cédula,Tipo Comprobante,NCF,Monto Facturado,ITBIS Facturado,Total General\n';
    const rows = invoices.map(inv => {
      const itbis = inv.baseAmount * inv.itbisRate;
      const total = inv.baseAmount + itbis;
      return `"${inv.client.replace(/"/g, '""')}","${inv.ncfType}","${inv.ncfNumber}",${inv.baseAmount.toFixed(2)},${itbis.toFixed(2)},${total.toFixed(2)}`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'anexo_607_dgii_simulado.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Anexo 607 (Ventas) exportado en Excel/CSV.');
  };


  // =======================================================
  // --- TAB 2: GENERADOR DE CONTRATOS Y DOCUMENTOS LEGALES ---
  // =======================================================
  const [docType, setDocType] = useState<'contrato' | 'iguala' | 'nda' | 'comision' | 'mutuo_acuerdo' | 'amonestacion' | 'despido' | 'dimision'>('contrato');
  
  // Contract specific fields
  const [empresaNombre, setEmpresaNombre] = useState('Inversiones Dominicanas SRL');
  const [empresaRNC, setEmpresaRNC] = useState('1-31-45678-2');
  const [empresaRepresentante, setEmpresaRepresentante] = useState('Ing. Manuel Santana');
  const [repCedula, setRepCedula] = useState('001-1245789-3');
  const [empresaDireccion, setEmpresaDireccion] = useState('Av. Winston Churchill No. 1024, Santo Domingo, D.N.');
  
  const [trabajadorNombre, setTrabajadorNombre] = useState('Francisco Alberto Rosario');
  const [trabajadorCedula, setTrabajadorCedula] = useState('002-8547123-5');
  const [trabajadorOcupacion, setTrabajadorOcupacion] = useState('Analista de TI & Redes');
  const [trabajadorDireccion, setTrabajadorDireccion] = useState('Calle Las Damas No. 14, El Millón, Santo Domingo');
  const [trabajadorEstadoCivil, setTrabajadorEstadoCivil] = useState('Soltero');
  const [trabajadorNacionalidad, setTrabajadorNacionalidad] = useState('Dominicana');

  const [laboralSalario, setLaboralSalario] = useState<number>(35000);
  const [laboralFechaInicio, setLaboralFechaInicio] = useState('2026-06-01');
  const [contratoModalidad, setContratoModalidad] = useState<'indefinido' | 'temporal' | 'obra'>('indefinido');
  const [laboralHoras, setLaboralHoras] = useState('44 horas semanales de lunes a viernes (8:00 AM - 5:00 PM)');

  // Optional Dominican Clauses
  const [clausePrueba, setClausePrueba] = useState(true);
  const [clauseConfidencialidad, setClauseConfidencialidad] = useState(true);
  const [clauseArbitraje, setClauseArbitraje] = useState(false);
  const [includeNotary, setIncludeNotary] = useState(false);

  // Amonestation/Despido fields
  const [amonestacionMotivo, setAmonestacionMotivo] = useState('Llegada tardía recurrente a la jornada laboral sin debida justificación');
  const [amonestacionFecha, setAmonestacionFecha] = useState('2026-05-30');
  const [tipoDespido, setTipoDespido] = useState<'desahucio' | 'causa justify'>('desahucio');
  const [despidoArticulo, setDespidoArticulo] = useState('Faltas repetidas e injustificadas de asistencia al trabajo');

  // DIMISIÓN
  const [dimisionDetalle, setDimisionDetalle] = useState('Por motivos profesionales y crecimiento personal.');

  // Method to copy compiled text
  const handleCopyDoc = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('¡Documento copiado al portapapeles!');
  };

  // Method to download compiled text as .txt file
  const handleDownloadDoc = () => {
    const text = compileDocumentText();
    let filename = 'documento_legal';
    if (docType === 'contrato') filename = `contrato_trabajo_${trabajadorNombre.toLowerCase().replace(/\s+/g, '_')}`;
    else if (docType === 'iguala') filename = `contrato_iguala_${trabajadorNombre.toLowerCase().replace(/\s+/g, '_')}`;
    else if (docType === 'nda') filename = `acuerdo_confidencialidad_nda_${trabajadorNombre.toLowerCase().replace(/\s+/g, '_')}`;
    else if (docType === 'comision') filename = `contrato_comision_${trabajadorNombre.toLowerCase().replace(/\s+/g, '_')}`;
    else if (docType === 'mutuo_acuerdo') filename = `terminacion_mutuo_acuerdo_${trabajadorNombre.toLowerCase().replace(/\s+/g, '_')}`;
    else if (docType === 'amonestacion') filename = `carta_amonestacion_${trabajadorNombre.toLowerCase().replace(/\s+/g, '_')}`;
    else if (docType === 'despido') filename = `carta_despido_${trabajadorNombre.toLowerCase().replace(/\s+/g, '_')}`;
    else if (docType === 'dimision') filename = `carta_dimision_${trabajadorNombre.toLowerCase().replace(/\s+/g, '_')}`;

    filename += '.txt';

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('¡Documento descargado con éxito!');
  };

  // Compile dynamic templates
  const compileDocumentText = () => {
    const formattedSalary = laboralSalario.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const formattedDate = new Date(laboralFechaInicio).toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' });
    const todayStr = new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' });

    switch(docType) {
      case 'contrato': {
        const modalText = contratoModalidad === 'indefinido' 
          ? 'TIEMPO INDEFINIDO (Art. 25 del Código de Trabajo)' 
          : contratoModalidad === 'temporal' 
          ? 'DURACIÓN LIMITADA O TEMPORAL (Art. 26 del Código de Trabajo)' 
          : 'CIERTA OBRA O SERVICIOS DETERMINADOS (Art. 31 del Código de Trabajo)';

        const baseContract = `CONTRATO INDIVIDUAL DE TRABAJO BAJO LEYES DE REPÚBLICA DOMINICANA\n\nENTRE: De una parte, la entidad comercial ${empresaNombre.toUpperCase()}, organizada bajo las leyes de la República Dominicana, provista del RNC No. ${empresaRNC}, con su domicilio social en ${empresaDireccion}, debidamente representada por su representante legal, Sr(a). ${empresaRepresentante}, de nacionalidad dominicana, portador de la Cédula No. ${repCedula}, quien para los fines de este contrato se denominará EL EMPLEADOR.\n\nY de la otra parte, el señor(a) ${trabajadorNombre.toUpperCase()}, de nacionalidad ${trabajadorNacionalidad}, de estado civil ${trabajadorEstadoCivil}, portador de la Cédula No. ${trabajadorCedula}, con domicilio en ${trabajadorDireccion}, de ocupación ${trabajadorOcupacion}, quien para los fines de este contrato se denominará EL TRABAJADOR.\n\nSE HA CONVENIDO Y PACTADO LO SIGUIENTE:\n\nPRIMERO (Objeto y Puesto): EL TRABAJADOR ingresa al servicio de EL EMPLEADOR para desempeñar las funciones de ${trabajadorOcupacion.toUpperCase()}, obligándose a realizar las directrices inherentes a esta posición de forma diligente y leal.\n\nSEGUNDO (Modalidad y Vigencia): Este contrato se concierta bajo la modalidad de ${modalText}. Iniciará sus efectos fácticos y legales a partir del ${formattedDate}.\n\nTERCERO (Duración de la Jornada): La jornada semanal ordinaria asignada para la posición de EL TRABAJADOR será de ${laboralHoras}, no excediendo de los límites señalados por el Código de Trabajo Dominicano.\n\nCUARTO (Salario y Compensación): Por los servicios prestados bajo subordinación patronal, EL EMPLEADOR pagará a EL TRABAJADOR un salario básico de RD$ ${formattedSalary} (PESOS DOMINICANOS), el cual se liquidará quincenalmente, con las retenciones pertinentes de Seguridad Social (TSS: ARS/AFP) e Impuesto Sobre la Renta (ISR) si aplica.\n\nQUINTO (Derecho Común - Leyes Supletoria): Para todo lo no expresamente pactado en el presente instrumento de derecho laboral privado, las partes de común acuerdo se remiten a las normas de orden público del Código de Trabajo de la República Dominicana (Ley No. 16-92) y las resoluciones emitidas por el Ministerio de Trabajo.`;

        let clausesText = '';
        let clauseCounter = 6;
        if (clausePrueba) {
          clausesText += `\n\nSEXTO (Período de Prueba): Conforme lo estipulado en el Artículo 30 del Código de Trabajo de la República Dominicana, las partes pactan de mutuo acuerdo un período de prueba de tres (3) meses de duración para evaluar la idoneidad y aptitudes de EL TRABAJADOR. Durante este período, cualquiera de las partes podrá poner fin al contrato sin incurrir en responsabilidad jurídica de preaviso ni auxilio de cesantía.`;
          clauseCounter++;
        }
        if (clauseConfidencialidad) {
          const latinNum = clauseCounter === 6 ? 'SEXTO' : 'SÉPTIMO';
          clausesText += `\n\n${latinNum} (Confidencialidad y Propiedad Intelectual): EL TRABAJADOR se obliga solemnemente a guardar absoluta reserva, discreción y secreto confidencial sobre todos los datos comerciales, patentes, software, finanzas e información de clientes a los que tenga acceso durante el ejercicio de sus funciones. Todo derecho de propiedad intelectual e industrial generado por EL TRABAJADOR en ocasión del servicio pertenecerá en su totalidad a EL EMPLEADOR de forma irrevocable.`;
          clauseCounter++;
        }
        if (clauseArbitraje) {
          const latinNum = clauseCounter === 6 ? 'SEXTO' : clauseCounter === 7 ? 'SÉPTIMO' : 'OCTAVO';
          clausesText += `\n\n${latinNum} (Jurisdicción y Cláusula Compromisoria): Para la interpretación o ejecución de cualquier controversia derivada del presente contrato, las partes acuerdan intentar una conciliación amigable. En su defecto, se someten deliberadamente a la jurisdicción de arbitraje institucional del Centro de Resolución de Alternativa de Controversias (CRC) de la Cámara de Comercio y Producción de Santo Domingo.`;
        }

        const signBlock = `\n\nHecho en duplicado de igual valor legal, en Santo Domingo, República Dominicana, al día ${todayStr}.\n\n__________________________                  __________________________\n        EL EMPLEADOR                               EL TRABAJADOR\nPor: ${empresaRepresentante}                      ${trabajadorNombre}`;

        const notaryBlock = includeNotary ? `\n\n----------------- ACTO DE LEGALIZACIÓN DE FIRMAS (NOTARIO PÚBLICO) -----------------\n\nEn la ciudad de Santo Domingo, Distrito Nacional, Capital de la República Dominicana, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleDateString('es-DO', {month: 'long'})} del año ${new Date().getFullYear()}, por ante mí, Dr./Ldo. ________________________________________________, Notario Público de los del Número del Distrito Nacional, debidamente colegiado con el No. ___________, COMPARECIERON libre y voluntariamente los señores ${empresaRepresentante} y ${trabajadorNombre}, de calidades constantes en el presente acto, a quienes doy fe conocer por sus respectivas cédulas de identidad, y me manifestaron bajo juramento de ley que las firmas puestas en el documento precedente son suyas de puño y letra, y que lo hacen libre de toda coacción.\n\nDE LO CUAL DOY FE Y FIRMO EN MI CALIDAD DE NOTARIO PÚBLICO VIGENTE.\n\n\n_____________________________________________\nNOTARIO PÚBLICO\nSello Oficial Notarial\n\nTESTIGOS INSTRUMENTALES:\n\n1. __________________________________________   2. __________________________________________\nNombre:                                         Nombre:\nCédula:                                         Cédula:` : '';

        return baseContract + clausesText + signBlock + notaryBlock;
      }

      case 'iguala': {
        const baseIguala = `CONTRATO DE PRESTACIÓN DE SERVICIOS INDEPENDIENTES (IGUALA PROFESIONAL)\n\nENTRE: De una parte, la entidad comercial ${empresaNombre.toUpperCase()}, provista del RNC No. ${empresaRNC}, con su domicilio en ${empresaDireccion}, debidamente representada por Sr(a). ${empresaRepresentante}, portador de la Cédula No. ${repCedula}, quien para efectos de este documento se denominará LA CONTRATANTE o EL CLIENTE.\n\nY de la otra parte, el señor(a) ${trabajadorNombre.toUpperCase()}, de nacionalidad ${trabajadorNacionalidad}, de estado civil ${trabajadorEstadoCivil}, portador de la Cédula No. ${trabajadorCedula}, con domicilio en ${trabajadorDireccion}, de profesión ${trabajadorOcupacion}, quien en lo adelante se denominará EL PROFESIONAL INDEPENDIENTE.\n\nSE HA CONVENIDO Y PACTADO LO SIGUIENTE:\n\nPRIMERO: OBJETO DEL SERVICIO. EL PROFESIONAL se obliga de manera autónoma e independiente a prestar servicios profesionales de consultoría, asesoramiento y ejecución técnica en materia de ${trabajadorOcupacion.toUpperCase()}, utilizando sus propios recursos operacionales y metodológicos.\n\nSEGUNDO: HONORARIOS. EL CLIENTE pagará a EL PROFESIONAL la suma ordinaria de RD$ ${formattedSalary} por vía de iguala fija de pago mensual, la cual se liquidará conforme las facturas con comprobante fiscal (NCF) emitidas por el profesional. Se hace constar explícitamente que por tratarse de un contrato de servicios civil autónomo, este pago no devenga salario ordinario, regalía pascual ni cálculo de prestaciones laborales bajo la Ley 16-92, y estará regido por las disposiciones del Código Civil de la República Dominicana.\n\nTERCERO: AUTONOMÍA TÉCNICA. EL PROFESIONAL ejecutará los servicios contratados de manera libre, sin subordinación jurídica ni dependencia laboral, no estando sujeto a horarios rígidos de oficina ni supervisión de asistencia diaria, rigiéndose por los entregables definidos.`;

        let equalClauses = '';
        let equalCounter = 4;
        if (clauseConfidencialidad) {
          equalClauses += `\n\nCUARTO (Confidencialidad y Propiedad Intelectual): EL PROFESIONAL se compromete a salvaguardar rigurosamente todos los datos comerciales, financieros, bases de datos o software del CLIENTE, limitando su exposición. Todo diseño o propiedad intelectual resultante de los servicios profesionales pertenecerá por entero al CLIENTE de forma indefinida.`;
          equalCounter++;
        }
        if (clauseArbitraje) {
          const latinNum = equalCounter === 4 ? 'CUARTO' : 'QUINTO';
          equalClauses += `\n\n${latinNum} (Resolución de Conflictos): Cualquier disputa sobre el cumplimiento de este instrumento civil será resuelto prioritariamente de forma amigable. En su defecto, se someterá de común acuerdo al Centro de Resolución de Alternativa de Controversias (CRC) de la Cámara de Comercio de Santo Domingo.`;
        }

        const equalSignBlock = `\n\nHecho de buena fe en dos ejemplares del mismo tenor, en Santo Domingo, República Dominicana, al día ${todayStr}.\n\n__________________________                  __________________________\n        LA CONTRATANTE                            EL PROFESIONAL\nPor: ${empresaRepresentante}                      ${trabajadorNombre}`;

        const equalNotary = includeNotary ? `\n\n----------------- ACTO DE LEGALIZACIÓN DE FIRMAS (NOTARIO PÚBLICO) -----------------\n\nEn la ciudad de Santo Domingo, Distrito Nacional, Capital de la República Dominicana, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleDateString('es-DO', {month: 'long'})} del año ${new Date().getFullYear()}, por ante mí, Dr./Ldo. ________________________________________________, Notario Público de los del Número del Distrito Nacional, debidamente colegiado con el No. ___________, COMPARECIERON libre y voluntariamente los señores ${empresaRepresentante} y ${trabajadorNombre}, de calidades constantes en el presente acto, a quienes doy fe conocer por sus respectivas cédulas de identidad, y me manifestaron de mutuo acuerdo que las firmas puestas en el documento precedente son suyas de puño y letra, y que lo hacen libre de toda coacción.\n\nDE LO CUAL DOY FE Y FIRMO EN MI CALIDAD DE NOTARIO PÚBLICO VIGENTE.\n\n\n_____________________________________________\nNOTARIO PÚBLICO\nSello Oficial Notarial\n\nTESTIGOS INSTRUMENTALES:\n\n1. __________________________________________   2. __________________________________________\nNombre:                                         Nombre:\nCédula:                                         Cédula:` : '';

        return baseIguala + equalClauses + equalSignBlock + equalNotary;
      }

      case 'nda': {
        const baseNda = `ACUERDO DE CONFIDENCIALIDAD Y NO DIVULGACIÓN DE INFORMACIÓN (NDA)\n\nENTRE: De una parte, la sociedad comercial ${empresaNombre.toUpperCase()}, provista del RNC No. ${empresaRNC}, con su domicilio en ${empresaDireccion}, debidamente representada por su apoderado especial, Sr(a). ${empresaRepresentante}, de nacionalidad dominicana, portador de la Cédula No. ${repCedula}, quien para efectos de este acuerdo de confidencialidad se denominará LA PARTE REVELADORA.\n\nY de la otra parte, el señor(a) ${trabajadorNombre.toUpperCase()}, de nacionalidad ${trabajadorNacionalidad}, de estado civil ${trabajadorEstadoCivil}, portador de la Cédula No. ${trabajadorCedula}, con domicilio en ${trabajadorDireccion}, de ocupación ${trabajadorOcupacion}, quien en lo adelante se denominará LA PARTE RECEPTORA.\n\nSE HA CONVENIDO Y PACTADO LO SIGUIENTE:\n\nPRIMERO (Objeto y Definición): LA PARTE REVELADORA se propone suministrar a LA PARTE RECEPTORA información confidencial relativa a planos, códigos, algoritmos, metodologías, secretos industriales, finanzas, listados de clientes actuales, o proyecciones de consultoría comercial con motivo de su vinculación profesional. Se considerará "Información Confidencial" toda aquella que sea revelada verbalmente, por escrito o vía electrónica, que esté marcada o que razonablemente deba entenderse como tal debido a su carácter reservado.\n\nSEGUNDO (Obligaciones Generales): LA PARTE RECEPTORA se compromete formalmente frente a LA PARTE REVELADORA a:\n  a) Mantener bajo estricta confidencialidad y absoluta reserva de secreto toda la información compartida, impidiendo su reproducción, copia, o divulgación a cualquier tercero sin contar con autorización previa, expresa y por escrito de LA PARTE REVELADORA.\n  b) Utilizar dicha información exclusivamente para la ejecución de sus actividades de servicio profesional contratado, absteniéndose de utilizarla en beneficio industrial o comercial propio o ajeno.\n  c) Retener las copias o accesos digitales bajo estándares de custodia seguros en todo momento.`;

        let ndaClauses = '';
        let ndaCounter = 3;
        if (clauseArbitraje) {
          ndaClauses += `\n\nTERCERO (Cámara de Comercio y Jurisdicción): Cualquier diferendo en la ejecución del presente acuerdo será sometido en primer término a la conciliación. De no lograrse un acuerdo, las partes se someten al arbitraje institucional del Centro de Resolución Alternativa de Controversias (CRC) de la Cámara de Comercio y Producción de Santo Domingo, renunciando a cualquier fuero ordinario.`;
          ndaCounter++;
        }

        const latinNum = ndaCounter === 3 ? 'TERCERO' : 'CUARTO';
        ndaClauses += `\n\n${latinNum} (Duración de Obligación y Cláusula Penal): El compromiso de no divulgación contenido en este acuerdo permanecerá en plena vigencia por un término determinado de cinco (5) años contados a partir de la firma de este acto. En caso de violación comprobada de las obligaciones de confidencialidad, LA PARTE RECEPTORA estará obligada a resarcir a LA PARTE REVELADORA por los daños y perjuicios directos e indirectos ocasionados, rigiéndose supletoriamente por las normas de responsabilidad civil del Código Civil de la República Dominicana.`;

        const ndaSignBlock = `\n\nHecho de común acuerdo y buena fe en dos originales, en Santo Domingo, República Dominicana, al día ${todayStr}.\n\n__________________________                  __________________________\n    LA PARTE REVELADORA                         LA PARTE RECEPTORA\nPor: ${empresaRepresentante}                      ${trabajadorNombre}`;

        const ndaNotary = includeNotary ? `\n\n----------------- ACTO DE LEGALIZACIÓN DE FIRMAS (NOTARIO PÚBLICO) -----------------\n\nEn la ciudad de Santo Domingo, Distrito Nacional, Capital de la República Dominicana, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleDateString('es-DO', {month: 'long'})} del año ${new Date().getFullYear()}, por ante mí, Notario Público con matrícula del Colegio Dominicano de Notarios No. ___________, COMPARECIERON libremente ${empresaRepresentante} y ${trabajadorNombre}, y me declararon con sus debidas palabras que las firmas puestas arriba corresponden a las que usan ordinariamente en todos sus actos, ratificando su adhesión.\n\nDOY FE DE LO OCURRIDO EN MI PRESENCIA.\n\n\n_____________________________________________\nNOTARIO PÚBLICO\nSello Oficial Notarial` : '';

        return baseNda + ndaClauses + ndaSignBlock + ndaNotary;
      }

      case 'comision': {
        const baseComision = `CONTRATO INDIVIDUAL DE TRABAJO EN MODALIDAD DE COMISIONISTA\n\nENTRE: De una parte, la empresa ${empresaNombre.toUpperCase()}, provista de su RNC No. ${empresaRNC}, con domicilio en ${empresaDireccion}, debidamente representada por Sr(a). ${empresaRepresentante}, portador de la Cédula No. ${repCedula}, quien para fines de este contrato se denominará EL EMPLEADOR.\n\nY de la otra parte, el señor(a) ${trabajadorNombre.toUpperCase()}, de nacionalidad ${trabajadorNacionalidad}, de estado civil ${trabajadorEstadoCivil}, portador de la Cédula No. ${trabajadorCedula}, con domicilio en ${trabajadorDireccion}, de ocupación ${trabajadorOcupacion}, quien para fines de este contrato se denominará EL TRABAJADOR COMISIONISTA.\n\nSE HA CONVENIDO Y PACTADO LO SIGUIENTE:\n\nPRIMERO (Atribuciones de Ventas): EL TRABAJADOR se obliga a ejecutar de manera diligente, leal y de buena fe labores de promoción comercial, intermediación y ventas para los productos y servicios provistos por EL EMPLEADOR. Desarrollará sus atribuciones en la zona asignada, cumpliendo con los estándares éticos y directrices del Código de Trabajo de la República Dominicana (Artículos 308 al 313).\n\nSEGUNDO (Base Salarial y Régimen de Comisión): Ambas partes estipulan libremente la remuneración bajo la modalidad mixta de salario combinado:\n  a) Salario Básico Garantizado de RD$ ${formattedSalary} (PESOS DOMINICANOS) mensuales, que servirá de plataforma de retención fiscal y TSS.\n  b) Porcentaje de Comisión adicional equivalente a un porcentaje de ventas netas cobradas y aprobadas por la empresa, liquidado y pagado al finalizar cada mes calendario.\n\nTERCERO (Gastos de Representación): Los gastos de transportación, dietas o representación debidamente documentados para las gestiones de ventas serán cubiertos por EL EMPLEADOR, previo visto bueno y entrega de comprobantes fiscales con validez de la DGII.`;

        let comisionClauses = '';
        let comisionCounter = 4;
        if (clauseConfidencialidad) {
          comisionClauses += `\n\nCUARTO (Confidencialidad de Cartera de Clientes): EL TRABAJADOR reconoce de manera categórica que la base de clientes y los prospectos provistos por EL EMPLEADOR o gestados bajo esta subordinación son de exclusiva propiedad comercial del empleador, constituyendo secreto de negocio altamente protegido y prohibida su divulgación posterior.`;
          comisionCounter++;
        }
        if (clauseArbitraje) {
          const latinNum = comisionCounter === 4 ? 'CUARTO' : 'QUINTO';
          comisionClauses += `\n\n${latinNum} (Jurisdicción y Cláusula Compromisoria): Toda disputa relativa a cobros o liquidaciones de comisiones se ventilará prioritariamente por vía amigable ante el Centro de Resolución de Alternativa de Controversias (CRC) de la Cámara de Comercio de Santo Domingo.`;
        }

        const comisionSignBlock = `\n\nHecho de doble conformidad en dos originales del mismo tenor y efecto en Santo Domingo, R.D., en fecha ${formattedDate}.\n\n__________________________                  __________________________\n        EL EMPLEADOR                            EL TRABAJADOR\nPor: ${empresaRepresentante}                      ${trabajadorNombre}`;

        const comisionNotary = includeNotary ? `\n\n----------------- ACTO DE LEGALIZACIÓN DE FIRMAS (NOTARIO PÚBLICO) -----------------\n\nEn la ciudad de Santo Domingo, a los ${new Date().getDate()} días de ${new Date().toLocaleDateString('es-DO', {month: 'long'})} de ${new Date().getFullYear()}, doy fe de que los señores comparecientes en este instrumento de ventas firmaron libre y voluntariamente por ante mí, Notario Público.\n\n_____________________________________________\nNOTARIO PÚBLICO\nSello Oficial Notarial` : '';

        return baseComision + comisionClauses + comisionSignBlock + comisionNotary;
      }

      case 'mutuo_acuerdo': {
        const baseMutuo = `ACUERDO DE TERMINACIÓN DE RELACIÓN LABORAL POR MUTUO CONSENTIMIENTO\n\nDE UNA PARTE: la sociedad comercial ${empresaNombre.toUpperCase()}, provista de su RNC No. ${empresaRNC}, con domicilio en ${empresaDireccion}, debidamente representada por Sr(a). ${empresaRepresentante}, de cédula No. ${repCedula}, quien para fines de este acto se denominará EL EMPLEADOR.\n\nY DE LA OTRA PARTE: el señor(a) ${trabajadorNombre.toUpperCase()}, de cédula No. ${trabajadorCedula}, de nacionalidad ${trabajadorNacionalidad}, de ocupación ${trabajadorOcupacion}, con domicilio en ${trabajadorDireccion}, quien para fines de este acto se denominará EL TRABAJADOR.\n\nDECLARACIONES Y CLÁUSULAS CONVENIDAS:\n\nPRIMERO (Causa de Finalización): Las partes, en estricto cumplimiento con el Artículo 68, Inciso 1 de la Ley No. 16-92 del Código de Trabajo de la República Dominicana, acuerdan poner fin de mutuo consentimiento y por voluntad propia a la relación de trabajo que les unía, surtiendo pleno efecto a partir del día de hoy.\n\nSEGUNDO (Suma Pautada Transaccional): En base a este acuerdo convencional de voluntades, EL EMPLEADOR hace entrega a EL TRABAJADOR de la suma final y de mutuo acuerdo de RD$ ${formattedSalary} (PESOS DOMINICANOS). Dicho pago engloba e incluye todas las prestaciones adquiridas, salarios ordinarios devengados, vacaciones acumuladas y proporción de salario de navidad de la Ley dominicana, otorgando total acuerdo con el monto.\n\nTERCERO (Descargo Absoluto y Renuncia de Acciones): EL TRABAJADOR declara haber recibido la referida suma a su entera satisfacción, por lo cual otorga a favor del EMPLEADOR, sus accionistas, ejecutivos y empresas afiliadas, un descargo formal, total, absoluto, definitivo e irrevocable por conceptos de salarios, comisiones, indemnizaciones por despido o desahucio, horas extraordinarias o cualquier otra compensación en República Dominicana. Ambas partes se comprometen a desistir de cualquier acción legal civil o laboral en curso o futura por motivo del extinguido vínculo laboral.`;

        const mutuoSignBlock = `\n\nFirmado libre de toda coacción y en duplicado, en Santo Domingo, República Dominicana, al día ${todayStr}.\n\n__________________________                  __________________________\n        EL EMPLEADOR                               EL TRABAJADOR\nPor: ${empresaRepresentante}                      ${trabajadorNombre}`;

        const mutuoNotary = includeNotary ? `\n\n----------------- ACTO DE LEGALIZACIÓN DE FIRMAS (NOTARIO PÚBLICO) -----------------\n\nEn la ciudad de Santo Domingo, D.N., República Dominicana, a los ${new Date().getDate()} días de ${new Date().toLocaleDateString('es-DO', {month: 'long'})} de ${new Date().getFullYear()}, comparecieron libremente ante mí las partes firmantes y declararon de mutuo acuerdo bajo la fe de la ley que convienen en todo lo estipulado.\n\n_____________________________________________\nNOTARIO PÚBLICO\nSello Oficial Notarial` : '';

        return baseMutuo + mutuoSignBlock + mutuoNotary;
      }

      case 'amonestacion':
        return `CARTA DE AMONESTACIÓN ESCRITA Y COMUNICADO DISCIPLINARIO

Fecha: ${todayStr}
Santo Domingo, República Dominicana

Al Trabajador: ${trabajadorNombre}
Cédula de Identidad: ${trabajadorCedula}
Posición: ${trabajadorOcupacion}
De parte del Empleador: ${empresaNombre} (RNC: ${empresaRNC})

ASUNTO: AMONESTACIÓN ESCRITA POR INCUMPLIMIENTO DE POLÍTICAS LABORALES

Incumplimiento Específico:
Por medio de la presente, nos dirigimos a usted con la finalidad de notificarle formalmente una AMONESTACIÓN ESCRITA. Este correctivo responde al suceso acontecido el día ${new Date(amonestacionFecha).toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })}, en el cual se constató:

"${amonestacionMotivo}"

Esta situación contraviene su contrato de trabajo y transgrede las directrices del Reglamento Interno de Trabajo del empleador, así como las obligaciones del Código de Trabajo dominicano aplicables al empleado.

Le instamos formalmente a corregir esta conducta de inmediato. Le informamos que la reiteración en faltas de esta índole dará lugar a correctivos mayores, incluyendo la terminación de su relación contractual por amonestaciones recurrentes conforme los artículos aplicables de la Ley 16-92.

Atentamente,

__________________________
Por: ${empresaRepresentante}
Departamento de Recursos Humanos
${empresaNombre} (RNC: ${empresaRNC})

Acuse de Recibo del Empleado (Firma o Constancia):

__________________________
Firma y Fecha de Recibo:`;

      case 'despido':
        const despidoConcept = tipoDespido === 'desahucio'
          ? `NOTIFICACIÓN DE DESAHUCIO (Rescisión del Contrato con Responsabilidad Patronal - Art. 75 Código de Trabajo)`
          : `COMUNICADO DE DESPIDO CON CAUSA JUSTIFICADA (Sin Responsabilidad Patronal - Art. 88 Código de Trabajo)`;

        const despidoDesc = tipoDespido === 'desahucio'
          ? `Por medio de la presente comunicación escrita, la entidad ${empresaNombre} procede a ejercer legalmente su derecho de Desahucio, dando por terminado su contrato individual de trabajo queriendo que finalice los efectos el día de hoy. 

De acuerdo con lo que ordena el artículo 86 del Código de Trabajo, ponemos a su entera disposición en un plazo no mayor de diez (10) días laborales, el pago proporcional correspondiente de sus prestaciones económicas e indemnizaciones (auxilio de cesantía, preaviso omitido, vacaciones acumuladas y proporción de salario de navidad).`
          : `Lamentamos comunicarle de forma expresa que la dirección de ${empresaNombre} le notifica el Despido Disciplinario del cargo laboral que ocupa, fundado en la comisión de faltas justificadas de acuerdo al Art. 88, inciso (${despidoArticulo}), consistente en conductas comprobadas en las últimas jornadas de trabajo. En virtud de esto, la empresa rescinde el contrato sin el pago de las indemnizaciones de preaviso y cesantía. Los salarios devengados y proporciones de vacaciones y salario de navidad adquiridos les serán pagados en tesorería.`;

        return `CARTA DE NOTIFICACIÓN DE TERMINACIÓN DE CONTRATO DE TRABAJO

Fecha de Comunicación: ${todayStr}
Santo Domingo, República Dominicana

Señor(a): ${trabajadorNombre}
Cédula de Identidad: ${trabajadorCedula}
Cargo: ${trabajadorOcupacion}

Estimado(a) Sr(a). ${trabajadorNombre}:

Asunto: ${despidoConcept}

${despidoDesc}

Se adjunta copia de este instrumento para que sea depositada formalmente ante el Ministerio de Trabajo de la República Dominicana, en un plazo menor a las 48 horas como lo exige la normativa vigente local.

Atentamente,

__________________________
Por: ${empresaRepresentante}
Dirección Administrativa y Legal
${empresaNombre}`;

      case 'dimision':
        return `CARTA FORMAL DE RENUNCIA / DIMISIÓN DE TRABAJADOR

Fecha: ${todayStr}
Santo Domingo, República Dominicana

A la Dirección de: ${empresaNombre}
RNC No: ${empresaRNC}
Atención: ${empresaRepresentante} / Recursos Humanos

Quien suscribe, ${trabajadorNombre.toUpperCase()}, dominicano, portador de la Cédula No. ${trabajadorCedula}, en mi calidad de empleado en sus dependencias bajo el puesto de ${trabajadorOcupacion}, me dirijo a ustedes por este medio para expresar libremente mi decisión irrevocable de presentar mi DIMISIÓN formal al puesto que vengo desempeñando.

Detalle o motivo (Sírvase constatar):
"${dimisionDetalle}"

Agradezco sinceramente las oportunidades de capacitación e interacción profesional brindadas durante mi estadía laboral en las oficinas de ${empresaNombre}. Asimismo, solicito que prepare mis cálculos proporcionales de deudas acumuladas por vacaciones anuales acumuladas de conformidad con la Ley de República Dominicana.

Atentamente,

__________________________
${trabajadorNombre}
Firma de Empleado Saliente
Cédula No. ${trabajadorCedula}

Sello de Recibido Empresa (Fecha y Hora):`;
    }
  };


  // ================================================================
  // --- TAB 3: EXPORTACIONES PROFESIONALES Y REPORTES DE ALTA CALIDAD ---
  // ================================================================
  const [reportType, setReportType] = useState<'prestaciones' | 'amortizacion' | 'it1'>('prestaciones');
  const [autoSync, setAutoSync] = useState(true);
  
  // Custom Paper Brand customization of company logo/stamp/colors
  const [stampName, setStampName] = useState('GRUPO CONSULTOR RD & ASOCIADOS');
  const [stampPhone, setStampPhone] = useState('(809) 555-0199');
  const [stampEmail, setStampEmail] = useState('impuestos@grupoconsultor.com.do');
  const [stampColor, setStampColor] = useState<'blue'|'teal'|'slate'>('teal');

  // Parameters for Prestaciones Report Sheet
  const [repPreTrabajador, setRepPreTrabajador] = useState('Julio César Marte');
  const [repPreSalario, setRepPreSalario] = useState(48000);
  const [repPrePreaviso, setRepPrePreaviso] = useState(28); // days
  const [repPreCesantia, setRepPreCesantia] = useState(42); // days
  const [repPreVacaciones, setRepPreVacaciones] = useState(14); // days
  const [repPreNavidad, setRepPreNavidad] = useState(5.5); // months proportion

  // Parameters for Amortizacion report
  const [repAmAmount, setRepAmAmount] = useState<number>(300000);
  const [repAmRate, setRepAmRate] = useState<number>(14.5); // % annual
  const [repAmTerm, setRepAmTerm] = useState<number>(12); // months

  // Parameters for IT-1 consolidated report
  const [repItSales, setRepItSales] = useState<number>(1200000);
  const [repItPurchases, setRepItPurchases] = useState<number>(650000);
  const [repItRetentions, setRepItRetentions] = useState<number>(45000);
  const [repItAdvances, setRepItAdvances] = useState<number>(18000);

  // Math calculated reports data
  // 1. Prestaciones calculation rates:
  const computedDailyPrestaciones = Number((repPreSalario / 23.83).toFixed(2));
  const totalPreavisoVal = repPrePreaviso * computedDailyPrestaciones;
  const totalCesantiaVal = repPreCesantia * computedDailyPrestaciones;
  const totalVacacionesVal = repPreVacaciones * computedDailyPrestaciones;
  const totalNavidadVal = Number(((repPreSalario / 12) * repPreNavidad).toFixed(2));
  const grandTotalPrestaciones = totalPreavisoVal + totalCesantiaVal + totalVacacionesVal + totalNavidadVal;

  // 2. Loan Amortization calculations Francés model representation
  const monthlyRateFraction = (repAmRate / 100) / 12;
  const amortizedMonthlyQuota = monthlyRateFraction > 0
    ? (repAmAmount * monthlyRateFraction) / (1 - Math.pow(1 + monthlyRateFraction, -repAmTerm))
    : repAmAmount / repAmTerm;

  const buildAmortizationSchedule = () => {
    let balance = repAmAmount;
    const rows = [];
    for (let i = 1; i <= Math.min(repAmTerm, 36); i++) {
      const interest = balance * monthlyRateFraction;
      const principal = amortizedMonthlyQuota - interest;
      balance = balance - principal;
      rows.push({
        month: i,
        quota: amortizedMonthlyQuota,
        interest: interest,
        principal: principal,
        balance: Math.max(0, balance)
      });
    }
    return rows;
  };
  const amortiScheduleRows = buildAmortizationSchedule();

  // 3. IT-1 Tax calculation rates:
  const it1TaxCollected = repItSales * 0.18;
  const it1TaxCredited = repItPurchases * 0.18;
  const it1NetTaxLiable = Math.max(0, it1TaxCollected - it1TaxCredited);
  const it1FinalPaymentDGII = Math.max(0, it1NetTaxLiable - repItRetentions - repItAdvances);

  const triggerMockPrint = () => {
    window.print();
  };

  const exportCurrentReportToCSV = () => {
    let csvContent = '';
    let filename = '';

    if (reportType === 'prestaciones') {
      filename = 'desglose_prestaciones_timbradas.csv';
      csvContent = `HOJA TIMBRADA DE PRESTACIONES LABORALES - ${stampName}\n` +
                   `EMPLEADO: ${repPreTrabajador}\n` +
                   `Salario Base Mensual: RD$ ${repPreSalario}\n` +
                   `Salario Diario Base: RD$ ${computedDailyPrestaciones}\n\n` +
                   `Concepto Laboral,Dias/Meses Equivalentes,Monto a Recibir (RD$)\n` +
                   `Indemnizacion por Preaviso,${repPrePreaviso} dias,${totalPreavisoVal.toFixed(2)}\n` +
                   `Auxilio de Cesantia,${repPreCesantia} dias,${totalCesantiaVal.toFixed(2)}\n` +
                   `Vacaciones Pendientes,${repPreVacaciones} dias,${totalVacacionesVal.toFixed(2)}\n` +
                   `Proporcional Sueldo 13,${repPreNavidad} meses,${totalNavidadVal.toFixed(2)}\n` +
                   `Total Neto Prestaciones Liquidado,,${grandTotalPrestaciones.toFixed(2)}\n`;
    } 
    else if (reportType === 'amortizacion') {
      filename = 'tabla_amortizacion_prestamos.csv';
      csvContent = `REPORTE DE AMORTIZACION - ${stampName}\n` +
                   `Monto de Prestamo prestado: RD$ ${repAmAmount}\n` +
                   `Tasa de Interes Anual: ${repAmRate}%\n` +
                   `Plazo: ${repAmTerm} meses\n` +
                   `Cuota Mensual Estimada: RD$ ${amortizedMonthlyQuota.toFixed(2)}\n\n` +
                   `Mes,Monto Cuota,Interes Intermediario,Capital Reducido,Balance Restante\n` +
                   amortiScheduleRows.map(r => `${r.month},${r.quota.toFixed(2)},${r.interest.toFixed(2)},${r.principal.toFixed(2)},${r.balance.toFixed(2)}`).join('\n');
    } 
    else {
      filename = 'resumen_it1_con_dgii.csv';
      csvContent = `REPORTE ANUALIZADO IT-1 DGII - ${stampName}\n` +
                   `Ventas Brutas Gravadas: RD$ ${repItSales}\n` +
                   `ITBIS Cobrado (18%): RD$ ${it1TaxCollected}\n` +
                   `ITBIS Pagado en Compras (18%): RD$ ${it1TaxCredited}\n` +
                   `Retenciones Clientes: RD$ ${repItRetentions}\n` +
                   `Anticipos Pagados: RD$ ${repItAdvances}\n` +
                   `ITBIS Neto a Liquidar: RD$ ${it1NetTaxLiable}\n` +
                   `Monto Final de Pago a DGII con Deducciones: RD$ ${it1FinalPaymentDGII}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo Excel/CSV exportado con éxito.');
  };


  // ==========================================
  // --- TAB 4: RETENCIONES Y RECARGOS DGII ---
  // ==========================================
  const [retConcept, setRetConcept] = useState('Honorarios de Auditoría Externa');
  const [retProviderType, setRetProviderType] = useState<'fisica' | 'juridica'>('fisica');
  const [retServiceType, setRetServiceType] = useState<'honorarios' | 'tecnico' | 'alquiler' | 'otros'>('honorarios');
  const [retGrossAmount, setRetGrossAmount] = useState<number>(100000);
  const [retOverdueDays, setRetOverdueDays] = useState<number>(0);
  const [retItbisRetainedRate, setRetItbisRetainedRate] = useState<'30' | '100'>('100');

  const isrRate = retProviderType === 'fisica' 
    ? (retServiceType === 'honorarios' ? 0.10 : retServiceType === 'alquiler' ? 0.10 : retServiceType === 'tecnico' ? 0.02 : 0.10)
    : 0.0; 

  const initialItbisAmount = retGrossAmount * 0.18;
  const itbisRetainedAmount = retProviderType === 'fisica' 
    ? initialItbisAmount 
    : initialItbisAmount * (Number(retItbisRetainedRate) / 100); 
  
  const isrAmount = retGrossAmount * isrRate;
  const netPaidToSupplier = retGrossAmount + initialItbisAmount - isrAmount - itbisRetainedAmount;

  const totalTaxToPayDGII = isrAmount + itbisRetainedAmount;
  
  let dgiMora = 0;
  let dgiiInterest = 0;
  let monthsOverdue = 0;

  if (retOverdueDays > 0 && totalTaxToPayDGII > 0) {
    monthsOverdue = Math.ceil(retOverdueDays / 30);
    dgiMora = totalTaxToPayDGII * 0.10;
    if (monthsOverdue > 1) {
      dgiMora += totalTaxToPayDGII * 0.04 * (monthsOverdue - 1);
    }
    dgiiInterest = totalTaxToPayDGII * 0.011 * monthsOverdue;
  }

  const totalPenalties = dgiMora + dgiiInterest;
  const totalFinalTaxPayable = totalTaxToPayDGII + totalPenalties;

  // Dynamic automatic synchronization with calculated totals and values of other tabs
  useEffect(() => {
    if (autoSync && trabajadorNombre) {
      setRepPreTrabajador(trabajadorNombre);
    }
  }, [autoSync, trabajadorNombre]);

  useEffect(() => {
    if (autoSync && laboralSalario > 0) {
      setRepPreSalario(laboralSalario);
    }
  }, [autoSync, laboralSalario]);

  useEffect(() => {
    if (autoSync && tab1Totals.base > 0) {
      setRepItSales(tab1Totals.base);
    }
  }, [autoSync, tab1Totals.base]);

  useEffect(() => {
    if (autoSync && totalTaxToPayDGII > 0) {
      setRepItRetentions(totalTaxToPayDGII);
    }
  }, [autoSync, totalTaxToPayDGII]);

  const forceManualSync = () => {
    if (trabajadorNombre) setRepPreTrabajador(trabajadorNombre);
    if (laboralSalario > 0) setRepPreSalario(laboralSalario);
    if (tab1Totals.base > 0) setRepItSales(tab1Totals.base);
    if (totalTaxToPayDGII > 0) setRepItRetentions(totalTaxToPayDGII);
    showToast('¡Datos y totales del portal sincronizados con el reporte!');
  };


  // Print stylesheet inline simulation style
  const printBlockStyle = "print:absolute print:inset-0 print:bg-white print:text-black print:z-[200] print:p-8 print:block";

  return (
    <div className="fixed inset-0 bg-[#0F172A]/70 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-gray-250 rounded-2xl shadow-2xl w-full max-w-6xl my-auto animate-in fade-in-50 zoom-in-95 duration-200 text-left flex flex-col max-h-[96vh] sm:max-h-[92vh] overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="bg-[#0F766E] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold text-lg">
              💼
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Portal Corporativo - NegocioRD Pro</h2>
              <p className="text-[10px] text-teal-100 font-medium tracking-wide">ÁREA EXCLUSIVA DE HERRAMIENTAS CORPORATIVAS Y ASESORÍA FISCAL</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/15 rounded text-teal-100 hover:text-white transition-all cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Toast Alerts */}
        {notification && (
          <div className="bg-teal-600 text-white text-xs px-6 py-2 flex justify-between items-center transition-all duration-300 animate-in fade-in slide-in-from-top-2 shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              {notification}
            </span>
            <span className="text-[9px] bg-teal-850 px-2 py-0.5 rounded font-mono font-bold">DIGITAL DOCS</span>
          </div>
        )}

        {/* Custom scrollable tab ribbon with responsive support */}
        <div className="border-b border-gray-200 bg-[#F9FAFB] flex shrink-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
          <button 
            onClick={() => setActiveTab('itbis-ncf')}
            className={`px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'itbis-ncf' 
                ? 'border-[#0F766E] text-[#0F766E] bg-white border-b-3' 
                : 'border-transparent text-gray-550 hover:text-gray-900 hover:bg-gray-100/40'
            }`}
          >
            <Layers size={14} />
            1. Desglose ITBIS & NCF
          </button>
          <button 
            onClick={() => setActiveTab('contratos-trabajo')}
            className={`px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'contratos-trabajo' 
                ? 'border-[#0F766E] text-[#0F766E] bg-white border-b-3' 
                : 'border-transparent text-gray-550 hover:text-gray-900 hover:bg-gray-100/40'
            }`}
          >
            <FileSignature size={14} />
            2. Generador de Contratos (Código)
          </button>
          <button 
            onClick={() => setActiveTab('exportacion-reportes')}
            className={`px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'exportacion-reportes' 
                ? 'border-[#0F766E] text-[#0F766E] bg-white border-b-3' 
                : 'border-transparent text-gray-550 hover:text-gray-900 hover:bg-gray-100/40'
            }`}
          >
            <Printer size={14} />
            3. Hojas Timbradas & PDF/Excel
          </button>
          <button 
            onClick={() => setActiveTab('retenciones-recargos')}
            className={`px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'retenciones-recargos' 
                ? 'border-[#0F766E] text-[#0F766E] bg-white border-b-3' 
                : 'border-transparent text-gray-550 hover:text-gray-900 hover:bg-gray-100/40'
            }`}
          >
            <Coins size={14} />
            4. Retenciones & Recargos DGII
          </button>
        </div>

        {/* Dynamic Modal Content space */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-white">
          
          {/* TAB 1: DESGLOSE DE ITBIS POR LOTES */}
          {activeTab === 'itbis-ncf' && (
            <div className="space-y-6">
              <div className="bg-teal-55/40 rounded-xl p-4 border border-teal-100 text-[#0F766E] text-xs leading-relaxed">
                <span className="font-bold text-sm block mb-1">Herramienta Profesional de Desglose de Facturas Emitidas:</span>
                Esta área dinámica permite a los asesores cargar múltiples ingresos fiscales, desglosando de inmediato la base de ITBIS (18%, 16% o exenta) y validando la composición de comprobantes fiscales (Crédito Fiscal B01, Consumo B02, etc.). Especialmente diseñado para auditoría quincenal.
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Addition Form Column */}
                <form onSubmit={handleAddInvoice} className="lg:col-span-4 bg-[#FAFAFA] border border-gray-200 rounded-xl p-4 space-y-3.5 h-fit">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 border-b pb-1.5 mb-2 flex items-center gap-1.5">
                    <Plus size={14} className="text-[#0F766E]" />
                    Registrar Factura
                  </h3>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Nombre Cliente</label>
                    <input 
                      type="text"
                      required
                      value={newClient}
                      onChange={(e) => setNewClient(e.target.value)}
                      placeholder="e.g. Compañía El Sol SRL"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F766E] font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Tipo de Comprobante (NCF)</label>
                    <select
                      value={newNcfType}
                      onChange={(e) => setNewNcfType(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    >
                      <option>Crédito Fiscal (B01)</option>
                      <option>Consumo (B02)</option>
                      <option>Único Ingreso (B14)</option>
                      <option>Gubernamentales (B15)</option>
                      <option>Zonas Francas (B16)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">NCF (Opcional)</label>
                      <input 
                        type="text"
                        value={newNcfNumber}
                        onChange={(e) => setNewNcfNumber(e.target.value)}
                        placeholder="Ej: B01000..."
                        maxLength={11}
                        className="w-full text-xs px-2 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F766E] font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Imponible ITBIS</label>
                      <select
                        value={newItbisRate}
                        onChange={(e) => setNewItbisRate(Number(e.target.value))}
                        className="w-full text-xs px-1.5 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                      >
                        <option value={0.18}>Tasa Gral (18%)</option>
                        <option value={0.16}>Reducido (16%)</option>
                        <option value={0.0}>Exento (0%)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Monto de Facturación (RD$ Bruto Base)</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs text-gray-400 font-bold">RD$</span>
                      <input 
                        type="number"
                        required
                        min="1"
                        step="1"
                        value={newBaseAmount}
                        onChange={(e) => setNewBaseAmount(e.target.value !== '' ? Number(e.target.value) : '')}
                        placeholder="0.00"
                        className="w-full text-xs pl-10 pr-2 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0F766E] font-mono font-bold"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-[#0F766E] hover:opacity-95 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus size={14} />
                    Agregar Al Lote
                  </button>
                </form>

                {/* Listing Live Table Column */}
                <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                  
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs max-h-[350px] overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F9FAFB] border-b border-gray-200 text-gray-500 font-bold">
                        <tr>
                          <th className="p-2.5">Cliente / Empresa</th>
                          <th className="p-2.5 hidden sm:table-cell">Tipo Comprobante</th>
                          <th className="p-2.5 font-mono">NCF</th>
                          <th className="p-2.5 text-right">Base Neto</th>
                          <th className="p-2.5 text-right">ITBIS</th>
                          <th className="p-2.5 text-right">Total Bruto</th>
                          <th className="p-2.5 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 font-medium">
                        {invoices.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-gray-400 font-normal">
                              Ninguno registrado en el lote. Utilice el formulario de la izquierda.
                            </td>
                          </tr>
                        ) : (
                          invoices.map((inv) => {
                            const itbisVal = inv.baseAmount * inv.itbisRate;
                            const totalVal = inv.baseAmount + itbisVal;
                            return (
                              <tr key={inv.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5 font-bold text-gray-800 truncate max-w-[120px]">{inv.client}</td>
                                <td className="p-2.5 text-gray-500 hidden sm:table-cell">{inv.ncfType.split(' ')[0]}</td>
                                <td className="p-2.5 font-mono text-[10px] text-gray-650 font-bold">{inv.ncfNumber}</td>
                                <td className="p-2.5 text-right font-mono text-gray-500">RD$ {inv.baseAmount.toLocaleString('en-US')}</td>
                                <td className="p-2.5 text-right font-mono text-teal-600 font-bold">RD$ {itbisVal.toLocaleString('en-US')} <span className="text-[9px] text-[#0F766E] font-normal">({inv.itbisRate * 100}%)</span></td>
                                <td className="p-2.5 text-right font-mono text-gray-900 font-semibold">RD$ {totalVal.toLocaleString('en-US')}</td>
                                <td className="p-2.5 text-center">
                                  <button 
                                    onClick={() => handleDeleteInvoice(inv.id)}
                                    type="button"
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    title="Eliminar factura"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-gray-50 p-4 border border-gray-200 rounded-xl">
                    <div className="text-left">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Suma Base Neto</span>
                      <p className="font-mono text-xs sm:text-sm font-bold text-gray-700">RD$ {tab1Totals.base.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-left border-l pl-3 sm:pl-4">
                      <span className="text-[9px] uppercase font-bold text-[#0F766E] block mb-0.5">ITBIS Liquidado</span>
                      <p className="font-mono text-xs sm:text-sm font-bold text-[#0F766E]">RD$ {tab1Totals.itbis.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-left border-l pl-3 sm:pl-4">
                      <span className="text-[9px] uppercase font-bold text-gray-500 block mb-0.5">Total General</span>
                      <p className="font-mono text-xs sm:text-sm font-bold text-gray-900">RD$ {tab1Totals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  {/* Lot Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <button 
                      onClick={() => {
                        setInvoices([]);
                        showToast('Lote de facturas limpiado.');
                      }}
                      className="px-3 py-1.5 border border-red-200 text-red-600 font-bold text-xs rounded hover:bg-neutral-50 cursor-pointer active:scale-95 transition-all"
                    >
                      Limpiar Lote
                    </button>
                    <button 
                      onClick={handleExport607}
                      className="px-4 py-1.5 bg-[#0F766E] hover:opacity-95 text-white font-bold text-xs rounded shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <FileSpreadsheet size={14} />
                      Exportar Anexo 607 (Ventas)
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}


          {/* TAB 2: GENERADOR DE CONTRATOS Y DOCUMENTOS LEGALES (CÓDIGO DE TRABAJO DE RD) */}
          {activeTab === 'contratos-trabajo' && (
            <div className="space-y-6">
              <div className="bg-teal-55/40 rounded-xl p-4 border border-teal-100 text-[#0F766E] text-xs leading-relaxed">
                <span className="font-bold text-sm block mb-1">Generador de Documentos y Redactor del Código de Trabajo de RD:</span>
                Esta herramienta le asiste para redactar contratos individuales e instrumentos disciplinarios vigentes de forma quilla, integrando la nomenclatura legal dominicana exigida ante el Ministerio de Trabajo bajo la Ley No. 16-92 en sus inspectores regionales.
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Inputs Setup Form (5 cols) */}
                <div className="lg:col-span-5 bg-[#FAFAFA] border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 border-b pb-1.5 flex items-center gap-1.5">
                    <FileSignature size={14} className="text-[#0F766E]" />
                    Ficha Técnica de Documento
                  </h3>

                  {/* Template Picker Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Documento a Redactar</label>
                    <select 
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-250 rounded-lg focus:ring-1 focus:ring-[#0F766E] outline-none font-bold"
                    >
                      <option value="contrato">1. Contrato de Trabajo (Código de Trabajo RD)</option>
                      <option value="iguala">2. Contrato de Iguala / Servicios Profesionales (Civil)</option>
                      <option value="nda">3. Acuerdo de Confidencialidad y No Divulgación (NDA)</option>
                      <option value="comision">4. Contrato de Comisión (Viajante / Ventas RD)</option>
                      <option value="mutuo_acuerdo">5. Convenio de Terminación por Mutuo Acuerdo (Art. 68)</option>
                      <option value="amonestacion">6. Carta de Amonestación Escrita (Sanción Ley 16-92)</option>
                      <option value="despido">7. Carta de Despido / Desahucio Notificado</option>
                      <option value="dimision">8. Carta de Dimisión / Renuncia Trabajador</option>
                    </select>
                  </div>

                  {/* Section A: Company Information */}
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-bold text-[#0F766E] uppercase tracking-widest block font-mono">Datos del Empleador (Compañía)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase block">Razón Social</label>
                        <input 
                          type="text"
                          value={empresaNombre}
                          onChange={(e) => setEmpresaNombre(e.target.value)}
                          className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase block">RNC Comercial</label>
                        <input 
                          type="text"
                          value={empresaRNC}
                          onChange={(e) => setEmpresaRNC(e.target.value)}
                          className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase block">Representante Legal</label>
                        <input 
                          type="text"
                          value={empresaRepresentante}
                          onChange={(e) => setEmpresaRepresentante(e.target.value)}
                          className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase block">Cédula del Representante</label>
                        <input 
                          type="text"
                          value={repCedula}
                          onChange={(e) => setRepCedula(e.target.value)}
                          className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-semibold text-gray-500 uppercase block">Dirección Social</label>
                      <input 
                        type="text"
                        value={empresaDireccion}
                        onChange={(e) => setEmpresaDireccion(e.target.value)}
                        className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none"
                      />
                    </div>
                  </div>

                  {/* Section B: Worker's Information */}
                  <div className="space-y-2.5 border-t pt-3">
                    <span className="text-[9px] font-bold text-[#0F766E] uppercase tracking-widest block font-mono">Datos de la Persona Física (Trabajador)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase block">Nombre Completo</label>
                        <input 
                          type="text"
                          value={trabajadorNombre}
                          onChange={(e) => setTrabajadorNombre(e.target.value)}
                          className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase block">Cédula Identidad</label>
                        <input 
                          type="text"
                          value={trabajadorCedula}
                          onChange={(e) => setTrabajadorCedula(e.target.value)}
                          className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase block">Ocupación</label>
                        <input 
                          type="text"
                          value={trabajadorOcupacion}
                          onChange={(e) => setTrabajadorOcupacion(e.target.value)}
                          className="w-full text-[11px] px-1 py-1 bg-white border border-gray-200 rounded outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase block">Nacionalidad</label>
                        <input 
                          type="text"
                          value={trabajadorNacionalidad}
                          onChange={(e) => setTrabajadorNacionalidad(e.target.value)}
                          className="w-full text-[11px] px-1 py-1 bg-white border border-gray-200 rounded outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase block">Estado Civil</label>
                        <input 
                          type="text"
                          value={trabajadorEstadoCivil}
                          onChange={(e) => setTrabajadorEstadoCivil(e.target.value)}
                          className="w-full text-[11px] px-1 py-1 bg-white border border-gray-200 rounded outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-semibold text-gray-500 uppercase block">Domicilio Habitual</label>
                      <input 
                        type="text"
                        value={trabajadorDireccion}
                        onChange={(e) => setTrabajadorDireccion(e.target.value)}
                        className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none"
                      />
                    </div>
                  </div>

                  {/* Section C: Labor Terms Context (Conditional values on template choice) */}
                  <div className="space-y-2.5 border-t pt-3">
                    <span className="text-[9px] font-bold text-[#0F766E] uppercase tracking-widest block font-mono">Términos del Acuerdo</span>
                    
                    {docType === 'contrato' && (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 uppercase block">Salario Mensual RD$</label>
                            <input 
                              type="number"
                              value={laboralSalario}
                              onChange={(e) => setLaboralSalario(Number(e.target.value))}
                              className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 uppercase block">Modalidad Contrato</label>
                            <select
                              value={contratoModalidad}
                              onChange={(e) => setContratoModalidad(e.target.value as any)}
                              className="w-full text-xs px-1 py-1 bg-white border border-gray-200 rounded outline-none"
                            >
                              <option value="indefinido">Tiempo Indefinido</option>
                              <option value="temporal">Temporal</option>
                              <option value="obra">Por Obra Determinado</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 uppercase block">Fecha Efecto Inicio</label>
                            <input 
                              type="date"
                              value={laboralFechaInicio}
                              onChange={(e) => setLaboralFechaInicio(e.target.value)}
                              className="w-full text-xs px-1 py-0.5 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 uppercase block">Distribución Horaria</label>
                            <input 
                              type="text"
                              value={laboralHoras}
                              onChange={(e) => setLaboralHoras(e.target.value)}
                              className="w-full text-xs px-1 py-1 bg-white border border-gray-200 rounded outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {docType === 'iguala' && (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 uppercase block">Honorarios Iguala RD$ (Mensual)</label>
                            <input 
                              type="number"
                              value={laboralSalario}
                              onChange={(e) => setLaboralSalario(Number(e.target.value))}
                              className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 uppercase block">Fecha Vigencia Inicio</label>
                            <input 
                              type="date"
                              value={laboralFechaInicio}
                              onChange={(e) => setLaboralFechaInicio(e.target.value)}
                              className="w-full text-xs px-1 py-0.5 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {docType === 'nda' && (
                      <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-lg text-[10px] text-emerald-800 leading-relaxed font-medium">
                        <span className="font-bold block mb-0.5">ℹ Acuerdo de Confidencialidad y No Divulgación (NDA):</span>
                        Este acuerdo formaliza obligaciones civiles de no divulgación en el despacho o consultoría comercial. Se nutrirá automáticamente de los campos del Empleador y del Profesional/Trabajador provistos arriba.
                      </div>
                    )}

                    {docType === 'comision' && (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 uppercase block">Salario Fijo Base RD$</label>
                            <input 
                              type="number"
                              value={laboralSalario}
                              onChange={(e) => setLaboralSalario(Number(e.target.value))}
                              className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 uppercase block">Fecha Inicial de Labores</label>
                            <input 
                              type="date"
                              value={laboralFechaInicio}
                              onChange={(e) => setLaboralFechaInicio(e.target.value)}
                              className="w-full text-xs px-1 py-0.5 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {docType === 'mutuo_acuerdo' && (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 uppercase block">Suma Transada Acordada (RD$)</label>
                            <input 
                              type="number"
                              value={laboralSalario}
                              onChange={(e) => setLaboralSalario(Number(e.target.value))}
                              className="w-full text-xs px-1.5 py-1 bg-[#FFFBEB] border border-amber-200 rounded outline-none font-mono text-amber-900 font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 uppercase block">Fecha Oficial de Término</label>
                            <input 
                              type="date"
                              value={laboralFechaInicio}
                              onChange={(e) => setLaboralFechaInicio(e.target.value)}
                              className="w-full text-xs px-1 py-0.5 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {docType === 'amonestacion' && (
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[9px] font-semibold text-gray-500 uppercase block">Fecha de la Falta</label>
                          <input 
                            type="date"
                            value={amonestacionFecha}
                            onChange={(e) => setAmonestacionFecha(e.target.value)}
                            className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-semibold text-gray-500 uppercase block">Detalle de la Infracción / Sucesos</label>
                          <textarea 
                            value={amonestacionMotivo}
                            onChange={(e) => setAmonestacionMotivo(e.target.value)}
                            rows={2}
                            className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {docType === 'despido' && (
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[9px] font-semibold text-gray-500 uppercase block">Clasificación De Terminación</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setTipoDespido('desahucio')}
                              className={`flex-1 py-1 font-bold text-[10px] rounded transition-all ${
                                tipoDespido === 'desahucio' 
                                  ? 'bg-teal-50 text-[#0F766E] border border-[#0F766E]' 
                                  : 'bg-white border text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              Con Responsabilidad (Desahucio)
                            </button>
                            <button
                              type="button"
                              onClick={() => setTipoDespido('causa justify')}
                              className={`flex-1 py-1 font-bold text-[10px] rounded transition-all ${
                                tipoDespido === 'causa justify' 
                                  ? 'bg-rose-50 text-rose-650 border border-rose-250' 
                                  : 'bg-white border text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              Sin Responsabilidad (Art 88)
                            </button>
                          </div>
                        </div>
                        {tipoDespido === 'causa justify' && (
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 uppercase block">Inciso causal del Art. 88 Ley 16-92</label>
                            <select
                              value={despidoArticulo}
                              onChange={(e) => setDespidoArticulo(e.target.value)}
                              className="w-full text-xs px-1 py-1 bg-white border border-gray-200 rounded outline-none"
                            >
                              <option value="Incoherencia e indisciplina en el sitio laboral">Infracción e Insubordinación reiterada</option>
                              <option value="Ausencia desautorizada durante 2 jornadas consecutivas">Faltar 2 días consecutivos sin permiso</option>
                              <option value="Perjuicio intencional a las maquinarias u oficinas">Daño físico / sabotaje a propiedad</option>
                              <option value="Falta de veracidad al declarar aptitudes profesionales">Plagio en datos o documentos de ingreso</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {docType === 'dimision' && (
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase block">Razón o Breve Justificación de Salida</label>
                        <textarea 
                          value={dimisionDetalle}
                          onChange={(e) => setDimisionDetalle(e.target.value)}
                          rows={2}
                          className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none resize-none"
                        />
                      </div>
                    )}

                    {/* Optional Clauses Block */}
                    {['contrato', 'iguala', 'nda', 'comision', 'mutuo_acuerdo'].includes(docType) && (
                      <div className="space-y-1.5 border-t border-gray-200 pt-3 mt-3">
                        <span className="text-[9px] font-bold text-[#0F766E] uppercase tracking-widest block font-mono">Cláusulas Adicionales</span>
                        <div className="space-y-1.5">
                          {docType === 'contrato' && (
                            <label className="flex items-center gap-2 cursor-pointer text-[10px] text-gray-650 font-bold">
                              <input 
                                type="checkbox" 
                                checked={clausePrueba} 
                                onChange={(e) => setClausePrueba(e.target.checked)}
                                className="accent-[#0F766E] rounded h-3.5 w-3.5"
                              />
                              Prorrata Período de Prueba (Art. 30 - 3 meses)
                            </label>
                          )}
                          <label className="flex items-center gap-2 cursor-pointer text-[10px] text-gray-650 font-bold">
                            <input 
                              type="checkbox" 
                              checked={clauseConfidencialidad} 
                              onChange={(e) => setClauseConfidencialidad(e.target.checked)}
                              className="accent-[#0F766E] rounded h-3.5 w-3.5"
                            />
                            Cláusula de Confidencialidad y Propiedad Intelectual
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-[10px] text-gray-650 font-bold">
                            <input 
                              type="checkbox" 
                              checked={clauseArbitraje} 
                              onChange={(e) => setClauseArbitraje(e.target.checked)}
                              className="accent-[#0F766E] rounded h-3.5 w-3.5"
                            />
                            Cláusula Compromisoria de Arbitraje (CRC Sto. Dgo.)
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-[10px] text-teal-850 font-black border-t border-dashed border-gray-250 pt-2 mt-2">
                            <input 
                              type="checkbox" 
                              checked={includeNotary} 
                              onChange={(e) => setIncludeNotary(e.target.checked)}
                              className="accent-[#0F766E] rounded h-3.5 w-3.5"
                            />
                            💼 Legalización de Firmas por Notario Público & Testigos
                          </label>
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* Compilation Viewport Container Sheet (7 cols) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  
                  {/* Styled physical document look */}
                  <div className="bg-[#525659] p-4 sm:p-6 rounded-xl overflow-hidden flex justify-center items-start shadow-inner min-h-[460px] max-h-[500px] overflow-y-auto">
                    <div 
                      className="bg-white w-full max-w-[550px] p-6 sm:p-8 text-[11px] leading-relaxed font-mono text-gray-800 shadow-2xl border border-gray-300 rounded-xs select-text whitespace-pre-wrap text-left relative"
                      id="labor-legal-compiled-sheet-preview"
                    >
                      <div className="absolute top-2 right-2 flex gap-1 print:hidden select-none">
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-100">✔ DR LAB LEGAL</span>
                        <span className="text-[9px] bg-red-50 text-red-800 font-bold px-1.5 py-0.5 rounded border border-red-100">CÓDIGO 16-92</span>
                      </div>
                      
                      {compileDocumentText()}
                    </div>
                  </div>

                  {/* Actions to handle doc text */}
                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <button 
                      onClick={() => handleCopyDoc(compileDocumentText())}
                      className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all text-center"
                    >
                      <Copy size={14} />
                      Copiar Contenido Redactado
                    </button>
                    <button 
                      onClick={handleDownloadDoc}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all text-center"
                    >
                      <Download size={14} />
                      Descargar Contrato (.txt)
                    </button>
                    <button 
                      onClick={triggerMockPrint}
                      className="px-4 py-2 bg-[#0F766E] hover:opacity-95 text-white font-bold text-xs rounded-lg shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all text-center"
                    >
                      <Printer size={14} />
                      Imprimir / Descargar PDF
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}


          {/* TAB 3: HOJAS TIMBRADAS DE REPORTES PRO Y EXPORTACIONES */}
          {activeTab === 'exportacion-reportes' && (
            <div className="space-y-6">
              
              <div className="bg-teal-55/40 rounded-xl p-4 border border-teal-100 text-[#0F766E] text-xs leading-relaxed">
                <span className="font-bold text-sm block mb-1">Módulo de Hojas Timbradas y Exportaciones de Alta Calidad:</span>
                Configure un encabezado formal simulado o corporativo oficial (timbrado) y exporte de inmediato en formato listo para impresión o descarga digital CSV para Microsoft Excel.
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Custom Branding & Parameters Configuration */}
                <div className="lg:col-span-5 bg-[#FAFAFA] border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4 h-fit">
                  
                  {/* Choose which Report Layout to load */}
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Elegir Reporte Corporativo</span>
                    <div className="grid grid-cols-3 gap-1 border rounded-lg overflow-hidden bg-white p-0.5">
                      <button 
                        type="button"
                        onClick={() => setReportType('prestaciones')}
                        className={`py-1.5 px-2 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                          reportType === 'prestaciones' 
                            ? 'bg-[#0F766E] text-white' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        A. Prestaciones
                      </button>
                      <button 
                        type="button"
                        onClick={() => setReportType('amortizacion')}
                        className={`py-1.5 px-2 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                          reportType === 'amortizacion' 
                            ? 'bg-[#0F766E] text-white' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        B. Préstamos
                      </button>
                      <button 
                        type="button"
                        onClick={() => setReportType('it1')}
                        className={`py-1.5 px-2 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                          reportType === 'it1' 
                            ? 'bg-[#0F766E] text-white' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        C. Resumen IT-1
                      </button>
                    </div>
                  </div>

                  {/* Section: Custom Letterhead Settings */}
                  <div className="space-y-2 border-t pt-3">
                    <span className="text-[9px] font-bold text-[#0F766E] uppercase tracking-widest block font-mono">Personalización del Timbrado de Oficina</span>
                    <div>
                      <label className="text-[9px] font-semibold text-gray-500 block">Nombre del Despacho / Consultora</label>
                      <input 
                        type="text"
                        value={stampName}
                        onChange={(e) => setStampName(e.target.value)}
                        className="w-full text-xs px-2 py-1 bg-white border border-gray-200 rounded outline-none font-bold text-gray-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 block">Teléfono Oficina</label>
                        <input 
                          type="text"
                          value={stampPhone}
                          onChange={(e) => setStampPhone(e.target.value)}
                          className="w-full text-xs px-2 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 block">Correo Institucional</label>
                        <input 
                          type="text"
                          value={stampEmail}
                          onChange={(e) => setStampEmail(e.target.value)}
                          className="w-full text-xs px-2 py-1 bg-white border border-gray-200 rounded outline-none font-mono text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Report specifics */}
                  <div className="space-y-2 border-t pt-3">
                    <span className="text-[9px] font-bold text-[#0F766E] uppercase tracking-widest block font-mono">Métricas del Período / Cálculo</span>
                    
                    {/* Auto Sync Toggle & Status */}
                    <div className="bg-emerald-50/65 border border-emerald-150 p-2.5 rounded-lg space-y-1.5 mb-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#0F766E] flex items-center gap-1">
                          <CheckCircle size={12} className="text-emerald-700" />
                          Sincronización de Totales
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={autoSync} 
                            onChange={(e) => setAutoSync(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-teal-700"></div>
                        </label>
                      </div>
                      <p className="text-[9.5px] text-emerald-800 leading-normal">
                        Mantiene este reporte sincronizado en tiempo real con los valores y totales calculados en las otras pestañas de Facturas, Contratos y Retenciones.
                      </p>
                      {!autoSync && (
                        <button
                          type="button"
                          onClick={forceManualSync}
                          className="w-full text-center py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[9px] rounded uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Sincronizar Manualmente Ahora
                        </button>
                      )}
                    </div>

                    {reportType === 'prestaciones' && (
                      <div className="space-y-2.5">
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="text-[9px] font-semibold text-gray-500 uppercase block">Nombre Completo del Trabajador</label>
                            {autoSync && <span className="text-[8px] px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold uppercase font-mono">Sincronizado</span>}
                          </div>
                          <input 
                            type="text"
                            value={repPreTrabajador}
                            onChange={(e) => setRepPreTrabajador(e.target.value)}
                            className={`w-full text-xs px-2 py-1 border rounded outline-none transition-all ${
                              autoSync 
                                ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#064E3B] font-semibold cursor-not-allowed' 
                                : 'bg-white border-gray-200 text-gray-800'
                            }`}
                            disabled={autoSync}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[9px] font-semibold text-gray-500 uppercase block">Salario Base RD$</label>
                              {autoSync && <span className="text-[8px] text-emerald-600 font-bold uppercase font-mono">Sync</span>}
                            </div>
                            <input 
                              type="number"
                              value={repPreSalario}
                              onChange={(e) => setRepPreSalario(Number(e.target.value))}
                              className={`w-full text-xs px-2 py-1 border rounded outline-none font-mono transition-all ${
                                autoSync 
                                  ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#064E3B] font-semibold cursor-not-allowed' 
                                  : 'bg-white border-gray-200 text-gray-800'
                              }`}
                              disabled={autoSync}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 uppercase block">Proporcional Sueldo 13</label>
                            <select
                              value={repPreNavidad}
                              onChange={(e) => setRepPreNavidad(Number(e.target.value))}
                              className="w-full text-xs px-1 py-1 bg-white border border-gray-200 rounded outline-none"
                            >
                              <option value={12}>Año Completo (12 meses)</option>
                              <option value={9}>Proporcional (9 meses)</option>
                              <option value={5.5}>Proporcional (5.5 meses)</option>
                              <option value={3}>Proporcional (3 meses)</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 block">Días Preaviso</label>
                            <input 
                              type="number"
                              value={repPrePreaviso}
                              onChange={(e) => setRepPrePreaviso(Number(e.target.value))}
                              className="w-full text-xs px-1 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 block">Días Cesantía</label>
                            <input 
                              type="number"
                              value={repPreCesantia}
                              onChange={(e) => setRepPreCesantia(Number(e.target.value))}
                              className="w-full text-xs px-1 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 block">Días Vacaciones</label>
                            <input 
                              type="number"
                              value={repPreVacaciones}
                              onChange={(e) => setRepPreVacaciones(Number(e.target.value))}
                              className="w-full text-xs px-1 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {reportType === 'amortizacion' && (
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[9px] font-semibold text-gray-500 block">Monto Capital Principal (RD$)</label>
                          <input 
                            type="number"
                            value={repAmAmount}
                            onChange={(e) => setRepAmAmount(Number(e.target.value))}
                            className="w-full text-xs px-2 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 block">Tasa Interés Anual (%)</label>
                            <input 
                              type="number"
                              step="0.1"
                              value={repAmRate}
                              onChange={(e) => setRepAmRate(Number(e.target.value))}
                              className="w-full text-xs px-2 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 block">Plazo en Meses</label>
                            <input 
                              type="number"
                              value={repAmTerm}
                              onChange={(e) => setRepAmTerm(Number(e.target.value))}
                              className="w-full text-xs px-2 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {reportType === 'it1' && (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[9px] font-semibold text-gray-500 block">Ventas Totales RD$</label>
                              {autoSync && <span className="text-[8px] text-emerald-600 font-bold uppercase font-mono">Sync</span>}
                            </div>
                            <input 
                              type="number"
                              value={repItSales}
                              onChange={(e) => setRepItSales(Number(e.target.value))}
                              className={`w-full text-xs px-1 py-1 border rounded outline-none font-mono transition-all ${
                                autoSync 
                                  ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#064E3B] font-semibold cursor-not-allowed' 
                                  : 'bg-white border-gray-200 text-gray-800'
                              }`}
                              disabled={autoSync}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 block">Compras Totales RD$</label>
                            <input 
                              type="number"
                              value={repItPurchases}
                              onChange={(e) => setRepItPurchases(Number(e.target.value))}
                              className="w-full text-xs px-1 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[9px] font-semibold text-gray-500 block">Retenciones Recibidas Client</label>
                              {autoSync && <span className="text-[8px] text-emerald-600 font-bold uppercase font-mono">Sync</span>}
                            </div>
                            <input 
                              type="number"
                              value={repItRetentions}
                              onChange={(e) => setRepItRetentions(Number(e.target.value))}
                              className={`w-full text-xs px-1.5 py-1 border rounded outline-none font-mono transition-all ${
                                autoSync 
                                  ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#064E3B] font-semibold cursor-not-allowed' 
                                  : 'bg-white border-gray-200 text-gray-800'
                              }`}
                              disabled={autoSync}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold text-gray-500 block">Anticipos Colectados</label>
                            <input 
                              type="number"
                              value={repItAdvances}
                              onChange={(e) => setRepItAdvances(Number(e.target.value))}
                              className="w-full text-xs px-1.5 py-1 bg-white border border-gray-200 rounded outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* Styled Print Out Sheet (7 cols) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  
                  {/* Outer container simulating a preview window */}
                  <div className="bg-[#525659] p-4 rounded-xl overflow-hidden flex justify-center items-start shadow-inner min-h-[440px] max-h-[460px] overflow-y-auto">
                    
                    {/* The Timbrad Sheet */}
                    <div 
                      id="timbrada-report-print-preview"
                      className="bg-white w-full max-w-[580px] p-6 sm:p-8 border border-gray-200 text-gray-800 shadow-2xl rounded-xs text-xs relative select-text text-left"
                    >
                      
                      {/* Banner Timbre Header */}
                      <div className="border-b-2 border-[#0F766E] pb-4 mb-6 flex justify-between items-start">
                        <div>
                          <h3 className="font-extrabold text-[#0F766E] text-sm uppercase tracking-wider">{stampName}</h3>
                          <p className="text-[9px] text-gray-500 font-mono mt-0.5">Asesoría Contable, Laboral y Defensoría de Impuestos en RD</p>
                          <div className="flex gap-3 text-[9px] text-[#0F766E] font-medium mt-1 font-mono">
                            <span>Tel: {stampPhone}</span>
                            <span>•</span>
                            <span>Email: {stampEmail}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] bg-[#0F766E] text-teal-50 px-2 py-0.5 rounded font-mono font-bold tracking-wider">REPORTE OFICIAL TIMBRADO</span>
                        </div>
                      </div>

                      {/* Prestaciones report rendering */}
                      {reportType === 'prestaciones' && (
                        <div className="space-y-4">
                          <div className="bg-teal-50/50 p-2.5 rounded border border-teal-150">
                            <span className="text-[9px] font-bold text-[#0F766E] block mb-0.5">ESTRUCTURA DE LIQUIDACIÓN Y CÁLCULOS</span>
                            <p className="text-gray-950 font-bold block">Trabajador: {repPreTrabajador}</p>
                            <p className="text-[10px] text-gray-650 mt-1">Estimación de pasivo correspondiente a liquidación voluntaria o desahucio con derechos del empleado.</p>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between border-b pb-1">
                              <span className="text-gray-500">Salario Promedio Mensual:</span>
                              <span className="font-mono font-bold">RD$ {repPreSalario.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span className="text-gray-500">Salario Diario Computado:</span>
                              <span className="font-mono font-bold">RD$ {computedDailyPrestaciones.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>

                          <table className="w-full text-xs text-left border-collapse border border-gray-200 mt-4 rounded">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-2 text-gray-500">Detalle / Concepto</th>
                                <th className="p-2 text-center text-gray-500">Vigencia (Días/Meses)</th>
                                <th className="p-2 text-right text-[#0F766E]">Total Liquidado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-150 font-medium">
                              <tr>
                                <td className="p-2 font-bold text-gray-700">Preaviso Omitido (Indemnización)</td>
                                <td className="p-2 text-center font-mono">{repPrePreaviso} días</td>
                                <td className="p-2 text-right font-mono text-gray-900">RD$ {totalPreavisoVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                              </tr>
                              <tr>
                                <td className="p-2 font-bold text-gray-700">Auxilio de Cesantía Acumulada</td>
                                <td className="p-2 text-center font-mono">{repPreCesantia} días</td>
                                <td className="p-2 text-right font-mono text-gray-900">RD$ {totalCesantiaVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                              </tr>
                              <tr>
                                <td className="p-2 font-bold text-gray-700">Vacaciones Adquiridas / No Gozadas</td>
                                <td className="p-2 text-center font-mono">{repPreVacaciones} días</td>
                                <td className="p-2 text-right font-mono text-gray-900">RD$ {totalVacacionesVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                              </tr>
                              <tr>
                                <td className="p-2 font-bold text-gray-700">Proporcional de Regalia (Sueldo 13)</td>
                                <td className="p-2 text-center font-mono">{repPreNavidad} meses</td>
                                <td className="p-2 text-right font-mono text-gray-900">RD$ {totalNavidadVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                              </tr>
                              <tr className="bg-teal-50 hover:bg-teal-50 border-t-2 font-bold text-gray-900">
                                <td className="p-2" colSpan={2}>Pasivo Laboral Total Neto Evaluado:</td>
                                <td className="p-2 text-right font-mono text-teal-700 text-sm">RD$ {grandTotalPrestaciones.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                              </tr>
                            </tbody>
                          </table>

                          <div className="pt-8 flex justify-between gap-4 mt-4 text-[9px]">
                            <div className="flex-1 text-center font-mono">
                              <div className="border-t mx-auto w-36 mb-1"></div>
                              <span>Sello de Oficina Asesora</span>
                            </div>
                            <div className="flex-1 text-center font-mono">
                              <div className="border-t mx-auto w-36 mb-1"></div>
                              <span>CPA Firmante Oficial</span>
                            </div>
                          </div>
                        </div>
                      )}


                      {/* Amortizacion Table Report Rendering */}
                      {reportType === 'amortizacion' && (
                        <div className="space-y-4">
                          <div className="bg-teal-50/50 p-2.5 rounded border border-teal-150">
                            <span className="text-[9px] font-bold text-[#0F766E] block mb-0.5">SISTEMA FRANCÉS DE AMORTIZACIÓN CONSTANTE</span>
                            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                              <span>Préstamo: RD$ {repAmAmount.toLocaleString('en-US')}</span>
                              <span>Tasa Anual: {repAmRate}%</span>
                              <span>Plazo: {repAmTerm} Meses</span>
                              <span>Cuota Mensual: RD$ {amortizedMonthlyQuota.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>

                          <div className="max-h-[220px] overflow-y-auto border border-gray-150 rounded">
                            <table className="w-full text-[10px] text-left border-collapse">
                              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 font-bold">
                                <tr>
                                  <th className="p-1.5 text-center">Mes No</th>
                                  <th className="p-1.5 text-right">Monto Cuota</th>
                                  <th className="p-1.5 text-right">Interés Liquidado</th>
                                  <th className="p-1.5 text-right">Capital Amortizado</th>
                                  <th className="p-1.5 text-right">Balance Restante</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-150 font-medium">
                                {amortiScheduleRows.map((row) => (
                                  <tr key={row.month} className="hover:bg-slate-50/50 font-mono">
                                    <td className="p-1.5 text-center text-gray-500">{row.month}</td>
                                    <td className="p-1.5 text-right font-bold">RD$ {row.quota.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                                    <td className="p-1.5 text-right text-red-500 font-bold">RD$ {row.interest.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                                    <td className="p-1.5 text-right text-emerald-600 font-bold">RD$ {row.principal.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                                    <td className="p-1.5 text-right text-gray-900">RD$ {row.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <p className="text-[9px] text-gray-400 leading-normal italic text-center mt-2 border-t pt-2">Simulación puramente indicativa con tasas fijas. Sujeto a variaciones de comisiones bancarias o gastos de seguros de deudores local.</p>
                        </div>
                      )}


                      {/* IT-1 Tax calculation report rendering */}
                      {reportType === 'it1' && (
                        <div className="space-y-4">
                          <div className="bg-teal-50/50 p-2.5 rounded border border-teal-150">
                            <span className="text-[9px] font-bold text-[#0F766E] block mb-0.5">RESUMEN CONSOLIDADO IT1 - CONCILIACIÓN DGII</span>
                            <span className="text-gray-950 block font-bold">Operaciones Fiscales Anualizadas / Quincenales</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-medium">
                            <div className="p-2 border rounded border-gray-150">
                              <span className="text-[9px] text-gray-400 block uppercase">ITBIS FACTURADO (COBRADO)</span>
                              <span className="font-mono font-bold text-gray-700">RD$ {it1TaxCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="p-2 border rounded border-gray-150">
                              <span className="text-[9px] text-gray-400 block uppercase">ITBIS PAGADO (CRÉDITO FISCAL)</span>
                              <span className="font-mono font-bold text-gray-700">RD$ {it1TaxCredited.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>

                          <div className="border border-gray-200 rounded p-4 bg-gray-50/50 space-y-2 text-xs font-semibold">
                            <div className="flex justify-between border-b pb-1">
                              <span className="text-gray-500 font-medium">1. ITBIS Neto a Declarar:</span>
                              <span className="font-mono text-gray-900 font-bold">RD$ {it1NetTaxLiable.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1 text-rose-600">
                              <span className="font-medium">- Retenciones Recibidas (Clientes):</span>
                              <span className="font-mono font-bold">- RD$ {repItRetentions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1 text-rose-600">
                              <span className="font-medium">- Anticipos Mensuales Pagados:</span>
                              <span className="font-mono font-bold">- RD$ {repItAdvances.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between pt-1.5 text-sm font-extrabold text-[#0F766E]">
                              <span>Monto Neto Total para Oficina Virtual:</span>
                              <span className="font-mono">RD$ {it1FinalPaymentDGII.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[9px] bg-amber-50 rounded border border-amber-100 p-2 text-amber-900 leading-normal">
                            <AlertCircle size={12} className="shrink-0 text-amber-600" />
                            <span>Correlación IR-2: Este resumen neto de ITBIS anual se asocia de forma directa con la casilla de Ingresos de Operación en el formulario de la declaración de renta IR-2 institucional.</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Operational sheet buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <button 
                      onClick={exportCurrentReportToCSV}
                      className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all text-center"
                    >
                      <Download size={14} className="text-[#0F766E]" />
                      Descargar Formato Excel (CSV)
                    </button>
                    <button 
                      onClick={triggerMockPrint}
                      className="px-4 py-2 bg-[#0F766E] hover:opacity-95 text-white font-bold text-xs rounded-lg shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all text-center"
                    >
                      <Printer size={14} />
                      Imprimir / Descargar PDF de Hoja Timbrada
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}


          {/* TAB 4: CALCULADORA DE RETENCIONES Y RECARGOS DGII */}
          {activeTab === 'retenciones-recargos' && (
            <div className="space-y-6">

              <div className="bg-[#FFFBEB] rounded-xl p-4 border border-amber-100 text-[#0F766E] text-xs leading-relaxed">
                <span className="font-bold text-sm block mb-1 text-amber-950">Planificador de Retenciones e Infracciones Tributarias:</span>
                Esta herramienta computa la sujeción de ITBIS (30%, 100%) e ISR (10% honorarios/alquileres, 2% técnicos) aplicable a proveedores externos según el Código Tributario dominicano. Adicionalmente, calcula el recargo por mora (10% + 4% mensual) y el interés indemnizatorio si el pago se efectúa fuera de fecha.
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Configuration Input Controls */}
                <div className="lg:col-span-5 bg-[#FAFAFA] border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 border-b pb-1.5 mb-1.5 flex items-center gap-1.5">
                    <Calculator size={14} className="text-[#0F766E]" />
                    Parámetros Transaccionales
                  </h3>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Concepto del Servicio / Egreso</label>
                    <input 
                      type="text"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-[#0F766E] outline-none font-medium text-gray-700"
                      value={retConcept}
                      onChange={(e) => setRetConcept(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Tipo de Sujeto Proveedor</label>
                      <div className="flex gap-2.5 mt-1">
                        <button
                          type="button"
                          onClick={() => setRetProviderType('fisica')}
                          className={`flex-1 py-1.5 px-2.5 text-[11px] font-bold rounded flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            retProviderType === 'fisica'
                              ? 'bg-teal-50 text-[#0F766E] border border-[#0F766E]'
                              : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <UserCheck size={12} />
                          Física
                        </button>
                        <button
                          type="button"
                          onClick={() => setRetProviderType('juridica')}
                          className={`flex-1 py-1.5 px-2.5 text-[11px] font-bold rounded flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            retProviderType === 'juridica'
                              ? 'bg-teal-50 text-[#0F766E] border border-[#0F766E]'
                              : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <Building size={12} />
                          Jurídica
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Categoría del Gasto</label>
                      <select
                        className="w-full text-xs px-2 py-1.5 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-[#0F766E] outline-none mt-1"
                        value={retServiceType}
                        disabled={retProviderType === 'juridica'}
                        onChange={(e) => setRetServiceType(e.target.value as any)}
                      >
                        <option value="honorarios">Honorarios (ISR 10%)</option>
                        <option value="alquiler">Alquileres (ISR 10%)</option>
                        <option value="tecnico">Servicios Técnicos (ISR 2%)</option>
                        <option value="otros">Otros Retención General (10%)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Monto de la Factura (Base RD$)</label>
                      <div className="relative mt-1">
                        <span className="absolute left-2.5 top-1.5 text-xs text-gray-400 font-bold">RD$</span>
                        <input 
                          type="number"
                          className="w-full text-xs pl-10 pr-2 py-1.5 bg-white border border-gray-200 rounded outline-none font-mono font-bold"
                          value={retGrossAmount}
                          min="1"
                          onChange={(e) => setRetGrossAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Retención ITBIS Directo</label>
                      <select
                        className="w-full text-xs px-2 py-1.5 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-[#0F766E] outline-none mt-1"
                        value={retItbisRetainedRate}
                        disabled={retProviderType === 'fisica'}
                        onChange={(e) => setRetItbisRetainedRate(e.target.value as any)}
                      >
                        {retProviderType === 'fisica' ? (
                          <option value="100">100% de Retención</option>
                        ) : (
                          <>
                            <option value="30">30% (Servicios Generales)</option>
                            <option value="100">100% (Profesionales/Especiales)</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-250 pt-2.5">
                    <label className="text-[10px] uppercase font-bold text-red-600 flex items-center gap-1">
                      <ShieldAlert size={12} />
                      ¿Días de Retraso de Pago a la DGII? (Calcular Penalidades)
                    </label>
                    <p className="text-[9px] text-gray-400 mb-1.5 leading-normal">Si declarará este impuesto fuera del límite legal habitual de presentación (Día 20 del mes siguiente).</p>
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded outline-none font-mono font-bold text-red-650"
                        min="0"
                        value={retOverdueDays}
                        placeholder="Ej: 45 días..."
                        onChange={(e) => setRetOverdueDays(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                      <span className="absolute right-2.5 top-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">DÍAS</span>
                    </div>
                  </div>

                </div>

                {/* Computational outputs breakdown */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Ledger Cards */}
                  <div className="bg-[#FCFCFC] border border-gray-300 rounded-xl p-5 space-y-4">
                    <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-widest block border-b pb-1.5">Liquidación de Retenciones en el Pago</span>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold block">ITBIS TOTAL FACTURADO (18%)</span>
                        <p className="font-mono text-xs sm:text-sm font-bold text-gray-800">RD$ {initialItbisAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold block">IMPUESTO BASE RETENER</span>
                        <p className="font-mono text-xs sm:text-sm font-bold text-teal-600">RD$ {itbisRetainedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-[9px] font-normal text-gray-500">({retProviderType === 'fisica' ? '100%' : `${retItbisRetainedRate}%`})</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-150 pt-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold block">MONTO RETENCIÓN ISR</span>
                        <p className="font-mono text-xs sm:text-sm font-bold text-rose-600">RD$ {isrAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-[9px] font-normal text-gray-500">({(isrRate * 100).toFixed(0)}%)</span></p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-450 font-bold block">NETO PAGAR AL COMPRADOR/PROVEEDOR</span>
                        <p className="font-mono text-xs sm:text-base font-bold text-[#0F766E]">RD$ {netPaidToSupplier.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Overdue Penalty Panel (Overdue days calculations) */}
                  <div className="border border-red-200 bg-red-50/20 rounded-xl p-5 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-red-105 pb-1.5">
                      <span className="text-[10px] text-red-700 font-bold flex items-center gap-1 uppercase tracking-widest">
                        <ShieldAlert size={14} />
                        Cálculo de Infracciones del Periodo (Mora y Recargos DGII)
                      </span>
                      {retOverdueDays > 0 ? (
                        <span className="text-[10px] bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded uppercase tracking-wider">Arreos ({monthsOverdue} Mes/es)</span>
                      ) : (
                        <span className="text-[10px] bg-teal-100 text-teal-700 font-medium px-2 py-0.5 rounded uppercase tracking-wider">A Fecha / Regular</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-2.5 bg-white border border-gray-150 rounded-lg">
                        <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider mb-0.5">Mora DGII (10% + 4%)</span>
                        <p className="font-mono text-xs font-bold text-red-600">RD$ {dgiMora.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="p-2.5 bg-white border border-gray-150 rounded-lg">
                        <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider mb-0.5">Interés (1.1% Mens)</span>
                        <p className="font-mono text-xs font-bold text-red-600">RD$ {dgiiInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="p-2.5 bg-white border border-gray-150 rounded-lg">
                        <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider mb-0.5">Total Penalidad Tardía</span>
                        <p className="font-mono text-xs font-bold text-red-700">RD$ {totalPenalties.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-red-600/5 border border-red-200 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 block font-bold">MONTO LIQUIDADO TOTAL A TRANSFERIR A LA DGII:</span>
                        <span className="text-[9px] text-gray-400">Impuestos base de retenciones + Recargos por atrasos calculados</span>
                      </div>
                      <span className="font-mono text-sm sm:text-base font-extrabold text-[#111827]">
                        RD$ {totalFinalTaxPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer actions bar */}
        <div className="bg-[#F9FAFB] px-6 py-4 border-t border-gray-200 flex justify-between items-center gap-4 shrink-0">
          <p className="text-[10px] text-gray-400 leading-normal max-w-lg hidden sm:block">
            Este software es de simulación parametrizada basada en normativas reales dominicanas (Ley No. 16-92 y Ley 11-92). Verifique siempre modificaciones o tasas impositivas en los portales oficiales locales antes de declaraciones.
          </p>
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200 text-xs font-bold rounded-lg cursor-pointer transition-all active:scale-95 text-center"
          >
            Cerrar Portal Pro
          </button>
        </div>

      </div>
    </div>
  );
}
