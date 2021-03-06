import angular from 'angular';
import isNil from 'lodash/isNil';

import loaderHtml from './boton-async.html';
import './boton-async.scss';

/**
 * Contiene la directiva <boton-async>, que al añadirla a un <button> muestra una animación mientras se está haciendo
 * un request al API.
 * @typedef {Object} Componentes.boton-async
 * @example
 * <button class="btn btn-success" type="submit" boton-async>Editar</button>
 */
export default angular.module('boton-async', [])
    .directive('botonAsync', ($rootScope) => {
        return {
            restrict: 'A',
            link: (scope, element, attrs) => {
                let contenidoBoton, progreso;
                element.bind('click', function() {
                    //Cambiar contenido del boton para simular animacion
                    progreso = true;
                    contenidoBoton  = element.html();
                    element.html(loaderHtml);
                });
                //Restablecer el contenido del boton y habilitar el mismo
                const reiniciarEstado = () => {
                    if(progreso) {
                        element.html(contenidoBoton);
                        progreso = false;
                    }
                    element.prop('disabled', false);
                };
                const listenerRequest = $rootScope.$on('GestionAutorizacionAPI:request', (event, method) => {
                    if (!isNil(method) && method !== 'GET') {
                        element.prop('disabled', true);

                    }
                });
                const listenerResponse = $rootScope.$on('GestionAutorizacionAPI:response', (event, method) => {
                    if (method !== 'GET') {
                        reiniciarEstado();
                    }
                });
                const listenerResponseError = $rootScope.$on('GestionAutorizacionAPI:responseError', () => {
                    reiniciarEstado();
                });
                scope.$on('$destroy', () => {
                    listenerRequest();
                    listenerResponse();
                    listenerResponseError();
                });
            }
        };
    });