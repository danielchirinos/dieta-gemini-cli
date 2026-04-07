/**
 * NutritionActions.js
 * Capa de Lógica de Negocio y Persistencia (Local Storage)
 */

const STORAGE_KEYS = {
    FOODS: 'dietaappv2_foods',
    LOGS: 'dietaappv2_logs'
};

/**
 * Guarda un nuevo alimento en el almacenamiento local.
 * @param {Object} food - El objeto de alimento con datos nutricionales.
 * @returns {Object} Objeto de resultado con código de estado y mensaje.
 */
function saveFood( food ) {
    if( !validateFood( food ) ) {
        return { code: 1, message: "Datos de alimento inválidos" };
    }

    try {
        const foods = getFoods();
        foods.push( {
            id: Date.now(),
            ...food
        } );
        setStorageItem( STORAGE_KEYS.FOODS, foods );
        return { code: 0, message: "Alimento guardado con éxito" };
    } catch( error ) {
        return { code: 1, message: "Error al guardar en el almacenamiento" };
    }
}

/**
 * Actualiza un alimento existente en la base de datos.
 * @param {Number} id - Identificador del alimento.
 * @param {Object} updatedFood - Nuevos datos del alimento.
 * @returns {Object} Objeto de resultado con código de estado y mensaje.
 */
function updateFood( id, updatedFood ) {
    if( !validateFood( updatedFood ) ) {
        return { code: 1, message: "Datos de alimento inválidos" };
    }

    try {
        let foods = getFoods();
        const index = foods.findIndex( item => item.id == id );
        
        if( index === -1 ) return { code: 1, message: "Alimento no encontrado" };

        foods[index] = { ...foods[ index ], ...updatedFood };

        setStorageItem( STORAGE_KEYS.FOODS, foods );
        return { code: 0, message: "Alimento actualizado correctamente" };
    } catch( error ) {
        return { code: 1, message: "Error al actualizar el alimento" };
    }
}

/**
 * Obtiene la lista de alimentos registrados desde el almacenamiento local.
 * @returns {Array} Lista de objetos de alimentos.
 */
function getFoods() {
    const data = getStorageItem( STORAGE_KEYS.FOODS );
    return data ? data : [];
}

/**
 * Valida los campos del objeto alimento.
 * @param {Object} food - El objeto alimento a validar.
 * @returns {Boolean} True si es válido, false en caso contrario.
 */
function validateFood( food ) {
    return food.name && food.protein >= 0 && food.carbs >= 0 && food.fats >= 0 && food.kcal >= 0;
}

/**
 * Guarda un registro de comida completada en el almacenamiento local.
 * @param {Object} meal - El objeto comida.
 * @returns {Object} Objeto de resultado.
 */
function saveMealLog( meal ) {
    if( !meal.name || meal.items.length === 0 ) {
        return { code: 1, message: "La comida debe tener un nombre y al menos un alimento" };
    }

    try {
        const logs = getMealLogs();
        const mealTotalMacros = calculateMealTotalMacros( meal.items );
        
        logs.push( {
            id: Date.now(),
            name: meal.name,
            items: meal.items,
            ...mealTotalMacros
        } );

        setStorageItem( STORAGE_KEYS.LOGS, logs );
        return { code: 0, message: "Comida registrada con éxito" };
    } catch( error ) {
        return { code: 1, message: "Error al registrar la comida" };
    }
}

/**
 * Actualiza un registro de comida existente.
 * @param {Number} id - Identificador de la comida.
 * @param {Object} updatedData - Nuevos datos.
 * @returns {Object} Objeto de resultado.
 */
function updateMealLog( id, updatedData ) {
    try {
        let logs = getMealLogs();
        const index = logs.findIndex( log => log.id == id );
        
        if( index === -1 ) return { code: 1, message: "Registro no encontrado" };

        const mealTotalMacros = calculateMealTotalMacros( updatedData.items );
        
        logs[index] = {
            ...logs[index],
            name: updatedData.name,
            items: updatedData.items,
            ...mealTotalMacros
        };

        setStorageItem( STORAGE_KEYS.LOGS, logs );
        return { code: 0, message: "Comida actualizada correctamente" };
    } catch( error ) {
        return { code: 1, message: "Error al actualizar el registro" };
    }
}

/**
 * Elimina un registro de comida o alimento.
 * @param {Number} id - Identificador.
 * @param {String} type - Tipo ('food' o 'meal').
 */
function deleteEntry( id, type ) {
    try {
        const key = type === 'food' ? STORAGE_KEYS.FOODS : STORAGE_KEYS.LOGS;
        const currentData = type === 'food' ? getFoods() : getMealLogs();
        
        const newData = currentData.filter( item => item.id != id );
        setStorageItem( key, newData );
        
        return { code: 0, message: "Registro eliminado con éxito" };
    } catch( error ) {
        return { code: 1, message: "Error al eliminar el registro" };
    }
}

/**
 * Calcula macros totales para una lista de items.
 */
function calculateMealTotalMacros( items ) {
    return items.reduce( ( accumulator, current ) => {
        accumulator.protein += current.protein;
        accumulator.carbs += current.carbs;
        accumulator.fats += current.fats;
        accumulator.kcal += current.kcal;
        return accumulator;
    }, { protein: 0, carbs: 0, fats: 0, kcal: 0 } );
}

/**
 * Obtiene los registros de comidas diarias.
 * @returns {Array}
 */
function getMealLogs() {
    const data = getStorageItem( STORAGE_KEYS.LOGS );
    return data ? data : [];
}

/**
 * Calcula los macros basados en el peso.
 */
function calculateMacros( food, weight ) {
    const factor = weight / 100;
    const protein = parseFloat( ( food.protein * factor ).toFixed( 1 ) );
    const carbs = parseFloat( ( food.carbs * factor ).toFixed( 1 ) );
    const fats = parseFloat( ( food.fats * factor ).toFixed( 1 ) );
    const baseKcal = food.kcal || 0;
    const kcal = parseFloat( ( baseKcal * factor ).toFixed( 1 ) );

    return { protein, carbs, fats, kcal };
}

/**
 * Calcula totales diarios globales.
 */
function calculateDailyTotals() {
    const logs = getMealLogs();
    return logs.reduce( ( accumulator, current ) => {
        accumulator.protein += current.protein;
        accumulator.carbs += current.carbs;
        accumulator.fats += current.fats;
        accumulator.kcal += current.kcal;
        return accumulator;
    }, { protein: 0, carbs: 0, fats: 0, kcal: 0 } );
}

/**
 * Limpia los datos de los registros de comidas diarias.
 */
function clearLogs() {
    removeStorageItem( STORAGE_KEYS.LOGS );
}