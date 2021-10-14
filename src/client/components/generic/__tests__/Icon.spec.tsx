/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow, mount } from 'enzyme';
import { TypeIcon, AppCellIcon, DefaultIcon } from '../Icon';

describe('TypeIcon tests', () => {
  it('should render a default icon for several known types', () => {
    // Setup tests from the config (copied here)
    const cases: { [key: string]: { [key: string]: string } } = {
      'SomeModule.SomeType': {
        icon: 'fa-file-o',
        color: '#F44336',
      },
      'KBaseGenomes.Genome': {
        icon: 'icon icon-genome',
        color: '#3F51B5',
      },
      'KBaseFBA.FBAModel': {
        icon: 'icon icon-metabolism',
        color: '#673AB7',
      },
    };
    for (const t of Object.keys(cases)) {
      const wrapper = shallow(<TypeIcon objType={t} />);
      const iconSpan = wrapper.find('span.fa-inverse');
      expect(iconSpan.hasClass(cases[t].icon)).toBeTruthy();
      expect(wrapper.find('span.fa-circle').prop('style')).toHaveProperty(
        'color',
        cases[t].color
      );
    }
  });
});

describe('AppIcon tests', () => {
  it('should render an initial loading icon', () => {
    const wrapper = shallow(
      <AppCellIcon appId={'SomeModule.someApp'} appTag={'release'} />
    );
    expect(wrapper.find('span.fa-spinner').length).toEqual(1);
  });

  it('should render an icon after the callback finishes', async () => {
    const wrapper = mount(
      <AppCellIcon appId={'SomeModule.someApp'} appTag={'release'} />
    );

    // SHould immediately spin, since the call to fetch and populate the icon
    // will not have completed yet.
    expect(wrapper.find('span.fa-spinner').length).toEqual(1);

    /*
    Note that a simple
    await new Promise.resolve();
    will also work here, as this may invoke the icon cache, which will cause
    the promise to immediately resolve (well, on the next turn of the interpreter
    wheel perhaps).
    This is a more general solution, though, as the timeout duration can be adjusted.
    Should really test cached and uncached behavior, and for uncached with different
    performance characterstics for the call to the NMS.
    */
    await new Promise<void>((resolve) => {
      window.setTimeout(() => {
        resolve();
      }, 0);
    });

    wrapper.update();
    expect(wrapper.find('span.fa-spinner').length).toEqual(0);
    expect(wrapper.find('span.fa-cube').length).toEqual(1);
  });
});

describe('DefaultIcon tests', () => {
  it('Should render icons for various cell types and a default', () => {
    const cases: { [key: string]: string } = {
      code: 'fa fa-code',
      app: 'fa fa-cube',
      markdown: 'fa fa-paragraph',
      data: 'fa fa-database',
      widget: 'fa fa-wrench',
      foobarbaz: 'fa fa-wrench',
    };
    for (const c of Object.keys(cases)) {
      const wrapper = shallow(<DefaultIcon cellType={c} />);
      expect(
        wrapper.find('span.fa-stack span.fa-stack-2x').prop('style')
      ).toHaveProperty('color', 'silver');
      expect(
        wrapper.find('span.fa-stack span.fa-inverse').hasClass(cases[c])
      ).toBeTruthy();
    }
  });
});
