const queryString = window.location.search;

const urlParams = new URLSearchParams(queryString);

const personID = parseInt(urlParams.get('personID'), 10);


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

let personData = [];

// se agrega el listener al botón remove

/* 
  "sale" - ventaActual
  "budget" - meta actual
  "saleBudgetDifference" - diferencia venta meta
  "yearSale" - venta anual
  "yearBudget" - meta anual
  "yearCompliance" - cumplimiento anual
  "invoices" - facturación
  "creditNotes" - devoluciones
  "salesOrders" - pedidos abiertos
  "quotations" - cotizaciones abiertas
*/


function setPersonData() {

  let personAllData = jsonData[personID].infoResult.data[0];

  let saleBudgetCompliance = getCompliance(personAllData.sale, personAllData.budget);
  let projectedCompliancePer = getProjectedCompliancePer(personAllData.monthAdvance, saleBudgetCompliance);
  let projectedCompliance = (projectedCompliancePer / 100) * personAllData.budget; 

  personData = {
      "sale" : personAllData.sale,
      "budget" : personAllData.budget,
      "saleBudgetDifference" : personAllData.sale - personAllData.budget,
      "saleBudgetCompliance" : saleBudgetCompliance,
      "yearSale" : personAllData.yearSale,
      "yearBudget" : personAllData.yearBudget,
      "yearCompliance" : getCompliance(personAllData.yearSale, personAllData.yearBudget),
      "invoices" : personAllData.invoices,
      "creditNotes" : personAllData.creditNotes,
      "salesOrders" : personAllData.salesOrders,
      "quotations" : personAllData.quotations,
      "projectedCompliancePer" : projectedCompliancePer,
      "projectedCompliance" : projectedCompliance,
      "weekResults" : getWeekResults(jsonData[personID].weekResult.data, personAllData)
  }
  console.log(personData);
}

function getWeekResults(ogWeekResults, personAllData){

  let budget = personAllData.budget;
  let pastMonthSale = personAllData.pastMonthSale;
  let pastYearSale = personAllData.pastYearSale;
  let weekResults = [];

  let acumWeekWeight = 0;
  ogWeekResults.forEach(element => {
    acumWeekWeight += element.weekWeight;
    
    weekResults.push(
      {
        "sale" : element.sale,
        "budget" : acumWeekWeight * budget,
        "pastMonthSale" : acumWeekWeight * pastMonthSale,
        "pastYearSale" : acumWeekWeight * pastYearSale,
      }
    );
  });

  return weekResults;
}

function getProjectedCompliancePer(monthAdvance, compliance){
  if(monthAdvance != 0){
    return (compliance  / monthAdvance) * 100;
  }
  return 0;
}


function getCompliance(sale, budget){

  if(budget !== 0){
    return ((sale / budget) * 100).toFixed(1);
  }
  return 0;  
}



function getData() {
 // once() method
    rootRef.on('value',(snap)=>{
    jsonData = snap.val();
    console.log(jsonData);
    setPersonData();
  });
}
