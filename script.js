var playerRed = "R";
var playerYellow = "Y";
var currPlayer = playerRed;

var gameOver = false;
var board;
var currColumns;

var rows = 6;
var columns = 7;

window.onload = function(){
    setGame();
}

function setGame(){
    board = [];
    currColumns = [5, 5, 5, 5, 5, 5, 5];

    for(let r = 0; r < rows; r++){
        let row = [];
        for(let c = 0; c < columns; c++){
            //JS
        row.push(' ');

        //HTML
        let tile = document.createElement("div");
        tile.id = r.toString() + "-" + c.toString();
        tile.classList.add("tile");
        tile.addEventListener("click", setPiece)
        document.getElementById("board").append(tile);

        }
        board.push(row);
    }
}

function setPiece(){
    if(gameOver){
        return;
    }
    
    let cooords = this.id.split("-");
    let r = parseInt(cooords[0]);
    let c = parseInt(cooords[1]);

    r = currColumns[c];
    if(r < 0){
        return
    }

    board[r][c] = currPlayer;
    let tile = document.getElementById(r.toString()+ "-" + c.toString());
    if(currPlayer == playerRed){
        tile.classList.add("red-piece");
        currPlayer = playerYellow
    }
    else{
        tile.classList.add("yellow-piece")
        currPlayer = playerRed;
    }

    r -= 1;
    currColumns[c] = r;

    checkWinner();
}

function checkWinner(){
    //Horizontally
    for(let r = 0; r < rows; r++){
       for (let c = 0; c < columns - 3; c++){
            if(board[r][c] != ' '){
                if(board[r][c] == board[r][c+1] && board[r][c+1] == board[r][c+2] && board[r][c+2] == board[r][c+3]){
                    setWinner(r, c);
                    return;
                }
            }
        }
    }

    //Vertically
    for(let c = 0; c < columns; c++){
        for(let r = 0; r < rows-3; r++){
            if(board[r][c] != ' '){
                if(board[r][c] == board[r+1][c] && board[r+1][c] == board[r+2][c] && board[r+2][c] == board[r+3][c]){
                    setWinner(r, c)     ;           
                }
            }
        }
    }

}

function setWinner(r, c){
    let winner = document.getElementById("winner");
    if(board[r][c] == playerRed){
        winner.innerText = "Player Red Wins!"
    }
    else{
        winner.innerText = "Player Yellow Wins!";
    }

    gameOver = true;
}

