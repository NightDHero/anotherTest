// PREVIEWER
// set bz price and npc sell price beforehand automaticly - run calculate - remove the entry field texts so them users dont see them

/*
    TODO: 
    Add Settings which include --> 1. Option to remove or add certain profits // profit per item // profit per stack //
                                   2. Option to adjust inventory dumptime
                                   3. Add the ability to change colors to all profits or to leave without 
                                   4. Add a save flip option if possible and name it and access it in the saved menu
                                   5. Add bz API
                                   6. Tab order (pressing tab makes u cycle between buy, sell, calculate, reset)
                                   7. Optional, pro tips window
                                   8. ------- Make settings clickable
                                   9. Make some text unselectable
                                   10. allow the user to edit preview elements names and apply those to result
                                   11. get rid of the y-axis scoll bar when opening preview
                                   12. add the swift animation that the open settings has to open preview
                                   13. add a Save? button to when i click calculate (in the results)
                                   14. not be able to access settings in save menu
                                   15. tab order for all windows -> main - save - protip - ect..
                                   16. set buy order number and price and sell price to see the potential profit
                                   17. fix switch toggle in preview not resizing
                                   18. make k or m or b work in buy price and sell price
                                   
*/


let ProfitPerHour, ProfitPerDay, ProfitPerMinute, ProfitPerInventory, time, Quantity, CoinsRequirementPerDay, ProfitPerHourText;
const calculateProfit = () => {
    const ItemBZBuyPrice = parseFloat(document.getElementById('bz-buy-price').value);
    const ItemNPCSellPrice = parseFloat(document.getElementById('npc-sell-price').value);

    if (isNaN(ItemBZBuyPrice) || ItemBZBuyPrice < 0 || isNaN(ItemNPCSellPrice) || ItemNPCSellPrice <= 0) {
        alert('Please enter valid numbers for both prices.');
        return;
    }

    if (ItemBZBuyPrice === ItemNPCSellPrice || ItemBZBuyPrice >= ItemNPCSellPrice) {
        alert('Did you know brains are meant to be used? You might want to give it a try sometime.');
        return;
    }

    const NPCCoinsSellLimit = 200000000;
    Quantity = NPCCoinsSellLimit / ItemNPCSellPrice;
    ProfitPerDay = Quantity * (ItemNPCSellPrice - ItemBZBuyPrice);
    CoinsRequirementPerDay = Quantity * ItemBZBuyPrice;
    const ProfitPerItem = ItemNPCSellPrice - ItemBZBuyPrice;
    const Inventory64 = 2240;
    ProfitPerInventory = ProfitPerItem * Inventory64;
    const InventoryDumptime = 20;
    const HourInMinutes = 60;
    const MinuteInSeconds = 60;
    ProfitPerMinute = (MinuteInSeconds / InventoryDumptime) * ProfitPerInventory;
    ProfitPerHour = ProfitPerMinute * 60;
    const TimeNeededToExecuteTheFlip = ProfitPerDay / ProfitPerMinute;

    if (ProfitPerHour >= ProfitPerDay) {
        const minutes = Math.floor(ProfitPerDay / ProfitPerMinute);
        ProfitPerHourText = `Profit / Hour (${minutes + 1}min): ${formatNumber(ProfitPerDay)}`;
        time = `${minutes + 1}min`;
    } else {
        ProfitPerHourText = `Profit / Hour: ${formatNumber(ProfitPerHour)}`;
        time = TimeNeededToExecuteTheFlip >= HourInMinutes
            ? `${Math.floor(TimeNeededToExecuteTheFlip / 60)}h ${Math.floor(TimeNeededToExecuteTheFlip % 60)}min`
            : `${Math.floor(TimeNeededToExecuteTheFlip)}min`;
    }

    updateResultsOrder();
    document.getElementById('result').classList.remove('hidden');
};

const resetCalculator = () => {
    document.getElementById('bz-buy-price').value = '';
    document.getElementById('npc-sell-price').value = '';
    document.getElementById('result').classList.add('hidden');
};


document.querySelector('.reset').addEventListener('keydown', function(event) {
    if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        document.getElementById('bz-buy-price').focus();
    }
});


const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'm';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(2).replace(/\.00$/, '') + 'k';
    }
    return num.toString();
};

const updateResultsOrder = () => {
    const resultContainer = document.getElementById('result');

    const results = {
        "ProfitPerHourText": ProfitPerHourText,
        "Profit / Day:": formatNumber(ProfitPerDay),
        "Profit / Minute:": formatNumber(ProfitPerMinute),
        "Profit / Inventory:": formatNumber(ProfitPerInventory),
        "Time Needed:": time,
        "Coins Required / Day:": formatNumber(CoinsRequirementPerDay),
        "Buy Order Size:": formatNumber(Quantity)
    };

    const previewItems = Array.from(document.querySelectorAll('.preview .draggable'));
    const orderedResults = previewItems
        .filter(item => item.querySelector('input[type="checkbox"]').checked)
        .sort((a, b) => a.dataset.order - b.dataset.order)
        .map(item => item.textContent.trim().split('\n')[0]);

    resultContainer.innerHTML = '';

    orderedResults.forEach((label, index) => {
        const resultElement = document.createElement('div');
        if (label === "Profit / Hour:") {
            resultElement.textContent = results["ProfitPerHourText"];
        } else if (results[label]) {
            resultElement.textContent = `${label} ${results[label]}`;
        }
        resultElement.classList.add('result-item');
        resultElement.dataset.order = index;
        resultContainer.appendChild(resultElement);
    });
};
















document.addEventListener('DOMContentLoaded', () => {
    const preview = document.querySelector('.preview');
    const settingsIcon = document.getElementById('settings-icon');
    const settingsMenu = document.getElementById('settings-menu');
    const calculateButton = document.querySelector('.calculate');
    const resetButton = document.querySelector('.reset');
    const settingButtons = document.querySelectorAll('.main');
    const saveButton = document.getElementById('save-icon');
    const saveMenu = document.querySelector('.save-menu');
    const createItem = document.querySelector('.create-item');
    const currentSave = document.querySelector('.current-save')
    const saveName = document.querySelector('.save-name');
    const container = document.querySelector('.container');
    const overlay = document.querySelector('.overlay');
    const saveBuyPrice = document.querySelector('.save-buy-price');
    const saveSellPrice = document.querySelector('.save-sell-price');
    const saveItemButton = document.querySelector('.save-item');
    const currentSaveBox = document.querySelector('.current-save-box');

    const createItemElements = [saveName, saveBuyPrice, saveSellPrice, saveItemButton];
    const currentSaveElements = [currentSaveBox]


    calculateButton.addEventListener('click', calculateProfit);
    resetButton.addEventListener('click', resetCalculator);
    settingsIcon.addEventListener('click', openSettings);
    settingButtons.forEach(button => button.addEventListener('click', mainSelection));
    saveButton.addEventListener('click', openSaveMenu);
    createItem.addEventListener('click', createNewSave);
    currentSave.addEventListener('click', currentSaves);
    saveItemButton.addEventListener('click', saveItem);

    function saveItem() {
        const buyPrice = parseFloat(saveBuyPrice.value);
        const sellPrice = parseFloat(saveSellPrice.value);
        const itemName = saveName.value.trim();

        const isNumeric = (value) => !isNaN(value) && !isNaN(parseFloat(value));

        if (isNumeric(itemName)) {
            alert("Item Name cannot be numbers only.");
            return;
        }

        if (!itemName) {
            alert("Item Name Empty..");
            return;
        }

        if (!saveBuyPrice.value) {
            alert("Buy Price Empty..");
            return;
        } 
        
        if (!saveSellPrice.value) {
            alert("Sell Price Empty..");
            return;
        }

        if (isNaN(buyPrice)) {
            alert("Buy Price must be a number.");
            return;
        }

        if (isNaN(sellPrice)) {
            alert("Sell Price must be a number.");
            return;
        }

        const newItem = document.createElement('div');
        newItem.classList.add('saved-item');
        newItem.innerHTML = `
        <details>
            <summary class="summary-save-item">
                <strong>${itemName}</strong>
            </summary>

                <p>Buy Price: ${buyPrice}</p>
                <p>Sell Price: ${sellPrice}</p>
        </details>
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
        </svg>
        <svg class="delete" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
        </svg>
        <svg class="edit" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
            <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
        </svg>
        `

        currentSaveBox.appendChild(newItem);

        saveName.value = '';
        saveBuyPrice.value = '';
        saveSellPrice.value = '';

    }



    function currentSaves() {
        const createItemElementsVisible = createItemElements.some(el => !el.classList.contains('hidden'));
        const currentSaveElementsVisible = currentSaveElements.some(el => !el.classList.contains('hidden'));


        if (createItemElementsVisible) {
            createItemElements.forEach(el => el.classList.add('hidden'));
        }

        if (currentSaveElementsVisible) {
            currentSaveElements.forEach(el => el.classList.add('hidden'));
            saveMenu.classList.remove('bottom-padding');
        }

        if (!currentSaveElementsVisible) {
            currentSaveElements.forEach(el => el.classList.remove('hidden'));
            saveMenu.classList.add('bottom-padding');
        }

        const currentSaveBoxChildren = Array.from(currentSaveBox.children).filter(child => !child.classList.contains('empty-message'))

        if (currentSaveBoxChildren.length === 0) {
            // Check if empty message already exists
            if (!currentSaveBox.querySelector('.empty-message')) {
                const emptyMessage = document.createElement('div');
                emptyMessage.classList.add('empty-message');
                emptyMessage.textContent = "Seems empty, try adding an item!";
                currentSaveBox.appendChild(emptyMessage);
            }
        } else {
            const emptyMessage = currentSaveBox.querySelector('.empty-message');
            if (emptyMessage) {
                currentSaveBox.removeChild(emptyMessage);
            }
        }
    }


    function createNewSave() {        
        const createItemElementsVisible = createItemElements.some(el => !el.classList.contains('hidden'));
        const currentSaveElementsVisible = currentSaveElements.some(el => !el.classList.contains('hidden'));
        // Check if any of the create item elements are currently visible

        
        if (currentSaveElementsVisible) {
            currentSaveElements.forEach(el => el.classList.add('hidden'));
        }

        if (!createItemElementsVisible) {
            createItemElements.forEach(el => el.classList.remove('hidden'));
            saveMenu.classList.add('bottom-padding');
           
        } 
        if (createItemElementsVisible) {
            createItemElements.forEach(el => el.classList.add('hidden'));
            saveMenu.classList.remove('bottom-padding');
        }
    }
        /* saveName.setFocus */

    

    function openSaveMenu() {
        if (saveMenu) {
            const isHidden = saveMenu.classList.contains('hidden');
            if (isHidden) {
                saveMenu.classList.remove('hidden');
                overlay.classList.remove('hidden');

                settingsIcon.classList.remove('rotated');
                settingsMenu.classList.remove('expanded');
                settingsMenu.classList.add('hidden');
                
                saveMenu.querySelectorAll('div, textarea').forEach(element => {
                    if (element.classList.contains('create-item') || element.classList.contains('current-save')) {
                        element.classList.remove('hidden');
                    } else {
                        element.classList.add('hidden');
                    }
                });
            } else {
                saveMenu.classList.add('hidden');
                overlay.classList.add('hidden');
/*                 saveMenu.classList.remove('bottom-padding');
 */                saveMenu.querySelectorAll('div, textarea').forEach(element => {
                    element.classList.add('hidden');
                });
            }
        }
    }

    


    function mainSelection(event) {
        const button = event.target;
        const selectionBorderIsActive = button.classList.contains('selection-border');

        settingButtons.forEach(btn => btn.classList.remove('selection-border'));
        saveMenu.querySelectorAll('.create-item, .current-save').forEach(btn => btn.classList.remove('selection-border'));

        if (!selectionBorderIsActive) {
            button.classList.add('selection-border');
        }

        if (button.textContent.includes('Preview')) {
            preview.classList.toggle('hidden');
        }

        if (!button.textContent.includes('Preview')) {
            preview.classList.add('hidden');
        }
    }

    function getItems() {
        return Array.from(preview.children);
    }
    function openSettings() {
        settingsIcon.classList.toggle('rotated');
        settingsMenu.classList.toggle('expanded');
        settingsMenu.classList.remove('hidden');
        preview.classList.add('hidden');
        saveMenu.classList.add('hidden');
        overlay.classList.add('hidden')
        settingButtons.forEach(btn => btn.classList.remove('selection-border'));
        resetCalculator();
    }

    function moveUp(index) {
        const items = getItems();
        if (index <= 0) return;

        const currentItem = items[index];
        const previousItem = items[index - 1];

        // Swap orders
        [currentItem.dataset.order, previousItem.dataset.order] = [previousItem.dataset.order, currentItem.dataset.order];

        renderPreview();
    }

    function moveDown(index) {
        const items = getItems();
        if (index >= items.length - 1) return;

        const currentItem = items[index];
        const nextItem = items[index + 1];

        // Swap orders
        [currentItem.dataset.order, nextItem.dataset.order] = [nextItem.dataset.order, currentItem.dataset.order];

        renderPreview();
    }

    function renderPreview() {
        const sortedItems = getItems().sort((a, b) => a.dataset.order - b.dataset.order);

        preview.innerHTML = '';
        sortedItems.forEach(item => preview.appendChild(item));

        updateResultsOrder();
    }

    preview.addEventListener('click', (event) => {
        const button = event.target;
        const item = button.closest('.draggable');
        if (!item) return;

        const index = parseInt(item.dataset.order, 10);

        if (button.classList.contains('move-up')) {
            moveUp(index);
        } else if (button.classList.contains('move-down')) {
            moveDown(index);
        }
    });

    preview.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') { // Ensure it's a checkbox change
            updateResultsOrder();
        }
    });
    renderPreview();
});
