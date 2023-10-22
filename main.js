const canvas = document.querySelector("canvas")
const scoreSpan = document.querySelector("span")
const endGameDiv = document.querySelector("div")
const btn = document.querySelector("button")
const endScore = document.querySelector("#score")
const c = canvas.getContext("2d")
canvas.width = innerWidth
canvas.height = innerHeight
let score = 0
let speed = 0.2

class Player{
  constructor(x, y, radius, color){
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }
  draw(){
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false)
    c.fillStyle = this.color
    c.fill()
  }
}

class Projectile{
  constructor(x, y, radius, color, velocity){
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }
  draw(){
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false)
    c.fillStyle = this.color
    c.fill()
  }
  update(){
    this.draw()
    this.x += this.velocity.x
    this.y += this.velocity.y
  }
}

class Enemy{
  constructor(x, y, radius, color, velocity){
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }
  draw(){
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false)
    c.fillStyle = this.color
    c.fill()
  }
  update(){
    this.draw()
    this.x += this.velocity.x
    this.y += this.velocity.y
  }
}
const friction = 0.99
class Particle{
  constructor(x, y, radius, color, velocity){
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }
  draw(){
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }
  update(){
    this.draw()
    this.velocity.x *=friction
    this.velocity.y *=friction
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.alpha -= 0.01
  }
}

const x = canvas.width /2
const y = canvas.height /2

const player = new Player(x, y , 10, "white")


const projectiles = []
const enemies = []
const particles = []
let interval
function spawnEnemies(){
  interval = setInterval(()=>{
    const radius = Math.random()* 30 + 4
    let enemyX, enemyY
    if (Math.random() < 0.5){
      enemyX = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      enemyY = Math.random() * canvas.height
    }
    else{
      enemyX = Math.random() * canvas.width
      enemyY = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }
    
    const index = Math.floor(Math.random() * 361)
    const color = `hsl(${index}, 50%, 50%)`
    const angle = Math.atan2(y - enemyY, x - enemyX)
    if (score % 100 === 0){
      speed = 0.2 + score/1000
    }
    const velocity = {
      x: Math.cos(angle) *speed,
      y: Math.sin(angle) *speed
    }
    enemies.push(new Enemy(enemyX, enemyY, radius, color, velocity))
  }, 1500)
}

let animationId
function animate(){
  animationId = requestAnimationFrame(animate)
  c.fillStyle = "rgba(0, 0, 0, 0.1)"
  c.fillRect(0, 0, canvas.width, canvas.height )
  player.draw()
  particles.forEach((particle, index) =>{
    if (particle.alpha <= 0.1){
      particles.splice(index, 1)
    }
    particle.update()
  })
  projectiles.forEach(projectile =>{
    projectile.update()
  })
  enemies.forEach((enemy, index) =>{
    enemy.update()
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
    if (dist <= player.radius+ enemy.radius){
      cancelAnimationFrame(animationId)
      endGameDiv.style.display = "block"
      endScore.textContent = score
      clearInterval(interval)
    }
    projectiles.forEach((projectile, i) =>{
      if (projectile.x <= -projectile.radius ||
        projectile.y <= -projectile.radius ||
        projectile.x >= canvas.width + projectile.radius||
        projectile.y >= canvas.height + projectile.radius){
          
          projectiles.splice(i, 1)
        }
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      if (dist <= enemy.radius+ projectile.radius){
        for (let i=0 ; i<enemy.radius *2; i++){
          particles.push(new Particle(projectile.x, projectile.y, Math.random() *2, enemy.color, {
            x: (Math.random() - 0.5) * (Math.random() * 8),
            y: (Math.random() - 0.5) * (Math.random() * 8)
          }))
        }
         if (enemy.radius - 10 > 10){
          gsap.to(enemy, {
            radius: enemy.radius -10
          })
         }
         else{

           setTimeout(()=>{
             enemies.splice(index, 1)
             
            }, 0)
            score +=10
            scoreSpan.textContent = score
          }
          projectiles.splice(i, 1)
         }
    })
    
  })
}

addEventListener("click", e =>{
  const angle = Math.atan2(e.clientY - y, e.clientX - x)
  const velocity = {
    x: Math.cos(angle) *4,
    y: Math.sin(angle) *4
  }
  projectiles.push(new Projectile(x, y, 5, "white", velocity))
  
})
btn.addEventListener("click", ()=>{
  endGameDiv.style.display= "none"
  projectiles.length= 0
  particles.length= 0
  enemies.length = 0
  speed = 0.2
  score = 0
  scoreSpan.textContent = 0
  animate()
  spawnEnemies()
})