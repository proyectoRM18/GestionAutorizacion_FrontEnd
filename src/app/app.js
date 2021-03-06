import angular from 'angular';
import ngRoute from 'angular-route';
import ngAnimate from 'angular-animate';
import ngMessages from 'angular-messages';
import toastr from 'angular-toastr';
import collapse from 'ui-bootstrap4/src/collapse';
import dropdown from 'ui-bootstrap4/src/dropdown';
import assign from'lodash/assign';
import 'whatwg-fetch';
import 'promise-polyfill/src/polyfill';

import apiInterceptor from './common/api-interceptor';
import personalModule from './common/personal';
import permisosAdminModule from './permisos-admin';
import mantenimientosMaestrosModule from './mantenimientos-maestros';
import centralAutorizacionesModule from './central-autorizaciones';
import homeModule from './home';

import '../style/app.scss';

/* @ngInject */
/**
 * Esta clase representa un controlador de Angular usado en el div que contiene la aplicación.
 */
class AppCtrl {

    /**
     * @param $rootScope
     * @param {SesionService} SesionService
     **/
    constructor($rootScope, SesionService) {
        /** @type {boolean} */
        this.menuColapsado = true;
        /** @type {boolean} */
        this.DEBUG_MODE = DEBUG_MODE;
        /** @type {boolean} */
        this.mostrarLoadingGlobal = true;
        const eliminarListener = $rootScope.$on('GestionAutorizacion:sesionObtenida', () => {
            this.mostrarLoadingGlobal = false;

            SesionService.obtenerUsuarioAutenticado()
                .then(usuario => {
                    /** @type {Persona} */
                    this.usuario = usuario;
                });

            eliminarListener();
        });
    }
}

const MODULE_NAME = 'app';
let RESPUESTA_CONF = {};

angular.module(MODULE_NAME, [
    ngRoute,
    ngAnimate,
    ngMessages,
    toastr,
    collapse,
    dropdown,

    personalModule.name,
    permisosAdminModule.name,
    mantenimientosMaestrosModule.name,
    homeModule.name,
    centralAutorizacionesModule.name
])
    .controller('AppCtrl', AppCtrl)
    .constant('AppConfig', {})
    .config(($httpProvider, $sceProvider, $locationProvider, $routeProvider, $compileProvider, toastrConfig, AppConfig) => {
        assign(AppConfig, RESPUESTA_CONF);

        // Para mejorar el rendimiento:
        if (!DEBUG_MODE) {
            $compileProvider.debugInfoEnabled(false);
        }
        $compileProvider.commentDirectivesEnabled(false);
        $compileProvider.cssClassDirectivesEnabled(false);

        $httpProvider.interceptors.push(apiInterceptor);
        if (!DEBUG_MODE) {
            $httpProvider.defaults.withCredentials = true;
        }

        $sceProvider.enabled(false);

        //Configuración de las alertas de la aplicación
        angular.extend(toastrConfig, {
            preventOpenDuplicates: true
        });

        $locationProvider.hashPrefix('');
        // Configuración de las rutas de la aplicación:
        $routeProvider
            .when('/', {
                template: require('./home/home.html'),
                controller: 'HomeController',
                controllerAs: 'vm'
            })
            .when('/admins', {
                template: require('./permisos-admin/permisos-admin.html'),
                controller: 'PermisosAdminController',
                controllerAs: 'vm'
            })
            .when('/actividades', {
                template: require('./mantenimientos-maestros/actividades/actividades.html'),
                controller: 'ActividadesController',
                controllerAs: 'vm'
            })
            .when('/aplicaciones', {
                template: require('./mantenimientos-maestros/aplicaciones/aplicaciones.html'),
                controller: 'AplicacionesController',
                controllerAs: 'vm'
            })
            .when('/etiquetas', {
                template: require('./mantenimientos-maestros/etiquetas/etiquetas.html'),
                controller: 'EtiquetasController',
                controllerAs: 'vm'
            })
            .when('/procesos', {
                template: require('./mantenimientos-maestros/procesos/procesos.html'),
                controller: 'ProcesosController',
                controllerAs: 'vm'
            })
            .when('/roles', {
                template: require('./mantenimientos-maestros/roles/roles.html'),
                controller: 'RolesController',
                controllerAs: 'vm'
            })
            .when('/notificaciones', {
                template: require('./mantenimientos-maestros/notificaciones/notificaciones.html'),
                controller: 'NotificacionesController',
                controllerAs: 'vm',
                resolve: {
                    esGeneral: () => { return true; },
                    titulo: () => { return 'Notificaciones Generales'; }
                }
            })
            .when('/notificaciones-especificas', {
                template: require('./mantenimientos-maestros/notificaciones/notificaciones.html'),
                controller: 'NotificacionesController',
                controllerAs: 'vm',
                resolve: {
                    esGeneral: () => { return false; },
                    titulo: () => { return 'Notificaciones Autorizaciones'; }
                }
            })
            .when('/central-autorizaciones', {
                template: require('./central-autorizaciones/peticiones/peticiones.html'),
                controller: 'PeticionesController',
                controllerAs: 'vm',
                resolve: {
                    autorizador: () => { return true; }
                }
            })
            .when('/mis-solicitudes', {
                template: require('./central-autorizaciones/peticiones/peticiones.html'),
                controller: 'PeticionesController',
                controllerAs: 'vm',
                resolve: {
                    autorizador: () => { return false; }
                }
            })
            .when('/peticion/:id', {
                template: require('./central-autorizaciones/detalles-peticion/detalles-peticion.html'),
                controller: 'DetallesPeticionController',
                controllerAs: 'vm'
            })
            .when('/acceso-denegado', {
                template: require('./401.html')
            })
            .when('/no-encontrado', {
                template: require('./404.html')
            })
            .otherwise({ redirectTo: '/no-encontrado' });
    })
    .run(($rootScope, SesionService) => {
        // Con esto se garantiza que el primer request que haga el app sea al endpoint de la sesión
        $rootScope.$emit('GestionAutorizacion:obteniendoSesion');
        SesionService.obtenerUsuarioAutenticado()
            .finally(() => {
                $rootScope.$emit('GestionAutorizacion:sesionObtenida');
            });
    });


// Levanta a mano el app después de cargar la configuración
window.fetch('app.conf.json')
    .then(response => {
        return response.json();
    })
    .then(confJSON => {
        RESPUESTA_CONF = confJSON;
        angular.bootstrap(document.getElementById('app'), [MODULE_NAME], { strictDi: true });
    })
    .catch(() => {
        angular.bootstrap(document.getElementById('app'), [MODULE_NAME], { strictDi: true });
    });


export default MODULE_NAME;