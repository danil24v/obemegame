class Fly extends Object{


    constructor(sprite, vec2pos, health){
        super(sprite, vec2pos)
        this.health = health
    }

    hit(){
        console.log('HIT')
        this.health -= 1
        this.move({x: 10, y: -50})
    }
}