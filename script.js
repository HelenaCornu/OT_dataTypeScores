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
  handleTableToggle();
  initCharts();
}

startApp();
