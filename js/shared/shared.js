/**
 * shared.js
 * Funciones de utilidad compartidas para toda la aplicación.
 */
const modalElement = document.getElementById('modalConfirmation');
const modalConfirmation = new bootstrap.Modal( modalElement );

/**
 * Muestra un modal de confirmación genérico.
 * @param {String} message - El mensaje a mostrar al usuario.
 * @returns {Promise<Boolean>} Resuelve true si el usuario confirma, false si cancela.
 */

function confirmation( message ){

    const labelMessage = document.getElementById( "label_message_confirmation" )
    labelMessage.textContent = message;

    modalConfirmation.show();
    return new Promise( ( resolve, reject ) => {

        let resolved = false;

        // resoler unico
        const safeResolve = ( value ) => {
            if ( resolved ) return;
            resolved = true;
            cleanup();
            resolve( value );
        };

        const btnOk = document.getElementById( "btn_ok" );
        const btnCancel = document.getElementById( "btn_cancel" );

        // manejo de ok
        const handleOk = () => {
            modalConfirmation.hide();
            safeResolve( true );
        };

        // manejo del cancel
        const handleCancel = () => {
            modalConfirmation.hide();
            safeResolve( false );
        };

        // manejo cierre externo
        const handleHidden = () => {
            safeResolve( false );
        };

        // limpieza de los listener y los handlers
        const cleanup = () => {
            btnOk.removeEventListener( "click", handleOk );
            btnCancel.removeEventListener( "click", handleCancel );
            modalElement.removeEventListener( "hidden.bs.modal", handleHidden );
        };

        btnOk.addEventListener( "click", handleOk, { once: true } );
        btnCancel.addEventListener( "click", handleCancel, { once: true } );

        // manejar cierre externo
        modalElement.addEventListener( "hidden.bs.modal", handleHidden );
    })
}