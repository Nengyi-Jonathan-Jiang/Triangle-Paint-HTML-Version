const SQRT_3_2 = 0.86602540378;

enum STATES{IDLE, DRAWING, ERASING, DRAW_BLENDED_EDGE};
class GameDisplay{
    private currState:STATES = STATES.IDLE;
    private SIZE = 64;
 	private COLORS:string[] = [
		"rgb( 30, 30, 30)",
		"rgb(130,130,130)",
		"rgb(230,230,230)",
		"rgb( 25, 60,100)",
		"rgb(100,130,170)",
		"rgb( 90,  0,  0)",
		"rgb(222,127,127)",
		"rgb(175,227,141)",
		"rgb( 66,135, 33)",
	];
    private canvas:Canvas;

    constructor(){
        this.canvas = new Canvas(0, 0, document.body);
        this.canvas.canvas.addEventListener("mouseDown",(e:MouseEvent)=>this.onMouseDown(e.clientX,e.clientY));
		this.canvas.canvas.addEventListener("mouseDown",(e:MouseEvent)=>this.onMouseUp(e.clientX,e.clientY));
		this.canvas.canvas.addEventListener("mouseDown",(e:MouseEvent)=>this.onMouseDown(e.clientX,e.clientY));
		this.canvas.canvas.addEventListener("mouseMove",(e:MouseEvent)=>this.onMouseMove(e.clientX,e.clientY));
        window.addEventListener("keypress",(e:KeyboardEvent)=>this.onKeyPressed(e.keyCode));
        window.addEventListener("resize",_=>this.canvas.resizeToWindow());
        Canvas.createAnimation(_=>this.paint());
    }

    //Called every time the display needs to update
    public paint():void{

        //Recalculate dimensions
        const WIDTH = this.canvas.width, HEIGHT = this.canvas.height;
        const SIZE = this.SIZE = Math.min(WIDTH,HEIGHT);
        const LEFT_OFFSET = this.LEFT_OFFSET = (WIDTH - SIZE) >> 1, TOP_OFFSET = this.TOP_OFFSET = (HEIGHT - SIZE) >> 1;

        const BOARD_SIZE = GameLogic.BOARD_SIZE;
        const PIECE_RAD = ~~(SIZE / BOARD_SIZE / 2);

        //Paint board background
        this.canvas.clear("#000");
        this.canvas.setFillColor("rgb(200,200,200)");
        this.canvas.fillRect(LEFT_OFFSET, TOP_OFFSET, LEFT_OFFSET + SIZE, TOP_OFFSET + SIZE);

        this.canvas.setDrawColor("#000");

        //Draw grid
        for(let i = 0; i <= BOARD_SIZE; i++){
            const offset =  i * SIZE / BOARD_SIZE;
            this.canvas.line(LEFT_OFFSET, TOP_OFFSET + offset, WIDTH - LEFT_OFFSET, TOP_OFFSET + offset);
            this.canvas.line(LEFT_OFFSET + offset, TOP_OFFSET, LEFT_OFFSET + offset, HEIGHT - TOP_OFFSET);
        }

        const PADDING = ~~(SIZE / BOARD_SIZE / 9);
        //Draw pieces
        for(let i = 0; i < GameLogic.BOARD_SIZE; i++){
            for(let j = 0; j < GameLogic.BOARD_SIZE; j++){
                const circleX = LEFT_OFFSET + i * SIZE / BOARD_SIZE;
                const circleY = TOP_OFFSET  + j * SIZE / BOARD_SIZE;
                
                switch(this.logic.getPieceAt(i, j)){
                    case BOARD_CELL.PLAYER:
                        this.canvas.circle(circleX + PIECE_RAD, circleY + PIECE_RAD, PIECE_RAD - PADDING);
                        break;
                    case BOARD_CELL.OPPONENT:
                        this.canvas.fillCircle(circleX + PIECE_RAD, circleY + PIECE_RAD, PIECE_RAD - PADDING);
                        break;
                }
            }
        }
    }

    public onWin():void{
        document.getElementById("game-result").dataset.result = "win";
        document.getElementById("game-result").onclick = (e =>{if(e.target instanceof HTMLElement) e.target.dataset.result = "null"; this.logic.resetBoard()});
    }
    public onLose():void{
        document.getElementById("game-result").dataset.result = "lose";
        document.getElementById("game-result").onclick = (e =>{if(e.target instanceof HTMLElement) e.target.dataset.result = "null"; this.logic.resetBoard()});
    }
    public onDraw():void{
        document.getElementById("game-result").dataset.result = "draw";
        document.getElementById("game-result").onclick = (e =>{if(e.target instanceof HTMLElement) e.target.dataset.result = "null"; this.logic.resetBoard()});
    }

    public onKeyPressed(keyCode:number):void{
        this.logic.onKey(keyCode);
    }

    public onMouseDown(x:number, y:number) {
        this.logic.click(
            ~~(GameLogic.BOARD_SIZE * (x - this.LEFT_OFFSET) / this.SIZE),
            ~~(GameLogic.BOARD_SIZE * (y - this.TOP_OFFSET) / this.SIZE)
        );
    }
}


enum BOARD_CELL{EMPTY,PLAYER,OPPONENT}
class GameLogic{
    private display:GameDisplay ;

    public static get BOARD_SIZE():number{return 13};

    private board:BOARD_CELL[][];
    private opponent:ComputerOpponent;

    constructor(disp:GameDisplay){
        this.opponent = new ComputerOpponent(this);
        this.display = disp;
        this.resetBoard();
    }


    public onKey(keycode:number){
        if(keycode == 82) this.resetBoard() //If r pressed, reset game
    }

    public click(x:number, y:number):void{
        if(x < 0 || x >= GameLogic.BOARD_SIZE || y < 0 || y >= GameLogic.BOARD_SIZE || this.board[x][y] != BOARD_CELL.EMPTY) return;
        this.playerMove(x, y);
    }

    private playerMove(x:number, y:number) {
        this.board[x][y] = BOARD_CELL.PLAYER;
        this.display.paint();

        switch(this.gameWon()){
            case 1:
                this.display.onWin();
                break;
            case 3:
                this.display.onDraw();
                break;
        }

        this.opponentMove();
    }

    private opponentMove(){
        this.opponent.move();
        this.display.paint();

        switch(this.gameWon()){
            case 2:
                this.display.onLose();
                break;
            case 3:
                this.display.onDraw();
                break;
        }
        
    }

    public resetBoard():void{
        this.board = new Array(GameLogic.BOARD_SIZE).fill(0).map(i=>new Array(GameLogic.BOARD_SIZE).fill(BOARD_CELL.EMPTY));
    }

    public gameWon():number{
        return /.*XXXXX.*/.test(this.getRows())
            || /.*XXXXX.*/.test(this.getCols())
            || /.*XXXXX.*/.test(this.getDiagonals(false))
            || /.*XXXXX.*/.test(this.getDiagonals(true))
        ? 1 :  /.*OOOOO.*/.test(this.getRows())
            || /.*OOOOO.*/.test(this.getCols())
            || /.*OOOOO.*/.test(this.getDiagonals(false))
            || /.*OOOOO.*/.test(this.getDiagonals(true))
        ? 2: this.isFull() ? 3 : 0;
    }

    public getPieceAt(x:number, y:number):BOARD_CELL{return this.board[x][y];}
    public hasPieceAt(x:number, y:number):boolean{return this.board[x][y] != BOARD_CELL.EMPTY;}
    public setPieceAt(o:ComputerOpponent,x:number, y:number, val:BOARD_CELL){if(o == this.opponent) this.board[x][y] = val;}
    public isEmpty():boolean{
        for(let i of this.board) for(let j of i) if(j !=  BOARD_CELL.EMPTY) return false;
        return true;
    }
    public isFull():boolean{
        for(let i of this.board) for(let j of i) if(j == BOARD_CELL.EMPTY) return false;
        return true;
    }

    private static m = new Map<BOARD_CELL,string>([[BOARD_CELL.EMPTY,"_"],[BOARD_CELL.PLAYER,"X"],[BOARD_CELL.OPPONENT,"O"]]);

	public getDiagonals(direction:boolean):string{
		let res = "",i:number,j:number,x:number,y:number,l = GameLogic.BOARD_SIZE;
		for (i = l - 1; i > 0; i--) {
			for (j = 0, x = i; x < l; j++, x++)
				res += GameLogic.m.get(this.board[direction ? l - x - 1 : x][j]);
			res += "|";
		}
		for (i = 0; i < l; i++) {
			for (j = 0, y = i; y < l; j++, y++)
				res += GameLogic.m.get(this.board[direction ? l - j - 1 : j][y]);
			res += "|";
		}
		return res;
	}
	public getRows():string{
		let res = "",i:number,j:number,l = GameLogic.BOARD_SIZE;
		for(i = 0; i < l; i++){
			for(j = 0; j < l; j++) res += GameLogic.m.get(this.board[i][j]);
			res += '|';
		}
		return res.toString();
	}
	public getCols():string{
		let res = "",i:number,j:number,l = GameLogic.BOARD_SIZE;
		for(i = 0; i < l; i++){
			for(j = 0; j < l; j++) res += GameLogic.m.get(this.board[j][i]);
			res += '|';
		}
		return res;
	}
}
class ComputerOpponent{
    private logic:GameLogic;

    static SCORING_MAP = new Map<RegExp,number>([
        //Guaranteed win for computer immediately
            [/OOOOO/g, 1000000000],
        //Guaranteed win for player in 1 moves
            [/XXXX_/g, -100000000],
            [/XXX_X/g, -100000000],
            [/XX_XX/g, -100000000],
            [/X_XXX/g, -100000000],
            [/_XXXX/g, -100000000],
        //Guaranteed win for computer in 2 moves
            [/_OOOO_/g,  20000000],
        //Possible win for computer in 2 moves
            [/OOO_O/g, 10000000],
            [/OO_OO/g, 10000000],
            [/O_OOO/g, 10000000],
            [/_OOOO/g, 10000000],
        //Possible win for player in 3 moves
            [/_XXX__/g,-1000000],
            [/__XXX_/g,-1000000],
            [/_XX_X_/g,-1000000],
            [/_X_XX_/g,-1000000],
            [/_XXX_/g,-500000],
        //Possible win for computer in 4 moves
            [/_OOO__/g, 100000],
            [/__OOO_/g, 100000],
            [/_OO_O_/g, 100000],
            [/_O_OO_/g, 100000],
            [/_OOO_/g, 50000],
        //Good moves for computer
            [/__OO__/g, 1200],
            [/_OO__/g, 1000],
            [/__OO_/g, 1000],
            [/XXO_/g, 500],
            [/_OXX/g, 500],
        //Barely disatvantageous situations for computer
            [/__XX_/g, -1100],
            [/_XX__/g, -1100],
            [/OXO/g, -100],
        //Don't go in random places
            [/OX/g, 1],
            [/XO/g, 1]
    ]);
    
    constructor(logic:GameLogic){this.logic = logic}

    move():void{
        const l = GameLogic.BOARD_SIZE;

		//If board is empty, go in middle space
		if(this.logic.isEmpty()){
			this.logic.setPieceAt(this, l / 2, l / 2, BOARD_CELL.OPPONENT); return;
		}

		//Store best moves & score so far
		let bestMoves:Pair<number,number>[] = [];
		let bestScore = Number.NEGATIVE_INFINITY;

		//For every empty space on the board
		for(let i = 0; i < l; i++) for(let j = 0; j < l; j++){
			if(this.logic.hasPieceAt(i, j)) continue;

			//Set the space to 2 for now
			this.logic.setPieceAt(this, i, j, BOARD_CELL.OPPONENT);

			//See how advantageous the board is
			let score = this.score();

			//If it is better than the current best board(s), set it to the new best board
			if(score > bestScore){
				bestMoves = [new Pair<number,number>(i,j)];
				bestScore = score;
			}
			//Otherwise, if it's just as good as the best board(s), add it the set of best boards
			else if(score == bestScore) bestMoves.push(new Pair<number,number>(i,j));

			//Reset the space to 0
			this.logic.setPieceAt(this, i, j, BOARD_CELL.EMPTY);
		}

		//Find a random move out of the best moves
		var move = bestMoves[~~(Math.random() * bestMoves.length)];

		//Carry out the move
		this.logic.setPieceAt(this, move.first, move.second, BOARD_CELL.OPPONENT);
	}

	//Find out how advantageous a given board configuration is
    public score():number{
		let score = 0;
		//All rows/columns/diagonals of the board, converted to a string and joined with '|'s
		let s:string = this.logic.getRows() + this.logic.getCols() + this.logic.getDiagonals(true) + this.logic.getDiagonals(false);
		//For each regex
		for(let a of ComputerOpponent.SCORING_MAP.entries()){
			//Multiply by score per match * number of matches
			score += (s.match(a[0]) || {length:0}).length * a[1];
		}
		//Return total score
		return score;
    }
}

new GameDisplay();
