const fs = require("fs")

function gerarKey(){
 const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
 let key = "PYBOT-"

 for(let i=0;i<8;i++){
  key += chars[Math.floor(Math.random()*chars.length)]
 }

 return key
}

const plano = process.argv[2] || "bronze"

const diasPlano = {
 bronze:30,
 prata:60,
 ouro:90
}

const db = JSON.parse(fs.readFileSync("./database.json"))

const novaKey = gerarKey()

db.keys.push({
 key:novaKey,
 plano:plano,
 expira: Date.now() + (diasPlano[plano]*86400000),
 ativa:true
})

fs.writeFileSync("./database.json", JSON.stringify(db,null,2))

console.log("KEY GERADA:", novaKey)
console.log("PLANO:", plano)
console.log("EXPIRA EM:", new Date(db.keys[db.keys.length-1].expira).toLocaleDateString('pt-BR'))