/**
 * Controls the rendering and updating of plots for the simulation.
 */
export class PlotController {
  #plots;
  #graphsTof;
  #graphsCoverage;
  #totalNumberOfTofGraphs;
  #totalNumberOfCoverageGraphs;
  #totalNumberOfCoveragePerSiteTypeGraphs;
  #tofLayout;
  #coverageLayout;
  #lineWidth = 1;
  #markerSize = 4;
  #isTofToggled = false;
  #isCoveragePerSiteTypeActive = false;

  #tofColors;
  #tofLabels;
  #coverageColors;
  #coverageLabels;
  #coveragePerSiteTypeColors;
  #coveragePerSiteTypeLabels;

  /**
   * Creates a PlotController instance.
   * @param {Object} plots - The initial data for plots.
   * @public
   */
  constructor(plots) {
    this.#plots = plots;
    this.#graphsTof = [];
    this.#graphsCoverage = [];
    this.#totalNumberOfTofGraphs = 0;
    this.#totalNumberOfCoverageGraphs = 0;
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

  /**
   * Renders the initial data for plots.
   * @public
   */
  renderInitialData() {
    // Set up initial data for each graph:
    // TOF
    this.#totalNumberOfTofGraphs = this.#plots.tof.length;
    this.#tofColors = this.#getColors('tof', 'color');
    this.#tofLabels = this.#getLabels('tof', 'label');

    // Coverage average
    this.#totalNumberOfCoverageGraphs = this.#plots.coverage.length;
    this.#coverageColors = this.#getColors('coverage', 'averageColor');
    this.#coverageLabels = this.#getLabels('coverage', 'averageLabel');

    // Coverage single
    this.#coveragePerSiteTypeColors = this.#getColorsForCoveragePerSiteType();
    this.#coveragePerSiteTypeLabels = this.#getLabelsForCoveragePerSiteType();
    this.#totalNumberOfCoveragePerSiteTypeGraphs = this.#coveragePerSiteTypeLabels.length;

    this.#newPlotTof();
    this.#newPlotCoverage();
  }

  /**
   * Updates the plots with new data.
   * @param {Object} plots - The updated data for plots.
   * @public
   */
  updatePlots(plots) {
    this.#plots = plots;
    this.#clearPlots();
    for (const plotData of this.#plots.plotData) {
      // Update each TOF graph with new data
      for (let i = 0; i < this.#totalNumberOfTofGraphs; i++) {
        const graphTOF = this.#graphsTof[i];

        graphTOF.x.push(plotData.kmcTime);
        const tofValues = plotData.tof[i].values;
        graphTOF.y.push(this.#isTofToggled ? tofValues[1] : tofValues[0]);
      }

      if (this.#isCoveragePerSiteTypeActive) {
        // Update each Coverage single graph with new data
        let coveragePerSiteTypeValues = this.#getValuesForCoveragePerSiteType(plotData);
        for (let k = 0; k < this.#totalNumberOfCoveragePerSiteTypeGraphs; k++) {
          const graphCoveragePerSiteType = this.#graphsCoverage[k];

          graphCoveragePerSiteType.x.push(plotData.kmcTime);
          graphCoveragePerSiteType.y.push(coveragePerSiteTypeValues[k]);
        }
      } else {
        // Update each Coverage graph with new data
        for (let j = 0; j < this.#totalNumberOfCoverageGraphs; j++) {
          const graphCoverage = this.#graphsCoverage[j];

          graphCoverage.x.push(plotData.kmcTime);
          graphCoverage.y.push(this.#calculateAverage(plotData.coverage[j].values));
        }
      }
    }

    Plotly.update('plotTOF', this.#graphsTof, this.#tofLayout);
    Plotly.update('plotCoverage', this.#graphsCoverage, this.#coverageLayout);
  }

  /**
   * Toggles the TOF graphs.
   * @param {boolean} [configurationCountActive] - Indicates whether configuration count is active.
   * @public
   */
  toggleTof(configurationCountActive) {
    this.#isTofToggled = configurationCountActive ?? !configurationCountActive;
  }

  /**
   * Toggles the Coverage graphs.
   * @param {boolean} [singleCoverageActive] - Indicates whether single coverage is active.
   * @public
   */
  toggleCoverage(singleCoverageActive) {
    let initialState = this.#isCoveragePerSiteTypeActive;
    this.#isCoveragePerSiteTypeActive = singleCoverageActive;
    if (initialState !== this.#isCoveragePerSiteTypeActive) {
      if (this.#isCoveragePerSiteTypeActive) {
        this.#newPlotCoveragePerSiteType();
      } else {
        this.#newPlotCoverage();
      }
    }
  }

  /**
   * Creates a new TOF plot using plotly.
   * @private
   */
  #newPlotTof() {
    let initialData = Array.from({ length: this.#totalNumberOfTofGraphs }, (_, index) => ({
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

  /**
   * Creates a new avergae coverage plot using plotly.
   * @private
   */
  #newPlotCoverage() {
    let initialData = Array.from({ length: this.#totalNumberOfCoverageGraphs }, (_, index) => ({
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

  /**
   * Creates a new coverage per site type plot using plotly.
   * @private
   */
  #newPlotCoveragePerSiteType() {
    let values = this.#getValuesForCoveragePerSiteType();

    let initialData = Array.from({ length: this.#totalNumberOfCoveragePerSiteTypeGraphs }, (_, index) => ({
      x: [this.#plots.plotData[0].kmcTime],
      y: [values[index]],
      mode: 'lines+markers',
      color: this.#coveragePerSiteTypeColors[index],
      line: {
        width: this.#lineWidth,
      },
      marker: {
        size: this.#markerSize,
      },
      name: this.#coveragePerSiteTypeLabels[index],
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

  /**
   * Clears all plots and their graph data.
   * @private
   */
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

  /**
   * Gets the colors for the specified plot.
   * @param plotName The plot name (tof or coverage)
   * @param key The key for the color (color, averageColor).
   * @private
   */
  #getColors(plotName, key) {
    return this.#plots[plotName].map(object => {
      const rgbColor = object[key];
      return this.#rgbToHex(rgbColor[0], rgbColor[1], rgbColor[2]);
    });
  }

  /**
   * Gets the labels for the specified plot.
   * @param plotName The plot name (tof or coverage)
   * @param key The key for the color (label, averageLabel).
   * @private
   */
  #getLabels(plotName, key) {
    const dataValues = this.#plots[plotName].map(entry => entry[key]);
    return dataValues;
  }

  /**
   * Gets the colors for the coverage per site type plot.
   * @private
   */
  #getColorsForCoveragePerSiteType() {
    let allColors = [];

    for (const item of this.#plots.coverage) {
      allColors = [...allColors, ...item.singleColors];
    }

    return allColors;
  }

  /**
   * Gets the labels for the coverage per site type plot.
   * @private
   */
  #getLabelsForCoveragePerSiteType() {
    let allLabels = [];

    for (const item of this.#plots.coverage) {
      allLabels = [...allLabels, ...item.singleLabels];
    }

    return allLabels;
  }

  /**
   * Gets the values for the coverage per site type plot.
   * @private
   */
  #getValuesForCoveragePerSiteType() {
    const coverage = this.#plots.plotData[0].coverage;
    const result = [];

    for (const entry of coverage) {
      const values = entry.values;
      result.push(...values);
    }

    return result;
  }

  /**
   * Converts rgb colors into hex strings that represent the same color.
   * @private
   */
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

  /**
   * Calculates the average value of an array of numbers.
   * @param array The number array
   * @private
   */
  #calculateAverage(array) {
    var sum = array.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);

    return sum / array.length;
  }
}
