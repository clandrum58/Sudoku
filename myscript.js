let rows = 9;
let cols = 9;
let hilite = false;
let numberColor = "blue";
let numberColors = ["red", "blue", "green", "purple", "aqua", "navy", "cyan"];
let colorIndex = 0;
let gameString = "004300209005009001070060043006002087190007400050083000600000105003508690042910300"
let gameString2 = "040100050107003960520008000000000017000906800803050620090060543600080700250097100"
let gameString3 = "000000657702400100350006000500020009210300500047109008008760090900502030030018206"
let gameString4 = "046000809200000000985230006700062000001000900000510002500093217000000003102000590"
let gameString5 = "020007500050809001000000084010005000007001800530700000000008030906000000000010742"
let gamesArray = [gameString, gameString2, gameString3, gameString4, gameString5];


//gameArray = gameString5.split('');
let gameBoard = new Array();
let candidates = new Array();
let trialAndError = new Array();
let trialValue = true;
let slotsOpen = false;
let countSingles = 0;
let countSingles2 = 0;
let puzzleRating = ["Easy", "Moderate", "Hard", "Brutal"];
let gameSelected = 0;



function loadGame() {
    let n = 0;
    let gameArray = gamesArray[gameSelected].split('');
    for (let i = 0; i < rows; i++) {
        gameBoard[i] = new Array();
        candidates[i] = new Array();
        for (let j = 0; j < cols; j++) {
            gameBoard[i][j] = gameArray[n];
            candidates[i][j] = new Array();
            n++;
        }
    }
    gameSelected++;
    if (gameSelected > 4) { gameSelected = 0};
    countSingles = 0;
    countSingles2 = 0;
    fillCandidatesArray();
    displayGame();
    // console.log(candidates.length);
    // console.log(candidates[1].length);
}

function getColorNumber() {
    if (colorIndex > 6) {
        //alert("Number of Colors defined has been exceeded!!")
        colorIndex = 0;
    }
    numberColor = numberColors[colorIndex];
    colorIndex++
}

function solvePuzzle() {
 
    //fillCandidatesArray();
    
    do {
        getColorNumber();
        fillSingleValueCandidates();
    } while (singleCandidatesExist());
    
    //findMoreHiddenSingles();
    let startAt = checkForOpenSlots();
    if (slotsOpen) {
        numberColor = "darkorange";
        solveByForce(startAt);
    } else {
        displayTotals();
    }
}

function displayTotals() {
    document.getElementById("solvedMsg").textContent = "Puzzle Rating: " + puzzleRating[0];
    document.getElementById("solvedMsg").style.display = "block";
    document.getElementById("cnt1Msg").textContent = "Single Values Filled: " + countSingles;
    document.getElementById("cnt1Msg").style.display = "block";
    document.getElementById("cnt2Msg").textContent = "Hidden Singles Filled: " + countSingles2;
    document.getElementById("cnt2Msg").style.display = "block";
}

function solveByForce(startAt) {
    let r = startAt[0];
    let c = startAt[1];
    let nextIndex = 0;
    var cellEntry, nextCell;

    do {
        for (let idx = nextIndex; idx < candidates[r][c].length; idx++) {
            if (numberFits(r, c, candidates[r][c][idx])) {
                updateGameBoard(r, c, candidates[r][c][idx], trialValue)
                cellEntry = [r, c, idx];
                trialAndError.unshift(cellEntry);
                nextIndex = 0;
                break;
            } else {
                if (idx == candidates[r][c].length - 1) {
                    // last candidate for this cell - must backtrack
                    cellEntry = backTrack();
                    nextIndex = cellEntry[2] + 1;
                    break;
                }
            }
        }
        nextCell = checkForOpenSlots();
        r = nextCell[0];
        c = nextCell[1];
    } while (slotsOpen);

    console.log("End of run...")
    displayTotals();
}

function backTrack() {
    let backTrackInProgress = true;
    var lastEntry, r, c, idx;
    do {
        lastEntry = trialAndError.shift();
        r = lastEntry[0];
        c = lastEntry[1];
        idx = lastEntry[2];
        updateGameBoard(r, c, 0, trialValue);
        if (idx + 1 < candidates[r][c].length) {
            backTrackInProgress = false;
        }
    } while (backTrackInProgress);
    return lastEntry;
    
}

function checkForOpenSlots() {
    let nullArray = [0, 0]

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (gameBoard[r][c] == 0) {
                slotsOpen = true;
                return [r, c];
            }
        }
    }
    slotsOpen = false;
    return nullArray;
}



function findHiddenSingles(r, c) {

    for (let i = 0; i < candidates[r][c].length; i++) {
        if (rowHasDupeCandidates(r, candidates[r][c][i])) {
            // Do nothing
        } else {
            // Unique Candidate found in row. Update gameBoard.
            updateGameBoard(r, c, candidates[r][c][i]);
            countSingles2++;
            break;
        }
        if (colHasDupeCandidates(c, candidates[r][c][i])) {
            // Do nothing
        } else {
            // Unique Candidate found in column. Update gameBoard.
            updateGameBoard(r, c, candidates[r][c][i]);
            countSingles2++;
            break;
        }
        if (sectorHasDupeCandidates) {
            continue;
        } else {
            // Unique Candidate found in sector. Update gameBoard.
            updateGameBoard(r, c, candidates[r][c][i]);
            countSingles2++;
            break;
        }
    }
}

function rowHasDupeCandidates(row, value) {
    var count = 0;
    for (let c = 0; c < 9; c++) {
        //idx = candidates[row][c].indexOf(value);
        if (candidates[row][c].indexOf(value) !== -1) {
            count++
        }
    }
    if (count > 1) {
        return true;
    }

    return false;
}

function colHasDupeCandidates(col, value) {
    var count = 0;
    for (let r = 0; r < 9; r++) {
        //idx = candidates[r][col].indexOf(value);
        if (candidates[r][col].indexOf(value) !== -1) {
            count++
        }
    }
    if (count > 1) {
        return true;
    }

    return false;
}

function sectorHasDupeCandidates(row, col, value) {
    var x, y;

    if (row < 3) {
        x = 0;
    } else if (row < 6) {
        x = 3;
    } else {
        x = 6;
    }
    let xx = x + 3;

    if (col < 3) {
        y = 0;
    } else if (col < 6) {
        y = 3;
    } else {
        y = 6;
    }
    let yy = y + 3;

    for (let i = x; i < xx; i++) {
        for (let j = y; j < yy; j++) {
            //idx = candidates[i][j].indexOf(value);
            if (candidates[i][j].indexOf(value) !== -1) {
                count++
            }
        }
    }

    if (count > 1) {
        return true;
    }

    return false;
}

function fillCandidatesArray() {
    var z;
    for (let r = 0; r < gameBoard.length; r++) {
        for (let c = 0; c < gameBoard[r].length; c++) {
            z = 0;
            if (gameBoard[r][c] == 0) {
                for (let n = 1; n < 10; n++) {
                    if (valueNotInRow(r, n) &&
                        valueNotInColumn(c, n) &&
                        valueNotInSector(r, c, n)) {
                        candidates[r][c][z] = n;
                        z++;
                    }
                }
            }
        }
    }
}
function forceComplete() {
    let startAt = checkForOpenSlots();
    getColorNumber();
    solveByForce(startAt);
}

function testButton() {
    console.log("Test Button invoked")
    // alert("This cell has " + candidates[r][c].length + "possible values");
    //let startAt = checkForOpenSlots();
    //console.log("Starting row = ", + startAt[0] + ". Starting col = " + startAt[1] + ".")
    getColorNumber();
    fillSingleValueCandidates();
    displayTotals();

}
function numberFits(row, col, value) {
    if (valueNotInRow(row, value) && 
        valueNotInColumn(col, value) &&
        valueNotInSector(row, col, value)) {
        return true;
    } else {
        return false;
    }
}

function updateGameBoard(row, col, value, trialValue) {
    gameBoard[row][col] = value;
    displayElement(row, col, true);
    if (!trialValue) {
        candidates[row][col].length = 0;
        adjustRelatedCandidates(row, col, value);
    } 
}

function fillSingleValueCandidates() {
    for (let r = 0; r < gameBoard.length; r++) {
        for (let c = 0; c < gameBoard[r].length; c++) {
            if (candidates[r][c].length == 1) {
                updateGameBoard(r, c, candidates[r][c][0]);
                countSingles++;
            } else if (candidates[r][c].length > 1) {
                findHiddenSingles(r, c);
            }
        }
    }
}

function singleCandidatesExist() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (candidates[r][c].length == 1) {
                return true;
            }
        }
    }
    return false;
}

function adjustRelatedCandidates(row, col, value) {
    var idx;
    var x, y;
    // adjust candidates in same column
    for (let r = 0; r < 9; r++) {
        idx = candidates[r][col].indexOf(value);
        if (idx !== -1) {
            candidates[r][col].splice(idx, 1);
        }
    }
    // adjust candidates in same row
    for (let c = 0; c < 9; c++) {
        idx = candidates[row][c].indexOf(value);
        if (idx !== -1) {
            candidates[row][c].splice(idx, 1);
        }
    }
    // adjust candidates in same sector
    if (row < 3) {
        x = 0;
    } else if (row < 6) {
        x = 3;
    } else {
        x = 6;
    }
    let xx = x + 3;

    if (col < 3) {
        y = 0;
    } else if (col < 6) {
        y = 3;
    } else {
        y = 6;
    }
    let yy = y + 3;

    for (let i = x; i < xx; i++) {
        for (let j = y; j < yy; j++) {
            idx = candidates[i][j].indexOf(value);
            if (idx !== -1) {
                candidates[i][j].splice(idx, 1);
            }
        }
    }
}

function runCode() {
    alert("Hello World!");
}

function valueNotInRow(row, value) {
    for (let col = 0; col < 9; col++) {
        if (gameBoard[row][col] == value) {
            return false;
        }
    }
    return true;
}

function valueNotInColumn(col, value) {
    for (let row = 0; row < 9; row++) {
        if (gameBoard[row][col] == value) {
            return false;
        }
    }
    return true;
}

function valueNotInSector(row, col, value) {
    var x, y;
    if (row < 3) {
        x = 0;
    } else if (row < 6) {
        x = 3;
    } else {
        x = 6;
    }
    let xx = x + 3;

    if (col < 3) {
        y = 0;
    } else if (col < 6) {
        y = 3;
    } else {
        y = 6;
    }
    let yy = y + 3;

    for (let i = x; i < xx; i++) {
        for (let j = y; j < yy; j++) {
            if (gameBoard[i][j] == value) {
                return false;
            }
        }
    }
    return true;
}

function displayGame() {
    /*
    console.log("loadGame function invoked")
    console.log(gameBoard.length);
    console.log(gameBoard[0].length);
    */

    for (let r = 0; r < gameBoard.length; r++) {
        for (let c = 0; c < gameBoard[r].length; c++) {
           displayElement(r, c);
        }
    }
    /*
    document.getElementById("r1c1").textContent = "9";
    document.getElementById("r2c5").textContent = "5";
    */
}
function displayElement(row, col, hilite) {
    //if (hide == true) {
    if (gameBoard[row][col] == 0) {
        document.getElementById("r" + (row + 1) + "c" + (col + 1)).textContent = " ";
        document.getElementById("r" + (row + 1) + "c" + (col + 1)).contentEditable = true;
    } else {
        document.getElementById("r" + (row + 1) + "c" + (col + 1)).textContent = gameBoard[row][col];
        if (hilite) {
            document.getElementById("r" + (row + 1) + "c" + (col + 1)).style.color = numberColor;
        } else {
           document.getElementById("r" + (row + 1) + "c" + (col + 1)).style.color = "black"; 
        }
    }
}