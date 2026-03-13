const express = require("express")
const fs = require("fs")
const path = require("path")
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static(__dirname))

function carregarDB(){
 return JSON.parse(fs.readFileSync("./database.json"))
}

function salvarDB(db){
 fs.writeFileSync("./database.json", JSON.stringify(db,null,2))
}

// Servir a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

// Endpoint para validar key
app.post("/validar", (req,res)=>{

 const {key} = req.body

 if(!key){
  return res.json({status:false,msg:"key não fornecida"})
 }

 const db = carregarDB()

 const registro = db.keys.find(k => k.key === key)

 if(!registro)
  return res.json({status:false,msg:"key inexistente"})

 if(!registro.ativa)
  return res.json({status:false,msg:"key desativada"})

 if(Date.now() > registro.expira)
  return res.json({status:false,msg:"key expirada"})

 return res.json({
  status:true,
  plano:registro.plano,
  expira:registro.expira,
  expiraFormatado: new Date(registro.expira).toLocaleDateString('pt-BR')
 })

})

// Endpoint para listar todas as keys (admin)
app.get("/keys", (req,res)=>{
 const db = carregarDB()
 res.json(db.keys)
})

// Endpoint para desativar key
app.post("/desativar", (req,res)=>{
 const {key, adminKey} = req.body

 // Verificar se é admin (por enquanto sem autenticação)
 if(adminKey !== "PYDEV777"){
  return res.json({status:false,msg:"acesso negado"})
 }

 const db = carregarDB()
 const registro = db.keys.find(k => k.key === key)

 if(!registro)
  return res.json({status:false,msg:"key inexistente"})

 registro.ativa = false
 salvarDB(db)

 return res.json({status:true,msg:"key desativada"})
})

// Endpoint para renovar key
app.post("/renovar", (req,res)=>{
 const {key, adminKey, dias} = req.body

 if(adminKey !== "PYDEV777"){
  return res.json({status:false,msg:"acesso negado"})
 }

 const db = carregarDB()
 const registro = db.keys.find(k => k.key === key)

 if(!registro)
  return res.json({status:false,msg:"key inexistente"})

 registro.expira = Date.now() + (dias * 86400000)
 salvarDB(db)

 return res.json({
  status:true,
  msg:"key renovada",
  novaExpiracao: new Date(registro.expira).toLocaleDateString('pt-BR')
 })
})

// Endpoint para deletar key
app.post("/deletar", (req,res)=>{
 const {key, adminKey} = req.body

 console.log("Tentativa de deletar key:", key, "adminKey:", adminKey)

 if(adminKey !== "PYDEV777"){
  console.log("Acesso negado")
  return res.json({status:false,msg:"acesso negado"})
 }

 const db = carregarDB()
 const index = db.keys.findIndex(k => k.key === key)

 console.log("Index encontrado:", index)

 if(index === -1){
  console.log("Key inexistente")
  return res.json({status:false,msg:"key inexistente"})
 }

 db.keys.splice(index, 1)
 salvarDB(db)

 console.log("Key deletada com sucesso")
 return res.json({status:true,msg:"key deletada"})
})

// Endpoint para gerar nova key via web
app.post("/gerar", (req,res)=>{
 const {plano, adminKey, dias} = req.body

 if(adminKey !== "PYDEV777"){
  return res.json({status:false,msg:"acesso negado"})
 }

 const diasPlano = {
  bronze:30,
  prata:60,
  ouro:90
 }

 if(!diasPlano[plano]){
  return res.json({status:false,msg:"plano inválido"})
 }

 const db = carregarDB()

 function gerarKey(){
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let key = "PYBOT-"

  for(let i=0;i<8;i++){
   key += chars[Math.floor(Math.random()*chars.length)]
  }

  return key
 }

 const novaKey = gerarKey()

 db.keys.push({
  key:novaKey,
  plano:plano,
    expira: (() => {
      const base = new Date();
      const diasAdd = parseInt(dias) > 0 ? parseInt(dias) : diasPlano[plano];
      base.setHours(0,0,0,0);
      base.setDate(base.getDate() + diasAdd);
      return base.getTime();
    })(),
  ativa:true,
  criadoEm: new Date().toISOString()
 })

 salvarDB(db)

 return res.json({
  status:true,
  key:novaKey,
  plano:plano,
  expira: new Date(db.keys[db.keys.length-1].expira).toLocaleDateString('pt-BR')
 })
})

// Endpoint para estatísticas
app.get("/stats", (req,res)=>{
 const db = carregarDB()
 const keys = db.keys

 const stats = {
  total: keys.length,
  ativas: keys.filter(k => k.ativa && Date.now() <= k.expira).length,
  expiradas: keys.filter(k => Date.now() > k.expira).length,
  desativadas: keys.filter(k => !k.ativa).length,
  porPlano: {
   bronze: keys.filter(k => k.plano === 'bronze').length,
   prata: keys.filter(k => k.plano === 'prata').length,
   ouro: keys.filter(k => k.plano === 'ouro').length
  }
 }

 res.json(stats)
})

app.listen(3001, ()=>{
 console.log("🚀 API de Licenciamento rodando na porta 3001")
 console.log("🌐 Dashboard Web: http://localhost:3001")
})