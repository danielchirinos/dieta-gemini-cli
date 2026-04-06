/**
 * NutritionController.js
 * Capa de Controlador: Gestión de navegación y eventos de la interfaz de usuario
 */

let currentMealDraft = [];
let editingMealDraft = [];

document.addEventListener( 'DOMContentLoaded', () => {
    init();
} );

/**
 * Inicializa la aplicación, vincula eventos y renderiza la interfaz inicial.
 */
function init() {
    // Referencias a elementos del DOM
    const foodForm = document.getElementById( 'food_form' );
    const mealForm = document.getElementById( 'meal_form' );
    const btnClearData = document.getElementById( 'btn_clear_data' );
    const navLinks = document.querySelectorAll( '.sidebar .nav-link' );
    
    const btnShowFoodForm = document.getElementById( 'btn_show_food_form' );
    const btnCancelFood = document.getElementById( 'btn_cancel_food' );
    const containerFoodForm = document.getElementById( 'container_food_form' );

    const btnShowMealForm = document.getElementById( 'btn_show_meal_form' );
    const btnCancelMeal = document.getElementById( 'btn_cancel_meal' );
    const containerMealForm = document.getElementById( 'container_meal_form' );
    const btnAddItem = document.getElementById( 'btn_add_item_to_meal' );

    const btnConfirmDelete = document.getElementById( 'btn_confirm_delete' );
    const editFoodForm = document.getElementById( 'edit_food_form' );

    // Renderizado inicial
    renderFoodDropdown();
    renderDailyReport();
    renderFoodListTable();
    renderMealsListTable();

    // --- Navegación ---
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

    // --- Toggles UI ---
    btnShowFoodForm.addEventListener( 'click', () => {
        containerFoodForm.classList.remove( 'd-none' );
        btnShowFoodForm.classList.add( 'd-none' );
    } );

    btnCancelFood.addEventListener( 'click', () => {
        containerFoodForm.classList.add( 'd-none' );
        btnShowFoodForm.classList.remove( 'd-none' );
        foodForm.reset();
    } );

    btnShowMealForm.addEventListener( 'click', () => {
        containerMealForm.classList.remove( 'd-none' );
        btnShowMealForm.classList.add( 'd-none' );
        currentMealDraft = [];
        renderDraftItems( 'current_meal_items', currentMealDraft );
    } );

    btnCancelMeal.addEventListener( 'click', () => {
        containerMealForm.classList.add( 'd-none' );
        btnShowMealForm.classList.remove( 'd-none' );
        mealForm.reset();
        currentMealDraft = [];
    } );

    btnAddItem.addEventListener( 'click', () => {
        const selectFood = document.getElementById( 'select_food' );
        const weightInput = document.getElementById( 'weight_grams' );
        
        const foodId = selectFood.value;
        const weight = parseFloat( weightInput.value );

        if( !foodId || isNaN( weight ) ) {
            return showNotification( "Seleccione un alimento y un peso válidos", "warning" );
        }

        const food = getFoods().find( item => item.id == foodId );
        if( food ) {
            const calculatedMacros = calculateMacros( food, weight );
            currentMealDraft.push( {
                foodName: food.name,
                weight: weight,
                ...calculatedMacros
            } );
            
            renderDraftItems( 'current_meal_items', currentMealDraft );
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
            fats: parseFloat( formData.get( 'fats_100' ) ),
            kcal: parseFloat( formData.get( 'kcal_100' ) )
        };

        const result = saveFood( food );
        showNotification( result.message, result.code === 0 ? "success" : "danger" );
        
        if( result.code === 0 ) {
            foodForm.reset();
            containerFoodForm.classList.add( 'd-none' );
            btnShowFoodForm.classList.remove( 'd-none' );
            renderFoodDropdown();
            renderFoodListTable();
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
        showNotification( result.message, result.code === 0 ? "success" : "danger" );

        if( result.code === 0 ) {
            containerMealForm.classList.add( 'd-none' );
            btnShowMealForm.classList.remove( 'd-none' );
            currentMealDraft = [];
            renderDailyReport();
            renderMealsListTable();
        }
    } );

    editFoodForm.addEventListener( 'submit', ( event ) => {

        event.preventDefault();
        const id = document.getElementById( 'edit_food_id' ).value;
        const food = {
            name: document.getElementById( 'edit_food_name' ).value,
            protein: parseFloat( document.getElementById( 'edit_protein_100' ).value ),
            carbs: parseFloat( document.getElementById( 'edit_carbs_100' ).value ),
            fats: parseFloat( document.getElementById( 'edit_fats_100' ).value ),
            kcal: parseFloat( document.getElementById( 'edit_kcal_100' ).value )
        };

        const result = updateFood( id, food );
        showNotification( result.message, result.code === 0 ? "success" : "danger" );

        if( result.code === 0 ) {
            const modalEl = document.getElementById( 'modal_edit_food' );
            const modal = bootstrap.Modal.getInstance( modalEl );
            modal.hide();
            renderFoodListTable();
            renderFoodDropdown();
        }
    } );

    btnConfirmDelete.addEventListener( 'click', () => {
        const id = document.getElementById( 'delete_target_id' ).value;
        const type = document.getElementById( 'delete_target_type' ).value;
        
        const result = deleteEntry( id, type );
        showNotification( result.message, result.code === 0 ? "success" : "danger" );

        if( result.code === 0 ) {
            const modalEl = document.getElementById( 'modal_confirm_delete' );
            const modal = bootstrap.Modal.getInstance( modalEl );
            modal.hide();
            renderDailyReport();
            renderFoodListTable();
            renderMealsListTable();
            renderFoodDropdown();
        }
    } );

    btnClearData.addEventListener( 'click', () => {
        openDeleteModal( 0, 'day' );
    } );
}

/**
 * Muestra una notificación Toast de Bootstrap.
 * @param {String} message - El mensaje a mostrar.
 * @param {String} type - El tipo de alerta (success, danger, warning, etc.).
 */
function showNotification( message, type ) {
    const toastEl = document.getElementById( 'app_toast' );
    const toastBody = document.getElementById( 'toast_body' );
    
    toastEl.className = `toast align-items-center border-0 rounded-3 shadow bg-${type} text-white position-fixed top-0 end-0 m-3`;
    toastBody.textContent = message;
    
    const toast = new bootstrap.Toast( toastEl );
    toast.show();
}

/**
 * Abre el modal de confirmación de eliminación.
 * @param {Number} id - Identificador del elemento.
 * @param {String} type - Tipo de elemento.
 */
window.openDeleteModal = ( id, type ) => {
    document.getElementById( 'delete_target_id' ).value = id;
    document.getElementById( 'delete_target_type' ).value = type;
    
    if( type === 'day' ) {
        document.querySelector( '#modal_confirm_delete p' ).textContent = "¿Desea limpiar todos los registros de hoy?";
    } else {
        document.querySelector( '#modal_confirm_delete p' ).textContent = "Esta acción no se puede deshacer.";
    }

    const modal = new bootstrap.Modal( document.getElementById( 'modal_confirm_delete' ) );
    modal.show();
};

/**
 * Abre el modal de edición de comida.
 * @param {Number} id - Identificador de la comida.
 */
window.openEditMealModal = ( id ) => {
    const meal = getMealLogs().find( log => log.id == id );
    if( !meal ) return;

    document.getElementById( 'edit_meal_id' ).value = id;
    document.getElementById( 'edit_meal_name' ).value = meal.name;
    editingMealDraft = [...meal.items];
    
    renderDraftItems( 'edit_meal_items_container', editingMealDraft, true );

    const modal = new bootstrap.Modal( document.getElementById( 'modal_edit_meal' ) );
    modal.show();
};

/**
 * Abre el modal de edición de alimento.
 * @param {Number} id - Identificador del alimento.
 */
window.openEditFoodModal = ( id ) => {
    const food = getFoods().find( item => item.id == id );
    if( !food ) return;

    document.getElementById( 'edit_food_id' ).value = id;
    document.getElementById( 'edit_food_name' ).value = food.name;
    document.getElementById( 'edit_protein_100' ).value = food.protein;
    document.getElementById( 'edit_carbs_100' ).value = food.carbs;
    document.getElementById( 'edit_fats_100' ).value = food.fats;
    document.getElementById( 'edit_kcal_100' ).value = food.kcal || 0;

    const modal = new bootstrap.Modal( document.getElementById( 'modal_edit_food' ) );
    modal.show();
};

/**
 * Renderiza los elementos de un borrador de comida.
 * @param {String} containerId - ID del contenedor.
 * @param {Array} items - Lista de items.
 * @param {Boolean} isEditing - Si es el modo edición.
 */
function renderDraftItems( containerId, items, isEditing = false ) {
    const list = document.getElementById( containerId );
    if( items.length === 0 ) {
        list.innerHTML = '<li class="list-group-item bg-transparent text-center text-muted small italic">Sin alimentos</li>';
        return;
    }

    list.innerHTML = items.map( ( item, index ) => `
        <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center border-0 border-bottom">
            <div>
                <span class="fw-bold">${item.foodName}</span> 
                <small class="text-muted ms-2">${item.weight}g (${item.kcal} kcal)</small>
            </div>
            <button type="button" class="btn btn-sm text-danger border-0" onclick="removeDraftItemByIndex('${containerId}', ${index}, ${isEditing})">
                <i class="bi bi-x-circle"></i>
            </button>
        </li>
    ` ).join( '' );
}

/**
 * Elimina un item del borrador por índice.
 */
window.removeDraftItemByIndex = ( containerId, index, isEditing ) => {
    if( isEditing ) {
        editingMealDraft.splice( index, 1 );
        renderDraftItems( containerId, editingMealDraft, true );
    } else {
        currentMealDraft.splice( index, 1 );
        renderDraftItems( containerId, currentMealDraft );
    }
};

/**
 * Renderiza la lista de comidas registradas.
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
                <td class="text-end">
                    <div class="btn-group shadow-sm rounded-pill overflow-hidden">
                        <button class="btn btn-sm btn-white border-end" onclick="openEditMealModal(${meal.id})"><i class="bi bi-pencil text-primary"></i></button>
                        <button class="btn btn-sm btn-white" onclick="openDeleteModal(${meal.id}, 'meal')"><i class="bi bi-trash text-danger"></i></button>
                    </div>
                </td>
            </tr>
        ` ).join( '' )
        : '<tr><td colspan="7" class="text-center py-4 text-muted small italic">No hay comidas registradas</td></tr>';
}

/**
 * Renderiza la tabla de alimentos registrados.
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
                    <div class="btn-group shadow-sm rounded-pill overflow-hidden">
                        <button class="btn btn-sm btn-white border-end" onclick="openEditFoodModal(${food.id})"><i class="bi bi-pencil text-primary"></i></button>
                        <button class="btn btn-sm btn-white" onclick="openDeleteModal(${food.id}, 'food')"><i class="bi bi-trash text-danger"></i></button>
                    </div>
                </td>
            </tr>
        ` ).join( '' )
        : '<tr><td colspan="6" class="text-center py-4 text-muted italic small">No hay alimentos registrados</td></tr>';
}

/**
 * Actualiza el menú desplegable de selección de alimentos.
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
 * Actualiza el resumen de totales nutricionales.
 */
function renderDailyReport() {
    const logs = getMealLogs();
    const totals = calculateDailyTotals();

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