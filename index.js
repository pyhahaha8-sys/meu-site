const axios = require("axios")
const fs = require("fs")
const path = require("path")

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json")))

async function verificarLicenca(){

 console.log("🔐 Verificando licença...")

 if(!config.license.key){
  console.log("❌ Nenhuma key configurada!")
  console.log("📝 Configure sua key no arquivo config.json")
  process.exit(1)
 }

 try{

  const res = await axios.post(`${config.license.api_url}/validar`,{
   key: config.license.key
  }, {timeout: 10000})

  if(!res.data.status){
   console.log(`❌ [ERRO] ${res.data.msg}`)
   console.log("💡 Entre em contato com o administrador para obter uma key válida")
   process.exit(1)
  }

  console.log("✅ Key válida!")
  console.log(`📊 Plano: ${res.data.plano}`)
  console.log(`⏰ Expira em: ${res.data.expiraFormatado}`)

  return res.data

 }catch(e){

  console.log("❌ Erro ao conectar na API de licenciamento")
  console.log("🔍 Verifique se o servidor da API está rodando")
  console.log(`🌐 URL: ${config.license.api_url}`)
  process.exit(1)

 }

}

async function iniciarBot(licenseInfo){
 console.log("🤖 Iniciando PyBot...")
 console.log(`📱 Bot: ${config.bot.name} v${config.bot.version}`)
 console.log(`⭐ Plano: ${licenseInfo.plano}`)

 // Aqui você pode adicionar o código do seu bot
 // Por enquanto, apenas simula o funcionamento
 console.log("✅ Bot iniciado com sucesso!")

 // Manter o processo rodando
 setInterval(() => {
  console.log("🔄 Bot rodando... (Licença válida)")
 }, 30000)
}

// Função principal
async function main(){
 try{
  const licenseInfo = await verificarLicenca()
  await iniciarBot(licenseInfo)
 }catch(e){
  console.error("Erro fatal:", e.message)
  process.exit(1)
 }
}

main()