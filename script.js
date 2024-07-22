document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    let currentDraggedBlock = null;
    let touchStartX = 0;
    let touchStartY = 0;

    const blocks = [
        { id: 1, color: 'green', size: 2, x: 1, y: 0 },
        { id: 2, color: 'green', size: 2, x: 4, y: 0 },
        { id: 3, color: 'green', size: 2, x: 3, y: 1 },
        { id: 4, color: 'green', size: 2, x: 4, y: 3 },
        { id: 5, color: 'green', size: 2, x: 2, y: 5 },

        { id: 6, color: 'red', size: 2, x: 0, y: 0 },
        { id: 7, color: 'red', size: 3, x: 1, y: 3 },
        { id: 8, color: 'red', size: 2, x: 2, y: 1 },
        { id: 9, color: 'red', size: 3, x: 3, y: 2 },
        { id: 10, color: 'red', size: 2, x: 4, y: 4 },
        { id: 11, color: 'red', size: 2, x: 5, y: 1 },

        { id: 12, color: 'blue', size: 2, x: 0, y: 2 }
    ];

    function isPositionValid(block, newX, newY) {
        // Check for out of bounds
        if (block.color === 'green' || block.color === 'blue') {
            if (newX < 0 || newX + block.size > 6 || newY < 0 || newY >= 6) {
                return false;
            }
        } else if (block.color === 'red') {
            if (newX < 0 || newX >= 6 || newY < 0 || newY + block.size > 6) {
                return false;
            }
        }

        // Check for collision with other blocks
        for (let otherBlock of blocks) {
            if (otherBlock.id !== block.id) {
                if (block.color === 'green' || block.color === 'blue') {
                    // Horizontal blocks
                    for (let i = 0; i < block.size; i++) {
                        for (let j = 0; j < otherBlock.size; j++) {
                            let increment = 0;
                            if (otherBlock.color === 'red') {
                                increment = j;
                            }
                            if (newX + i === otherBlock.x && newY === otherBlock.y + increment) {
                                return false;
                            }
                        }
                    }
                } else if (block.color === 'red') {
                    // Vertical blocks
                    for (let i = 0; i < block.size; i++) {
                        for (let j = 0; j < otherBlock.size; j++) {
                            let increment = 0;
                            if (otherBlock.color === 'green') {
                                increment = j;
                            }
                            if (newX === otherBlock.x + increment && newY + i === otherBlock.y) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }

    function clearHighlights() {
        const highlightedCells = gameBoard.querySelectorAll('.highlight');
        highlightedCells.forEach(cell => {
            cell.classList.remove('highlight');
        });
    }

    function highlightPosition(block, newX, newY) {
        clearHighlights();
        if (block.color === 'green' || block.color === 'blue') {
            // Horizontal blocks
            for (let i = 0; i < block.size; i++) {
                const cell = gameBoard.querySelector(`[data-x="${newX + i}"][data-y="${newY}"]`);
                if (cell) cell.classList.add('highlight');
            }
        } else if (block.color === 'red') {
            // Vertical blocks
            for (let i = 0; i < block.size; i++) {
                const cell = gameBoard.querySelector(`[data-x="${newX}"][data-y="${newY + i}"]`);
                if (cell) cell.classList.add('highlight');
            }
        }
    }

    // Initialize the grid
    for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
            const cell = document.createElement('div');
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.style.gridColumnStart = x + 1;
            cell.style.gridRowStart = y + 1;
            cell.classList.add('grid-cell');
            gameBoard.appendChild(cell);
        }
    }

    blocks.forEach(block => {
        const div = document.createElement('div');
        div.classList.add('block', block.color);
        div.classList.add(block.color === 'green' || block.color === 'blue' ? (block.size === 2 ? 'horizontal-two' : 'horizontal-three') : (block.size === 2 ? 'two' : 'three'));
        div.style.gridColumnStart = block.x + 1;
        div.style.gridRowStart = block.y + 1;
        div.draggable = true;
        div.dataset.id = block.id;
        div.textContent = block.id;
        gameBoard.appendChild(div);

        // Mouse event listeners
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify(block));
            currentDraggedBlock = block;
        });

        // Touch event listeners
        div.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            currentDraggedBlock = block;
        });

        div.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!currentDraggedBlock) return;

            const touch = e.touches[0];
            const targetColumn = Math.floor((touch.clientX - gameBoard.offsetLeft) / 50);
            const targetRow = Math.floor((touch.clientY - gameBoard.offsetTop) / 50);

            const existingBlock = blocks.find(b => b.id === currentDraggedBlock.id);
            let newX = existingBlock.x;
            let newY = existingBlock.y;

            if (existingBlock.color === 'green' || existingBlock.color === 'blue') {
                newX = targetColumn;
            } else if (existingBlock.color === 'red') {
                newY = targetRow;
            }

            if (isPositionValid(existingBlock, newX, newY)) {
                highlightPosition(existingBlock, newX, newY);
            } else {
                clearHighlights();
            }
        });

        div.addEventListener('touchend', (e) => {
            clearHighlights();
            if (!currentDraggedBlock) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const targetColumn = Math.floor((touchEndX - gameBoard.offsetLeft) / 50);
            const targetRow = Math.floor((touchEndY - gameBoard.offsetTop) / 50);

            const existingBlock = blocks.find(b => b.id === currentDraggedBlock.id);
            let newX = existingBlock.x;
            let newY = existingBlock.y;

            if (existingBlock.color === 'green' || existingBlock.color === 'blue') {
                newX = targetColumn;
            } else if (existingBlock.color === 'red') {
                newY = targetRow;
            }

            if (isPositionValid(existingBlock, newX, newY)) {
                existingBlock.x = newX;
                existingBlock.y = newY;

                const blockElement = gameBoard.querySelector(`.block[data-id='${currentDraggedBlock.id}']`);
                blockElement.style.gridColumnStart = existingBlock.x + 1;
                blockElement.style.gridRowStart = existingBlock.y + 1;
            }

            currentDraggedBlock = null;
        });
    });

    // Mouse drag-and-drop event listeners
    gameBoard.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!currentDraggedBlock) return;

        const targetColumn = Math.floor((e.clientX - gameBoard.offsetLeft) / 50);
        const targetRow = Math.floor((e.clientY - gameBoard.offsetTop) / 50);

        const existingBlock = blocks.find(b => b.id === currentDraggedBlock.id);
        let newX = existingBlock.x;
        let newY = existingBlock.y;

        if (existingBlock.color === 'green' || existingBlock.color === 'blue') {
            newX = targetColumn;
        } else if (existingBlock.color === 'red') {
            newY = targetRow;
        }

        if (isPositionValid(existingBlock, newX, newY)) {
            highlightPosition(existingBlock, newX, newY);
        } else {
            clearHighlights();
        }
    });

    gameBoard.addEventListener('dragleave', (e) => {
        clearHighlights();
    });

    gameBoard.addEventListener('drop', (e) => {
        e.preventDefault();
        clearHighlights();
        if (!currentDraggedBlock) return;

        const targetColumn = Math.floor((e.clientX - gameBoard.offsetLeft) / 50);
        const targetRow = Math.floor((e.clientY - gameBoard.offsetTop) / 50);

        const existingBlock = blocks.find(b => b.id === currentDraggedBlock.id);
        let newX = existingBlock.x;
        let newY = existingBlock.y;

        if (existingBlock.color === 'green' || existingBlock.color === 'blue') {
            newX = targetColumn;
        } else if (existingBlock.color === 'red') {
            newY = targetRow;
        }

        if (isPositionValid(existingBlock, newX, newY)) {
            existingBlock.x = newX;
            existingBlock.y = newY;

            const blockElement = gameBoard.querySelector(`.block[data-id='${currentDraggedBlock.id}']`);
            blockElement.style.gridColumnStart = existingBlock.x + 1;
            blockElement.style.gridRowStart = existingBlock.y + 1;
        }

        currentDraggedBlock = null;
    });
});