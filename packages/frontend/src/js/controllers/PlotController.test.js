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
        const mockNewPlot = Plotly.newPlot;
        plotController.renderInitialData();

        expect(mockNewPlot).toHaveBeenCalledTimes(2); // Called for TOF and Coverage plots
        expect(mockNewPlot).toHaveBeenCalledWith(
          'plotTOF',
          expect.any(Array),
          expect.objectContaining({ title: { text: 'TOF' } }),
          expect.any(Object)
        );
        expect(mockNewPlot).toHaveBeenCalledWith(
          'plotCoverage',
          expect.any(Array),
          expect.objectContaining({ title: { text: 'Coverage' } }),
          expect.any(Object)
        );
      }).not.toThrow();
    });
  });

  describe('updatePlots', () => {
    test('should update TOF and Coverage plots with new data and not throw exceptions', () => {
      expect(() => {
        const mockUpdate = Plotly.update;
        plotController.updatePlots({
          tof: [{ label: 'CH4_formation', color: [0.5, 0.5, 0.5] }],
          coverage: [
            {
              averageLabel: 'C',
              averageColor: [0.5, 0.5, 0.5],
              singleLabels: ['C_Rh211_s', 'C_Rh211_t', 'C_Rh211_f'],
              singleColors: [
                [0.2, 0.6, 0.3],
                [0.4, 0.5, 0.8],
                [0.9, 0.6, 0.2],
              ],
            },
          ],
          plotData: [
            {
              kmcTime: 1,
              tof: [{ values: [1, 1] }],
              coverage: [{ values: [0.5, 0.5, 0.5] }],
            },
          ],
        });

        expect(mockUpdate).toHaveBeenCalledTimes(2); // Called for TOF and Coverage plots
        expect(mockUpdate).toHaveBeenCalledWith('plotTOF', expect.any(Array), expect.any(Object));
        expect(mockUpdate).toHaveBeenCalledWith('plotCoverage', expect.any(Array), expect.any(Object));
      }).not.toThrow();
    });
  });
});
