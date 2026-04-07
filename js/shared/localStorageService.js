/**
 * localStorageService.js
 * Servicio centralizado para la gestión del almacenamiento local.
 */

/**
 * Guarda un objeto o valor en localStorage convirtiéndolo a JSON.
 * @param {String} key - La clave bajo la cual se guardará el dato.
 * @param {any} value - El valor o objeto a guardar.
 */
function setStorageItem( key, value ) {
    try {
        const serializedValue = JSON.stringify( value );
        localStorage.setItem( key, serializedValue );
    } catch( error ) {
        console.error( "Error saving to localStorage", error );
    }
}

/**
 * Obtiene un valor de localStorage y lo deserializa de JSON.
 * @param {String} key - La clave del dato a obtener.
 * @returns {any|null} El valor deserializado o null si no existe.
 */
function getStorageItem( key ) {
    try {
        const data = localStorage.getItem( key );
        return data ? JSON.parse( data ) : null;
    } catch( error ) {
        console.error( "Error reading from localStorage", error );
        return null;
    }
}

/**
 * Elimina un elemento de localStorage.
 * @param {String} key - La clave del dato a eliminar.
 */
function removeStorageItem( key ) {
    try {
        localStorage.removeItem( key );
    } catch( error ) {
        console.error( "Error removing from localStorage", error );
    }
}

/**
 * Limpia todo el contenido de localStorage.
 */
function clearStorage() {
    try {
        localStorage.clear();
    } catch( error ) {
        console.error( "Error clearing localStorage", error );
    }
}