class Example extends Phaser.Scene
{
    preload ()
    {
        this.load.image('bg0', 'res/bahmut.jpg');
        this.load.image('bg1', 'res/dnepr.jpg');
        this.load.image('splash1', 'res/over.png');
        this.load.image('splash2', 'res/win.jpg');
        this.load.image('player', 'res/player.png');
        this.load.image('road', 'res/road.png');
        this.load.image('mine', 'res/tmka.png');
        this.load.image('lancet', 'res/lancet.png');
        this.load.spritesheet({
            key: 'expl',
            url: 'res/explosion.png',
            frameConfig: {
                frameWidth: 64,
                frameHeight: 64,
                startFrame: 0,
                endFrame: 15
            }
        });
        this.load.audio('win', 'res/sfx_win.mp3')
        this.load.audio('lose', 'res/sfx_lose.mp3')
        this.load.audio('jump', 'res/sfx_jump.mp3')
    }

    create ()
    {
        this.graphics = this.add.graphics();
        this.gameState = 'play'
        this.bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg0');
        this.bg.setDisplaySize(this.scale.width, this.scale.height);
        this.bg1 = this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg1');
        this.bg1.setDisplaySize(this.scale.width, this.scale.height);
        this.bg1.visible = false
        this.road = []
        this.mines = []
        this.currentFly = null
        this.roadSprSize = 128
        this.spawnDelay = 2000
        this.chanceMineSpawn = 2
        this.chanceLancetSpawn = 6
        this.objMoveSpeed = 12
        this.explObject = null
        this.kmDoDurki = 100
        this.kmDoDurkiLeft = this.kmDoDurki
        this.durkaText = this.add.text(10, 10, 
            '', 
            { fontFamily: 'Arial', fontSize: 64, color: '#00ff00' });
        for (let i = 0; i < 8; i++) {
            let roadPiece = this.add.sprite(this.roadSprSize * i, 0, 'road');
            roadPiece.setScale(2)
            console.log(this.scale.height)
            roadPiece.y = this.scale.height - roadPiece.displayHeight/4
            this.road.push(roadPiece)
        }

        this.player = new Player(this, 0, 0, {key: 'player'});
        this.player.setScale(2)
        this.player.x = this.player.displayWidth/2
        this.player.y = this.scale.height - this.player.displayHeight

        this.splashLose = this.add.image(this.scale.width / 2, this.scale.height / 2, 'splash1');
        this.splashLose.setDisplaySize(this.scale.width, this.scale.height);
        this.splashLose.visible = false

        this.splashWin = this.add.image(this.scale.width / 2, this.scale.height / 2, 'splash2');
        this.splashWin.setDisplaySize(this.scale.width, this.scale.height);
        this.splashWin.visible = false

        this.sound.unlock();

        this.handleTimer = this.time.delayedCall(this.spawnDelay, this.repeatCallback, [], this);

        this.scale.on('resize', this.resize, this);

        this.input.on('pointerdown', function (pointer)
        {
            this.sound.unlock();

            var touchX = pointer.x;
            var touchY = pointer.y;
            console.log('touch', touchX, touchY)

            if(this.gameState == 'losescreen'){
                this.restartGame()
                return
            }
            
            if(touchY >= this.player.y - this.player.displayHeight){
                if(this.player.jumpState == 'ground') this.sound.play('jump');
                this.player.jump()
            }

            if(this.currentFly != null){
                if(Math.abs(this.currentFly.x - touchX) <= this.currentFly.displayHeight/2){
                    console.log("Del fly")
                    this.makeExplosion(this.currentFly.x, this.currentFly.y)
                    this.currentFly.destroy()
                    this.currentFly = null
                } 
            }

        }, this);

        
    }

    repeatCallback() {
        if(this.gameState != 'play'){
            this.splashLose.visible = true
            this.gameState = 'losescreen'
            return
        }

        this.kmDoDurkiLeft -= 1
        if(this.kmDoDurkiLeft < this.kmDoDurki/2 & !this.bg1.visible)
            this.bg1.visible = true
        else if(this.kmDoDurkiLeft <= 0){
            this.gameOver('win')
            this.gameState = 'win'
            this.splashWin.visible = true
            return
        }

        let chanceMine = Math.floor(Math.random() * this.chanceMineSpawn)
        if(chanceMine == 0){
            let mine = this.add.sprite(0, 0, 'mine');
            mine.x = this.scale.width + mine.displayWidth
            mine.y = this.scale.height -  mine.displayWidth - mine.displayWidth/2
            this.mines.push(mine)
            console.log('Mine spawned')
        }

        let chanceLancet = Math.floor(Math.random() * this.chanceLancetSpawn)
        if(chanceLancet == 0 && this.currentFly == null){
            let fly = this.add.sprite(0, 0, 'lancet');
            fly.x = this.scale.width + fly.displayWidth
            fly.y = this.scale.width * (Math.floor(Math.random() * 5)/100)
            this.currentFly = fly
            console.log('Lancet spawned')
        }

        this.handleTimer = this.time.delayedCall(this.spawnDelay, this.repeatCallback, [], this);
    }

    resize (gameSize, baseSize, displaySize, resolution)
    {
        const width = gameSize.width;
        const height = gameSize.height;

        this.cameras.resize(width, height);
    }

    update ()
    {   
        if(this.gameState != 'play') return

        this.road.forEach(roadPiece => {
            roadPiece.x -= this.objMoveSpeed
        });
        if(this.road[1].x <= 0){
            for (let i = 0; i < this.road.length; i++) {
                this.road[i].x = this.roadSprSize * i
            }
        }

        let bPlayer = this.player.getBounds()
        this.mines.forEach(mine => {
            mine.x -= this.objMoveSpeed
            let bMine = mine.getBounds()
            bMine.y += mine.displayHeight/2
            if(Phaser.Geom.Intersects.RectangleToRectangle(bMine, bPlayer)){
                this.makeExplosion(mine.x, mine.y)
                this.gameOver('lose')
            }
            if(mine.x <= 0){ 
                mine.destroy() 
                this.mines.shift()
            }
        });
       

        if(this.currentFly != null){
            this.currentFly.angle = -30
            if(this.currentFly.x > this.player.x)
                this.currentFly.x -= this.objMoveSpeed/3.5
            if(this.currentFly.y < this.player.y)
                this.currentFly.y += this.objMoveSpeed/2

            let bFly = this.currentFly.getBounds()
            if(Phaser.Geom.Intersects.RectangleToRectangle(bFly, bPlayer)){
                console.log('GameOver: Fly')
                this.makeExplosion(this.currentFly.x, this.currentFly.y)
                this.gameOver('lose')
            }
        }

        this.durkaText.setText('Do durki ' + this.kmDoDurkiLeft + ' km.');


    }

    gameOver(sound){
        this.sound.play(sound);
        this.gameState = 'over'
        if(this.currentFly != null) this.currentFly.destroy()
        this.currentFly = null
        for (let i = 0; i < this.mines.length; i++) {
            this.mines[i].destroy() 
        }
        this.mines = []
    }

    restartGame(){
        this.splashLose.visible = false
        this.bg.visible = true
        this.bg1.visible = false
        this.kmDoDurkiLeft = this.kmDoDurki
        this.currentFly = null
        this.mines = []
        this.gameState = 'play'
        this.handleTimer = this.time.delayedCall(this.spawnDelay, this.repeatCallback, [], this);

    }

    makeExplosion(x, y){
        const mummyAnimation = this.anims.create({
            key: 'exanim',
            frames: this.anims.generateFrameNumbers('expl'),
            frameRate: 16
        });
        if(this.explObject != null)
            this.explObject.destroy()
        this.explObject = this.add.sprite(x, y, 'expl').setScale(4);
        this.explObject.play({ key: 'exanim', repeat: 0 });
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: 'rgb(255, 0, 00)',
    audio: {
		disableWebAudio: true
	},
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 1280
    },
    scene: Example
};

console.log(Phaser.Scale)
const game = new Phaser.Game(config);