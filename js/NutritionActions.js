/**
 * NutritionActions.js
 * Capa de Lógica de Negocio y Persistencia (Local Storage)
 */

const STORAGE_KEYS = {
    FOODS: 'nutritrack_foods',
    LOGS: 'nutritrack_logs'
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
        localStorage.setItem( STORAGE_KEYS.FOODS, JSON.stringify( foods ) );
        return { code: 0, message: "Alimento guardado con éxito" };
    } catch( error ) {
        return { code: 1, message: "Error al guardar en el almacenamiento" };
    }
}

/**
 * Obtiene la lista de alimentos registrados desde el almacenamiento local.
 * @returns {Array} Lista de objetos de alimentos.
 */
function getFoods() {
    const data = localStorage.getItem( STORAGE_KEYS.FOODS );
    return data ? JSON.parse( data ) : [];
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
 * Guarda un registro de comida completada (grupo de alimentos) en el almacenamiento local.
 * @param {Object} meal - El objeto comida que contiene el nombre y los elementos.
 * @returns {Object} Objeto de resultado con código de estado y mensaje.
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

        localStorage.setItem( STORAGE_KEYS.LOGS, JSON.stringify( logs ) );
        return { code: 0, message: "Comida registrada con éxito" };
    } catch( error ) {
        return { code: 1, message: "Error al registrar la comida" };
    }
}

/**
 * Calcula los macros totales y las calorías para una lista de elementos en una comida.
 * @param {Array} items - Lista de alimentos con sus macros calculados.
 * @returns {Object} Objeto con el total de proteínas, carbohidratos, grasas y kcal.
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
 * Obtiene los registros de comidas diarias desde el almacenamiento local.
 * @returns {Array} Lista de objetos de registros de comidas.
 */
function getMealLogs() {
    const data = localStorage.getItem( STORAGE_KEYS.LOGS );
    return data ? JSON.parse( data ) : [];
}

/**
 * Calcula los macros basados en el peso (proporción para 100g).
 * Utiliza el campo kcal específico proporcionado en los datos del alimento.
 * @param {Object} food - El objeto alimento con valores base para 100g.
 * @param {Number} weight - El peso en gramos consumido.
 * @returns {Object} Macros y kcal calculados para el peso específico.
 */
function calculateMacros( food, weight ) {
    const factor = weight / 100;
    const protein = parseFloat( ( food.protein * factor ).toFixed( 1 ) );
    const carbs = parseFloat( ( food.carbs * factor ).toFixed( 1 ) );
    const fats = parseFloat( ( food.fats * factor ).toFixed( 1 ) );
    
    // Usando el campo kcal del alimento o 0 si no existe
    const baseKcal = food.kcal || 0;
    const kcal = parseFloat( ( baseKcal * factor ).toFixed( 1 ) );

    return { protein, carbs, fats, kcal };
}

/**
 * Calcula los valores nutricionales totales diarios de todos los registros.
 * @returns {Object} Objeto con los valores totales diarios.
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
 * Limpia los datos de los registros de comidas diarias del almacenamiento.
 */
function clearLogs() {
    localStorage.removeItem( STORAGE_KEYS.LOGS );
}