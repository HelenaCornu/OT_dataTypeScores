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

      // Adding the data into the rows
      let tableContent = "";
      let tableContainer = document.querySelector("#table-rows");

      let graphData = []; //declaring as an object

      for (let i = 0; i < rawElements.length; i++) {
        let currentElement = rawElements[i];
        currentElement.datasourceScores.sort((a, b) => (a.id > b.id ? 1 : -1));

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
          },
        };

        for (let j = 0; j < currentElement.datasourceScores.length; j++) {
          targetScores["newRow"]["datasourceList"].push(
            currentElement.datasourceScores[j].id
          );
          targetScores["newRow"]["datasourceScoreList"].push(
            currentElement.datasourceScores[j].score
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
              backgroundColor: ["rgb(52, 137, 202)"],
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
