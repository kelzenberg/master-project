/* eslint-disable no-undef */
import { PlotController } from './PlotController';

const plots = {
  tof: [
    {
      label: 'CH4_formation',
      color: [1, 0, 0],
    },
  ],
  coverage: [
    {
      averageLabel: 'C',
      averageColor: [1, 1, 0],
      singleLabels: ['C_Rh211_s', 'C_Rh211_t', 'C_Rh211_f'],
      singleColors: [
        [0.1, 0.7, 0.2],
        [0.3, 0.4, 0.9],
        [0.8, 0.5, 0.1],
      ],
    },
  ],
  plotData: [
    {
      kmcTime: 0,
      tof: [
        {
          values: [0, 0],
        },
      ],
      coverage: [
        {
          values: [0, 0, 0],
        },
      ],
    },
  ],
};

describe('PlotController', () => {
  let plotController;

  beforeEach(() => {
    plotController = new PlotController(plots);
  });

  describe('renderInitialData', () => {
    test('should initialize TOF and Coverage plots with correct data and not throw exceptions', () => {
      expect(() => {
        plotController.renderInitialData();

        expect(global.Plotly.newPlot).toHaveBeenCalledTimes(2);
      }).not.toThrow();
    });
  });
});
