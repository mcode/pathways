import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Arrow from '../Arrow';

const testEdge = {
  start: 'start',
  end: 'end',
  label: {
    text: 'label',
    x: 0,
    y: 0
  },
  points: [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 20 }]
};

describe('<Arrow />', () => {
  it('renders an arrow with a label', () => {
    const { container, getByText } = render(
      <Arrow 
        edge={testEdge}
        edgeName='test'
        isOnPatientPath={false}
        widthOffset={0}
      />
    );

    expect(getByText(testEdge.label.text)).toBeVisible();
    expect(container.firstChild).toHaveClass('arrow');
  });

  it('renders an arrow on patient path', () => {
    const { container, getByText } = render(
      <Arrow 
        edge={testEdge}
        edgeName='test'
        isOnPatientPath={true}
        widthOffset={0}
      />
    );

    expect(container.firstChild).toHaveClass('arrowOnPatientPath');
  })
});
