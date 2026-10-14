import {
  buildCollapsedAddonPreview,
  isAgentExcludedCover,
  isCoverVisibleForDcAuto,
  isPopularAddonCover,
} from '@/config/addon-tooltips';

describe('addon cover visibility (DC Auto)', () => {
  it('hides Peer-to-Peer (P2P) Cover by name', () => {
    const cover = {
      coverCode: 'P2P-TEST',
      coverName: 'Peer-to-Peer (P2P) Cover',
      azolHiddenInd: 0,
    };
    expect(isAgentExcludedCover(cover)).toBe(true);
    expect(isCoverVisibleForDcAuto(cover)).toBe(false);
  });

  it('shows standard add-ons', () => {
    const cover = {
      coverCode: '89',
      coverName: 'Cover for Windscreens, Windows And Sunroof',
      azolHiddenInd: 0,
    };
    expect(isCoverVisibleForDcAuto(cover)).toBe(true);
  });

  it('treats Drive Guard as popular by name', () => {
    expect(
      isPopularAddonCover({ coverCode: 'X', coverName: 'Drive Guard' }),
    ).toBe(true);
  });

  it('always includes popular add-ons in collapsed preview (e.g. Drive Guard after ERW block)', () => {
    const list = [
      { coverCode: 'PAB-ERW', coverName: 'ERW', sequence: 1 },
      { coverCode: '89', coverName: 'Windscreen', sequence: 2 },
      { coverCode: 'A202', coverName: 'E-Hailing', sequence: 3 },
      { coverCode: '72', coverName: 'Passengers', sequence: 4 },
      { coverCode: '57', coverName: 'Perils', sequence: 5 },
      { coverCode: '112', coverName: 'CART', sequence: 6 },
      { coverCode: 'DG', coverName: 'Drive Guard', sequence: 99 },
      { coverCode: 'ZZ', coverName: 'Other', sequence: 100 },
    ];
    const preview = buildCollapsedAddonPreview(list, 5);
    expect(preview.some((c) => c.coverName === 'Drive Guard')).toBe(true);
    expect(preview.some((c) => c.coverCode === 'ZZ')).toBe(false);
  });
});
