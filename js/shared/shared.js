const modalConfirmation = document.getElementById( 'modalConfirmation' )

function confirmation( message ){

    const labelMessage = document.getElementById( "label_message_confirmation" )
    labelMessage.innerHTM = message

    modalConfirmation.show()
    return new Promise( ( resolve, reject ) => {
        $("#btn_ok").one("click", () => {
            modalConfirmation.hide()
            resolve( true );
        });

        $("#btn_cancel").one("click", () => {
            modalConfirmation.hide()
            resolve( false );
        }); 
    })
}