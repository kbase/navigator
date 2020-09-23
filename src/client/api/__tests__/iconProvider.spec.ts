/**
 * @jest-environment jsdom
 */
import iconData from '../icons.json';

import IconProvider, { AppTag } from '../iconProvider';
const ip = IconProvider.Instance;
const defaultType = {
  isImage: false,
  icon: iconData.defaults.type,
  color: iconData.colors[0],
};
const defaultApp = {
  isImage: false,
  icon: iconData.defaults.app,
  color: '#683AB7',
};

test('Should have default type icons for happy inputs', () => {
  ['SomeModule.SomeType-1.0', 'SomeModule.SomeType'].forEach(t => {
    expect(ip.typeIcon(t)).toEqual(defaultType);
  });
});

test('Should have default type icon for unhappy inputs, with a warning', () => {
  ['foo', '', '3'].forEach(t => {
    expect(ip.typeIcon(t)).toEqual(defaultType);
  });
});

test('Should have known type icons for known types', () => {
  const genomeIcon = {
    isImage: false,
    icon: 'icon icon-genome',
    color: '#3F51B5',
  };
  [
    'KBaseGenomes.Genome-1.0',
    'KBaseGenomes.Genome',
    'Genome',
    'kbasegenomes.genome',
  ].forEach(t => {
    expect(ip.typeIcon(t)).toEqual(genomeIcon);
  });
});

test('Should have default app icons for unknown apps', async () => {
  ['SomeModule/SomeApp', 'SomeModule.SomeApp', 'SomeApp', ''].forEach(
    async app => {
      const appIcon = await ip.appIcon(app, 'release' as AppTag);
      expect(appIcon).toEqual(defaultApp);
    }
  );
});

test('Should have default app icons for unknown types', async () => {
  const appIcon = await ip.appIcon('kb_megahit/run_megahit', 'foo' as AppTag);
  expect(appIcon).toEqual(defaultApp);
});

test('Should have an app icon for a known app', async () => {
  const appIcon = await ip.appIcon(
    'kb_megahit/run_megahit',
    'release' as AppTag
  );
  expect(appIcon).toEqual(defaultApp);
});
