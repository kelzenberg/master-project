import Plotly from 'plotly.js-dist';
export class PlotController {
  #plots;
  #maxStoredDataPoints;
  #initialGraphsTOF;
  #initialGraphsCoverage;
  #tofNumGraphs;
  #coverageNumGraphs;
  #tofLayout;
  #coverageLayout;

  constructor(plots, maxStoredDataPoints) {
    this.#plots = plots;
    this.#maxStoredDataPoints = maxStoredDataPoints;
    this.#initialGraphsTOF = [];
    this.#initialGraphsCoverage = [];
    this.#tofNumGraphs = 0;
    this.#coverageNumGraphs = 0;
    this.#tofLayout = {
      title: 'TOF',
      xaxis: {
        title: 'kmc time',
      },
      yaxis: {
        title: 'Value',
      },
      hovermode: 'x',
    };
    this.#coverageLayout = {
      title: 'Coverage',
      xaxis: {
        title: 'kmc time',
      },
      yaxis: {
        title: 'Value',
      },
      hovermode: 'x',
    };
  }

  renderInitialData() {
    // Set up initial data for each graph
    this.#tofNumGraphs = this.#plots.tof.length;
    this.#coverageNumGraphs = this.#plots.coverage.length;
    let tofColors = this.#getColors(this.#tofNumGraphs);
    let coverageColors = this.#getColors(this.#coverageNumGraphs);
    let tofLabels = this.#getTofLabels();
    let coverageLabels = this.#getCoverageLabels();

    let initialDataTOF = Array.from({ length: this.#tofNumGraphs }, (_, index) => ({
      x: [this.#plots.plotData.kmcTime],
      y: [this.#plots.plotData[index].values[0]],
      type: 'line',
      mode: 'lines+markers',
      line: {
        color: tofColors[index],
      },
      marker: {
        color: tofColors[index],
      },
      name: tofLabels[index],
    }));

    let initialDataCoverage = Array.from({ length: this.#coverageNumGraphs }, (_, index) => ({
      x: [this.#plots.plotData.kmcTime],
      y: [this.#calculateAverage(this.#plots.plotData[index].values)],
      type: 'line',
      mode: 'lines+markers',
      line: {
        color: coverageColors[index],
      },
      marker: {
        color: coverageColors[index],
      },
      name: coverageLabels[index],
    }));

    Plotly.newPlot('plotTOF', initialDataTOF, this.#tofLayout).then(plotTOF => {
      this.#initialGraphsTOF = [...plotTOF.data];
    });
    Plotly.newPlot('plotCoverage', initialDataCoverage, this.#coverageLayout).then(plotCoverage => {
      this.#initialGraphsCoverage = [...plotCoverage.data];
    });
  }

  updatePlots(plotData) {
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

    // Update the TOF plot with new data
    Plotly.update('plotTOF', this.#initialGraphsTOF, this.#tofLayout);

    // Update the Coverage plot with new data
    Plotly.update('plotCoverage', this.#initialGraphsCoverage, this.#coverageLayout);
  }

  #getColors(numGraphs) {
    const colors = new Set();

    while (colors.size < numGraphs) {
      const color = '#' + Math.floor(Math.random() * 16_777_215).toString(16);
      colors.add(color);
    }

    return [...colors];
  }

  #getTofLabels() {
    return this.#plots.tof.map(tofObject => {
      const label = tofObject.label;
      return label;
    });
  }

  #getCoverageLabels() {
    return this.#plots.coverage.map(coverageObject => {
      const label = coverageObject.averageLabel;
      return label;
    });
  }

  #calculateAverage(array) {
    var sum = array.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    return sum / array.length;
  }
}
