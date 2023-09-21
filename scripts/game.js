canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const imgBackground = document.getElementById("img_bg0");
const imgBackground1 = document.getElementById("img_bg1");
const imgWin = document.getElementById("img_win");
const imgOver = document.getElementById("img_over");
const imgPlayer = document.getElementById("img_player");
const imgRoad = document.getElementById("img_road");
const imgLancet = document.getElementById("img_lancet");
const imgObsTmka = document.getElementById("img_tmka");
const sfxMusic = document.getElementById("sfx_music");
const sfxJump = document.getElementById("sfx_jump");
const sfxHit = document.getElementById("sfx_hit");
const sfxLose = document.getElementById("sfx_lose");
const sfxWin = document.getElementById("sfx_win");
var player = new Player(imgPlayer, {x: 0, y: 0})
var obsObjects = []
var flyes = []
var spawnChanceOneFrom = 4
var spawnChanceOneFromFly = 10
var respawnTimerIntervalMs = 800
var road = []
var roadTimerIntervalMs = 10
var roadTimer = null
var spawnerTimer = null

const kmPerRoadPiece = 2
const durkaDist = 241; //241
var currentDurkDist = durkaDist

const moveSpeed = 10
const flyHealth = 3
var gameState = 'play'

function resize_canvas(){
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(gameState == 'play' | gameState == 'over'){
        if(currentDurkDist < durkaDist/2)
            ctx.drawImage(imgBackground1, 0, 0, canvas.width*3, canvas.height);
        else
            ctx.drawImage(imgBackground, 0, 0, canvas.width*3, canvas.height);

        road.forEach(rPiece => {
            rPiece.draw(ctx)
        });

        flyes.forEach(fly => {
            fly.draw(ctx)
        });

        player.draw(ctx)
        obsObjects.forEach(obs => {
            obs.draw(ctx)
        });

        ctx.fillText("Do durki ostalos': " + currentDurkDist + " km.", 10, 50);
    }
    else if(gameState == 'end'){
        ctx.drawImage(imgOver, 0, 0, canvas.width, canvas.height);
        ctx.fillText("Game over, tap to replay...", 10, 50);
    }
    else if(gameState == 'win'){
        ctx.drawImage(imgWin, 0, 0, canvas.width, canvas.height);
        ctx.fillText("You win!!!", 10, 50);
    }
    else if(gameState == 'rotate'){
        ctx.fillText("Pereverni ekran v portretniy rejim i obnovi stranicu", 10, 50);
    }

    window.requestAnimationFrame(gameLoop);
}

function gameOver(){
    gameState = 'over'
    clearInterval(roadTimer)
    clearInterval(spawnerTimer)
    console.log('Game over')
    sfxLose.pause()
    sfxLose.currentTime = 0
    sfxLose.play()
}

function win(){
    clearInterval(roadTimer)
    clearInterval(spawnerTimer)
    gameState = 'win'
    console.log('Win')
    sfxWin.pause()
    sfxWin.currentTime = 0
    sfxWin.play()
}

function restartGame(){
    road = []
    obsObjects = []
    flyes = []
    currentDurkDist = durkaDist
    const sprSize = player.getSpriteSize(ctx)
    player.setPos({x: 0, y: canvas.height - sprSize - sprSize/2})
    const baseRoadPos = {x: sprSize, y: canvas.height - sprSize}
    for (let i = 0; i < 6; i++) {
        let roadPart = new Object(imgRoad, {x: baseRoadPos.x * i, y: baseRoadPos.y})
        road.push(roadPart)
    }
    roadTimer = setInterval(moveObjects, roadTimerIntervalMs, baseRoadPos);
    spawnerTimer = setInterval(spawnObjects, respawnTimerIntervalMs);
    gameState = 'play'
}

function handleClickEvent(canvas, event){
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    console.log('Click:', x, y)

    if(gameState == 'over') gameState = 'end'
    else if(gameState == 'end') restartGame()

    if(gameState != 'play') return
    let pPos = player.getPos()
    let sprSizeP = player.getSpriteSize(ctx)
    let diffX = Math.abs(pPos.x) - Math.abs(x)
    let diffY = y- sprSizeP - pPos.y 
    if(Math.abs(diffX) < sprSizeP && Math.abs(diffY) < sprSizeP){
        player.jump()
        sfxJump.pause()
        sfxJump.currentTime = 0
        sfxJump.play()
    }

    let delFly = false
    flyes.forEach(fly => {
        fPos = fly.getPos()
        let diffX = Math.abs(fPos.x) - Math.abs(x)
        let diffY = Math.abs(fPos.y) - Math.abs(y)
        let sprSizeFly = fly.getSpriteSize(ctx)
        if(Math.abs(diffX) < sprSizeFly && Math.abs(diffY) < sprSizeFly){
            fly.hit()
            sfxHit.pause()
            sfxHit.currentTime = 0
            sfxHit.play()
            if(fly.health <= 0) delFly = true
        }
    });
    if(delFly) flyes.shift()
}

var wayKounter = 0;
function moveObjects(baseRoadPos){
    for (let i = 0; i < road.length; i++) {
        road[i].move({x: -moveSpeed, y: 0})
    }
    if(road[1].getPos().x <= 0)
    {
        for (let i = 0; i < road.length; i++) {
            road[i].setPos({x: baseRoadPos.x * i, y: baseRoadPos.y})
        }
        wayKounter += 1
    }
    if(wayKounter >= kmPerRoadPiece){
        wayKounter = 0
        currentDurkDist -= 1
        if(currentDurkDist <= 0) win()
    }

    var pSize = player.getSpriteSize(ctx)
    obsObjects.forEach(obs => {
        obs.move({x: -moveSpeed, y: 0})
        //Handle lose
        let obsSize = obs.getSpriteSize(ctx)
        let diffX = obs.getPos().x - player.getPos().x
        let diffY = player.getPos().y - obs.getPos().y + obsSize

        if(diffX < pSize-obsSize/2 && diffY > - obsSize) {
            gameOver()
        }

        if(obs.getPos().x <= 0){
            obsObjects.shift()
        }

    });

    flyes.forEach(fly => {
        let pPos = player.getPos()
        let fPos = fly.getPos()
        let fSize = fly.getSpriteSize(ctx)
        let velX = moveSpeed/3
        let velY = moveSpeed/3
        if(pPos.x < fPos.x) velX = velX * -1
        else if(pPos.x == fPos.x) velX = 0
        if(pPos.y < fPos.y) velY = velY * -1
        else if(pPos.y == fPos.y) velY = 0
        fly.move({x: velX, y: velY})

        //Handle lose
        let diffX = fly.getPos().x - player.getPos().x
        let diffY = player.getPos().y+pSize - fly.getPos().y-fSize
        if(diffX <= pSize-fSize/2 && diffY <= 10){
            gameOver()
        } 
        
    });

}

function spawnObjects(){
    let chanceFly = Math.floor(Math.random() * spawnChanceOneFromFly)
    if(chanceFly == 0 && flyes.length == 0){
        let flyNew = new Fly(imgLancet, {x: 0, y: 0}, flyHealth)
        flyNew.setPos({x: canvas.width - (Math.floor(Math.random() * (canvas.width*0.1)) + 1), 
            y: 0})
        flyes.push(flyNew)
        console.log('Fly spawned', flyNew)
    }

    let chance = Math.floor(Math.random() * spawnChanceOneFrom)
    if(chance == 0){
        let obsNew = new Object(imgObsTmka, {x: 0, y: 0})
        obsNew.setResizeFactor(-2)
        let xCorner = canvas.width
        if(canvas.height > xCorner)
            xCorner = canvas.height
        obsNew.setPos({x: xCorner + obsNew.getSpriteSize(ctx), 
            y: road[1].getPos().y})
        obsObjects.push(obsNew)
        console.log('Mine spawned', obsNew)
    }
    
}

resize_canvas()
if(canvas.height > canvas.width) gameState = 'rotate'
ctx.fillStyle = "rgb(113, 58, 190)";
ctx.font = "48px serif";
window.requestAnimationFrame(gameLoop);

if(gameState != 'rotate'){
    restartGame()
    canvas.addEventListener('mousedown', function(e) {
        handleClickEvent(canvas, e)
    })
}
