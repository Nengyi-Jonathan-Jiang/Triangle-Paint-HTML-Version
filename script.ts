const SQRT_3_2 = 0.86602540378;

enum STATES{IDLE, DRAWING, ERASING, DRAW_BLENDED_EDGE};
class GameDisplay{
    private currState:STATES = STATES.IDLE;
    private SIZE = 64;
    private scale:number = 33.3;
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
    private showGrid:boolean;

    constructor(){
        this.canvas = new Canvas(0, 0, document.body);
        this.canvas.canvas.addEventListener("mousedown",(e:MouseEvent)=>this.onMouseDown(e.clientX,e.clientY))
		this.canvas.canvas.addEventListener("mouseup"  ,(e:MouseEvent)=>this.onMouseUp(e.clientX,e.clientY));
		this.canvas.canvas.addEventListener("mousemove",(e:MouseEvent)=>this.onMouseDown(e.clientX,e.clientY));
		this.canvas.canvas.addEventListener("wheel"    ,(e:WheelEvent)=>this.onMouseWheel(e.deltaY));
        window.addEventListener("keypress",(e:KeyboardEvent)=>this.onKeyPressed(e.keyCode));
        window.addEventListener("resize",_=>this.canvas.resizeToWindow());
        Canvas.createAnimation((...args)=>this.paint(...args));
    }

    public paint(currTime:number,elapsedTime:number):void {
        const blinking = ((~~(currTime * 15)) & 3) != 0 && this.showGrid;

        if(this.showGrid){
            this.canvas.setStrokeColor("rgb(200,200,200)");
            for(let i = 0; i <= this.SIZE; i++){
                this.canvas.line(~~(i * this.scale * SQRT_3_2), 0, ~~(i * this.scale * SQRT_3_2), ~~(this.SIZE * this.scale));
            }
            for(let i = 0; i <= this.SIZE * 3 / 2; i++){
                this.canvas.line(0, ~~(i * this.scale), ~~(this.SIZE * this.scale * SQRT_3_2), ~~((i - this.SIZE / 2) * this.scale));
                this.canvas.line(0, ~~((i - this.SIZE / 2) * this.scale), ~~(this.SIZE * this.scale * SQRT_3_2), ~~(i * this.scale));
            }
            this.canvas.setFillColor("#FFF");
            this.canvas.fillRect(0,~~(this.SIZE * this.scale),~~(this.SIZE * this.scale * SQRT_3_2),~~(this.SIZE / 2 * this.scale));
            for(let i = 0; i < this.SIZE; i += 2) this.canvas.fillPolygon([0,0],[
                [~~((i) * this.scale * SQRT_3_2) + 1, ~~((this.SIZE - 1) * this.scale) + 1],
                [~~((i) * this.scale * SQRT_3_2) + 1, ~~(this.SIZE * this.scale) + 1],
                [~~((i + 2) * this.scale * SQRT_3_2) - 1,~~(this.SIZE * this.scale) + 1],
            ]);
        }

        // //Draw filled triangles (or triangle outlines)
        // for(let i = 0; i < this.SIZE; i++){
        //     let x1 = ~~((i - 1.) * scale), x2 = ~~((i - .5) * scale),
        //         x3 = ~~((i + 0.) * scale), x4 = ~~((i + .5) * scale),
        //         x5 = ~~((i + 1.) * scale);
        //     for(let j = 0; j < this.SIZE * 2; j++){
        //         let y1 = ~~((j / 2) * scale * SQRT_3_2), y2 = ~~((j / 2 + 1) * scale * SQRT_3_2);

        //         if(i == mouseX && j == mouseY && blinking){ //cell is hovered over
        //             if(blinking && currState != States.ERASING){
        //                 g.setColor(COLORS[this.currColor]);
        //                 fillTriAt(g,x1,x2,x3,x4,x5,y1,y2,j);
        //             }
        //         }
        //         else if(triangleData[i][j] > 0){   //cell has color
        //             g.setColor(COLORS[triangleData[i][j] - 1]);
        //             fillTriAt(g,x1,x2,x3,x4,x5,y1,y2,j);
        //         }
        //     }
        // }

        // //Draw edges
        // g.setColor(Color.BLACK);
        // for(let i = 0; i < this.SIZE; i++){
        //     let x1 = ~~((i - 1.) * scale), x2 = ~~((i - .5) * scale),
        //         x3 = ~~((i + 0.) * scale), x4 = ~~((i + .5) * scale);
        //     for(let j = 0; j < this.SIZE * 3; j++){
        //         let y1 = ~~((j / 3) * scale * SQRT_3_2), y2 = ~~((j / 3 + 1) * scale * SQRT_3_2);
        //         if(edgeData[i][j]) drawEdge(g,x1,x2,x3,x4,y1,y2,j);
        //     }
        // }
    }

    // private void fillTriAt(Graphics2D g, x1:number, let x2, let x3, let x4, let x5, let y1, let y2, let j){
    //     switch(j & 3){
    //         case 0:
    //             g.fillPolygon(new let[]{y1,y2,y1}, new let[]{x1,x2,x3}, 3);
    //             break;
    //         case 1:
    //             g.fillPolygon(new let[]{y2,y1,y2}, new let[]{x2,x3,x4}, 3);
    //             break;
    //         case 2:
    //             g.fillPolygon(new let[]{y1,y2,y1}, new let[]{x2,x3,x4}, 3);
    //             break;
    //         case 3:
    //             g.fillPolygon(new let[]{y2,y1,y2}, new let[]{x3,x4,x5}, 3);
    //             break;
    //         default: break;
    //     }
    // }

    // public static class Edge{
    //     public let x1,y1,x2,y2,ex,ey;
    //     public Edge(let x1,let y1,let x2,let y2,let ex,let ey){
    //         this.x1 = x1; this.x2 = x2;
    //         this.y1 = y1; this.y2 = y2;
    //         this.ex = ex; this.ey = ey;
    //     }
    // }
    // public Edge[] getAdjacentEdges(let x, let y){
    //     let y_ = (y >> 2) * 6;
    //     switch(y & 3){
    //         case 0:
    //             return new Edge[]{
    //                 new Edge(x,y,x - 1, y + 1, x + 0, y_ + 1),
    //                 new Edge(x,y,x - 1, y - 1, x + 0, y_ + 0),
    //                 new Edge(x,y,x + 0, y + 1, x + 0, y_ + 2),
    //             };
    //         case 1:
    //             return new Edge[]{
    //                 new Edge(x,y,x + 0, y + 1, x + 0, y_ + 3),
    //                 new Edge(x,y,x + 0, y - 1, x + 0, y_ + 2),
    //                 new Edge(x,y,x + 1, y - 1, x + 1, y_ + 1),
    //             };
    //         case 2:
    //             return new Edge[]{
    //                 new Edge(x,y,x + 0, y - 1, x + 0, y_ + 3),
    //                 new Edge(x,y,x - 1, y + 1, x + 0, y_ + 4),
    //                 new Edge(x,y,x + 0, y + 1, x + 0, y_ + 5),
    //             };
    //         case 3:
    //             return new Edge[]{
    //                 new Edge(x,y,x + 1, y - 1, x + 1, y_ + 4),
    //                 new Edge(x,y,x + 0, y - 1, x + 0, y_ + 5),
    //                 new Edge(x,y,x + 1, y + 1, x + 1, y_ + 6),
    //             };
    //         default: return new Edge[]{};
    //     }
    // }
    // public void drawEdge(Graphics2D g, let x1, let x2, let x3, let x4, let y1, let y2, let j){
    //     switch(j % 6){
    //         case 0:
    //             g.drawLine(y1,x1,y1,x3);
    //             break;
    //         case 1:
    //             g.drawLine(y1,x1,y2,x2);
    //             break;
    //         case 2:
    //             g.drawLine(y2,x2,y1,x3);
    //             break;
    //         case 3:
    //             g.drawLine(y1,x2,y1,x4);
    //             break;
    //         case 4:
    //             g.drawLine(y1,x2,y2,x3);
    //             break;
    //         case 5:
    //             g.drawLine(y2,x3,y1,x4);
    //             break;
    //         default: break;
    //     }
    // }

    // //#region MouseObserver interface implementations

    // @Override
    // public void onMouseMove(let x, let y) {
    //     lastMouseX = mouseX;
    //     lastMouseY = mouseY;

    //     double Y = x / scale / SQRT_3_2, X = y / scale - 0.5 * (Y % 2) + 1;
    //     mouseX = ~~X;
    //     mouseY = 2 * ~~Y + ((X % 1.0) + (Y % 1.0) >= 1 ? 1 : 0);

    //     switch(currState){
    //         case IDLE: break;
    //         case DRAW_BLENDED_EDGE:
    //             drawBlendedEdge();
    //             if(!keys.isKeyPressed(KeyEvent.VK_CONTROL)) currState = States.DRAWING;
    //             break;
    //         case DRAWING:
    //             drawNormal();
    //             if(keys.isKeyPressed(KeyEvent.VK_CONTROL)) currState = States.DRAW_BLENDED_EDGE;
    //             break;
    //         case ERASING:
    //             erase();
    //             break;
    //     }
    // }

    // //#region drawing functions
    // private void drawBlendedEdge(){
    //     triangleData[mouseX][mouseY] = currColor + 1;
    //     for(Edge e : getAdjacentEdges(mouseX, mouseY)){
    //         edgeData[e.ex][e.ey] = triangleData[e.x2][e.y2] != currColor + 1;
    //     }
    // }
    // private void drawNormal(){
    //     triangleData[mouseX][mouseY] = currColor + 1;
    //     if(mouseX != lastMouseX || mouseY != lastMouseY){
    //         for(Edge e : getAdjacentEdges(mouseX, mouseY)){
    //             edgeData[e.ex][e.ey] = e.x2 != lastMouseX || e.y2 != lastMouseY;
    //         }
    //     }
    // }

    // private void erase(){
    //     triangleData[mouseX][mouseY] = 0;
    //     for(Edge e : getAdjacentEdges(mouseX, mouseY)){
    //         edgeData[e.ex][e.ey] = triangleData[e.x1][e.y1] + triangleData[e.x2][e.y2] != 0;
    //     }
    // }
    // //#endregion

    // @Override
    // public void onMouseWheel(let wheelRotation) {
    //     scale *= 1. - .01 * wheelRotation;
    // }

    // @Override
    // public void onMouseClick(let x, let y, MyMouseListener.Button b) {}

    // @Override
    // public void onMouseDown(let x, let y, MyMouseListener.Button b) {
    //     switch(b){
    //         case LEFT_CLICK:
    //             currState = States.DRAW_BLENDED_EDGE;
    //             onMouseMove(x,y);
    //             break;
    //         case MIDDLE_CLICK: break;
    //         case RIGHT_CLICK:
    //             currState = States.ERASING;
    //             onMouseMove(x,y);
    //             break;
    //         case NO_CLICK: break;
    //     }
    // }
    
    // @Override
    // public void onMouseUp(let x, let y, MyMouseListener.Button b) {
    //     currState = States.IDLE;
    //     lastMouseX = lastMouseY = -1;
    // }

    // //#endregion

    // //#region KeyObserver interface implementations

    // @Override
    // public void onKeyPressed(let keyCode) {
    //     switch(keyCode){
    //         case KeyEvent.VK_EQUALS:
    //             scale *= 1.01;
    //             break;
    //         case KeyEvent.VK_MINUS:
    //             scale *= 0.99;
    //             break;
    //         case KeyEvent.VK_1:
    //             currColor = 0; break;
    //         case KeyEvent.VK_2:
    //             currColor = 1; break;
    //         case KeyEvent.VK_3:
    //             currColor = 2; break;
    //         case KeyEvent.VK_4:
    //             currColor = 3; break;
    //         case KeyEvent.VK_5:
    //             currColor = 4; break;
    //         case KeyEvent.VK_6:
    //             currColor = 5; break;
    //         case KeyEvent.VK_7:
    //             currColor = 6; break;
    //         case KeyEvent.VK_8:
    //             currColor = 7; break;
    //         case KeyEvent.VK_9:
    //             currColor = 8; break;
            
    //         case KeyEvent.VK_R:
    //             for(boolean[] i : edgeData) for(let j = 0; j < i.length; j++) i[j] = false;
    //             for(let[] i : triangleData) for(let j = 0; j < i.length; j++) i[j] = 0;
    //             break;
    //         case KeyEvent.VK_V:
    //             showGrid = !showGrid; break;
            
    //         default:break;
    //     }
    // }

    // @Override
    // public void onKeyReleased(let keyCode){}
    // @Override
    // public void onKeyTyped(let keyCode){}








    // //Called every time the display needs to update
    // public paint():void{

    //     //Recalculate dimensions
    //     const WIDTH = this.canvas.width, HEIGHT = this.canvas.height;
        
    //     //Paint board background
    //     this.canvas.clear("#EEE");
    //     //this.canvas.setFillColor("rgb(200,200,200)");
    //     //this.canvas.fillRect(LEFT_OFFSET, TOP_OFFSET, LEFT_OFFSET + this.SIZE, TOP_OFFSET + this.SIZE);

    //     // this.canvas.setDrawColor("#000");

    //     // //Draw grid
    //     // for(let i = 0; i <= BOARD_SIZE; i++){
    //     //     const offset =  i * this.SIZE / BOARD_SIZE;
    //     //     this.canvas.line(LEFT_OFFSET, TOP_OFFSET + offset, WIDTH - LEFT_OFFSET, TOP_OFFSET + offset);
    //     //     this.canvas.line(LEFT_OFFSET + offset, TOP_OFFSET, LEFT_OFFSET + offset, HEIGHT - TOP_OFFSET);
    //     // }

    //     // const PADDING = ~~(this.SIZE / BOARD_SIZE / 9);
    //     // //Draw pieces
    //     // for(let i = 0; i < GameLogic.BOARD_SIZE; i++){
    //     //     for(let j = 0; j < GameLogic.BOARD_SIZE; j++){
    //     //         const circleX = LEFT_OFFSET + i * this.SIZE / BOARD_SIZE;
    //     //         const circleY = TOP_OFFSET  + j * this.SIZE / BOARD_SIZE;
                
    //     //         switch(this.logic.getPieceAt(i, j)){
    //     //             case BOARD_CELL.PLAYER:
    //     //                 this.canvas.circle(circleX + PIECE_RAD, circleY + PIECE_RAD, PIECE_RAD - PADDING);
    //     //                 break;
    //     //             case BOARD_CELL.OPPONENT:
    //     //                 this.canvas.fillCircle(circleX + PIECE_RAD, circleY + PIECE_RAD, PIECE_RAD - PADDING);
    //     //                 break;
    //     //         }
    //     //     }
    //     // }
    // }

    public onKeyPressed(keyCode:number):void{
        
    }

    public onMouseDown(x:number, y:number) {
        
    }
    public onMouseUp(x:number, y:number) {
        
    }
    public onMouseMove(x:number, y:number) {
        
    }
    public onMouseWheel(d:number) {
        this.scale *= 1 - d * .0004;
    }
    
}

new GameDisplay();
