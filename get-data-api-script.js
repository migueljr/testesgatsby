const fs  = require('fs')
const axios  = require('axios')

const argv = require('yargs')
        .alias('t', 'tenant')
        .demandOption('tenant')
        .argv


let data ='';

let dataObject = {}

let config = {
  headers: {
    "Accept": "application/json",
    "Content-Type":"application/json",
    "x-budibase-api-key":"8e36567de258645fafeee892527301ab-82b22ccfeb905232a35b6cdded44aff77bab0dbcb82613aa03778f165d83df8768705313bcccfde1",
    "x-budibase-app-id":"app_dev_default_78f2c05c4ce542ddb2757fe1596bec67"
  }
}

//var url = 'https://budibase.internal.angulare.app/api/ta_e6b682eba7c04c42899a7ee7759e35be/search'
var url = 'https://budibase.internal.angulare.app/api/ta_e6b682eba7c04c42899a7ee7759e35be/search'



//let tenant = argv.tenant

let tenant = argv.tenant=='auto' ? process.env.TENANT : argv.tenant

console.log('✔️ - Buscando dados do tenant: '+tenant)

axios({
  method: "post",
  url: url,
  data:{
    "query":{
      "equal":{"tenant":tenant, "app_type":"web"}
    }
  },
  headers: config.headers
})
.then(r=>{
    console.log('✔️ - Customer App Ready')
    dataObject.customer_app = {...r.data.rows[0]}

    let idsAppPages = []

    dataObject.customer_app.app_pages.map(item=>idsAppPages.push(item._id))


    axios({
      method: "post",
      url: `https://budibase.internal.angulare.app/api/ta_507d7d6fe1e8455181c4cdb0f3ba6adf/search`,
      data:{
        "query":{
          "equal":{"tenant":argv.tenant}
        }
      },
      headers: config.headers
    }).then(r2=>{
      console.log('✔️ - App Pages Ready')
      dataObject.app_pages = {...r2.data.rows.filter(item=>idsAppPages.filter(item2=>item2==item._id).length)}
      let appPagesNew = []
      let i = 0
      while(dataObject.app_pages[i]){
        appPagesNew.push(dataObject.app_pages[i])
        i++
      }

      dataObject.app_pages = appPagesNew

      let allIdsAppSections = []

      dataObject.app_pages.map(item=>{
        if(item.app_sections){
          item.app_sections.map(item2=>{
            allIdsAppSections.push(item2._id)
          })
        }
        
      })

      axios({
        method: "post",
        url: `https://budibase.internal.angulare.app/api/ta_867bac97e64047b8b8b5a0a458d3767b/search`,
        data:{
          "query":{
            "equal":{"tenant":argv.tenant}
          }
        },
        headers: config.headers
      }).then(r3=>{
        console.log('✔️ - App Sections Ready')
        dataObject.app_sections = {...r3.data.rows}

        let appSectionsNew = []
        let i = 0
        while(dataObject.app_sections[i]){
          appSectionsNew.push(dataObject.app_sections[i])
          i++
        }

        dataObject.app_sections = appSectionsNew
        
        dataObject.app_sections = dataObject.app_sections.filter(item=>allIdsAppSections.filter(item2=>item2==item._id).length)


        axios({
          method: "post",
          url: `https://budibase.internal.angulare.app/api/ta_4c55bdc59f68423885c529931f81961c/search`,
          data:{
            "query":{
              "equal":{"tenant":argv.tenant}
            }
          },
          headers: config.headers
        }).then(r4=>{
          console.log('✔️ - Customer Ready')
          dataObject.customer = {...r4.data.rows[0]}


          axios({
            method: "post",
            url: `https://budibase.internal.angulare.app/api/ta_67ff91d6ebac401997bb65ee8084ca0c/search`,
            data:{
              "query":{
                "equal":{"_id":dataObject.customer_app.angulare_settings ? dataObject.customer_app.angulare_settings[0]._id : ''}
              }
            },
            headers: config.headers
          }).then(r5=>{
            console.log('✔️ - Angulare Settings Ready')
            dataObject.angulare_settings = {...r5.data.rows[0]}



            axios({
              method: "post",
              url: `https://budibase.internal.angulare.app/api/ta_92f2d228d7bf49e588b68f8c04e77e53/search`,
              data:{
                "query":{
                  "equal":{"tenant":argv.tenant}
                }
              },
              headers: config.headers
            }).then(r6=>{
              console.log('✔️ - Unit customer Ready')
              dataObject.unit_customer = {...r6.data.rows}

              let UnitsNew = []
              let i = 0
              while(dataObject.unit_customer[i]){
                UnitsNew.push(dataObject.unit_customer[i])
                i++
              }

              dataObject.unit_customer = UnitsNew
  
  
              data = 'const data = '+JSON.stringify(dataObject)
  
              fs.writeFile('./src/data/data.js', '', (err) => {
                  if (err) throw err;
                console.log('✔️ - Limpando arquivo');
              });
  
              setTimeout(()=>{
                fs.writeFile('./src/data/data.js', data+'; module.exports = data;', (err) => {
                  if (err) throw err;
                  console.log('✔️ - Arquivo gerado');
                });
              }, 1000)
            
            })

          
          })


        })
  
  
      })


    })

    
})
.catch(e=>{
  console.log(e)
})




