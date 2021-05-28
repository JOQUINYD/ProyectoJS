window.onload = function() {
  getData();
  console.log("Que pasa chavales")
};

// en estas const para manejar facilemtne la base de datos.
const database = firebase.database();
// referencia a la collection test_col para utilizar las funciones sobre esta colección
const rootRef = database.ref('/');
//
let jsonData = [];

// se agrega el listener al botón remove
function showData (){
    let tableHtml = '';

    let personID = 0;

    jsonData.forEach(element => {

      let personData = element.infoResult.data[0];
      
      let saleBudgetCompliance = 0;

      if (personData.sale === 0 || personData.budget === 0){
        saleBudgetCompliance = "Sin Ventas o Metas";
      }
      else{
        saleBudgetCompliance = `${personData.budget / personData.sale}%`;
      }


      tableHtml += `<tr personID = " ${personID} " > 
                    <td class = "text-truncate text-center"> ${personData.slpName} </td>
                    <td class = "text-truncate text-center"> ${personData.sale} </td>
                    <td class = "text-truncate text-center"> ${personData.budget} </td>
                    <td class = "text-truncate text-center"> ${(personData.sale - personData.budget)} </td>
                    <td class = "text-truncate text-center"> ${saleBudgetCompliance} </td>
                    <td class = "text-truncate text-center"> <button class="btn btn-outline-success" onclick="goToDashboard(this)"> <i class="far fa-paper-plane"></i> </button> </td>
                  </tr>`;  
      personID += 1;
    });
    
    document.getElementById("tbodytable1ID").innerHTML = tableHtml;
    datatableProperties()
}

function getData (){
 // once() method
    rootRef.on('value',(snap)=>{
    jsonData = snap.val();
    console.log(jsonData);
    showData();
  });
}

function datatableProperties(){
  $('#table1TableID').DataTable({
    "bSort" : true,
    "paging" : true,
    "pageLength" : 20,
  });
}

