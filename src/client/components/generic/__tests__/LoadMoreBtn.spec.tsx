import React from 'react';
import { shallow } from 'enzyme';
import { LoadMoreBtn } from '../LoadMoreBtn';

describe('LoadMoreBtn tests', () => {
  let onLoadMoreSpy: () => void;
  const itemCount = 10;
  const totalItems = 20;

  beforeEach(() => {
    onLoadMoreSpy = jest.fn();
  });

  it('should load a button with some known items', () => {
    const wrapper = shallow(
      <LoadMoreBtn
        loading={false}
        itemCount={itemCount}
        totalItems={totalItems}
        onLoadMore={onLoadMoreSpy}
      />
    );
    expect(wrapper.text()).toEqual(
      `Load more (${totalItems - itemCount} remaining)`
    );
  });

  it('should load a loading spinner with the loading prop', () => {
    const wrapper = shallow(
      <LoadMoreBtn
        loading={true}
        itemCount={itemCount}
        totalItems={totalItems}
        onLoadMore={onLoadMoreSpy}
      />
    );
    expect(wrapper.text()).toEqual('Loading...');
    expect(wrapper.find('i').hasClass('fa fa-cog fa-spin')).toBeTruthy();
  });

  it('should call its onload function on click', () => {
    const wrapper = shallow(
      <LoadMoreBtn
        loading={false}
        itemCount={itemCount}
        totalItems={totalItems}
        onLoadMore={onLoadMoreSpy}
      />
    );
    wrapper.find('a').simulate('click');
    expect(onLoadMoreSpy).toHaveBeenCalledTimes(1);
  });

  it('should have text saying there are no more items', () => {
    const wrapper = shallow(
      <LoadMoreBtn
        loading={false}
        itemCount={itemCount}
        totalItems={itemCount}
        onLoadMore={onLoadMoreSpy}
      />
    );
    expect(wrapper.text()).toEqual('No more results.');
  });
});
