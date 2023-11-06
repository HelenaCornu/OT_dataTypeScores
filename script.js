function getData() {
  // Getting the data from the OT Platform API as a post request, .then ensures that you only proceed once you have the data
  axios
    .post("https://api.platform.opentargets.org/api/v4/graphql", {
      query: `{
    disease(efoId: "EFO_0001071") {
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

      const sortByObject = importOrder.reduce((obj, item, index) => {
        return {
          ...obj,
          [item]: index,
        };
      }, {});

      let colours = {
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
        let tableTemplate = `<tr>
        <td><button id="table-btn-${
          currentElement.target.id
        }" class = "closed"></button></td>
        <td>${currentElement.target.approvedSymbol}</td>
        <td>${currentElement.target.id}</td>
        <td>${currentElement.target.approvedName}</td>
        <td>${currentElement.score.toFixed(3)}</td>
    </tr>
    <tr class = "hide" id = "graph-drawer-${currentElement.target.id}" >
        <td colspan = "5">
            <div class = "chartcontainer">
            <canvas id="bar-chart-${currentElement.target.id}"></canvas>
            <canvas id="radar-chart-${currentElement.target.id}"></canvas>
        </div>
        </td>
    </tr>`;

        tableContent = tableContent + tableTemplate;

        //creating the object storing the chart data

        //Nested for loop iterates through the datasource scores for the current element, adding each datasource name to an array and each datasource score to an array
        // Within graphData, create a nested object for which the ID is the target ID

        let targetScores = {
          newRow: {
            targetID: `${currentElement.target.id}`,
            datasourceList: [],
            datasourceScoreList: [],
            backgroundColour: [],
          },
        };

        for (let j = 0; j < currentElement.datasourceScores.length; j++) {
          targetScores["newRow"]["datasourceList"].push(
            currentElement.datasourceScores[j].id
          );
          targetScores["newRow"]["datasourceScoreList"].push(
            currentElement.datasourceScores[j].score
          );
          targetScores["newRow"]["backgroundColour"].push(
            colours[currentElement.datasourceScores[j].id]
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
        (async function () {
          const data = {
            labels: graphData[k].newRow.datasourceList,
            datasets: [
              {
                label: "Data Type Scores",
                data: graphData[k].newRow.datasourceScoreList,
                backgroundColor: graphData[k].newRow.backgroundColour,
              },
            ],
          };

          new Chart(
            document.getElementById(
              `bar-chart-${graphData[k]["newRow"]["targetID"]}`
            ),
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
            document.getElementById(
              `radar-chart-${graphData[k]["newRow"]["targetID"]}`
            ),
            {
              type: "radar",
              data: data,
              borderColor: ["rgb(52, 137, 202)"],
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
        })(); // end of async function

        let tableBTN = document.querySelector(
          `#table-btn-${graphData[k]["newRow"]["targetID"]}`
        );
        let tableSection = document.querySelector(
          `#graph-drawer-${graphData[k]["newRow"]["targetID"]}`
        );

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
      } // end of chart for loop
    }); // end of .then
} // end of getData function

getData();

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
