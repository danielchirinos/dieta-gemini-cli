/**
 * NutritionController.js
 * Capa de Controlador: Gestión de navegación y eventos de la interfaz de usuario
 */

let currentMealDraft = [];

document.addEventListener( 'DOMContentLoaded', () => {
    init();
} );

/**
 * Inicializa la aplicación, vincula eventos y renderiza la interfaz inicial.
 */
function init() {
    // Referencias a elementos del DOM (Los IDs de HTML son snake_case según GEMINI.md)
    const foodForm = document.getElementById( 'food_form' );
    const mealForm = document.getElementById( 'meal_form' );
    const btnClearData = document.getElementById( 'btn_clear_data' );
    const navLinks = document.querySelectorAll( '.sidebar .nav-link' );
    
    // Elementos de la interfaz de la sección de Alimentos
    const btnShowFoodForm = document.getElementById( 'btn_show_food_form' );
    const btnCancelFood = document.getElementById( 'btn_cancel_food' );
    const containerFoodForm = document.getElementById( 'container_food_form' );

    // Elementos de la interfaz de la sección de Comidas
    const btnShowMealForm = document.getElementById( 'btn_show_meal_form' );
    const btnCancelMeal = document.getElementById( 'btn_cancel_meal' );
    const containerMealForm = document.getElementById( 'container_meal_form' );
    const btnAddItem = document.getElementById( 'btn_add_item_to_meal' );

    // Renderizado inicial de la interfaz
    renderFoodDropdown();
    renderDailyReport();
    renderFoodListTable();
    renderMealsListTable();

    // --- Lógica de Navegación ---
    navLinks.forEach( link => {
        link.addEventListener( 'click', ( event ) => {
            event.preventDefault();
            navLinks.forEach( item => item.classList.remove( 'active' ) );
            link.classList.add( 'active' );

            const targetSectionId = link.getAttribute( 'data-section' );
            document.querySelectorAll( '.app-section' ).forEach( section => {
                section.classList.add( 'd-none' );
            } );
            document.getElementById( targetSectionId ).classList.remove( 'd-none' );
        } );
    } );

    // --- Alternancia de la interfaz de Alimentos ---
    btnShowFoodForm.addEventListener( 'click', () => {
        containerFoodForm.classList.remove( 'd-none' );
        btnShowFoodForm.classList.add( 'd-none' );
    } );

    btnCancelFood.addEventListener( 'click', () => {
        containerFoodForm.classList.add( 'd-none' );
        btnShowFoodForm.classList.remove( 'd-none' );
        foodForm.reset();
    } );

    // --- Alternancia de la interfaz de Comidas ---
    btnShowMealForm.addEventListener( 'click', () => {
        containerMealForm.classList.remove( 'd-none' );
        btnShowMealForm.classList.add( 'd-none' );
        currentMealDraft = [];
        renderDraftItems();
    } );

    btnCancelMeal.addEventListener( 'click', () => {
        containerMealForm.classList.add( 'd-none' );
        btnShowMealForm.classList.remove( 'd-none' );
        mealForm.reset();
        currentMealDraft = [];
    } );

    /**
     * Añade un alimento con un peso específico al borrador de la comida actual.
     */
    btnAddItem.addEventListener( 'click', () => {
        const selectFood = document.getElementById( 'select_food' );
        const weightInput = document.getElementById( 'weight_grams' );
        
        const foodId = selectFood.value;
        const weight = parseFloat( weightInput.value );

        if( !foodId || isNaN( weight ) ) {
            return alert( "Por favor, seleccione un alimento y un peso válidos" );
        }

        const food = getFoods().find( item => item.id == foodId );
        if( food ) {
            const calculatedMacros = calculateMacros( food, weight );
            currentMealDraft.push( {
                foodName: food.name,
                weight: weight,
                ...calculatedMacros
            } );
            
            renderDraftItems();
            weightInput.value = '';
            selectFood.value = '';
        }
    } );

    // --- Envíos de Formulario ---
    foodForm.addEventListener( 'submit', ( event ) => {
        event.preventDefault();
        const formData = new FormData( foodForm );
        const food = {
            name: formData.get( 'food_name' ),
            protein: parseFloat( formData.get( 'protein_100' ) ),
            carbs: parseFloat( formData.get( 'carbs_100' ) ),
            fats: parseFloat( formData.get ( 'fats_100' ) ),
            kcal: parseFloat( formData.get ( 'kcal_100' ) )
        };

        const result = saveFood( food );
        if( result.code === 0 ) {
            foodForm.reset();
            containerFoodForm.classList.add( 'd-none' );
            btnShowFoodForm.classList.remove( 'd-none' );
            renderFoodDropdown();
            renderFoodListTable();
        } else {
            alert( result.message );
        }
    } );

    mealForm.addEventListener( 'submit', ( event ) => {
        event.preventDefault();
        const mealNameInput = document.getElementById( 'meal_name' );
        
        const meal = {
            name: mealNameInput.value,
            items: currentMealDraft
        };

        const result = saveMealLog( meal );
        if( result.code === 0 ) {
            mealForm.reset();
            containerMealForm.classList.add( 'd-none' );
            btnShowMealForm.classList.remove( 'd-none' );
            currentMealDraft = [];
            renderDailyReport();
            renderMealsListTable();
        } else {
            alert( result.message );
        }
    } );

    /**
     * Limpia todos los registros del día actual.
     */
    btnClearData.addEventListener( 'click', () => {
        if( confirm( "¿Está seguro de que desea borrar todos los datos de hoy?" ) ) {
            clearLogs();
            renderDailyReport();
            renderMealsListTable();
        }
    } );
}

/**
 * Renderiza los elementos temporales añadidos a la comida que se está configurando actualmente.
 */
function renderDraftItems() {
    const list = document.getElementById( 'current_meal_items' );
    if( currentMealDraft.length === 0 ) {
        list.innerHTML = '<li class="list-group-item bg-transparent text-center text-muted small italic">Añada alimentos a esta comida</li>';
        return;
    }

    list.innerHTML = currentMealDraft.map( ( item, index ) => `
        <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center border-0 border-bottom">
            <div>
                <span class="fw-bold">${item.foodName}</span> 
                <small class="text-muted ms-2">${item.weight}g (${item.kcal} kcal)</small>
            </div>
            <button class="btn btn-sm text-danger border-0" onclick="removeDraftItem(${index})">
                <i class="bi bi-x-circle"></i>
            </button>
        </li>
    ` ).join( '' );
}

/**
 * Elimina un elemento del borrador de la comida actual.
 * Vinculado al objeto window para acceso desde la plantilla HTML.
 * @param {Number} index - El índice del elemento a eliminar.
 */
window.removeDraftItem = ( index ) => {
    currentMealDraft.splice( index, 1 );
    renderDraftItems();
};

/**
 * Renderiza la lista de comidas registradas en la tabla de la sección de Comidas.
 */
function renderMealsListTable() {
    const tableBody = document.getElementById( 'meals_list_table' );
    const logs = getMealLogs();

    tableBody.innerHTML = logs.length > 0
        ? logs.map( meal => `
            <tr>
                <td class="fw-bold">${meal.name}</td>
                <td><small class="text-muted">${meal.items.map( item => item.foodName ).join( ', ' )}</small></td>
                <td class="text-primary fw-medium">${meal.protein.toFixed( 1 )}g</td>
                <td class="text-success fw-medium">${meal.carbs.toFixed( 1 )}g</td>
                <td class="text-warning fw-medium">${meal.fats.toFixed( 1 )}g</td>
                <td class="fw-bold">${meal.kcal.toFixed( 1 )}</td>
            </tr>
        ` ).join( '' )
        : '<tr><td colspan="6" class="text-center py-4 text-muted small italic">No hay comidas registradas</td></tr>';
}

/**
 * Renderiza la tabla de la base de datos de alimentos registrados.
 */
function renderFoodListTable() {
    const tableBody = document.getElementById( 'food_list_table' );
    const foods = getFoods();

    tableBody.innerHTML = foods.length > 0
        ? foods.map( food => `
            <tr>
                <td class="fw-medium">${food.name}</td>
                <td>${food.protein}g</td>
                <td>${food.carbs}g</td>
                <td>${food.fats}g</td>
                <td>${food.kcal || 0}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-secondary border-0" onclick="alert( 'Funcionalidad de editar/eliminar próximamente' )">
                        <i class="bi bi-three-dots"></i>
                    </button>
                </td>
            </tr>
        ` ).join( '' )
        : '<tr><td colspan="6" class="text-center py-4 text-muted italic small">No hay alimentos registrados</td></tr>';
}

/**
 * Actualiza el menú desplegable de selección de alimentos en el formulario de Comidas.
 */
function renderFoodDropdown() {
    const selectFood = document.getElementById( 'select_food' );
    const foods = getFoods();
    
    selectFood.innerHTML = '<option value="">Seleccionar...</option>';
    foods.forEach( food => {
        const option = document.createElement( 'option' );
        option.value = food.id;
        option.textContent = `${food.name} (P: ${food.protein} / C: ${food.carbs} / G: ${food.fats} / Kcal: ${food.kcal || 0})`;
        selectFood.appendChild( option );
    } );
}

/**
 * Actualiza el resumen de totales nutricionales en las secciones de Inicio y Comidas.
 */
function renderDailyReport() {
    const logs = getMealLogs();
    const totals = calculateDailyTotals();

    // Actualizar la tabla en Inicio (Todos los elementos de todas las comidas)
    const homeTableBody = document.getElementById( 'meal_log_table' );
    let allItems = [];
    logs.forEach( meal => allItems = allItems.concat( meal.items ) );

    homeTableBody.innerHTML = allItems.length > 0 
        ? allItems.map( item => `
            <tr>
                <td class="fw-medium">${item.foodName}</td>
                <td>${item.weight}g</td>
                <td class="text-primary">${item.protein}g</td>
                <td class="text-success">${item.carbs}g</td>
                <td class="text-warning">${item.fats}g</td>
                <td class="fw-bold">${item.kcal.toFixed( 1 )}</td>
            </tr>
        ` ).join( '' )
        : '<tr><td colspan="6" class="text-center py-4 text-muted small italic">No hay registros hoy</td></tr>';

    // Actualizar Totales en todos los elementos de resumen
    const elementsToUpdate = {
        calories: [ 'total_calories', 'total_calories_comidas' ],
        protein: [ 'total_protein', 'total_protein_comidas' ],
        carbs: [ 'total_carbs', 'total_carbs_comidas' ],
        fats: [ 'total_fats', 'total_fats_comidas' ]
    };

    elementsToUpdate.calories.forEach( id => document.getElementById( id ).textContent = totals.kcal.toFixed( 0 ) );
    elementsToUpdate.protein.forEach( id => document.getElementById( id ).textContent = totals.protein.toFixed( 1 ) + 'g' );
    elementsToUpdate.carbs.forEach( id => document.getElementById( id ).textContent = totals.carbs.toFixed( 1 ) + 'g' );
    elementsToUpdate.fats.forEach( id => document.getElementById( id ).textContent = totals.fats.toFixed( 1 ) + 'g' );
}