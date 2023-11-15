// CONSTANTS
const selectedTarget = document.querySelector(".target-select");

const importOrder = [
  "ot_genetics_portal",
  "eva",
  "gene_burden",
  "genomics_england",
  "gene2Phenotype",
  "uniprot_literature",
  "uniprot_variants",
  "orphanet",
  "clingen",
  "cancer_gene_census",
  "intogen",
  "eva_somatic",
  "cancer_biomarkers",
  "chembl",
  "crispr_screen",
  "crispr",
  "slapenrich",
  "progeny",
  "reactome",
  "sysbio",
  "europepmc",
  "expression_atlas",
  "impc",
];

const colours = {
  ot_genetics_portal: "rgb(88, 139, 139)",
  eva: "rgb(88, 139, 139)",
  gene_burden: "rgb(88, 139, 139)",
  genomics_england: "rgb(88, 139, 139)",
  gene2Phenotype: "rgb(88, 139, 139)",
  uniprot_literature: "rgb(88, 139, 139)",
  uniprot_variants: "rgb(88, 139, 139)",
  orphanet: "rgb(88, 139, 139)",
  clingen: "rgb(88, 139, 139)",
  cancer_gene_census: "rgb(246, 246, 246)",
  intogen: "rgb(246, 246, 246)",
  eva_somatic: "rgb(246, 246, 246)",
  cancer_biomarkers: "rgb(246, 246, 246)",
  chembl: "rgb(255, 213, 194)",
  crispr_screen: "rgb(242, 143, 59)",
  crispr: "rgb(242, 143, 59)",
  slapenrich: "rgb(242, 143, 59)",
  progeny: "rgb(242, 143, 59)",
  reactome: "rgb(242, 143, 59)",
  sysbio: "rgb(242, 143, 59)",
  europepmc: "rgb(200, 85, 61)",
  expression_atlas: "rgb(45, 48, 71)",
  impc: "rgb(147, 183, 190)",
};

const datasourceLabels = {
  ot_genetics_portal: "OT Genetics",
  eva: "ClinVar",
  gene_burden: "Gene Burden",
  genomics_england: "Genomics England PanelApp",
  gene2Phenotype: "Gene2Phenotype",
  uniprot_literature: "Uniprot (literature)",
  uniprot_variants: "Uniprot curated variants",
  orphanet: "Orphanet",
  clingen: "ClinGen",
  cancer_gene_census: "Cancer Gene Census",
  intogen: "IntOGen",
  eva_somatic: "ClinVar (somatic)",
  cancer_biomarkers: "Cancer Biomarkers",
  chembl: "ChEMBL",
  crispr_screen: "CRISPR Screens",
  crispr: "Project SCORE",
  slapenrich: "SLAPenrich",
  progeny: "PROGENy",
  reactome: "Reactome",
  sysbio: "Gene Signatures",
  europepmc: "Europe PMC",
  expression_atlas: "Expression Atlas",
  impc: "IMPC",
};

const sortByObject = importOrder.reduce((obj, item, index) => {
  return {
    ...obj,
    [item]: index,
  };
}, {});

function createTargetScoreList(targetDataScores, scoreList) {
  scoreList.datasourceList.push(datasourceLabels[targetDataScores.id]);
  scoreList.datasourceScoreList.push(targetDataScores.score);
  scoreList.backgroundColour.push(colours[targetDataScores.id]);
}

function handleToggle(targetId) {
  let tableBTN = document.querySelector(`#table-btn-${targetId}`);
  let tableSection = document.querySelector(`#graph-drawer-${targetId}`);

  tableBTN.onclick = function () {
    let ifClosed = tableBTN.classList.contains("closed");
    tableSection.classList.toggle("hide");
    if (ifClosed) {
      tableBTN.classList.remove("closed");
      tableBTN.classList.add("open");
    } else {
      tableBTN.classList.remove("open");
      tableBTN.classList.add("closed");
    }
  };
}

function initCharts(graphDataElement) {
  (async function () {
    const data = {
      labels: graphDataElement.datasourceList,
      datasets: [
        {
          label: "Data Source Scores",
          data: graphDataElement.datasourceScoreList,
          backgroundColor: graphDataElement.backgroundColour,
        },
      ],
    };

    new Chart(
      document.getElementById(`bar-chart-${graphDataElement["targetID"]}`),
      {
        type: "bar",
        data: data,
        options: {
          animation: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Data Type scores (bar)",
              padding: {
                top: 10,
                bottom: 30,
              },
              font: {
                size: 18,
                family: "Roboto",
              },
            },
          },
        },
        // backgroundColor: ["rgb(52, 137, 202)"],
      }
    ); // end of bar chart

    new Chart(
      document.getElementById(`radar-chart-${graphDataElement["targetID"]}`),
      {
        type: "radar",
        data: data,
        options: {
          animation: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Data Type scores (radar)",
              padding: {
                top: 10,
                bottom: 30,
              },
              font: {
                size: 18,
                family: "Roboto",
              },
            },
          },
          elements: {
            line: {
              borderWidth: 3,
            },
          },
        },
      }
    ); // end of radar chart
  })();
}

function createTableRow(element) {
  return `<tr>
        <td><button id="table-btn-${
          element.target.id
        }" class = "closed"></button></td>
        <td>${element.target.approvedSymbol}</td>
        <td>${element.target.id}</td>
        <td>${element.target.approvedName}</td>
        <td>${element.score.toFixed(3)}</td>
    </tr>
    <tr class = "hide" id = "graph-drawer-${element.target.id}" >
        <td colspan = "5">
            <div class = "chartcontainer">
            <canvas id="bar-chart-${element.target.id}"></canvas>
            <canvas id="radar-chart-${element.target.id}"></canvas>
        </div>
        </td>
    </tr>`;
}

function getData(id) {
  // Getting the data from the OT Platform API as a post request, .then ensures that you only proceed once you have the data
  axios
    .post("https://api.platform.opentargets.org/api/v4/graphql", {
      query: `{
    disease(efoId: "${id}") {
    associatedTargets{
      rows{
        target {
          approvedSymbol
          id
          approvedName
        }
        score
        datasourceScores {
          id
          score
        }
      }
    }
  }
}`,
    })
    // Getting only the data we need
    .then((result) => {
      rawElements = result.data.data.disease.associatedTargets.rows;
      console.log(rawElements);

      // rawElements = rawElements.splice(0, 10);

      // Adding the data into the rows
      let tableContent = "";
      let tableContainer = document.querySelector("#table-rows");

      let graphData = []; //declaring as an object

      for (let i = 0; i < rawElements.length; i++) {
        let currentElement = rawElements[i];
        currentElement.datasourceScores.sort(
          (a, b) => sortByObject[a.id] - sortByObject[b.id]
        );

        //adding data to the table -- to test I have removed class=hide from the graph drawer
        let rowTemplate = createTableRow(currentElement);

        tableContent = tableContent + rowTemplate;

        //creating the object storing the chart data

        //Nested for loop iterates through the datasource scores for the current element, adding each datasource name to an array and each datasource score to an array
        // Within graphData, create a nested object for which the ID is the target ID

        let targetScores = {
          targetID: `${currentElement.target.id}`,
          datasourceList: [],
          datasourceScoreList: [],
          backgroundColour: [],
        };

        for (let j = 0; j < currentElement.datasourceScores.length; j++) {
          createTargetScoreList(
            currentElement.datasourceScores[j],
            targetScores
          );
        } //end of nested for loop

        //add to graphData
        graphData.push(targetScores);
      } //end of first for loop

      //Adding the new HMTL back into the table
      tableContainer.innerHTML = tableContent;
      console.log(graphData);

      // Charts and button toggle
      for (let k = 0; k < graphData.length; k++) {
        // end of async function
        initCharts(graphData[k]);
        handleToggle(graphData[k].targetID);
      } // end of chart for loop
    }); // end of .then
} // end of getData function

// getData("EFO_0000384");

selectedTarget.addEventListener("change", (event) => {
  getData(event.target.value);
});

//Colours for each data type; and data sources included in each data type
// ["rgb(88, 139, 139)"][ // Genetic association
//   // otGeneticsPortal	eva	geneBurden	genomicsEngland	gene2Phenotype	uniprotLiterature	uniprotVariants	orphanet	clingen
//   "rgb(246, 246, 246)"
// ][ // Somatic mutations
//   // cancerGeneCensus	intogen	evaSomatic	cancerBiomarkers
//   "rgb(255, 213, 194)"
// ][ // Known Drug
//   // chembl
//   "rgb(242, 143, 59)"
// ][ // Affected Pathway
//   //crisprScreen	crispr	slapenrich	progeny	reactome	sysbio
//   "rgb(200, 85, 61)"
// ][ // Literature
//   //europepmc
//   "rgb(45, 48, 71)"
// ][ // RNA expression
//   //expressionAtlas
//   "rgb(147, 183, 190)"
// ]; // Animal Model
// //impc
