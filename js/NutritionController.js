/**
 * NutritionController.js
 * Orquestador JS: Gestión de navegación y eventos
 */

let currentMealDraft = [];

document.addEventListener( 'DOMContentLoaded', () => {
    init();
} );

function init() {
    // Referencias generales
    const food_form = document.getElementById( 'food_form' );
    const meal_form = document.getElementById( 'meal_form' );
    const btn_clear = document.getElementById( 'btn_clear_data' );
    const nav_links = document.querySelectorAll( '.sidebar .nav-link' );
    
    // Referencias Alimentos
    const btn_show_food_form = document.getElementById( 'btn_show_food_form' );
    const btn_cancel_food = document.getElementById( 'btn_cancel_food' );
    const container_food_form = document.getElementById( 'container_food_form' );

    // Referencias Comidas
    const btn_show_meal_form = document.getElementById( 'btn_show_meal_form' );
    const btn_cancel_meal = document.getElementById( 'btn_cancel_meal' );
    const container_meal_form = document.getElementById( 'container_meal_form' );
    const btn_add_item = document.getElementById( 'btn_add_item_to_meal' );

    // Inicializar UI
    renderFoodDropdown();
    renderDailyReport();
    renderFoodListTable();
    renderMealsListTable();

    // --- Navegación ---
    nav_links.forEach( link => {
        link.addEventListener( 'click', ( e ) => {
            e.preventDefault();
            nav_links.forEach( l => l.classList.remove( 'active' ) );
            link.classList.add( 'active' );

            const targetSectionId = link.getAttribute( 'data-section' );
            document.querySelectorAll( '.app-section' ).forEach( section => {
                section.classList.add( 'd-none' );
            } );
            document.getElementById( targetSectionId ).classList.remove( 'd-none' );
        } );
    } );

    // --- Lógica de UI Alimentos ---
    btn_show_food_form.addEventListener( 'click', () => {
        container_food_form.classList.remove( 'd-none' );
        btn_show_food_form.classList.add( 'd-none' );
    } );

    btn_cancel_food.addEventListener( 'click', () => {
        container_food_form.classList.add( 'd-none' );
        btn_show_food_form.classList.remove( 'd-none' );
        food_form.reset();
    } );

    // --- Lógica de UI Comidas ---
    btn_show_meal_form.addEventListener( 'click', () => {
        container_meal_form.classList.remove( 'd-none' );
        btn_show_meal_form.classList.add( 'd-none' );
        currentMealDraft = [];
        renderDraftItems();
    } );

    btn_cancel_meal.addEventListener( 'click', () => {
        container_meal_form.classList.add( 'd-none' );
        btn_show_meal_form.classList.remove( 'd-none' );
        meal_form.reset();
        currentMealDraft = [];
    } );

    btn_add_item.addEventListener( 'click', () => {
        const select = document.getElementById( 'select_food' );
        const weightInput = document.getElementById( 'weight_grams' );
        
        const foodId = select.value;
        const weight = parseFloat( weightInput.value );

        if( !foodId || isNaN( weight ) ) return alert( "Seleccione un alimento y peso válido" );

        const food = getFoods().find( f => f.id == foodId );
        if( food ) {
            const calculatedMacros = calculateMacros( food, weight );
            currentMealDraft.push( {
                foodName: food.name,
                weight: weight,
                ...calculatedMacros
            } );
            
            renderDraftItems();
            weightInput.value = '';
            select.value = '';
        }
    } );

    // --- Eventos de Formulario ---
    food_form.addEventListener( 'submit', ( e ) => {
        e.preventDefault();
        const formData = new FormData( food_form );
        const food = {
            name: formData.get( 'food_name' ),
            protein: parseFloat( formData.get( 'protein_100' ) ),
            carbs: parseFloat( formData.get( 'carbs_100' ) ),
            fats: parseFloat( formData.get( 'fats_100' ) )
        };

        const result = saveFood( food );
        if( result.code === 0 ) {
            food_form.reset();
            container_food_form.classList.add( 'd-none' );
            btn_show_food_form.classList.remove( 'd-none' );
            renderFoodDropdown();
            renderFoodListTable();
        } else {
            alert( result.message );
        }
    } );

    meal_form.addEventListener( 'submit', ( e ) => {
        e.preventDefault();
        const mealName = document.getElementById( 'meal_name' ).value;
        
        const meal = {
            name: mealName,
            items: currentMealDraft
        };

        const result = saveMealLog( meal );
        if( result.code === 0 ) {
            meal_form.reset();
            container_meal_form.classList.add( 'd-none' );
            btn_show_meal_form.classList.remove( 'd-none' );
            currentMealDraft = [];
            renderDailyReport();
            renderMealsListTable();
        } else {
            alert( result.message );
        }
    } );

    btn_clear.addEventListener( 'click', () => {
        if( confirm( "¿Estás seguro de limpiar los datos de hoy?" ) ) {
            clearLogs();
            renderDailyReport();
            renderMealsListTable();
        }
    } );
}

/**
 * Renderiza los items temporales de la comida actual en creación
 */
function renderDraftItems() {
    const list = document.getElementById( 'current_meal_items' );
    if( currentMealDraft.length === 0 ) {
        list.innerHTML = '<li class="list-group-item bg-transparent text-center text-muted small italic">Agregue alimentos a esta comida</li>';
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
 * Elimina un item del borrador de la comida
 */
window.removeDraftItem = ( index ) => {
    currentMealDraft.splice( index, 1 );
    renderDraftItems();
};

/**
 * Renderiza la lista de comidas completas
 */
function renderMealsListTable() {
    const tableBody = document.getElementById( 'meals_list_table' );
    const logs = getMealLogs();

    tableBody.innerHTML = logs.length > 0
        ? logs.map( meal => `
            <tr>
                <td class="fw-bold">${meal.name}</td>
                <td><small class="text-muted">${meal.items.map( i => i.foodName ).join( ', ' )}</small></td>
                <td class="text-primary fw-medium">${meal.protein.toFixed( 1 )}g</td>
                <td class="text-success fw-medium">${meal.carbs.toFixed( 1 )}g</td>
                <td class="text-warning fw-medium">${meal.fats.toFixed( 1 )}g</td>
                <td class="fw-bold">${meal.kcal}</td>
            </tr>
        ` ).join( '' )
        : '<tr><td colspan="6" class="text-center py-4 text-muted small italic">No hay comidas registradas</td></tr>';
}

/**
 * Renderiza el listado de alimentos en la sección Alimentos
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
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-secondary border-0" onclick="alert( 'Acciones disponibles pronto' )">
                        <i class="bi bi-three-dots"></i>
                    </button>
                </td>
            </tr>
        ` ).join( '' )
        : '<tr><td colspan="5" class="text-center py-4 text-muted italic small">No hay alimentos registrados</td></tr>';
}

/**
 * Renderiza el select de alimentos registrados
 */
function renderFoodDropdown() {
    const select = document.getElementById( 'select_food' );
    const foods = getFoods();
    
    select.innerHTML = '<option value="">Seleccionar...</option>';
    foods.forEach( food => {
        const option = document.createElement( 'option' );
        option.value = food.id;
        option.textContent = `${food.name} (P: ${food.protein} / C: ${food.carbs} / G: ${food.fats})`;
        select.appendChild( option );
    } );
}

/**
 * Actualiza la tabla de consumo y los totales (en Inicio y Comidas)
 */
function renderDailyReport() {
    const logs = getMealLogs();
    const totals = calculateDailyTotals();

    // Actualizar tabla en Inicio (Desglosado por alimento dentro de comidas)
    const inicioTableBody = document.getElementById( 'meal_log_table' );
    let allItems = [];
    logs.forEach( meal => allItems = allItems.concat( meal.items ) );

    inicioTableBody.innerHTML = allItems.length > 0 
        ? allItems.map( item => `
            <tr>
                <td class="fw-medium">${item.foodName}</td>
                <td>${item.weight}g</td>
                <td class="text-primary">${item.protein}g</td>
                <td class="text-success">${item.carbs}g</td>
                <td class="text-warning">${item.fats}g</td>
                <td class="fw-bold">${item.kcal}</td>
            </tr>
        ` ).join( '' )
        : '<tr><td colspan="6" class="text-center py-4 text-muted small italic">No hay registros hoy</td></tr>';

    // Actualizar Totales en ambas secciones
    const elementsToUpdate = {
        calories: [ 'total_calories', 'total_calories_comidas' ],
        protein: [ 'total_protein', 'total_protein_comidas' ],
        carbs: [ 'total_carbs', 'total_carbs_comidas' ],
        fats: [ 'total_fats', 'total_fats_comidas' ]
    };

    elementsToUpdate.calories.forEach( id => document.getElementById( id ).textContent = totals.kcal );
    elementsToUpdate.protein.forEach( id => document.getElementById( id ).textContent = totals.protein.toFixed( 1 ) + 'g' );
    elementsToUpdate.carbs.forEach( id => document.getElementById( id ).textContent = totals.carbs.toFixed( 1 ) + 'g' );
    elementsToUpdate.fats.forEach( id => document.getElementById( id ).textContent = totals.fats.toFixed( 1 ) + 'g' );
}