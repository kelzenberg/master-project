import { newPlot, update as plotUpdate } from 'plotly.js-dist-min';

export class PlotController {
  #plots;
  #graphsTof;
  #graphsCoverage;
  #tofNumGraphs;
  #coverageNumGraphs;
  #coverageSingleNumGraphs;
  #tofLayout;
  #coverageLayout;
  #lineWidth = 1;
  #markerSize = 4;
  #isTofToggled = false;
  #isCoverageToggled = false;

  #tofColors;
  #tofLabels;
  #coverageColors;
  #coverageLabels;
  #coverageSingleColors;
  #coverageSingleLabels;

  constructor(plots) {
    this.#plots = plots;
    this.#graphsTof = [];
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
    // Set up initial data for each graph:
    // TOF
    this.#tofNumGraphs = this.#plots.tof.length;
    this.#tofColors = this.#getColors('tof', 'color');
    this.#tofLabels = this.#getLabels('tof', 'label');

    // Coverage average
    this.#coverageNumGraphs = this.#plots.coverage.length;
    this.#coverageColors = this.#getColors('coverage', 'averageColor');
    this.#coverageLabels = this.#getLabels('coverage', 'averageLabel');

    // Coverage single
    this.#coverageSingleColors = this.#getAllSingleColors();
    this.#coverageSingleLabels = this.#getAllSingleLabels();
    this.#coverageSingleNumGraphs = this.#coverageSingleLabels.length;

    this.#newPlotTof();
    this.#newPlotCoverage();
  }

  updatePlots(plotDataList) {
    this.#clearPlots();
    for (const plotData of plotDataList) {
      // Update each TOF graph with new data
      for (let i = 0; i < this.#tofNumGraphs; i++) {
        const graphTOF = this.#graphsTof[i];

        graphTOF.x.push(plotData.kmcTime);
        const tofValues = plotData.tof[i].values;
        this.#setYValueForTof(graphTOF, tofValues);
      }

      if (this.#isCoverageToggled) {
        // Update each Coverage single graph with new data
        let coverageSingleValues = this.#getAllSingleValues(plotData);
        for (let k = 0; k < this.#coverageSingleNumGraphs; k++) {
          const graphCoverageSingle = this.#graphsCoverage[k];

          graphCoverageSingle.x.push(plotData.kmcTime);
          graphCoverageSingle.y.push(coverageSingleValues[k]);
        }
      } else {
        // Update each Coverage graph with new data
        for (let j = 0; j < this.#coverageNumGraphs; j++) {
          const graphCoverage = this.#graphsCoverage[j];

          graphCoverage.x.push(plotData.kmcTime);
          graphCoverage.y.push(this.#calculateAverage(plotData.coverage[j].values));
        }
      }
    }

    plotUpdate('plotTOF', this.#graphsTof, this.#tofLayout);
    plotUpdate('plotCoverage', this.#graphsCoverage, this.#coverageLayout);
  }

  toggleTof() {
    this.#isTofToggled = !this.#isTofToggled;
  }

  toggleCoverage() {
    this.#isCoverageToggled = !this.#isCoverageToggled;
    if (this.#isCoverageToggled) {
      const plotData = this.#plots.plotData[0];
      this.#newPlotCoverageSingle(plotData);
    } else {
      this.#newPlotCoverage();
    }
  }

  #newPlotTof() {
    let initialData = Array.from({ length: this.#tofNumGraphs }, (_, index) => ({
      x: [this.#plots.plotData[0].kmcTime],
      y: [this.#plots.plotData[0].tof[index].values[0]],
      mode: 'lines+markers',
      color: this.#tofColors[index],
      line: {
        width: this.#lineWidth,
      },
      marker: {
        size: this.#markerSize,
      },
      name: this.#tofLabels[index],
    }));

    newPlot('plotTOF', initialData, this.#tofLayout, { responsive: true }).then(plotTOF => {
      this.#graphsTof = [...plotTOF.data];
    });
  }

  #newPlotCoverage() {
    let initialData = Array.from({ length: this.#coverageNumGraphs }, (_, index) => ({
      x: [this.#plots.plotData[0].kmcTime],
      y: [this.#calculateAverage(this.#plots.plotData[0].coverage[index].values)],
      mode: 'lines+markers',
      color: this.#coverageColors[index],
      line: {
        width: this.#lineWidth,
      },
      marker: {
        size: this.#markerSize,
      },
      name: this.#coverageLabels[index],
    }));

    newPlot('plotCoverage', initialData, this.#coverageLayout, {
      responsive: true,
    }).then(plotCoverage => {
      this.#graphsCoverage = [...plotCoverage.data];
    });
  }

  #newPlotCoverageSingle(plotData) {
    let values = this.#getAllSingleValues(plotData);

    let initialData = Array.from({ length: this.#coverageSingleNumGraphs }, (_, index) => ({
      x: [this.#plots.plotData[0].kmcTime],
      y: [values[index]],
      mode: 'lines+markers',
      color: this.#coverageSingleColors[index],
      line: {
        width: this.#lineWidth,
      },
      marker: {
        size: this.#markerSize,
      },
      name: this.#coverageSingleLabels[index],
    }));

    newPlot('plotCoverage', initialData, this.#coverageLayout, {
      responsive: true,
    }).then(plotCoverage => {
      this.#graphsCoverage = [...plotCoverage.data];
    });
  }

  #clearPlots() {
    for (let i = 0; i < this.#tofNumGraphs; i++) {
      this.#graphsTof[i].x = [];
      this.#graphsTof[i].y = [];
    }
    if (this.#isCoverageToggled) {
      for (let j = 0; j < this.#coverageSingleNumGraphs; j++) {
        this.#graphsCoverage[j].x = [];
        this.#graphsCoverage[j].y = [];
      }
    } else {
      for (let j = 0; j < this.#coverageNumGraphs; j++) {
        this.#graphsCoverage[j].x = [];
        this.#graphsCoverage[j].y = [];
      }
    }
  }

  #setYValueForTof(graphTOF, values) {
    graphTOF.y.push(this.#isTofToggled ? values[1] : values[0]);
  }

  #getColors(plotName, key) {
    return this.#plots[plotName].map(object => {
      const rgbColor = object[key];
      return this.#rgbToHex(rgbColor[0], rgbColor[1], rgbColor[2]);
    });
  }

  #getLabels(plotName, key) {
    const dataValues = this.#plots[plotName].map(entry => entry[key]);
    return dataValues;
  }

  #getAllSingleLabels() {
    let allLabels = [];

    for (const item of this.#plots.coverage) {
      allLabels = [...allLabels, ...item.singleLabels];
    }

    return allLabels;
  }

  #getAllSingleColors() {
    let allColors = [];

    for (const item of this.#plots.coverage) {
      allColors = [...allColors, ...item.singleColors];
    }

    return allColors;
  }

  #getAllSingleValues(plotData) {
    const coverage = plotData.coverage;
    const result = [];

    for (const entry of coverage) {
      const values = entry.values;
      result.push(...values);
    }

    return result;
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
