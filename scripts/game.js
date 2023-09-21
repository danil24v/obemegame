canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const imgBackground = document.getElementById("img_bg0");
const imgPlayer = document.getElementById("img_player");
const imgRoad = document.getElementById("img_road");
const imgLancet = document.getElementById("img_lancet");
const imgObsTmka = document.getElementById("img_tmka");
const sfxMusic = document.getElementById("sfx_music");
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
const moveSpeed = 10
const flyHealth = 3

function resize_canvas(){
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    window.requestAnimationFrame(gameLoop);
}

function handleClickEvent(canvas, event){
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    console.log('Click:', x, y)
    let pPos = player.getPos()
    let sprSizeP = player.getSpriteSize(ctx)
    let diffX = Math.abs(pPos.x) - Math.abs(x)
    let diffY = Math.abs(pPos.y) - Math.abs(y)
    if(Math.abs(diffX) < sprSizeP && Math.abs(diffY) < sprSizeP){
        player.jump()
    }

    let delFly = false
    flyes.forEach(fly => {
        fPos = fly.getPos()
        let diffX = Math.abs(fPos.x) - Math.abs(x)
        let diffY = Math.abs(fPos.y) - Math.abs(y)
        let sprSizeFly = fly.getSpriteSize(ctx)
        console.log('FPos:', fPos.x, fPos.y)
        console.log('Diff:', diffX, diffY)
        if(Math.abs(diffX) < sprSizeFly && Math.abs(diffY) < sprSizeFly){
            fly.hit()
            if(fly.health <= 0) delFly = true
        }
    });
    if(delFly) flyes.shift()
    sfxMusic.muted = false
    sfxMusic.loop = true
    sfxMusic.play()
}

function moveRoad(baseRoadPos, playerY){
    for (let i = 0; i < road.length; i++) {
        road[i].move({x: -moveSpeed, y: 0})
    }
    if(road[1].getPos().x <= 0)
    {
        for (let i = 0; i < road.length; i++) {
            road[i].setPos({x: baseRoadPos.x * i, y: baseRoadPos.y})
        }
    }

    obsObjects.forEach(obs => {
        obs.move({x: -moveSpeed, y: 0})
        if(obs.getPos().x < 0 * obs.getSpriteSize(ctx)){
            console.log('Del obs')
            obsObjects.shift()
        }

    });

    flyes.forEach(fly => {
        pPos = player.getPos()
        fPos = fly.getPos()
        let velX = moveSpeed/3
        let velY = moveSpeed/3
        if(pPos.x < fPos.x) velX = velX * -1
        else if(pPos.x == fPos.x) velX = 0
        if(pPos.y < fPos.y) velY = velY * -1
        else if(pPos.y == fPos.y) velY = 0
        fly.move({x: velX, y: velY})
    });

}

function spawnObs(){
    let chanceFly = Math.floor(Math.random() * spawnChanceOneFromFly)
    if(chanceFly == 0 && flyes.length == 0){
        let flyNew = new Fly(imgLancet, {x: 0, y: 0}, flyHealth)
        flyNew.setPos({x: canvas.width / (Math.floor(Math.random() * 2) + 1), 
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
window.requestAnimationFrame(gameLoop);
const sprSize = player.getSpriteSize(ctx)
player.setPos({x: 0, y: canvas.height - sprSize - sprSize/2})
const baseRoadPos = {x: sprSize, y: canvas.height - sprSize}
for (let i = 0; i < 6; i++) {
    let roadPart = new Object(imgRoad, {x: baseRoadPos.x * i, y: baseRoadPos.y})
    road.push(roadPart)
}
roadTimer = setInterval(moveRoad, roadTimerIntervalMs, baseRoadPos);
spawnerTimer = setInterval(spawnObs, respawnTimerIntervalMs);
canvas.addEventListener('click', function(e) {
    handleClickEvent(canvas, e)
})
