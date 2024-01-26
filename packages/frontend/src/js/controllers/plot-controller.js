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
  #isSingleCoverageActive = false;

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
          text: 'kmc time [s]',
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
        yaxis: {
          type: 'log',
          autorange: true,
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
        yaxis: { range: [0, 1], autorange: false },
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

  updatePlots(plots) {
    this.#plots = plots;
    this.#clearPlots();
    for (const plotData of this.#plots.plotData) {
      // Update each TOF graph with new data
      for (let i = 0; i < this.#tofNumGraphs; i++) {
        const graphTOF = this.#graphsTof[i];

        graphTOF.x.push(plotData.kmcTime);
        const tofValues = plotData.tof[i].values;
        this.#setYValueForTof(graphTOF, tofValues);
      }

      if (this.#isSingleCoverageActive) {
        // Update each Coverage single graph with new data
        let coverageSingleValues = this.#getAllSingleValuesCoverage(plotData);
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

    Plotly.update('plotTOF', this.#graphsTof, this.#tofLayout);
    Plotly.update('plotCoverage', this.#graphsCoverage, this.#coverageLayout);
  }

  toggleTof(configurationCountActive) {
    this.#isTofToggled = configurationCountActive ?? !configurationCountActive;
  }

  toggleCoverage(singleCoverageActive) {
    let initialState = this.#isSingleCoverageActive;
    this.#isSingleCoverageActive = singleCoverageActive;
    if (initialState !== this.#isSingleCoverageActive) {
      if (this.#isSingleCoverageActive) {
        this.#newPlotCoverageSingle();
      } else {
        this.#newPlotCoverage();
      }
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

    Plotly.newPlot(
      'plotTOF',
      initialData,
      {
        ...this.#tofLayout,
        yaxis: { type: 'log', autorange: true },
      },
      {
        responsive: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      }
    ).then(plotTOF => {
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

    Plotly.newPlot(
      'plotCoverage',
      initialData,
      {
        ...this.#coverageLayout,
        yaxis: { range: [0, 1] },
      },
      {
        responsive: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      }
    ).then(plotCoverage => {
      this.#graphsCoverage = [...plotCoverage.data];
    });
  }

  #newPlotCoverageSingle() {
    let values = this.#getAllSingleValuesCoverage();

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

    Plotly.newPlot(
      'plotCoverage',
      initialData,
      {
        ...this.#coverageLayout,
        yaxis: { range: [0, 1] },
      },
      {
        responsive: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      }
    ).then(plotCoverage => {
      this.#graphsCoverage = [...plotCoverage.data];
    });
  }

  #clearPlots() {
    for (let i = 0; i < this.#graphsTof.length; i++) {
      this.#graphsTof[i].x = [];
      this.#graphsTof[i].y = [];
    }

    for (let j = 0; j < this.#graphsCoverage.length; j++) {
      this.#graphsCoverage[j].x = [];
      this.#graphsCoverage[j].y = [];
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

  #getAllSingleValuesCoverage() {
    const coverage = this.#plots.plotData[0].coverage;
    const result = [];

    for (const entry of coverage) {
      const values = entry.values;
      result.push(...values);
    }

    return result;
  }

  #rgbToHex(red, green, blue) {
    red = Math.min(1, Math.max(0, red));
    green = Math.min(1, Math.max(0, green));
    blue = Math.min(1, Math.max(0, blue));

    const redHex = Math.round(red * 255)
      .toString(16)
      .padStart(2, '0');
    const greenHex = Math.round(green * 255)
      .toString(16)
      .padStart(2, '0');
    const blueHex = Math.round(blue * 255)
      .toString(16)
      .padStart(2, '0');

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
