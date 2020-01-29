import { Injectable } from '@angular/core';
@Injectable()
export class Language{
	private i18n:any = {
		es:{
			'language-list': [
				{name:'es', value: 'Español'},
				{name: 'en', value: 'Inglés'}
			],
			'message-errors': {
				'0':'Sin errores aparentes',
				'1':'El identificador ya existe, use otro',
				'2':'Usuario o contraseña incorrectas',
				'3':'No tienes permisos para realizar esta operación',
				'4':'No has iniciado sesión',
				'5':'La base de datos local no ha sido inicializada',
				'6':'No se puede actualizar porque esta reportado como muerto',
				'7':'No se puede agregar el historial porque existe un historial del mismo tipo en la misma fecha',
				'-1': 'El servidor no responde, verifique su conexion a internet',
			},
			'notifications': 'Notificaciones',
			'average':'Promedio',
			'deviation': 'Desviacion estandar',
			'user-required-credentials': 'Se necesita un nombre de usaurio y contraseña válidos',
			'stats': 'Estadísticas',
			'data-group': 'Grupos de datos',
			'group-name': 'Nombre del grupo',
			'duplicated-name': 'Nombre ya existente, ingrese otro nombre',
			'quick-access': 'Acceso rápido',
			'session': 'Sesión',
			'change': 'Cambiar',
			'exit': 'Salir',
			'peso_nacimiento': 'Peso al nacer',
			'peso_destete': 'Peso al destete',
			'peso_anual': 'Peso al año',
			'login': 'Iniciar sesión',
			'home': 'Inicio',
			'cattle': 'Ganado',
			'settings': 'Ajustes',
			'no-items': 'Lo sentimos, no hay elementos',
			'db-init': "Inicializando base de datos... por favor espere",
			'db-list': 'Obteniendo registros...',
			'login-init': 'Iniciando sesión...',
			'login-error': 'No se pudo iniciar sesión',
			'db-error': 'Error en la base de datos',
			'db-error-save': 'Error guardando el registro',
			'db-error-list': 'No se pudieron obtener los registros',
			'register':'Registro',
			'register-id-required': 'Se necesita un identificador para el registro',
			'register-type-required': 'Se necesita un tipo para el registro',
			'register-not-saved-alert': 'El registro no se ha guardado aún, ¿desea regresar de todas formas?',
			'register-saving': 'Guardando registro...',
			'register-deleting': 'Borrando registro...',
			'register-save-error': 'No se pudo guardar el registro',
			'register-delete-error': 'No se pudieron eliminar los registro(s)',
			'register-cloud-save-error': 'Algunos registros no pudieron guardarse, es probable que fueran dados de alta antes',
			'register-save-error-confirm-local': 'No se pudo conectar al servidor, ¿desea guardar el registro localmente?',
			'getting-information': 'Recuperando información',
			'add-children':'Agregar cría',
			'error':"Error",
			'ok': 'Aceptar',
			'cancel': 'Cancelar',
			'yes': 'Sí',
			'no': 'No',
			'delete':'Eliminar',
			'from': 'Desde',
			'until': 'Hasta',
			'mode-online-only': 'Esta acción solo se puede realizar en el modo online',
			'update-service-date': '¿Desea que calcule la fecha de servicio también?',
			'language': 'Lenguaje',
			'account': 'Cuenta',
			'password': 'Contraseña', 
			'enter': 'Acceder',
			'info-ids': 'Identificadores',
			'info-delivery': 'Parto',
			'info-general': 'Información general',
			'users': 'Usuarios',
			'user-anon': 'Anónimo',
			'user-details':'Detalles del usuario',
			'user-username': 'Usuario',
			'user-password': 'Contraseña',
			'user-firstname': 'Nombre',
			'user-lastname': 'Apellidos',
			'user-phone': 'Teléfono',
			'user-email': 'Correo electrónico',
			'user-permissions': 'Permisos',
			'user-permissions-cattle-read': 'Ver ganado',
			'user-permissions-cattle-write': 'Agregar/Editar ganado',
			'user-permissions-user-read': 'Ver usuarios',
			'user-permissions-user-write': 'Agregar/Editar usuarios',
			'mode': 'Modo',
			'mode-list': [
				'Online',
				'Offline'
			],
			'death-type': 'Tipo de muerte',
			'mode-offline': 'Offline',
			'mode-online': 'Online',
			'cattle-list': 'Lista de Ganado',
			'cattle-sex': 'Sexo',
			'cattle-status-list': ['Activo', 'Muerto', 'Vendido'],
			'cattle-sex-list': ['Hembra', 'Macho', 'Free martin'],
			'search': 'Buscar',
			'filter': 'Filtrar',
			'add': 'Agregar',
			'edit': 'Editar',
			'measures':'Medidas',
			'description': 'Descripción',
			'anotations': 'Anotaciones',
			'historial-type': "Tipo de registro",
			'historial-type-list': [
				"Calor",
				"Servicio",
				"Parto", 
				"Enfermedad",
				"Muerte"
			],
			'historial-type-list-f': [
				["0", "Calor"],
				["1", "Servicio"],
				["2", "Parto"],
				["3", "Enfermedad"],
				["4", "Muerte"]
			],
			'historial-type-list-m': [
				["3", "Enfermedad"],
				["4", "Muerte"]
			],
			'diagnostic' : 'Dignóstico',
			'treatment':'Tratamiento',
			'recycle': 'Papelera',
			'recycle-restore': 'Restaurar',
			'recycle-delete': 'Vaciar',
			'recycle-confirm-empty': '¿Seguro que desea vaciar la papelera?',
			'cloud-storage': 'Almacenamiento en la nube',
			'cloud-synchronize': 'Respaldar',
			'cloud-copy': 'Obtener copia',
			'database':'Base de datos',
			'interface':'Interfaz',
			'register-date': 'Fecha de registro',
			'historial': 'Historial',
			'historial-details': 'Detalles del registro',
			'historial-filter': "Filtrar historial",
			'historial-date-filter': "Filtrar por fecha de registro",
			'historial-medic':'Mostrar historial médico',
			'historial-reproductive':'Mostrar historial reproductivo',
			'months-short': [
				"Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
			],
			'month': 'Mes',
			'months':'Meses',
			'year': 'Año',
			'years' : 'Años',
			'parameters': "Párametros",
			'cattle-birth': 'Nacimiento',
			'cattle-weaning': 'Destete',
			'cattle-anual': 'Anual',
			'cattle-filter': 'Filtrado de ganado',
			'cattle-filter-weight': 'Filtrado por peso',
			'cattle-birth-weight': 'Peso al nacer',
			'cattle-child':'Crías',
			'cattle-birth-date': 'Fecha de nacimiento',
			'cattle-birth-type': 'Tipo de nacimiento',
			'cattle-delivery-type': 'Tipo de parto',
			'cattle-delivery-type-list': [
				"Sin dificultad", 
				"Leve dificultad", 
				"Mayor dificultad", 
				"Cesárea", 
				"Presentación anormal",
				"Muerte al parto", 
				"Aborto prematuro"
			],
			'cattle-birth-type-list': [
				"Sencillo", 
				"Gemelo macho", 
				"Gemela hembra", 
				"Triates", 
				"Gemelos de diferentes sexos"
			],
			'cattle-death-type-list': [
				"Natural",
				"Enfermedad",
				"Destastre natural",
				"Por depredador"
			],
			'cattle-weaning-weight': 'Peso al destete',
			'cattle-weaning-date': 'Fecha de peso al destete',
			'cattle-anual-weight': 'Peso al año',
			'cattle-anual-date': 'Fecha de peso al año',
			'cattle-service-date': 'Fecha del servicio',
			'cattle-service-type': 'Tipo de servicio',
			'cattle-service': 'Servicio',
			'cattle-service-success': 'Servicio exitoso',
			'cattle-service-type-list': [
				"Monta natural", 
				"Inseminación artificial", 
				"Transferencia de embrión"
			],
			'others': 'Otros',
			'age': 'Edad (años)',
			'cattle-status': 'Estado',
			'cattle-body-size': 'Talla corporal',
			'registers': 'Lista de ganado', 
			'save': 'Guardar',
			'name': 'Nombre',
			'father': 'Padre',
			'mother': 'Madre',
			'cattle-tattoo': 'Tatuaje',
			'cattle-tattoo-location': 'Localización del tatuaje',
			'cattle-tattoo-location-list':  [
				"Anca o pierna izquierda", 
				"Anca o pierna derecha", 
				"Costilla Izquierda", 
				"Costilla Derecha", 
				"Paleta u hombro izquierdo", 
				"Paleta u hombro derecho", 
				"Oreja Izquerda", 
				"Oreja derecha"
			],
			'cattle-snout-color': 'Color de morro',
			'cattle-snout-color-list': [
				"Gris claro", 
				"Negro", 
				"Rosado", 
				"Sepia", 
				"Rosado con manchas color sepia", 
				"Con manchas y lunares", 
				"No disponible"
			],
			'cattle-horns': 'Cuernos',
			'cattle-horns-list': [
				"Sin cuernos (mélon de nacimiento)", 
				"Con cuernos", 
				"Cuernos falsos (Cuerno suelto)"
			],
			'cattle-genetic-grade': 'Grado genético',
			'cattle-genetic-grade-list': [
				"Simmental Puro", 
				"Simmental Pura Sangre", 
				"Simmental 3/8 cebú, Simbrah Puro", 
				"3/4 Simmental 1/4 Cebú, Simbrah Fundación", 
				"1/2 Simmental 1/2 Cebú, Simbrah Fundación",
				"1/4 Simmental 3/4 Cebú, Simbrah Fundación", 
				"3/8 Simmental 5/8 Cebú, Simbrah Fundación",
				"Simmental 7/8", 
				"Simmental 3/4",
				"Simmental 1/2"
			],
			'cattle-skin-color': 'Color de capa',
			'cattle-skin-color-list': [
				"Rojo", 
				"Amarillo claro o paja", 
				"Amarillo oscuro", 
				"Pinto", 
				"Hosco claro", 
				"Hosco oscuro", 
				"Gris, etc."
			],
			'cattle-eye-color-left': 'pigmentación ojo izquierdo',
			'cattle-eye-color-right': 'pigmentación ojo derecho',
			'cattle-eye-color-list': [
				"Total pigmentación", 
				"1/4 de ojo pigmentado", 
				"1/2 de ojo pigmentado", 
				"3/4 de ojo pigmentado", 
				"Ausencia de pigmento, blanco"
			],
			'cattle-weaning-manage': 'Manejo al destete',
			'cattle-weaning-manage-list': [
				"Madre natural con becerro", 
				"Madre natural más creep feeding", 
				"Madre con gemelos", 
				"Madre restringida o becerro cubeteado", 
				"Madre nodriza", 
				"En ordeña"
			],
			'cattle-weaning-group': 'Grupo al destete',
			'cattle-anual-group': 'Grupo al año',
			'cattle-anual-manage': 'Manejo al año',
			'cattle-anual-manage-list': [
				"Solo pastoreo", 
				"Pastoreo más suplemento", 
				"Concentrado"
			],
			'cattle-scrotal-date': 'Fecha circunf. escrotal',
			'cattle-scrotal-circumference': 'Circunf. escrotal',
			'cattle-pelvimetry-date':'Fecha pelvimetría',
			'cattle-pelvimetry-horizontal': 'Pelvimetría horizontal',
			'cattle-pelvimetry-vertical': 'Pelvimetría vertical',
			'cattle-body-size-date': 'Fecha talla corporal',

		},

		en : {
			'language-list': [
				{name:'es', value: 'Spanish'},
				{name: 'en', value: 'English'}
			],
			'login': 'Login',
			'home': 'Home',
			'cattle': 'Cattle',
			'settings': 'Settings',
			'db-init':'Initializing database... please wait',
			'db-list':'Fetching data registers...',
			'db-error': 'Database error',
			'db-error-list': 'Error fetching registers',
			'db-error-save': 'Error saving register',
			'ok': 'Ok',
			'cancel': 'Cancelar',
			'account': 'Account',
			'password': 'Password',
			'enter': 'Log-in',
			'mode-offline': 'Offline mode',
			'cattle-list': 'Cattle list',
			'cattle-sex': 'Sexo',
			'cattle-status-list': ['Active', 'Dead', 'Sold'],
			'cattle-status': 'Status',
			'cattle-sex-list': ['Female', 'Male', 'Free martin'],
			'search': 'Search',
			'filter': 'Filter',
			'add': 'Add',
			'language':'Language',
			'cattle-filter': 'Cattle filter',
			'cattle-filter-weight': 'Weight filter',
			'cattle-birth-weight': 'Birth weight',
			'cattle-birth-date': 'Birth date',
			'cattle-birth-type': 'Birth type',
			'cattle-delivery-type': 'Delivery type',
			'cattle-weaning-weight': 'Weaning weight (kgs)',
			'cattle-anual-weight': 'Weight at first year(kg)',
			'cattle-service-date': 'Service date',
			'age': 'Age (years)',
			'cattles-status': 'Status',
			'cattle-corporal-weight': 'Body size (cm)',
			'registers': 'Cattle list',
			'save': 'Save',
			'name': 'Name',
			'father': 'Father',
			'mother': 'Madre',
			'cattle-tattoo': 'Tattoo',
			'cattle-tattoo-location': 'Tattoo location',
			'cattle-snout-color': 'Snout color',
			'cattle-horns': 'Horns',
			'cattle-horns-list': ["No horns", "With horns", "False horns"],
			'cattle-genetic-grade': 'Genetic grade',
			'cattle-skin-color': 'Fur color',
			'cattle-eye-color-left': 'Left eye color',
			'cattle-eye-color-right': 'Right eye color',
			'cattle-weaning-date': 'Weaning weight date',
			'cattle-weaning-manage': 'Weaning manage',
			'cattle-weaning-group': 'Weaning group',
			'cattle-anual-manage': 'Anual manage',
			'cattle-anual-date': 'Anual weight date',
			'cattle-anual-group': 'Anual group',
			'castle-scrotal-date': 'Scrotal circumference date',
			'castle-scrotal-circumference': 'Scrotal circumference',
			'cattle-pelvimetry-horizontal': 'Horizontal pelvimetry',
			'cattle-pelvimetry-vertical': 'Vertical pelvimetry',
			'cattle-body-size-date': 'Body size date',
			'cattle-birth': 'Birth',
			'cattle-weaning': 'Weaning',
			'cattle-anual': 'Anual',
		}
	};
	private langKey:string;
	private defaultKey: string;
	constructor(){
		this.langKey = this.defaultKey = 'es';
	}

	setLang(lang: string){
		if (this.i18n[lang]){
			this.langKey = lang;
		}
	}

	getLang():string{
		return this.langKey;
	}

	

	get(key){
		let lang = this.i18n[this.langKey];
		let def = this.i18n[this.defaultKey];

		if (lang[key])
			return lang[key];
		else if (def[key]){
			return def[key];
		}
		else{
			return 'not in language list:' + key;
		}
	}
}