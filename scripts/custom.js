class Player extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, config) {
        super(scene, x, y, config.key)
        this.jumpState = 'ground'
        this.jumpStartY = y
        this.scene = scene
        this.upSpeed = 24
        this.scene.add.existing(this)
    }

    preUpdate (time, delta) {
        super.preUpdate(time, delta)

        if(this.jumpState == 'up')
            this.y -= this.upSpeed
        else if(this.jumpState == 'down')
            this.y += this.upSpeed/2

        if(this.jumpState == 'up' & this.y <= this.jumpStartY-this.displayHeight*2)
            this.jumpState = 'down'

        if(this.jumpState == 'down' & this.y >= this.jumpStartY){
            this.y = this.jumpStartY
            this.jumpState = 'ground'
        }
    }

    jump(){
        if(this.jumpState == 'ground'){
            this.jumpStartY = this.y
            this.jumpState = 'up'
        }
    }

}