import { computeLinearScaleScore } from "./scores";

describe("scores/linearScore", () => {
  it("should recompute a score with the the min provided as the scale' start and the max being the largest value", () => {
    const min = 2;
    const data = [{ score: 4 }, { score: 6 }, { score: 8 }];
    expect(computeLinearScaleScore(min, "score")(data)).toEqual([
      // 4 is at 1/3rd of the {2,8} segment
      {
        score: 0.3333333333333333,
      },
      {
        score: 0.6666666666666666,
      },
      {
        score: 1,
      },
    ]);
  });

  it("should recompute the complement score when reverse is true", () => {
    const min = 2;
    const data = [{ score: 4 }, { score: 6 }, { score: 8 }];
    expect(computeLinearScaleScore(min, "score", true)(data)).toEqual([
      {
        score: 0.6666666666666667,
      },
      {
        score: 0.33333333333333337,
      },
      {
        score: 0,
      },
    ]);
  });
});
