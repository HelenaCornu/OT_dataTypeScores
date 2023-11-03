function handleTableToggle() {
  let tableBTN = document.querySelector("#table-btn");
  let tableSection = document.querySelector("#graph-drawer");
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

// axios.post('https://api.platform.opentargets.org/api/v4/graphql', {
//   query: `{
//     disease(efoId: "EFO_0001071") {
//     associatedTargets{
//       rows{
//         target {
//           approvedSymbol
//           id
//           approvedName
//         }
//         score
//         datasourceScores {
//           id
//           score
//         }
//       }
//     }
//   }
// }`
// }).then((result) => {
//   console.log(
//     result.data.disease.associatedTargets.rows[0].target.approvedName);
// });

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
      console.log(result.data.data.disease.associatedTargets.rows);
      let rawElements = result.data.data.disease.associatedTargets.rows;

      // Cutting down the number of responses. Can modify -- set to five for testing
      rawElements = rawElements.splice(0, 5);

      // Adding the data into the rows
      let tableContent = "";
      let tableContainer = document.querySelector("#table-rows");

      for (let i = 0; i < rawElements.length; i++) {
        let currentElement = rawElements[i];
        let tableTemplate = `<tr>
        <td><button id="table-btn" class = "closed"></button></td>
        <td>${currentElement.target.approvedSymbol}</td>
        <td>${currentElement.target.id}</td>
        <td>${currentElement.target.approvedName}</td>
        <td>${currentElement.score}</td>
    </tr>
    <tr class = "hide" id = "graph-drawer" >
        <td colspan = "5">
            <div class = "chartcontainer">
            <canvas id="bar-chart"></canvas>
            <canvas id="radar-chart"></canvas>
        </div>
        </td>
    </tr>`;
        tableContent = tableContent + tableTemplate;
      }
      tableContainer.innerHTML = tableContent;
    });
}

function initCharts() {
  const data = {
    labels: [
      "Literature",
      "RNA Expression",
      "Genetic Association",
      "Somatic Mutation",
      "Known Drug",
      "Animal Model",
      "Affected Pathway",
    ],
    datasets: [
      {
        label: "Data Type Scores",
        data: [0.696, 0.922, 0.122, 0.933, 0.983, 0.197, 0.605],
      },
    ],
  };

  (async function () {
    new Chart(document.getElementById("bar-chart"), {
      type: "bar",
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
      data: data,
      backgroundColor: ["rgb(52, 137, 202)"],
    });
  })();

  (async function () {
    new Chart(document.getElementById("radar-chart"), {
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
    });
  })();
}

function startApp() {
  // handleTableToggle();
  getData();
  // initCharts();
}

startApp();
