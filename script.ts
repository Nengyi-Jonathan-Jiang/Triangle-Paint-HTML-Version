const SQRT_3_2 = 0.86602540378;

class Edge{
    public x1:number;
    public y1:number;
    public x2:number;
    public y2:number;
    public ex:number;
    public ey:number;
    constructor(x1:number, y1:number,x2:number, y2:number, ex:number, ey:number){
        this.x1 = x1; this.x2 = x2; this.y1 = y1; this.y2 = y2; this.ex = ex; this.ey = ey;
    }
}

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
    private currColor = 0;
    private canvas:Canvas;
    private showGrid:boolean;

    private lastMouseX = -1;
    private lastMouseY = -1;
    private mouseX = 0;
    private mouseY = 0;

    private triangleData:number[][] = new Array(this.SIZE).fill([]).map(i=>new Array(this.SIZE * 2).fill(0));
    private edgeData:boolean[][] = new Array(this.SIZE).fill([]).map(i=>new Array(this.SIZE * 3).fill(0));

    constructor(){
        this.canvas = new Canvas(0, 0, document.body);
        this.canvas.canvas.addEventListener("mousedown",(e:MouseEvent)=>this.onMouseDown(e.clientX,e.clientY,e.button,e.ctrlKey))
		this.canvas.canvas.addEventListener("mouseup"  ,(e:MouseEvent)=>this.onMouseUp(e.clientX,e.clientY));
		this.canvas.canvas.addEventListener("mousemove",(e:MouseEvent)=>this.onMouseMove(e.clientX,e.clientY,e.ctrlKey));
		this.canvas.canvas.addEventListener("wheel"    ,(e:WheelEvent)=>this.onMouseWheel(e.deltaY));
        window.addEventListener("keypress",(e:KeyboardEvent)=>this.onKeyPressed(e.keyCode));
        window.addEventListener("resize",_=>this.canvas.resizeToWindow());
        Canvas.createAnimation((...args)=>this.paint(...args));
    }

    public paint(currTime:number,elapsedTime:number):void {
        const {COLORS,SIZE,showGrid,scale,canvas,edgeData,triangleData,mouseX,mouseY,currState,currColor,fillTriAt,drawEdge} = this;

        const blinking = ((~~(currTime * 15)) & 3) != 0 && this.showGrid;

        if(showGrid){
            canvas.setStrokeColor("rgb(200,200,200)");
            for(let i = 0; i <= SIZE; i++){
                canvas.line(~~(i * scale * SQRT_3_2), 0, ~~(i * scale * SQRT_3_2), ~~(SIZE * scale));
            }
            for(let i = 0; i <= SIZE * 3 / 2; i++){
                canvas.line(0, ~~(i * scale), ~~(SIZE * scale * SQRT_3_2), ~~((i - SIZE / 2) * scale));
                canvas.line(0, ~~((i - SIZE / 2) * scale), ~~(SIZE * scale * SQRT_3_2), ~~(i * scale));
            }
            canvas.setFillColor("#FFF");
            canvas.fillRect(0,~~(SIZE * scale),~~(SIZE * scale * SQRT_3_2),~~(SIZE / 2 * scale));
            for(let i = 0; i < SIZE; i += 2) canvas.fillPolygon([0,0],[
                [~~((i) * scale * SQRT_3_2) + 1, ~~((SIZE - 1) * scale) + 1],
                [~~((i) * scale * SQRT_3_2) + 1, ~~(SIZE * scale) + 1],
                [~~((i + 2) * scale * SQRT_3_2) - 1,~~(SIZE * scale) + 1],
            ]);
        }

        //Draw filled triangles (or triangle outlines)
        for(let i = 0; i < SIZE; i++){
            let x1 = ~~((i - 1.) * scale), x2 = ~~((i - .5) * scale),
                x3 = ~~((i + 0.) * scale), x4 = ~~((i + .5) * scale),
                x5 = ~~((i + 1.) * scale);
            for(let j = 0; j < SIZE * 2; j++){
                let y1 = ~~((j >> 1) * scale * SQRT_3_2), y2 = ~~(((j >> 1) + 1) * scale * SQRT_3_2);

                if(i == mouseX && j == mouseY && blinking){ //cell is hovered over
                    if(blinking && currState != STATES.ERASING){
                        canvas.setFillColor(COLORS[currColor]);
                        fillTriAt(x1,x2,x3,x4,x5,y1,y2,j);
                    }
                }
                else if(triangleData[i][j] > 0){   //cell has color
                    canvas.setFillColor(COLORS[triangleData[i][j] - 1]);
                    fillTriAt(x1,x2,x3,x4,x5,y1,y2,j);
                }
            }
        }

        //Draw edges
        canvas.setStrokeColor("#000");
        for(let i = 0; i < SIZE; i++){
            let x1 = ~~((i - 1.) * scale), x2 = ~~((i - .5) * scale),
                x3 = ~~((i + 0.) * scale), x4 = ~~((i + .5) * scale);
            for(let j = 0; j < SIZE * 3; j++){
                let y1 = ~~((j / 3) * scale * SQRT_3_2), y2 = ~~((j / 3 + 1) * scale * SQRT_3_2);
                if(edgeData[i][j]) drawEdge(x1,x2,x3,x4,y1,y2,j);
            }
        }
    }

    private fillTriAt(x1:number, x2:number, x3:number, x4:number, x5:number, y1:number, y2:number, j:number):void{
        switch(j & 3){
            case 0:
                this.canvas.fillPolygon([0,0],[[y1,x1],[y2,x2],[y1,x3]]); break;
            case 1:
                this.canvas.fillPolygon([0,0],[[y2,x2],[y1,x3],[y2,x4]]); break;
            case 2:
                this.canvas.fillPolygon([0,0],[[y1,x2],[y2,x3],[y1,x4]]); break;
            case 3:
                this.canvas.fillPolygon([0,0],[[y2,x3],[y1,x4],[y2,x5]]); break;
        }
    }
    public getAdjacentEdges(x:number, y:number):Edge[]{
        let y_ = (y >> 2) * 6;
        switch(y & 3){
            case 0:
                return [
                    new Edge(x,y,x - 1, y + 1, x + 0, y_ + 1),
                    new Edge(x,y,x - 1, y - 1, x + 0, y_ + 0),
                    new Edge(x,y,x + 0, y + 1, x + 0, y_ + 2),
                ];
            case 1:
                return [
                    new Edge(x,y,x + 0, y + 1, x + 0, y_ + 3),
                    new Edge(x,y,x + 0, y - 1, x + 0, y_ + 2),
                    new Edge(x,y,x + 1, y - 1, x + 1, y_ + 1),
                ];
            case 2:
                return [
                    new Edge(x,y,x + 0, y - 1, x + 0, y_ + 3),
                    new Edge(x,y,x - 1, y + 1, x + 0, y_ + 4),
                    new Edge(x,y,x + 0, y + 1, x + 0, y_ + 5),
                ];
            case 3:
                return [
                    new Edge(x,y,x + 1, y - 1, x + 1, y_ + 4),
                    new Edge(x,y,x + 0, y - 1, x + 0, y_ + 5),
                    new Edge(x,y,x + 1, y + 1, x + 1, y_ + 6),
                ];
            default: return [];
        }
    }

    public drawEdge(x1:number, x2:number, x3:number, x4:number, y1:number, y2:number, j:number):void{
        switch(j % 6){
            case 0:
                this.canvas.line(y1,x1,y1,x3); break;
            case 1:
                this.canvas.line(y1,x1,y2,x2); break;
            case 2:
                this.canvas.line(y2,x2,y1,x3); break;
            case 3:
                this.canvas.line(y1,x2,y1,x4); break;
            case 4:
                this.canvas.line(y1,x2,y2,x3); break;
            case 5:
                this.canvas.line(y2,x3,y1,x4); break;
            default: break;
        }
    }

    private drawBlendedEdge(){
        const {mouseX,mouseY,currColor} = this;
        this.triangleData[mouseX][mouseY] = currColor + 1;
        for(let e of this.getAdjacentEdges(mouseX, mouseY)){
            this.edgeData[e.ex][e.ey] = this.triangleData[e.x2][e.y2] != currColor + 1;
        }
    }
    private drawNormal(){
        const {lastMouseX,lastMouseY,mouseX,mouseY,currColor} = this;
        this.triangleData[mouseX][mouseY] = currColor + 1;
        if(mouseX != lastMouseX || mouseY != lastMouseY){
            for(let e of this.getAdjacentEdges(mouseX, mouseY)){
                this.edgeData[e.ex][e.ey] = e.x2 != lastMouseX || e.y2 != lastMouseY;
            }
        }
    }

    private erase(){
        const {mouseX,mouseY,currColor} = this;
        this.triangleData[mouseX][mouseY] = 0;
        for(let e of this.getAdjacentEdges(mouseX, mouseY)){
            this.edgeData[e.ex][e.ey] = this.triangleData[e.x1][e.y1] + this.triangleData[e.x2][e.y2] != 0;
        }
    }

    public onKeyPressed(keyCode:number):void{
        switch(keyCode){
            case 187:
                this.scale *= 1.01;
                break;
            case 189:
                this.scale *= 0.99;
                break;
            case 49: case 50: case 51:
            case 52: case 53: case 54:
            case 55: case 56: case 57:
                this.currColor = keyCode - 49; break;
            case 82:
                for(let i : this.edgeData) for(let j = 0; j < i.length; j++) i[j] = false;
                for(let i : this.triangleData) for(let j = 0; j < i.length; j++) i[j] = 0;
                break;
            case 86:
                this.showGrid = !this.showGrid; break;
            
            default:break;
        }
    }

    public onMouseDown(x:number, y:number, b:number, ctrlKey:boolean) {
        switch(b){
            case 0:
                this.currState = STATES.DRAW_BLENDED_EDGE;
                this.onMouseMove(x,y,ctrlKey);
                break;
            case 1: break;
            case 2:
                this.currState = STATES.ERASING;
                this.onMouseMove(x,y,ctrlKey);
                break;
        }
    }
    public onMouseUp(x:number, y:number) {
        this.currState = STATES.IDLE;
        this.lastMouseX = this.lastMouseY = -1;
    }
    public onMouseMove(x:number, y:number, ctrlKey:boolean) {

        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;

        let Y = x / this.scale / SQRT_3_2, X = y / this.scale - 0.5 * (Y % 2) + 1;
        this.mouseX = ~~X;
        this.mouseY = 2 * ~~Y + ((X % 1) + (Y % 1) >= 1 ? 1 : 0);

        switch(this.currState){
            case STATES.IDLE: break;
            case STATES.DRAW_BLENDED_EDGE:
                this.drawBlendedEdge();
                if(!ctrlKey) this.currState = STATES.DRAWING;
                break;
            case STATES.DRAWING:
                this.drawNormal();
                if(ctrlKey) this.currState = STATES.DRAW_BLENDED_EDGE;
                break;
            case STATES.ERASING:
                this.erase();
                break;
        }
    }
    public onMouseWheel(d:number) {
        this.scale *= 1 - d * .0004;
    }
    
}

new GameDisplay();
