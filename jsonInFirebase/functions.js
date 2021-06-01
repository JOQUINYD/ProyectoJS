window.onload = function() {
  
  let promise = new Promise((resolve, reject) =>{
    rootRef.on('value',(snap)=>{
      resolve(snap.val());
    });
  })

  promise.then((data) => {
    jsonData = data;
    showData();
  })
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
    
    tableHtml += `<tr personID = " ${personID} " > 
                  <td class = "text-truncate text-center"> ${personData.slpName} </td>
                  <td class = "text-truncate text-center"> ₡ ${personData.sale.toFixed(4)} </td>
                  <td class = "text-truncate text-center"> ₡ ${personData.budget.toFixed(4)} </td>
                  <td class = "text-truncate text-center"> ₡ ${(personData.sale - personData.budget).toFixed(4)} </td>
                  ${getSaleBudgetComplianceHtml(personData.sale, personData.budget)}
                  <td class = "text-truncate text-center"> <button class="btn btn-outline-success" onclick="goToDashboard(this)"> <i class="far fa-paper-plane"></i> </button> </td>
                </tr>`;  
    personID += 1;
  });
  
  document.getElementById("tbodytable1ID").innerHTML = tableHtml;
  datatableProperties();
}

function getSaleBudgetCompliance(sale, budget){

  let saleBudgetCompliance = 0;

  if (budget === 0){
    saleBudgetCompliance = "Sin Meta establecida";
  }
  else{
    saleBudgetCompliance = `${((sale / budget)*100).toFixed(2)}`;
  }

  return saleBudgetCompliance;
}

function getSaleBudgetComplianceHtml(sale, budget){
  saleBudgetCompliance = getSaleBudgetCompliance(sale, budget);

    if(saleBudgetCompliance === "Sin Meta establecida"){
      return `<td class = "text-truncate text-center"> <span class="badge bg-secondary">${saleBudgetCompliance}%</span> </td>`;
    }
    else{
      if (saleBudgetCompliance >= 100) {
        return `<td class = "text-truncate text-center"> <span class="badge bg-success">${saleBudgetCompliance}%</span> </td>`;
      } 
      if (saleBudgetCompliance < 80) {
        return `<td class = "text-truncate text-center"> <span class="badge bg-danger">${saleBudgetCompliance}%</span> </td>`;
      }
      return `<td class = "text-truncate text-center"> <span class="badge bg-warning text-dark">${saleBudgetCompliance}%</span> </td>`;
    }
}

function goToDashboard(element){
  let closestTr = element.closest('tr'); 
  console.log(closestTr.getAttribute('personID'));
  window.location.href = `dashboard.html?personID=${closestTr.getAttribute('personID')}`;

}

function datatableProperties(){
  $('#table1TableID').DataTable({
    "bSort" : true,
    "paging" : true,
    "pageLength" : 20,
  });
}


/**
 * 
 *  Promesa
 * 
 */





/*
function getData (){
// once() method
    rootRef.on('value',(snap)=>{
    jsonData = snap.val();
    console.log(jsonData);
    showData();
  });
}
*/ 
