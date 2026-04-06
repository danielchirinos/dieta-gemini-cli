/**
 * NutritionActions.js
 * Capa de Lógica de Negocio y Persistencia (Local Storage)
 */

const STORAGE_KEYS = {
    FOODS: 'nutritrack_foods',
    LOGS: 'nutritrack_logs'
};

/**
 * Guarda un alimento en el storage
 * @param {Object} food 
 */
function saveFood( food ) {
    if( !validateFood( food ) ) return { code: 1, message: "Datos de alimento inválidos" };

    try {
        const foods = getFoods();
        foods.push( {
            id: Date.now(),
            ...food
        } );
        localStorage.setItem( STORAGE_KEYS.FOODS, JSON.stringify( foods ) );
        return { code: 0, message: "Alimento guardado con éxito" };
    } catch( e ) {
        return { code: 1, message: "Error al guardar en storage" };
    }
}

/**
 * Obtiene la lista de alimentos registrados
 * @returns {Array}
 */
function getFoods() {
    const data = localStorage.getItem( STORAGE_KEYS.FOODS );
    return data ? JSON.parse( data ) : [];
}

/**
 * Valida los campos de un alimento
 * @param {Object} food 
 * @returns {Boolean}
 */
function validateFood( food ) {
    return food.name && food.protein >= 0 && food.carbs >= 0 && food.fats >= 0;
}

/**
 * Registra una comida completa (grupo de alimentos)
 * @param {Object} meal 
 */
function saveMealLog( meal ) {
    if( !meal.name || meal.items.length === 0 ) return { code: 1, message: "La comida debe tener nombre y al menos un alimento" };

    try {
        const logs = getMealLogs();
        const mealTotalMacros = calculateMealTotalMacros( meal.items );
        
        logs.push( {
            id: Date.now(),
            name: meal.name,
            items: meal.items,
            ...mealTotalMacros
        } );

        localStorage.setItem( STORAGE_KEYS.LOGS, JSON.stringify( logs ) );
        return { code: 0, message: "Comida registrada con éxito" };
    } catch( e ) {
        return { code: 1, message: "Error al registrar la comida" };
    }
}

/**
 * Calcula los totales de una lista de items seleccionados para una comida
 * @param {Array} items 
 */
function calculateMealTotalMacros( items ) {
    return items.reduce( ( acc, curr ) => {
        acc.protein += curr.protein;
        acc.carbs += curr.carbs;
        acc.fats += curr.fats;
        acc.kcal += curr.kcal;
        return acc;
    }, { protein: 0, carbs: 0, fats: 0, kcal: 0 } );
}

/**
 * Obtiene los logs (comidas) del día
 * @returns {Array}
 */
function getMealLogs() {
    const data = localStorage.getItem( STORAGE_KEYS.LOGS );
    return data ? JSON.parse( data ) : [];
}

/**
 * Calcula macros basados en el peso (regla de 3 para 100g)
 * @param {Object} food 
 * @param {Number} weight 
 */
function calculateMacros( food, weight ) {
    const factor = weight / 100;
    const protein = parseFloat( ( food.protein * factor ).toFixed( 1 ) );
    const carbs = parseFloat( ( food.carbs * factor ).toFixed( 1 ) );
    const fats = parseFloat( ( food.fats * factor ).toFixed( 1 ) );
    const kcal = Math.round( ( protein * 4 ) + ( carbs * 4 ) + ( fats * 9 ) );

    return { protein, carbs, fats, kcal };
}

/**
 * Calcula los totales globales del día
 */
function calculateDailyTotals() {
    const logs = getMealLogs();
    return logs.reduce( ( acc, curr ) => {
        acc.protein += curr.protein;
        acc.carbs += curr.carbs;
        acc.fats += curr.fats;
        acc.kcal += curr.kcal;
        return acc;
    }, { protein: 0, carbs: 0, fats: 0, kcal: 0 } );
}

/**
 * Limpia los datos del día
 */
function clearLogs() {
    localStorage.removeItem( STORAGE_KEYS.LOGS );
}