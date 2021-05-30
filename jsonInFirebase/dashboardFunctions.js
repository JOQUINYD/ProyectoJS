const queryString = window.location.search;

const urlParams = new URLSearchParams(queryString);

const personID = parseInt(urlParams.get('personID'), 10);

const formatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  minimumFractionDigits: 0
})

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
      "name" : personAllData.slpName,
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
}

function getWeekResults(ogWeekResults, personAllData){

  let sale = 0;
  let budget = personAllData.budget;
  let pastMonthSale = personAllData.pastMonthSale;
  let pastYearSale = personAllData.pastYearSale;

  let acumWeekWeight = 0;
  
  let sales = [];
  let budgets = [];
  let pastMonthSales = [];
  let pastYearSales = [];

  ogWeekResults.forEach(element => {
    
    acumWeekWeight += element.weekWeight;
    sale += element.sale;

    /*
    sales.push(formatMillions(sale));
    budgets.push(formatMillions((acumWeekWeight/100) * budget));
    pastMonthSales.push(formatMillions((acumWeekWeight/100) * pastMonthSale));
    pastYearSales.push(formatMillions((acumWeekWeight/100) * pastYearSale));
    */

    sales.push(sale);
    budgets.push((acumWeekWeight/100) * budget);
    pastMonthSales.push((acumWeekWeight/100) * pastMonthSale);
    pastYearSales.push((acumWeekWeight/100) * pastYearSale);
  });
  
  let weekResults = {
    "sales" : sales,
    "budgets" : budgets,
    "pastMonthSales" : pastMonthSales,
    "pastYearSales" : pastYearSales
  };

  return weekResults;
}

function formatMillions(num){
  return ((num / 1000000).toFixed(0) + "M");
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
    renderCharts();
  });
}


/*

Charts functions

*/

function renderCharts(){
  renderUserName();
  renderBarChart();
  renderSaleComplianceData();
  renderSaleBudgetCompGauge();
  renderProjectedGauge();
  renderOtherCards();
}

function renderBarChart(){
  var barChartoptions = {
      series: [{name: 'Meta', data: personData.weekResults.budgets}, {name: 'Venta', data: personData.weekResults.sales}, {name: 'Mes anterior', data: personData.weekResults.pastMonthSales}, {name: 'Año anterior',data: personData.weekResults.pastYearSales}],
      chart: {
      type: 'bar',
      height: 430,
    },
    colors : ['#ff4a5f','#00e071','#8e8e8e','#717171'],
    plotOptions: {
      bar: {
        horizontal: false,
        dataLabels: {
          position: 'top',
        },
      }
    },
    dataLabels: {
      enabled: false,
      offsetX: -6,
      style: {
        fontSize: '12px',
        colors: ['#fff']
      }
    },
    stroke: {
      show: true,
      width: 1,
      colors: ['#fff']
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter : function(value){
          return formatter.format(value);
        }
      }
    },
    xaxis: {
      categories: ["Semana 1", "Semana 2", "Semana 3", "Semana 4", "Semana 5", "Semana 6"],
    },
    yaxis: {
      show : true,
      labels: {
        formatter: function(value){
          return formatMillions(value);
        }
      }
    },
  };
  var barChart = new ApexCharts(document.querySelector("#barChart"), barChartoptions);
  barChart.render();
}

function renderSaleComplianceData(){
  document.getElementById("ventaActual").innerHTML = formatter.format(personData.sale);
  document.getElementById("metaActual").innerHTML =  formatter.format(personData.budget);
  document.getElementById("diferencia").innerHTML = formatter.format(personData.saleBudgetDifference);

  if (personData.saleBudgetDifference <= 0) {
    document.getElementById("diferencia").classList.add("diferenciaNegativa");
    console.log("Quede");
  }
  else{
    document.getElementById("diferencia").classList.add("diferenciaPositiva");
  }
}

function renderSaleBudgetCompGauge(){
  var options = {
    chart: {
      height: 400,
      type: "radialBar"
    },
    
    series: [personData.saleBudgetCompliance],
    
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "65%"
        },
       
        dataLabels: {
          showOn: "always",
          name: {
            offsetY: -10,
            show: true,
            color: "#888",
            fontSize: "13px"
          },
          value: {
            color: "#111",
            fontSize: "30px",
            show: true
          }
        }
      }
    },
  
    stroke: {
      lineCap: "round",
    },
    labels: ["Cumplimiento"],
    colors: ["#00e071"]
  };

  var chart = new ApexCharts(document.querySelector("#complianceGauge"), options);
  chart.render();
}

function renderProjectedGauge(){
  var options = {
    chart: {
      height: 400,
      type: "radialBar"
    },
    
    series: [personData.projectedCompliancePer.toFixed(2)],
    
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "65%"
        },
       
        dataLabels: {
          showOn: "always",
          name: {
            offsetY: -10,
            show: true,
            color: "#888",
            fontSize: "13px"
          },
          value: {
            color: "#111",
            fontSize: "30px",
            show: true
          }
        }
      }
    },
  
    stroke: {
      lineCap: "round",
    },
    labels: [formatter.format(personData.projectedCompliance)]
  };

  var chart = new ApexCharts(document.querySelector("#projectedGauge"), options);
  chart.render();
}

function renderOtherCards(){
  document.getElementById("pedidosAbiertos").innerHTML = formatter.format(personData.salesOrders);
  document.getElementById("cotizacionesAbiertas").innerHTML =  formatter.format(personData.quotations);
  document.getElementById("ventaAnual").innerHTML =  formatter.format(personData.yearSale);
  document.getElementById("metaAnual").innerHTML =  formatter.format(personData.yearBudget);
  document.getElementById("cumplimientoAnual").innerHTML =  personData.yearCompliance + "%";
  document.getElementById("facturacion").innerHTML =  formatter.format(personData.invoices);
  document.getElementById("devoluciones").innerHTML =  formatter.format(personData.creditNotes);
}

function renderUserName(){
  document.getElementById("nombreVendedor").innerHTML = personData.name;
}