import { newPlot, update as plotUpdate } from 'plotly.js-dist-min';

export class PlotController {
  #plots;
  #graphsTOF;
  #graphsCoverage;
  #tofNumGraphs;
  #coverageNumGraphs;
  #tofLayout;
  #coverageLayout;
  #lineWidth = 1;
  #markerSize = 4;

  constructor(plots) {
    this.#plots = plots;
    this.#graphsTOF = [];
    this.#graphsCoverage = [];
    this.#tofNumGraphs = 0;
    this.#coverageNumGraphs = 0;
    this.#tofLayout = {
      font: {
        family: 'Roboto, sans-serif',
        weight: 'normal',
      },
      xaxis: {
        title: {
          text: 'kmc time',
        },
      },
      hovermode: 'x',
      margin: {
        l: 40,
        r: 5,
        t: 40,
        b: 40,
        pad: 0,
      },
      title: {
        text: 'TOF',
        font: {
          color: '#006c66',
        },
      },
      responsive: true,
    };
    this.#coverageLayout = {
      ...this.#tofLayout,
      title: {
        text: 'Coverage',
        font: {
          color: '#006c66',
        },
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

    newPlot('plotTOF', initialDataTOF, this.#tofLayout, { responsive: true }).then(plotTOF => {
      this.#graphsTOF = [...plotTOF.data];
    });
    newPlot('plotCoverage', initialDataCoverage, this.#coverageLayout, {
      title: 'Coverage',
      responsive: true,
    }).then(plotCoverage => {
      this.#graphsCoverage = [...plotCoverage.data];
    });
  }

  updatePlots(plotDataList) {
    this.#clearPlots();
    for (const plotData of plotDataList) {
      // Update each TOF graph with new data
      for (let tofGraphIndex = 0; tofGraphIndex < this.#tofNumGraphs; tofGraphIndex++) {
        const graphTOF = this.#graphsTOF[tofGraphIndex];

        graphTOF.x.push(plotData.kmcTime);
        graphTOF.y.push(plotData.tof[tofGraphIndex].values[0]); //hier muss noch ein toggle für values[1] eingebaut werden!
      }

      // Update each Coverage graph with new data
      for (let coverageGraphIndex = 0; coverageGraphIndex < this.#coverageNumGraphs; coverageGraphIndex++) {
        const graphCoverage = this.#graphsCoverage[coverageGraphIndex];

        graphCoverage.x.push(plotData.kmcTime);
        graphCoverage.y.push(this.#calculateAverage(plotData.coverage[coverageGraphIndex].values));
      }
    }

    plotUpdate('plotTOF', this.#graphsTOF, this.#tofLayout);
    plotUpdate('plotCoverage', this.#graphsCoverage, this.#coverageLayout, { title: 'Coverage' });
  }

  #clearPlots() {
    for (let tofGraphIndex = 0; tofGraphIndex < this.#tofNumGraphs; tofGraphIndex++) {
      this.#graphsTOF[tofGraphIndex].x = [];
      this.#graphsTOF[tofGraphIndex].y = [];
    }
    for (let coverageGraphIndex = 0; coverageGraphIndex < this.#coverageNumGraphs; coverageGraphIndex++) {
      this.#graphsCoverage[coverageGraphIndex].x = [];
      this.#graphsCoverage[coverageGraphIndex].y = [];
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
