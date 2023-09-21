class Object{

    constructor(sprite, vec2pos){
        this.pos = vec2pos
        this.sprite = sprite
        this.sprSize = null
        this.resizeFactor = 1
        console.log('Object', vec2pos, this.pos)     
    }

    setPos(vec2pos){
        this.pos = vec2pos
    }

    getPos(){
        return this.pos
    }

    setResizeFactor(factor){
        if(factor == 0) throw new Error('Resize factor can not be 0!');
        this.resizeFactor = factor
        this.sprSize = null
    }

    move(vec2move){
        this.pos = {x: this.pos.x + vec2move.x, y: this.pos.y + vec2move.y}
    }

    getSpriteSize(ctx){
        let screenSize = ctx.canvas.clientWidth;
        if(screenSize < ctx.canvas.clientHeight) 
            screenSize = ctx.canvas.clientHeight;

        let baseSize = Math.floor(screenSize/5)    
        let ret = Math.floor(baseSize/2) * 2
        if(this.resizeFactor < 0)
            ret = Math.floor(ret / Math.abs(this.resizeFactor))
        else
            ret = Math.floor(ret * Math.abs(this.resizeFactor))

        return ret
    }

    draw(ctx){
        if(this.sprSize == null)
            this.sprSize = this.getSpriteSize(ctx)
        ctx.drawImage(this.sprite, this.pos.x, this.pos.y, this.sprSize, this.sprSize);
    }
}