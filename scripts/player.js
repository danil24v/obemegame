class Player extends Object{

    constructor(sprite, vec2pos){
        console.log('Player', vec2pos)
        super(sprite, vec2pos)
        this.timer = null
        this.jumpState = 'ground'
        this.groundPosY = null
    }

    timerJump(pInst){
        let velUp = -35
        let velDown = 8
        let sprSize = 0
        if(pInst.sprSize != null) sprSize = pInst.sprSize
        let jumpHeight = pInst.groundPosY-sprSize*1.4

        if(pInst.jumpState == 'up')
            pInst.move({x: 0, y: velUp})
        else
            pInst.move({x: 0, y: velDown})

        if(pInst.jumpState == 'up' & pInst.getPos().y < jumpHeight){
            pInst.jumpState = 'down'
        } 
        else if(pInst.jumpState == 'down' & pInst.getPos().y >= pInst.groundPosY){
            pInst.jumpState = 'ground'
            pInst.setPos({x: pInst.getPos().x, y: pInst.groundPosY})
            console.log('Grounded')
            clearInterval(pInst.timer)
        }

    }

    jump(){
        if(this.jumpState == 'ground'){
            this.jumpState = 'up'
            this.groundPosY = this.getPos().y
            console.log("Jump")
            this.isJumping = true
            this.timerJump(this)
            this.timer = setInterval(this.timerJump, 10, this);
        }
    }

}