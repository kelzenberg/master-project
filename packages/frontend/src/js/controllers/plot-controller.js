import Plotly from 'plotly.js-dist';
export class PlotController {
  #plots;
  #maxStoredDataPoints;
  #initialGraphsTOF;
  #initialGraphsCoverage;
  #tofNumGraphs;
  #coverageNumGraphs;
  #layout;
  #lineWidth = 1;
  #markerSize = 4;

  constructor(plots, maxStoredDataPoints) {
    this.#plots = plots;
    this.#maxStoredDataPoints = maxStoredDataPoints;
    this.#initialGraphsTOF = [];
    this.#initialGraphsCoverage = [];
    this.#tofNumGraphs = 0;
    this.#coverageNumGraphs = 0;
    this.#layout = {
      xaxis: {
        title: 'kmc time',
      },
      hovermode: 'x',
      margin: {
        l: 40,
        r: 0,
        t: 0,
        b: 40,
        pad: 0,
      },
    };
  }

  renderInitialData() {
    // Set up initial data for each graph
    this.#tofNumGraphs = this.#plots.tof.length;
    this.#coverageNumGraphs = this.#plots.coverage.length;
    let tofColors = this.#getColors('tof', 'color');
    let coverageColors = this.#getColors('coverage', 'averageColor');
    let tofLabels = this.#getLabels('tof', 'label');
    let coverageLabels = this.#getLabels('coverage', 'averageLabel');

    let initialDataTOF = Array.from({ length: this.#tofNumGraphs }, (_, index) => ({
      x: [this.#plots.plotData[0].kmcTime],
      y: [this.#plots.plotData[0].tof[index].values[0]],
      mode: 'lines+markers',
      color: tofColors[index],
      line: {
        width: this.#lineWidth,
      },
      marker: {
        size: this.#markerSize,
      },
      name: tofLabels[index],
    }));

    let initialDataCoverage = Array.from({ length: this.#coverageNumGraphs }, (_, index) => ({
      x: [this.#plots.plotData[0].kmcTime],
      y: [this.#calculateAverage(this.#plots.plotData[0].coverage[index].values)],
      mode: 'lines+markers',
      color: coverageColors[index],
      line: {
        width: this.#lineWidth,
      },
      marker: {
        size: this.#markerSize,
      },
      name: coverageLabels[index],
    }));

    Plotly.newPlot('plotTOF', initialDataTOF, this.#layout, { responsive: true }).then(plotTOF => {
      this.#initialGraphsTOF = [...plotTOF.data];
    });
    Plotly.newPlot('plotCoverage', initialDataCoverage, this.#layout, { title: 'Coverage', responsive: true }).then(
      plotCoverage => {
        this.#initialGraphsCoverage = [...plotCoverage.data];
      }
    );
  }

  updatePlots(plotDataList) {
    for (const plotData of plotDataList) {
      // Update each TOF graph with new data
      for (let tofGraphIndex = 0; tofGraphIndex < this.#tofNumGraphs; tofGraphIndex++) {
        const graphTOF = this.#initialGraphsTOF[tofGraphIndex];

        graphTOF.x.push(plotData.kmcTime);
        graphTOF.y.push(plotData.tof[tofGraphIndex].values[0]); //hier muss noch ein toggle für values[1] eingebaut werden!

        // Remove oldest data points if the limit is reached
        if (graphTOF.x.length > this.#maxStoredDataPoints) {
          graphTOF.x.shift();
          graphTOF.y.shift();
        }
      }

      // Update each Coverage graph with new data
      for (let coverageGraphIndex = 0; coverageGraphIndex < this.#coverageNumGraphs; coverageGraphIndex++) {
        const graphCoverage = this.#initialGraphsCoverage[coverageGraphIndex];

        graphCoverage.x.push(plotData.kmcTime);
        graphCoverage.y.push(this.#calculateAverage(plotData.coverage[coverageGraphIndex].values));

        // Remove oldest data points if the limit is reached
        if (graphCoverage.x.length > this.#maxStoredDataPoints) {
          graphCoverage.x.shift();
          graphCoverage.y.shift();
        }
      }

      Plotly.update('plotTOF', this.#initialGraphsTOF, this.#layout);
      Plotly.update('plotCoverage', this.#initialGraphsCoverage, this.#layout);
    }
  }

  #getColors(plotName, key) {
    return this.#plots[plotName].map(object => {
      const rgbColor = object[key];
      return this.#rgbToHex(rgbColor.x, rgbColor.y, rgbColor.z);
    });
  }

  #getLabels(plotName, key) {
    return this.#plots[plotName].map(object => {
      const label = object[key];
      return label;
    });
  }

  #rgbToHex(red, green, blue) {
    // Ensure that the input values are within the valid range (0.0 to 1.0)
    red = Math.min(1, Math.max(0, red));
    green = Math.min(1, Math.max(0, green));
    blue = Math.min(1, Math.max(0, blue));

    // Convert the decimal values to hexadecimal
    const redHex = Math.round(red * 255)
      .toString(16)
      .padStart(2, '0');
    const greenHex = Math.round(green * 255)
      .toString(16)
      .padStart(2, '0');
    const blueHex = Math.round(blue * 255)
      .toString(16)
      .padStart(2, '0');

    // Concatenate the hexadecimal values
    const hexCode = `#${redHex}${greenHex}${blueHex}`;

    return hexCode;
  }

  #calculateAverage(array) {
    var sum = array.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    return sum / array.length;
  }
}
